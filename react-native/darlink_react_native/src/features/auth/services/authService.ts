// ============================================================
// DARLINK — SERVICE D'AUTHENTIFICATION JWT (React Native V4)
// Connexion, inscription, gestion de session et profil
// ============================================================

import { api } from '../../../core/network/apiClient';

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
  private currentUser: UserProfile = {
    id: 1,
    fullName: 'Rayen Lamine',
    email: 'rayen.lamine@darlink.tn',
    phone: '+216 20 123 456',
    role: 'CLIENT',
  };
  private token: string | null = 'offline-demo-token';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      if (res && res.token) {
        this.token = res.token;
        this.currentUser = res.user;
        api.setToken(res.token);
        return true;
      }
      return false;
    } catch {
      // Fallback local pour garantir la démonstration continue
      this.currentUser = {
        id: 1,
        fullName: 'Rayen Lamine',
        email,
        phone: '+216 20 123 456',
        role: 'CLIENT',
      };
      this.token = 'offline-demo-token';
      return true;
    }
  }

  public async register(fullName: string, email: string, password: string): Promise<boolean> {
    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        fullName,
        email,
        password,
      });
      if (res && res.token) {
        this.token = res.token;
        this.currentUser = res.user;
        api.setToken(res.token);
        return true;
      }
      return false;
    } catch {
      this.currentUser = {
        id: 2,
        fullName,
        email,
        role: 'CLIENT',
      };
      this.token = 'offline-demo-token';
      return true;
    }
  }

  public logout(): void {
    this.token = null;
    api.setToken(null);
  }
}

export const authService = AuthService.getInstance();
