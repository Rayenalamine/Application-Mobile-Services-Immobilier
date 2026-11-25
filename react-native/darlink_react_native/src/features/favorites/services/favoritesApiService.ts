// ============================================================
// DARLINK — SERVICE DES FAVORIS CLOUD FIRESTORE RÉACTIF (React Native)
// Persistance Cloud Firestore sur users/{userId}/favorites/{propertyId}
// Isolation stricte par UID, zéro pollution inter-comptes,
// écouteur temps réel (synchronisation cross-device).
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
import { getFirebaseDb } from '../../../core/firebase/firebaseSdk';
import { Property } from '../../properties/domain/models/property';
import { propertyApiService } from '../../properties/services/propertyApiService';

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
  private unsubscribeSnapshot: (() => void) | null = null;
  private pendingToggles = new Set<string>();

  private getStorageKey(suffix: string): string {
    const uidScope = this.currentUserId ? `user_${this.currentUserId}` : 'guest';
    return `@darlink_fav_${uidScope}_${suffix}`;
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
      // Ignorer
    }
  }

  private async safeStorageRemove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignorer
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

  /**
   * Définit l'identifiant utilisateur courant avec isolation stricte.
   * Vide immédiatement la mémoire vive et recharge les favoris du compte cible.
   */
  public setUserId(userId: string | null): void {
    if (this.currentUserId !== userId) {
      this.favoriteIds.clear();
      this.cachedFavorites = [];
      this.currentUserId = userId;
      this.isInitialized = false;
      this.notify();

      if (userId) {
        this.init().then(() => this.syncWithBackend());
        this.startRealtimeSync();
      } else {
        this.stopRealtimeSync();
      }
    }
  }

  /**
   * Initialisation : charge les favoris scopés par cet utilisateur
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const keyIds = this.getStorageKey('ids');
      const keyProps = this.getStorageKey('props');

      const storedIds = await this.safeStorageGet(keyIds);
      const storedProps = await this.safeStorageGet(keyProps);

      if (storedIds) {
        const parsedIds = JSON.parse(storedIds) as string[];
        this.favoriteIds = new Set(parsedIds.map(String));
      } else {
        this.favoriteIds.clear();
      }

      if (storedProps) {
        this.cachedFavorites = JSON.parse(storedProps) as Property[];
      } else {
        this.cachedFavorites = [];
      }

      this.isInitialized = true;
      this.notify();
    } catch (e) {
      console.warn('[DarLink Favorites] Erreur chargement local scopé :', e);
      this.favoriteIds.clear();
      this.cachedFavorites = [];
      this.isInitialized = true;
      this.notify();
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
        // Ignorer
      }
    });
  }

  private async persistLocally(): Promise<void> {
    const keyIds = this.getStorageKey('ids');
    const keyProps = this.getStorageKey('props');
    await this.safeStorageSet(keyIds, JSON.stringify(Array.from(this.favoriteIds)));
    await this.safeStorageSet(keyProps, JSON.stringify(this.cachedFavorites));
  }

  /**
   * Démarre le listener Firestore temps réel onSnapshot() sur users/{uid}/favorites
   */
  public startRealtimeSync(): void {
    this.stopRealtimeSync();
    const uid = this.currentUserId;
    if (!uid) return;

    try {
      const db = getFirebaseDb();
      const favRef = collection(db, 'users', uid, 'favorites');
      this.unsubscribeSnapshot = onSnapshot(
        favRef,
        async (snapshot) => {
          if (this.currentUserId !== uid) return;
          const remoteIds = new Set(
            snapshot.docs.map((d) => String((d.data() as FirestoreFavoriteDoc).propertyId || d.id))
          );
          for (const pendingId of this.pendingToggles) {
            if (this.favoriteIds.has(pendingId)) {
              remoteIds.add(pendingId);
            } else {
              remoteIds.delete(pendingId);
            }
          }
          const isDifferent =
            remoteIds.size !== this.favoriteIds.size ||
            Array.from(remoteIds).some((id) => !this.favoriteIds.has(id));
          if (isDifferent) {
            this.favoriteIds = remoteIds;
            const allProps = await propertyApiService.getProperties();
            this.cachedFavorites = allProps.filter((p) => this.favoriteIds.has(String(p.id)));
            await this.persistLocally();
            this.notify();
          }
        },
        (err) => {
          console.warn('[DarLink Favorites] Erreur listener Firestore onSnapshot:', err.message);
        }
      );
    } catch (err) {
      console.warn('[DarLink Favorites] Snapshot listener init skipped:', err);
    }
  }

  public stopRealtimeSync(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
  }

  /**
   * Synchronisation bidirectionnelle stricte avec Cloud Firestore : users/{userId}/favorites
   */
  public async syncWithBackend(): Promise<void> {
    const uid = this.currentUserId;
    if (!uid) {
      this.favoriteIds.clear();
      this.cachedFavorites = [];
      this.notify();
      return;
    }

    try {
      const subcollectionPath = `users/${uid}/favorites`;
      const docs = await firestoreEngine.getCollection<FirestoreFavoriteDoc>(subcollectionPath);

      // Si l'utilisateur n'a aucun favori en base, TOUJOURS réinitialiser la liste (ne jamais laisser traîner un ancien compte)
      if (!Array.isArray(docs) || docs.length === 0) {
        const hadFavorites = this.favoriteIds.size > 0;
        this.favoriteIds.clear();
        this.cachedFavorites = [];
        await this.persistLocally();
        if (hadFavorites) this.notify();
        return;
      }

      const remoteIds = new Set(docs.map((d) => String(d.propertyId || d.id)));

      // Vérifier s'il y a eu des changements avant de déclencher des re-rendus
      const isDifferent =
        remoteIds.size !== this.favoriteIds.size ||
        Array.from(remoteIds).some((id) => !this.favoriteIds.has(id));

      if (isDifferent) {
        this.favoriteIds = remoteIds;
        const allProps = await propertyApiService.getProperties();
        this.cachedFavorites = allProps.filter((p) => this.favoriteIds.has(String(p.id)));

        await this.persistLocally();
        this.notify();
      }
    } catch (err) {
      console.warn('[DarLink Favorites] Synchronisation distante impossible (mode hors-ligne) :', err);
    }
  }

  /**
   * Réinitialisation intégrale lors de la déconnexion
   */
  public async clear(): Promise<void> {
    this.stopRealtimeSync();
    const oldKeyIds = this.getStorageKey('ids');
    const oldKeyProps = this.getStorageKey('props');

    this.favoriteIds.clear();
    this.cachedFavorites = [];
    this.currentUserId = null;
    this.isInitialized = false;

    await this.safeStorageRemove(oldKeyIds);
    await this.safeStorageRemove(oldKeyProps);
    // Nettoyer également les anciennes clés globales résiduelles
    await this.safeStorageRemove('@darlink_favorites_ids');
    await this.safeStorageRemove('@darlink_favorites_properties');

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
   * Bascule l'état favori et persiste dans Cloud Firestore avec mise à jour optimiste
   */
  public async toggleFavorite(propertyId: string | number, property?: Property): Promise<boolean> {
    const strId = String(propertyId);
    this.pendingToggles.add(strId);
    const willBeFavorite = !this.favoriteIds.has(strId);

    try {
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

      // Persistance locale scopée
      await this.persistLocally();
      this.notify();

      // Persistance Cloud Firestore : users/{userId}/favorites/{propertyId}
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
    } finally {
      this.pendingToggles.delete(strId);
    }
  }
}

export const favoritesApiService = FavoritesApiService.getInstance();
