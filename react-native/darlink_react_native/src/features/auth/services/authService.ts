// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION FIREBASE AUTH RÉEL (React Native)
// Identity Toolkit REST API : inscription, connexion JWT réel,
// vérification email, réinitialisation, changement email/MDP, suppression compte
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultFirebaseConfig } from '../../../core/firebase/firebaseConfig';
import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { favoritesApiService } from '../../favorites/services/favoritesApiService';

export type AccountRole = 'USER' | 'OWNER' | 'AGENCY' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AccountRole;
  emailVerified: boolean;
  photoUrl?: string;
  agencyId?: string;
}

export interface PasswordStrengthResult {
  score: number; // 0..4
  label: string;
  valid: boolean;
  issues: string[];
}

const STORAGE_KEY_TOKEN = '@darlink_auth_token';
const STORAGE_KEY_REFRESH = '@darlink_auth_refresh_token';
const STORAGE_KEY_USER = '@darlink_auth_user';

const IDENTITY_BASE = 'https://identitytoolkit.googleapis.com/v1';

function normalizeRole(raw?: string): AccountRole {
  const up = (raw || 'USER').toUpperCase().trim();
  if (up === 'OWNER' || up === 'AGENCY' || up === 'ADMIN') return up;
  return 'USER';
}

function mapFirebaseAuthError(code?: string): string {
  switch (code) {
    case 'EMAIL_EXISTS':
      return 'Cette adresse e-mail est déjà associée à un compte DarLink.';
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'INVALID_PASSWORD':
      return 'Adresse e-mail ou mot de passe incorrect.';
    case 'USER_DISABLED':
      return 'Ce compte a été désactivé par l’administration.';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
    case 'INVALID_EMAIL':
      return 'Format d’adresse e-mail invalide.';
    case 'WEAK_PASSWORD':
      return 'Mot de passe trop faible (minimum 8 caractères requis).';
    case 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN':
    case 'TOKEN_EXPIRED':
      return 'Session expirée. Veuillez vous reconnecter pour cette action sensible.';
    default:
      return code ? `Erreur d’authentification Firebase (${code}).` : 'Erreur d’authentification Firebase.';
  }
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const issues: string[] = [];
  let score = 0;
  if (password.length >= 8) score++;
  else issues.push('Au moins 8 caractères');

  if (/[A-Z]/.test(password)) score++;
  else issues.push('Une lettre majuscule');

  if (/[0-9]/.test(password)) score++;
  else issues.push('Un chiffre');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else issues.push('Un caractère spécial');

  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  return {
    score,
    label: labels[score],
    valid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
    issues,
  };
}

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;
  public lastError: string | null = null;
  private listeners: (() => void)[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private get apiKey(): string {
    return defaultFirebaseConfig.apiKey;
  }

  private async safeStorageGet(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private async safeStorageSet(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore
    }
  }

  private async safeStorageRemove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }

  private constructor() {
    this.initPromise = this.init();
  }

  public waitForInit(): Promise<void> {
    return this.initPromise ?? Promise.resolve();
  }

  public getDiagnosticInfo(): {
    projectId: string;
    platform: string;
    authUid: string;
    databaseId: string;
  } {
    const uid = this.currentUser?.id;
    const displayUid = uid ? `${uid.slice(0, 6)}...` : 'Guest (Unauthenticated)';
    return {
      projectId: defaultFirebaseConfig.projectId,
      platform: 'React Native / Expo Go',
      authUid: displayUid,
      databaseId: '(default)',
    };
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const storedToken = await this.safeStorageGet(STORAGE_KEY_TOKEN);
      const storedRefresh = await this.safeStorageGet(STORAGE_KEY_REFRESH);
      const storedUser = await this.safeStorageGet(STORAGE_KEY_USER);

      if (storedToken && storedUser) {
        this.token = storedToken;
        this.refreshToken = storedRefresh;
        this.currentUser = JSON.parse(storedUser) as UserProfile;
        firestoreEngine.setToken(storedToken);
        favoritesApiService.setUserId(String(this.currentUser.id));
        await this.refreshSessionIfNeeded();
        await favoritesApiService.syncWithBackend();
        this.notify();
      }
    } catch {
      // Ignore invalid local storage
    } finally {
      this.isInitialized = true;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentUser && this.token);
  }

  private async persistSession(): Promise<void> {
    if (this.token) await this.safeStorageSet(STORAGE_KEY_TOKEN, this.token);
    if (this.refreshToken) await this.safeStorageSet(STORAGE_KEY_REFRESH, this.refreshToken);
    if (this.currentUser) await this.safeStorageSet(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
  }

  private async lookupAccount(idToken: string): Promise<{ emailVerified: boolean; email?: string; displayName?: string } | null> {
    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:lookup?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const u = data?.users?.[0];
      if (!u) return null;
      return {
        emailVerified: Boolean(u.emailVerified),
        email: u.email,
        displayName: u.displayName,
      };
    } catch {
      return null;
    }
  }

  public async refreshSessionIfNeeded(): Promise<boolean> {
    if (!this.token) return false;
    const account = await this.lookupAccount(this.token);
    if (account) {
      if (this.currentUser && this.currentUser.emailVerified !== account.emailVerified) {
        this.currentUser = { ...this.currentUser, emailVerified: account.emailVerified };
        await this.persistSession();
        this.notify();
      }
      return true;
    }
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(this.refreshToken)}`,
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.id_token) {
        this.token = data.id_token;
        this.refreshToken = data.refresh_token || this.refreshToken;
        firestoreEngine.setToken(this.token);
        await this.persistSession();
        return true;
      }
    } catch {
      // Offline
    }
    return false;
  }

  public async login(email: string, password: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    this.lastError = null;
    if (!cleanEmail || !password) {
      this.lastError = 'Veuillez saisir votre adresse e-mail et votre mot de passe.';
      return false;
    }

    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:signInWithPassword?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, returnSecureToken: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        this.lastError = mapFirebaseAuthError(data?.error?.message);
        return false;
      }

      const uid: string = data.localId;
      this.token = data.idToken;
      this.refreshToken = data.refreshToken || null;
      firestoreEngine.setToken(this.token);

      const accountInfo = await this.lookupAccount(data.idToken);
      const emailVerified = Boolean(accountInfo?.emailVerified);

      let userDoc = await firestoreEngine.getDocument<UserProfile>('users', uid);
      if (!userDoc) {
        const fallbackProfile: UserProfile = {
          id: uid,
          fullName: accountInfo?.displayName || data.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '',
          role: 'USER',
          emailVerified,
        };
        await firestoreEngine.setDocument('users', uid, {
          ...fallbackProfile,
          accountStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
        userDoc = fallbackProfile;
      } else if (userDoc.emailVerified !== emailVerified) {
        await firestoreEngine.patchFields('users', uid, { emailVerified });
      }

      this.currentUser = {
        id: uid,
        fullName: userDoc.fullName || accountInfo?.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: userDoc.phone || '',
        role: normalizeRole(userDoc.role),
        emailVerified,
        photoUrl: userDoc.photoUrl,
        agencyId: userDoc.agencyId,
      };

      favoritesApiService.setUserId(uid);
      await this.persistSession();
      await favoritesApiService.syncWithBackend();
      this.notify();
      return true;
    } catch {
      this.lastError = 'Impossible de joindre Firebase Authentication. Vérifiez votre connexion.';
      return false;
    }
  }

  public async register(
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    requestedRole: string = 'USER',
    confirmPassword?: string
  ): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    this.lastError = null;

    if (!cleanName || cleanName.length < 2) {
      this.lastError = 'Veuillez saisir votre nom complet.';
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      this.lastError = 'Format d’adresse e-mail invalide.';
      return false;
    }
    const strength = evaluatePasswordStrength(password);
    if (!strength.valid) {
      this.lastError = `Mot de passe insuffisant : ${strength.issues.join(', ')}.`;
      return false;
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      this.lastError = 'La confirmation du mot de passe ne correspond pas.';
      return false;
    }

    // Sécurité : jamais d'auto-attribution du rôle ADMIN côté client
    const safeRole: AccountRole =
      requestedRole.toUpperCase() === 'OWNER'
        ? 'OWNER'
        : requestedRole.toUpperCase() === 'AGENCY'
        ? 'AGENCY'
        : 'USER';

    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:signUp?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, returnSecureToken: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        this.lastError = mapFirebaseAuthError(data?.error?.message);
        return false;
      }

      const uid: string = data.localId;
      this.token = data.idToken;
      this.refreshToken = data.refreshToken || null;
      firestoreEngine.setToken(this.token);

      await fetch(`${IDENTITY_BASE}/accounts:update?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: this.token, displayName: cleanName }),
      }).catch(() => {});

      // Envoyer un vrai e-mail de vérification Firebase (ne jamais simuler verified=true)
      await this.resendVerificationEmail();

      const profile: UserProfile = {
        id: uid,
        fullName: cleanName,
        email: cleanEmail,
        phone: phone?.trim() || '',
        role: safeRole,
        emailVerified: false,
      };

      await firestoreEngine.setDocument('users', uid, {
        ...profile,
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });

      this.currentUser = profile;
      favoritesApiService.setUserId(uid);
      await this.persistSession();
      this.notify();
      return true;
    } catch {
      this.lastError = 'Erreur réseau lors de la création du compte Firebase.';
      return false;
    }
  }

  public async resendVerificationEmail(): Promise<boolean> {
    if (!this.token) {
      this.lastError = 'Vous devez être connecté pour envoyer l’e-mail de vérification.';
      return false;
    }
    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:sendOobCode?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken: this.token }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.lastError = mapFirebaseAuthError(err?.error?.message);
        return false;
      }
      return true;
    } catch {
      this.lastError = 'Impossible d’envoyer l’e-mail de vérification.';
      return false;
    }
  }

  public async refreshVerificationStatus(): Promise<boolean> {
    if (!this.token || !this.currentUser) return false;
    const info = await this.lookupAccount(this.token);
    if (!info) return false;
    const verified = info.emailVerified;
    this.currentUser = { ...this.currentUser, emailVerified: verified };
    await firestoreEngine.patchFields('users', this.currentUser.id, { emailVerified: verified });
    await this.persistSession();
    this.notify();
    return verified;
  }

  public async sendPasswordResetEmail(email: string): Promise<string | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return 'Veuillez saisir une adresse e-mail valide.';
    }
    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:sendOobCode?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: cleanEmail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return mapFirebaseAuthError(err?.error?.message);
      }
      return null;
    } catch {
      return 'Impossible d’envoyer l’e-mail de réinitialisation.';
    }
  }

  public async updateProfile(
    fullName: string,
    phone?: string,
    photoUrl?: string,
    role?: 'USER' | 'OWNER' | 'AGENCY'
  ): Promise<boolean> {
    if (!this.currentUser || !this.token) return false;
    const uid = this.currentUser.id;
    const safeRole: AccountRole =
      role && (role === 'USER' || role === 'OWNER' || role === 'AGENCY')
        ? role
        : this.currentUser.role;

    try {
      await fetch(`${IDENTITY_BASE}/accounts:update?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: this.token,
          displayName: fullName.trim(),
          ...(photoUrl ? { photoUrl } : {}),
        }),
      }).catch(() => {});

      const patchData: Record<string, unknown> = {
        fullName: fullName.trim(),
        phone: phone !== undefined ? phone.trim() : this.currentUser.phone || '',
        role: safeRole,
        updatedAt: new Date().toISOString(),
      };
      if (photoUrl !== undefined) patchData.photoUrl = photoUrl;

      const ok = await firestoreEngine.patchFields('users', uid, patchData);
      if (!ok) return false;

      this.currentUser = {
        ...this.currentUser,
        fullName: fullName.trim(),
        phone: String(patchData.phone || ''),
        role: safeRole,
        photoUrl: photoUrl !== undefined ? photoUrl : this.currentUser.photoUrl,
      };
      await this.persistSession();
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  private async reauthenticate(currentPassword: string): Promise<string | null> {
    if (!this.currentUser) return 'Utilisateur non connecté.';
    const res = await fetch(`${IDENTITY_BASE}/accounts:signInWithPassword?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.currentUser.email,
        password: currentPassword,
        returnSecureToken: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return mapFirebaseAuthError(data?.error?.message);
    }
    this.token = data.idToken;
    this.refreshToken = data.refreshToken || this.refreshToken;
    firestoreEngine.setToken(this.token);
    return null;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
    if (!this.currentUser || !this.token) return 'Utilisateur non connecté.';
    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.valid) {
      return `Nouveau mot de passe insuffisant : ${strength.issues.join(', ')}.`;
    }

    const reauthErr = await this.reauthenticate(currentPassword);
    if (reauthErr) return reauthErr;

    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:update?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: this.token, password: newPassword, returnSecureToken: true }),
      });
      const data = await res.json();
      if (!res.ok) return mapFirebaseAuthError(data?.error?.message);
      if (data.idToken) {
        this.token = data.idToken;
        this.refreshToken = data.refreshToken || this.refreshToken;
        firestoreEngine.setToken(this.token);
        await this.persistSession();
      }
      return null;
    } catch {
      return 'Erreur lors de la mise à jour du mot de passe.';
    }
  }

  public async changeEmail(currentPassword: string, newEmail: string): Promise<string | null> {
    if (!this.currentUser || !this.token) return 'Utilisateur non connecté.';
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return 'Format d’adresse e-mail invalide.';
    }

    const reauthErr = await this.reauthenticate(currentPassword);
    if (reauthErr) return reauthErr;

    try {
      const res = await fetch(`${IDENTITY_BASE}/accounts:update?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: this.token, email: cleanEmail, returnSecureToken: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        return mapFirebaseAuthError(data?.error?.message);
      }
      if (data.idToken) {
        this.token = data.idToken;
        this.refreshToken = data.refreshToken || this.refreshToken;
        firestoreEngine.setToken(this.token);
      }
      this.currentUser = { ...this.currentUser, email: cleanEmail, emailVerified: false };
      await firestoreEngine.patchFields('users', this.currentUser.id, {
        email: cleanEmail,
        emailVerified: false,
        updatedAt: new Date().toISOString(),
      });
      await this.resendVerificationEmail();
      await this.persistSession();
      this.notify();
      return null;
    } catch {
      return 'Erreur lors du changement d’adresse e-mail.';
    }
  }

  /**
   * Suppression sécurisée du compte avec réauthentification et anonymisation/archivage des annonces
   */
  public async deleteAccount(currentPassword: string): Promise<string | null> {
    if (!this.currentUser || !this.token) return 'Utilisateur non connecté.';
    const uid = this.currentUser.id;

    const reauthErr = await this.reauthenticate(currentPassword);
    if (reauthErr) return reauthErr;

    try {
      // 1. Archiver et anonymiser les annonces appartenant à cet utilisateur
      const userListings = await firestoreEngine.runStructuredQuery<{ id: string }>({
        collectionId: 'properties',
        whereFilters: [{ field: { fieldPath: 'ownerId' }, op: 'EQUAL', value: { stringValue: uid } }],
        limit: 100,
      });
      for (const prop of userListings) {
        await firestoreEngine.patchFields('properties', prop.id, {
          listingStatus: 'ARCHIVED',
          agentName: 'Compte supprimé',
          agentPhone: '',
          updatedAt: new Date().toISOString(),
        });
      }

      // 2. Nettoyer les favoris de l'utilisateur
      const favs = await firestoreEngine.getCollection(`users/${uid}/favorites`, 100);
      for (const f of favs) {
        await firestoreEngine.deleteDocument(`users/${uid}/favorites`, f.id);
      }

      // 3. Supprimer le document utilisateur Firestore
      await firestoreEngine.deleteDocument('users', uid);

      // 4. Supprimer le compte Firebase Auth
      const res = await fetch(`${IDENTITY_BASE}/accounts:delete?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: this.token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return mapFirebaseAuthError(data?.error?.message);
      }

      await this.logout();
      return null;
    } catch {
      return 'Erreur lors de la suppression du compte.';
    }
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
    this.refreshToken = null;
    firestoreEngine.setToken(null);
    await favoritesApiService.clear();
    await this.safeStorageRemove(STORAGE_KEY_TOKEN);
    await this.safeStorageRemove(STORAGE_KEY_REFRESH);
    await this.safeStorageRemove(STORAGE_KEY_USER);
    this.notify();
  }
}

export const authService = AuthService.getInstance();
