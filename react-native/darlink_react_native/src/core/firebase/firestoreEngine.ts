// ============================================================
// DARLINK — MOTEUR CLOUD FIRESTORE & STRUCTURED QUERY (React Native)
// Connecteur direct REST vers Cloud Firestore (:runQuery, CRUD, cache hors-ligne)
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultFirebaseConfig, FirebaseConfig } from './firebaseConfig';

export interface FirestoreFieldMap {
  [key: string]: unknown;
}

export interface StructuredFieldFilter {
  field: { fieldPath: string };
  op:
    | 'EQUAL'
    | 'NOT_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'ARRAY_CONTAINS'
    | 'IN';
  value: Record<string, unknown>;
}

export interface StructuredOrderBy {
  field: { fieldPath: string };
  direction: 'ASCENDING' | 'DESCENDING';
}

export class FirestoreEngine {
  private static instance: FirestoreEngine;
  private config: FirebaseConfig = defaultFirebaseConfig;
  private idToken: string | null = null;

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

  public toFirestoreValue(val: unknown): Record<string, unknown> {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: val.toString() };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((v) => this.toFirestoreValue(v)) } };
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

  public toFirestoreDoc(data: Record<string, unknown>): { fields: Record<string, unknown> } {
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields[key] = this.toFirestoreValue(value);
      }
    }
    return { fields };
  }

  public fromFirestoreDoc<T = Record<string, unknown>>(doc: {
    name?: string;
    fields?: Record<string, Record<string, unknown>>;
  }): T & { id: string } {
    const result: Record<string, unknown> = {};
    if (doc.fields) {
      for (const [key, value] of Object.entries(doc.fields)) {
        result[key] = this.fromFirestoreValue(value);
      }
    }
    const docId = doc.name ? doc.name.split('/').pop() || '' : '';
    return { ...result, id: result.id ? String(result.id) : docId } as T & { id: string };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.idToken) {
      headers['Authorization'] = `Bearer ${this.idToken}`;
    }
    return headers;
  }

  public async getCollection<T = Record<string, unknown>>(
    collectionPath: string,
    pageSize: number = 50
  ): Promise<Array<T & { id: string }>> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}?pageSize=${pageSize}&key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
      if (!response.ok) return [];
      const json = await response.json();
      if (!json.documents || !Array.isArray(json.documents)) return [];
      return json.documents.map((doc: Parameters<typeof this.fromFirestoreDoc>[0]) =>
        this.fromFirestoreDoc<T>(doc)
      );
    } catch {
      return [];
    }
  }

  /**
   * Requête structurée Firestore côté serveur (:runQuery) avec filtres, tri et pagination
   */
  public async runStructuredQuery<T = Record<string, unknown>>(params: {
    collectionId: string;
    whereFilters?: StructuredFieldFilter[];
    orderBy?: StructuredOrderBy[];
    limit?: number;
    offset?: number;
  }): Promise<Array<T & { id: string }>> {
    const url = `${this.firestoreBaseUrl}:runQuery?key=${this.config.apiKey}`;
    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: params.collectionId }],
      limit: params.limit ?? 30,
    };
    if (params.offset && params.offset > 0) {
      structuredQuery.offset = params.offset;
    }
    if (params.whereFilters && params.whereFilters.length === 1) {
      structuredQuery.where = { fieldFilter: params.whereFilters[0] };
    } else if (params.whereFilters && params.whereFilters.length > 1) {
      structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters: params.whereFilters.map((f) => ({ fieldFilter: f })),
        },
      };
    }
    if (params.orderBy && params.orderBy.length > 0) {
      structuredQuery.orderBy = params.orderBy;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ structuredQuery }),
      });
      if (!response.ok) return [];
      const json = await response.json();
      if (!Array.isArray(json)) return [];
      const items: Array<T & { id: string }> = [];
      for (const row of json) {
        if (row && row.document) {
          items.push(this.fromFirestoreDoc<T>(row.document));
        }
      }
      return items;
    } catch {
      return [];
    }
  }

  public async getDocument<T = Record<string, unknown>>(
    collectionPath: string,
    docId: string
  ): Promise<(T & { id: string }) | null> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
      if (!response.ok) return null;
      const json = await response.json();
      return this.fromFirestoreDoc<T>(json);
    } catch {
      return null;
    }
  }

  public async setDocument(
    collectionPath: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    const body = JSON.stringify(this.toFirestoreDoc(data));
    try {
      const response = await fetch(url, { method: 'PATCH', headers: this.getHeaders(), body });
      return response.ok;
    } catch {
      return false;
    }
  }

  public async patchFields(
    collectionPath: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const masks = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&');
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?${masks}&key=${this.config.apiKey}`;
    const body = JSON.stringify(this.toFirestoreDoc(data));
    try {
      const response = await fetch(url, { method: 'PATCH', headers: this.getHeaders(), body });
      return response.ok;
    } catch {
      return false;
    }
  }

  public async deleteDocument(collectionPath: string, docId: string): Promise<boolean> {
    const url = `${this.firestoreBaseUrl}/${collectionPath}/${encodeURIComponent(docId)}?key=${this.config.apiKey}`;
    try {
      const response = await fetch(url, { method: 'DELETE', headers: this.getHeaders() });
      return response.status === 200 || response.ok;
    } catch {
      return false;
    }
  }
}

export const firestoreEngine = FirestoreEngine.getInstance();
