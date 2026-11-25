// ============================================================
// DARLINK — SERVICE DES FAVORIS CLOUD FIRESTORE (React Native)
// Persistance Cloud Firestore sur users/{userId}/favorites/{propertyId}
// Synchronisation temps réel, isolation stricte et résilience redémarrages
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { Property } from '../../properties/domain/models/property';
import { propertyApiService } from '../../properties/services/propertyApiService';

const STORAGE_FAV_IDS = '@darlink_favorites_ids';
const STORAGE_FAV_PROPS = '@darlink_favorites_properties';

export interface FirestoreFavoriteDoc {
  id?: string;
  propertyId: string;
  createdAt: string;
  userId?: string;
}

class FavoritesApiService {
  private static instance: FavoritesApiService;
  private favoriteIds = new Set<string>();
  private cachedFavorites: Property[] = [];
  private listeners = new Set<() => void>();
  private isInitialized = false;
  private currentUserId: string | null = null;

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

  public static getInstance(): FavoritesApiService {
    if (!FavoritesApiService.instance) {
      FavoritesApiService.instance = new FavoritesApiService();
    }
    return FavoritesApiService.instance;
  }

  public setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  /**
   * Initialisation : charge les favoris depuis AsyncStorage puis synchronise avec Firestore
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const storedIds = await this.safeStorageGet(STORAGE_FAV_IDS);
      const storedProps = await this.safeStorageGet(STORAGE_FAV_PROPS);

      if (storedIds) {
        const parsedIds = JSON.parse(storedIds) as string[];
        this.favoriteIds = new Set(parsedIds.map(String));
      }
      if (storedProps) {
        this.cachedFavorites = JSON.parse(storedProps) as Property[];
      }
      this.isInitialized = true;
      this.notify();

      if (this.currentUserId) {
        await this.syncWithBackend();
      }
    } catch (e) {
      console.warn('[DarLink Favorites] Erreur chargement local :', e);
      this.isInitialized = true;
    }
  }

  public addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Ignorer les erreurs d'écouteurs détachés
      }
    });
  }

  private async persistLocally(): Promise<void> {
    await this.safeStorageSet(STORAGE_FAV_IDS, JSON.stringify(Array.from(this.favoriteIds)));
    await this.safeStorageSet(STORAGE_FAV_PROPS, JSON.stringify(this.cachedFavorites));
  }

  /**
   * Synchronisation avec Cloud Firestore : users/{userId}/favorites
   */
  public async syncWithBackend(): Promise<void> {
    const uid = this.currentUserId;
    if (!uid) return;

    try {
      const subcollectionPath = `users/${uid}/favorites`;
      const docs = await firestoreEngine.getCollection<FirestoreFavoriteDoc>(subcollectionPath);

      if (Array.isArray(docs)) {
        const remoteIds = new Set(docs.map((d) => String(d.propertyId || d.id)));
        this.favoriteIds = remoteIds;

        const allProps = await propertyApiService.getProperties();
        this.cachedFavorites = allProps.filter((p) => this.favoriteIds.has(String(p.id)));

        await this.persistLocally();
        this.notify();
      }
    } catch {
      // Conserver les favoris locaux en cas de coupure réseau
    }
  }

  public async clear(): Promise<void> {
    this.favoriteIds.clear();
    this.cachedFavorites = [];
    this.currentUserId = null;
    await this.safeStorageRemove(STORAGE_FAV_IDS);
    await this.safeStorageRemove(STORAGE_FAV_PROPS);
    this.notify();
  }

  public getCachedFavorites(): Property[] {
    return this.cachedFavorites;
  }

  public async getFavorites(): Promise<Property[]> {
    if (!this.isInitialized) {
      await this.init();
    }
    if (this.currentUserId) {
      await this.syncWithBackend();
    }
    return this.cachedFavorites;
  }

  public isFavorite(propertyId: string | number): boolean {
    return this.favoriteIds.has(String(propertyId));
  }

  /**
   * Bascule l'état favori et persiste dans Cloud Firestore
   */
  public async toggleFavorite(propertyId: string | number, property?: Property): Promise<boolean> {
    const strId = String(propertyId);
    const willBeFavorite = !this.favoriteIds.has(strId);

    if (willBeFavorite) {
      this.favoriteIds.add(strId);
      if (property && !this.cachedFavorites.some((p) => String(p.id) === strId)) {
        this.cachedFavorites.push(property);
      } else {
        const allProps = await propertyApiService.getProperties();
        const prop = allProps.find((p) => String(p.id) === strId);
        if (prop && !this.cachedFavorites.some((p) => String(p.id) === strId)) {
          this.cachedFavorites.push(prop);
        }
      }
    } else {
      this.favoriteIds.delete(strId);
      this.cachedFavorites = this.cachedFavorites.filter((p) => String(p.id) !== strId);
    }

    // Persistance locale immédiate
    await this.persistLocally();
    this.notify();

    // Persistance distante dans Cloud Firestore sous users/{userId}/favorites/{propertyId}
    const uid = this.currentUserId;
    if (uid) {
      const subcollectionPath = `users/${uid}/favorites`;
      try {
        if (willBeFavorite) {
          await firestoreEngine.setDocument(subcollectionPath, strId, {
            propertyId: strId,
            userId: uid,
            createdAt: new Date().toISOString(),
          });
        } else {
          await firestoreEngine.deleteDocument(subcollectionPath, strId);
        }
      } catch (err) {
        console.warn('[DarLink Favorites] Synchronisation Cloud Firestore différée :', err);
      }
    }

    return willBeFavorite;
  }
}

export const favoritesApiService = FavoritesApiService.getInstance();
