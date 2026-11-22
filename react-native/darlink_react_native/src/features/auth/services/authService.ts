// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION JWT RÉEL (React Native V4)
// Connexion, inscription, gestion de session et profil
// ============================================================

import { api } from '../../../core/network/apiClient';
import { favoritesApiService } from '../../favorites/services/favoritesApiService';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthResponse {
  token: string;
  type: string;
  user: UserProfile;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private token: string | null = null;
  public lastError: string | null = null;
  private listeners: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
    return !!this.token && !!this.currentUser;
  }

  public async login(email: string, password: string): Promise<boolean> {
    try {
      this.lastError = null;
      const res = await api.post<AuthResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      if (res && res.token) {
        this.token = res.token;
        this.currentUser = res.user;
        api.setToken(res.token);
        this.notify();
        return true;
      }
      this.lastError = 'Réponse serveur invalide.';
      return false;
    } catch (e: any) {
      const msg = e?.message || String(e);
      this.lastError =
        msg.includes('401') || msg.includes('Identifiants invalides')
          ? 'Email ou mot de passe incorrect.'
          : 'Impossible de se connecter au serveur DarLink.';
      return false;
    }
  }

  public async register(
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<boolean> {
    try {
      this.lastError = null;
      const res = await api.post<AuthResponse>('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone?.trim(),
      });
      if (res && res.token) {
        this.token = res.token;
        this.currentUser = res.user;
        api.setToken(res.token);
        this.notify();
        return true;
      }
      this.lastError = 'Réponse serveur invalide.';
      return false;
    } catch (e: any) {
      const msg = e?.message || String(e);
      this.lastError = msg.includes('existe déjà')
        ? 'Cet email est déjà enregistré.'
        : 'Erreur lors de la création du compte.';
      return false;
    }
  }

  public async updateProfile(fullName: string, phone?: string): Promise<boolean> {
    try {
      const updated = await api.put<UserProfile>('/users/me', {
        fullName: fullName.trim(),
        phone: phone?.trim(),
      });
      if (updated && updated.id) {
        this.currentUser = updated;
        this.notify();
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<string | null> {
    try {
      const res = await api.post<{ message: string }>('/users/me/change-password', {
        currentPassword,
        newPassword,
      });
      if (res && res.message) {
        return null; // Succès
      }
      return 'Erreur de modification du mot de passe.';
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes('incorrect')) {
        return 'Le mot de passe actuel est incorrect.';
      }
      return 'Erreur lors du changement de mot de passe.';
    }
  }

  public logout(): void {
    this.token = null;
    this.currentUser = null;
    api.setToken(null);
    favoritesApiService.clear();
    this.notify();
  }
}

export const authService = AuthService.getInstance();
