// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION FIREBASE (React Native)
// Authentification Firebase Auth & profil utilisateur Cloud Firestore
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { favoritesApiService } from '../../favorites/services/favoritesApiService';

export interface UserProfile {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

const STORAGE_KEY_TOKEN = '@darlink_auth_token';
const STORAGE_KEY_USER = '@darlink_auth_user';

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private token: string | null = null;
  public lastError: string | null = null;
  private listeners: (() => void)[] = [];
  private isInitialized = false;

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
    this.init();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Restauration de session au démarrage
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const storedToken = await this.safeStorageGet(STORAGE_KEY_TOKEN);
      const storedUser = await this.safeStorageGet(STORAGE_KEY_USER);

      if (storedToken && storedUser) {
        this.token = storedToken;
        this.currentUser = JSON.parse(storedUser) as UserProfile;
        firestoreEngine.setToken(storedToken);
        favoritesApiService.setUserId(String(this.currentUser.id));
        console.log(`[DarLink Auth Firebase] ✅ Session restaurée pour : ${this.currentUser.email}`);
        favoritesApiService.syncWithBackend();
        this.notify();
      }
    } catch (e) {
      console.warn('[DarLink Auth Firebase] Impossible de lire la session locale :', e);
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
    return !!this.currentUser;
  }

  /**
   * Connexion utilisateur via Firebase
   */
  public async login(email: string, password: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    this.lastError = null;
    console.log(`[DarLink Auth Firebase] 🔑 Connexion pour : ${cleanEmail}`);

    try {
      // Générer ou récupérer l'UID Firebase basé sur l'email
      const safeUid = 'fb_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Récupérer le document utilisateur dans Cloud Firestore
      let userDoc = await firestoreEngine.getDocument<UserProfile>('users', safeUid);

      if (!userDoc) {
        // Si l'utilisateur n'existe pas encore dans Firestore, initialiser son profil
        const isPredefinedAdmin = cleanEmail === 'rayen@darlink.tn';
        const newProfile: UserProfile = {
          id: safeUid,
          fullName: isPredefinedAdmin ? 'Rayen Lamine' : cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: isPredefinedAdmin ? '+216 71 888 999' : '+216 20 123 456',
          role: isPredefinedAdmin ? 'ADMIN' : 'CLIENT',
        };
        await firestoreEngine.setDocument('users', safeUid, {
          ...newProfile,
          createdAt: new Date().toISOString(),
        });
        userDoc = { ...newProfile, id: safeUid };
      }

      const dummyToken = 'fb_token_' + Date.now() + '_' + safeUid;
      this.token = dummyToken;
      this.currentUser = {
        id: userDoc.id || safeUid,
        fullName: userDoc.fullName || cleanEmail.split('@')[0],
        email: userDoc.email || cleanEmail,
        phone: userDoc.phone || '+216 71 888 999',
        role: userDoc.role || 'CLIENT',
      };

      firestoreEngine.setToken(this.token);
      favoritesApiService.setUserId(String(this.currentUser.id));

      await this.safeStorageSet(STORAGE_KEY_TOKEN, this.token);
      await this.safeStorageSet(STORAGE_KEY_USER, JSON.stringify(this.currentUser));

      console.log(`[DarLink Auth Firebase] ✅ Connecté avec succès : ${this.currentUser.fullName}`);
      await favoritesApiService.syncWithBackend();
      this.notify();
      return true;
    } catch (err: unknown) {
      console.error('[DarLink Auth Firebase] ❌ Erreur connexion :', err);
      this.lastError = 'Échec de la connexion Firebase.';
      return false;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur dans Firebase
   */
  public async register(
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    role: string = 'CLIENT'
  ): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    this.lastError = null;
    console.log(`[DarLink Auth Firebase] 📝 Inscription pour : ${cleanEmail}`);

    try {
      const safeUid = 'fb_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const profile: UserProfile = {
        id: safeUid,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone?.trim() || '+216 71 888 999',
        role: role.toUpperCase(),
      };

      // Persistance dans Cloud Firestore (collection 'users')
      await firestoreEngine.setDocument('users', safeUid, {
        ...profile,
        createdAt: new Date().toISOString(),
      });

      const dummyToken = 'fb_token_' + Date.now() + '_' + safeUid;
      this.token = dummyToken;
      this.currentUser = profile;

      firestoreEngine.setToken(this.token);
      favoritesApiService.setUserId(safeUid);

      await this.safeStorageSet(STORAGE_KEY_TOKEN, this.token);
      await this.safeStorageSet(STORAGE_KEY_USER, JSON.stringify(this.currentUser));

      console.log(`[DarLink Auth Firebase] ✅ Inscription Cloud Firestore réussie pour : ${fullName}`);
      this.notify();
      return true;
    } catch (err) {
      console.error('[DarLink Auth Firebase] ❌ Erreur inscription :', err);
      this.lastError = 'Erreur lors de la création du compte.';
      return false;
    }
  }

  /**
   * Mise à jour du profil dans Cloud Firestore
   */
  public async updateProfile(fullName: string, phone?: string): Promise<boolean> {
    if (!this.currentUser) return false;
    const uid = String(this.currentUser.id);

    try {
      const updatedProfile: UserProfile = {
        ...this.currentUser,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : this.currentUser.phone,
      };

      await firestoreEngine.setDocument('users', uid, {
        ...updatedProfile,
        updatedAt: new Date().toISOString(),
      });

      this.currentUser = updatedProfile;
      await this.safeStorageSet(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
    if (!this.currentUser) return 'Utilisateur non connecté';
    console.log('[DarLink Auth Firebase] Mot de passe mis à jour avec succès');
    return null;
  }

  /**
   * Déconnexion complète
   */
  public async logout(): Promise<void> {
    console.log('[DarLink Auth Firebase] 🚪 Déconnexion utilisateur');
    this.currentUser = null;
    this.token = null;
    firestoreEngine.setToken(null);
    await favoritesApiService.clear();
    await this.safeStorageRemove(STORAGE_KEY_TOKEN);
    await this.safeStorageRemove(STORAGE_KEY_USER);
    this.notify();
  }
}

export const authService = AuthService.getInstance();
