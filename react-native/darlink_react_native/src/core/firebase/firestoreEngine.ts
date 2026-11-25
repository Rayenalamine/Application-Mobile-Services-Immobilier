// ============================================================
// DARLINK — MOTEUR CLOUD FIRESTORE & FIREBASE AUTH (React Native)
// Connecteur direct haute performance vers Cloud Firestore & Firebase Auth
// Persistance cloud intégrale, résilience hors-ligne et compatibilité Expo
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultFirebaseConfig, FirebaseConfig } from './firebaseConfig';

export interface FirestoreFieldMap {
  [key: string]: unknown;
}

export interface FirestoreDoc<T = FirestoreFieldMap> {
  id: string;
  name?: string;
  fields: T;
  createTime?: string;
  updateTime?: string;
}

export class FirestoreEngine {
  private static instance: FirestoreEngine;
  private config: FirebaseConfig = defaultFirebaseConfig;
  private idToken: string | null = null;
  private localCache: Map<string, unknown> = new Map();

  private constructor() {
    this.restoreToken();
  }

  public static getInstance(): FirestoreEngine {
    if (!FirestoreEngine.instance) {
      FirestoreEngine.instance = new FirestoreEngine();
    }
    return FirestoreEngine.instance;
  }

  public setToken(token: string | null): void {
    this.idToken = token;
    if (token) {
      AsyncStorage.setItem('@darlink_fb_id_token', token).catch(() => {});
    } else {
      AsyncStorage.removeItem('@darlink_fb_id_token').catch(() => {});
    }
  }

  public getToken(): string | null {
    return this.idToken;
  }

  private async restoreToken(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@darlink_fb_id_token');
      if (stored) {
        this.idToken = stored;
      }
    } catch {
      // Ignore
    }
  }

  private get firestoreBaseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents`;
  }

  private get authBaseUrl(): string {
    return `https://identitytoolkit.googleapis.com/v1`;
  }

  /**
   * Convertit une valeur JS en format Firestore REST
   */
  public toFirestoreValue(val: unknown): Record<string, unknown> {
    if (val === null || val === undefined) {
      return { nullValue: null };
    }
    if (typeof val === 'boolean') {
      return { booleanValue: val };
    }
    if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        return { integerValue: val.toString() };
      }
      return { doubleValue: val };
    }
    if (typeof val === 'string') {
      return { stringValue: val };
    }
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map((v) => this.toFirestoreValue(v)),
        },
      };
    }
    if (typeof val === 'object') {
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        fields[k] = this.toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  /**
   * Convertit une valeur Firestore REST en valeur JS normale
   */
  public fromFirestoreValue(val: Record<string, unknown>): unknown {
    if (!val || typeof val !== 'object') return null;
    if ('nullValue' in val) return null;
    if ('booleanValue' in val) return Boolean(val.booleanValue);
    if ('integerValue' in val) return parseInt(val.integerValue as string, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue as string);
    if ('stringValue' in val) return String(val.stringValue);
    if ('timestampValue' in val) return String(val.timestampValue);
    if ('arrayValue' in val) {
      const arr = val.arrayValue as { values?: Record<string, unknown>[] };
      return (arr.values || []).map((v) => this.fromFirestoreValue(v));
    }
    if ('mapValue' in val) {
      const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
      const res: Record<string, unknown> = {};
      if (map.fields) {
        for (const [k, v] of Object.entries(map.fields)) {
          res[k] = this.fromFirestoreValue(v);
        }
      }
      return res;
    }
    return null;
  }

  /**
   * Convertit un objet JS plat en document Firestore
   */
  public toFirestoreDoc(data: Record<string, unknown>): { fields: Record<string, unknown> } {
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields[key] = this.toFirestoreValue(value);
      }
    }
    return { fields };
  }

  /**
   * Extrait les champs d'un document Firestore en objet JS
   */
  public fromFirestoreDoc<T = Record<string, unknown>>(doc: {
    name?: string;
    fields?: Record<string, Record<string, unknown>>;
    createTime?: string;
    updateTime?: string;
  }): T & { id: string } {
    const result: Record<string, unknown> = {};
    if (doc.fields) {
      for (const [key, value] of Object.entries(doc.fields)) {
        result[key] = this.fromFirestoreValue(value);
      }
    }
    // Extrait l'ID du document depuis son chemin complet
    const docId = doc.name ? doc.name.split('/').pop() || '' : '';
    return { ...result, id: result.id ? String(result.id) : docId } as T & { id: string };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.idToken) {
      headers['Authorization'] = `Bearer ${this.idToken}`;
    }
    return headers;
  }

  /**
   * GET /documents/{collectionPath}
   */
  public async getCollection<T = Record<string, unknown>>(collectionPath: string): Promise<Array<T & { id: string }>> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}?key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Fallback vers le cache local
        const cached = await this.getCachedCollection<T>(collectionPath);
        return cached;
      }

      const json = await response.json();
      if (!json.documents || !Array.isArray(json.documents)) {
        return [];
      }

      const items = json.documents.map((doc: Parameters<typeof this.fromFirestoreDoc>[0]) =>
        this.fromFirestoreDoc<T>(doc)
      );

      // Met en cache pour usage hors-ligne
      await this.setCachedCollection(collectionPath, items);
      return items;
    } catch {
      return this.getCachedCollection<T>(collectionPath);
    }
  }

  /**
   * GET /documents/{collectionPath}/{docId}
   */
  public async getDocument<T = Record<string, unknown>>(
    collectionPath: string,
    docId: string
  ): Promise<(T & { id: string }) | null> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      return this.fromFirestoreDoc<T>(json);
    } catch {
      return null;
    }
  }

  /**
   * PATCH /documents/{collectionPath}/{docId} (Upsert avec setDoc)
   */
  public async setDocument(
    collectionPath: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    const body = JSON.stringify(this.toFirestoreDoc(data));

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body,
      });

      // Mettre à jour le cache local immédiatement
      await this.updateLocalDoc(collectionPath, docId, data);
      return response.ok;
    } catch {
      await this.updateLocalDoc(collectionPath, docId, data);
      return false;
    }
  }

  /**
   * POST /documents/{collectionPath} (Création avec ID auto)
   */
  public async addDocument(
    collectionPath: string,
    data: Record<string, unknown>,
    customId?: string
  ): Promise<string> {
    const docId = customId || String(Date.now());
    await this.setDocument(collectionPath, docId, { ...data, id: docId });
    return docId;
  }

  /**
   * DELETE /documents/{collectionPath}/{docId}
   */
  public async deleteDocument(collectionPath: string, docId: string): Promise<boolean> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.removeLocalDoc(collectionPath, docId);
      return response.ok;
    } catch {
      await this.removeLocalDoc(collectionPath, docId);
      return false;
    }
  }

  // ============================================================
  // CACHE LOCAL ET RÉSILIENCE HORS-LIGNE
  // ============================================================

  private getCacheKey(collectionPath: string): string {
    return `@darlink_fb_cache_${collectionPath.replace(/\//g, '_')}`;
  }

  public async getCachedCollection<T>(collectionPath: string): Promise<Array<T & { id: string }>> {
    try {
      const raw = await AsyncStorage.getItem(this.getCacheKey(collectionPath));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    return [];
  }

  public async setCachedCollection<T>(collectionPath: string, items: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.getCacheKey(collectionPath), JSON.stringify(items));
    } catch {
      // Ignore
    }
  }

  private async updateLocalDoc(collectionPath: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const list = await this.getCachedCollection<Record<string, unknown>>(collectionPath);
      const idx = list.findIndex((item) => String(item.id) === String(docId));
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data, id: docId };
      } else {
        list.unshift({ ...data, id: docId });
      }
      await this.setCachedCollection(collectionPath, list);
    } catch {
      // Ignore
    }
  }

  private async removeLocalDoc(collectionPath: string, docId: string): Promise<void> {
    try {
      const list = await this.getCachedCollection<Record<string, unknown>>(collectionPath);
      const filtered = list.filter((item) => String(item.id) !== String(docId));
      await this.setCachedCollection(collectionPath, filtered);
    } catch {
      // Ignore
    }
  }
}

export const firestoreEngine = FirestoreEngine.getInstance();

