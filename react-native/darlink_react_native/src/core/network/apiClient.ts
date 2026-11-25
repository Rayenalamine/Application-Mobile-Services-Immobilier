// ============================================================
// DARLINK — CLIENT RÉSEAU CENTRALISÉ (React Native V3-V8)
// Client REST connectant l'application au backend Spring Boot 3
// Support dynamique : Web (localhost), Simulateurs et Smartphones Expo Go (LAN IP)
// ============================================================

import { ApiException, ProblemDetail } from '../errors/problemDetails';

function getPlatformOS(): string {
  try {
    // Dynamic import to avoid esbuild/Node.js parsing errors in CLI test runners
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RN = require('react-native');
    return RN?.Platform?.OS || 'web';
  } catch {
    return 'web';
  }
}

function getExpoHostUri(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ConstantsModule = require('expo-constants');
    const Constants = ConstantsModule?.default || ConstantsModule;
    return Constants?.expoConfig?.hostUri;
  } catch {
    return undefined;
  }
}

function resolveBaseUrl(): string {
  // 1. Détection via variable d'environnement Expo
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  // 2. Si on est sur le Web, localhost est toujours privilégié
  if (getPlatformOS() === 'web') {
    return envUrl || 'http://localhost:8085/api/v1';
  }

  // 3. Sur mobile physique (Expo Go), récupérer automatiquement l'IP de la machine de dev
  const hostUri = getExpoHostUri();
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      const detected = `http://${hostIp}:8085/api/v1`;
      console.log(`[DarLink API] IP machine détectée automatiquement via Expo : ${detected}`);
      return detected;
    }
  }

  // 4. Fallback variable LAN ou IP par défaut du réseau local
  return process.env.EXPO_PUBLIC_LAN_API_BASE_URL || 'http://172.16.150.192:8085/api/v1';
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private authToken: string | null = null;

  private constructor() {
    this.baseUrl = resolveBaseUrl();
    console.log(`[DarLink API] Initialisation ApiClient sur : ${this.baseUrl} (Plateforme : ${getPlatformOS()})`);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl;
    console.log(`[DarLink API] BaseUrl mise à jour : ${this.baseUrl}`);
  }

  public setToken(token: string | null) {
    this.authToken = token;
  }

  public getToken(): string | null {
    return this.authToken;
  }

  public async get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (queryParams) {
      const parts: string[] = [];
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
        }
      });
      if (parts.length > 0) {
        url += `?${parts.join('&')}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, { method: 'DELETE' });
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const method = options.method || 'GET';
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    console.log(`[DarLink API] 🚀 ${method} ${url}`);

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let problem: ProblemDetail;
        if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
          problem = await response.json();
        } else {
          const rawText = await response.text();
          problem = {
            type: 'urn:darlink:error:http',
            title: `HTTP ${response.status}`,
            status: response.status,
            detail: rawText || `Erreur serveur HTTP ${response.status}`,
          };
        }
        console.error(`[DarLink API] ❌ HTTP ${response.status} sur ${method} ${url}`, problem);
        throw new ApiException(problem);
      }

      console.log(`[DarLink API] ✅ HTTP ${response.status} pour ${method} ${url}`);

      if (response.status === 204) {
        return {} as T;
      }

      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      const errorMsg = err instanceof Error ? err.message : 'Impossible de contacter le serveur DarLink';
      console.error(`[DarLink API] ⚠️ Échec réseau sur ${method} ${url} : ${errorMsg}`);
      throw new ApiException({
        type: 'urn:darlink:error:network',
        title: 'Erreur réseau',
        status: 0,
        detail: `Impossible de contacter le serveur (${this.baseUrl}). Vérifiez que le backend Spring Boot est actif sur le port 8085 et que votre téléphone est sur le même Wi-Fi.`,
      });
    }
  }
}

export const api = ApiClient.getInstance();
