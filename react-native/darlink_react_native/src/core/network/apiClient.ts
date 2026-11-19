// ============================================================
// DARLINK — CLIENT RÉSEAU CENTRALISÉ (React Native V3-V8)
// Client REST connectant l'application au backend Spring Boot 3
// ============================================================

import { ApiException, ProblemDetail } from '../errors/problemDetails';

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl = 'http://localhost:8085/api/v1';
  private authToken: string | null = null;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
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

  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, { method: 'DELETE' });
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let problem: ProblemDetail;
        if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
          problem = await response.json();
        } else {
          problem = {
            type: 'urn:darlink:error:http',
            title: `HTTP ${response.status}`,
            status: response.status,
            detail: await response.text(),
          };
        }
        throw new ApiException(problem);
      }

      if (response.status === 204) {
        return {} as T;
      }

      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      throw new ApiException({
        type: 'urn:darlink:error:network',
        title: 'Erreur réseau',
        status: 0,
        detail: err instanceof Error ? err.message : 'Impossible de contacter le serveur DarLink',
      });
    }
  }
}

export const api = ApiClient.getInstance();
