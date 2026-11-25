// ============================================================
// DARLINK — SERVICE DES FAVORIS (React Native V6, V9 & Persistence)
// Synchronisation REST avec Spring Boot & persistance réelle AsyncStorage
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../core/network/apiClient';
import { Property } from '../../properties/domain/models/property';
import { propertyApiService, SpringPropertyDto } from '../../properties/services/propertyApiService';

const STORAGE_FAV_IDS = '@darlink_favorites_ids';
const STORAGE_FAV_PROPS = '@darlink_favorites_properties';

class FavoritesApiService {
  private static instance: FavoritesApiService;
  private favoriteIds = new Set<string>();
  private cachedFavorites: Property[] = [];
  private listeners = new Set<() => void>();
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
      // In non-storage environments, fail silently
    }
  }

  private async safeStorageRemove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fail silently
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
   * Initialisation asynchrone : charge les favoris depuis AsyncStorage
   * puis synchronise avec le backend si authentifié
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

      // Si déjà authentifié, synchroniser avec l'API
      if (Boolean(api.getToken())) {
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

  public async syncWithBackend(): Promise<void> {
    try {
      const list = await api.get<SpringPropertyDto[]>('/favorites');
      if (Array.isArray(list)) {
        const mapped = list.map((dto) => propertyApiService.mapDtoToProperty(dto));
        this.favoriteIds = new Set(mapped.map((p) => String(p.id)));
        this.cachedFavorites = mapped;
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
    await this.safeStorageRemove(STORAGE_FAV_IDS);
    await this.safeStorageRemove(STORAGE_FAV_PROPS);
    this.notify();
  }

  public getCachedFavorites(): Property[] {
    return this.cachedFavorites;
  }

  public async getFavorites(): Promise<Property[]> {
    // S'assurer que le cache local est chargé
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      const list = await api.get<SpringPropertyDto[]>('/favorites');
      if (Array.isArray(list)) {
        const mapped = list.map((dto) => propertyApiService.mapDtoToProperty(dto));
        this.favoriteIds = new Set(mapped.map((p) => String(p.id)));
        this.cachedFavorites = mapped;
        await this.persistLocally();
        // ATTENTION : Ne pas appeler this.notify() ici pour éviter toute boucle infinie !
        return mapped;
      }
    } catch {
      // Retourner le cache mémoire/local persisté
    }
    return this.cachedFavorites;
  }

  public async getFavoriteIds(): Promise<string[]> {
    if (!this.isInitialized) {
      await this.init();
    }
    try {
      const ids = await api.get<number[]>('/favorites/ids');
      if (Array.isArray(ids)) {
        this.favoriteIds = new Set(ids.map(String));
        await this.safeStorageSet(STORAGE_FAV_IDS, JSON.stringify(Array.from(this.favoriteIds)));
      }
    } catch {
      // Conserver le cache
    }
    return Array.from(this.favoriteIds);
  }

  public isFavorite(propertyId: string): boolean {
    return this.favoriteIds.has(String(propertyId));
  }

  public async toggleFavorite(propertyId: string, property?: Property): Promise<boolean> {
    const idStr = String(propertyId);
    const isFav = this.favoriteIds.has(idStr);

    if (isFav) {
      this.favoriteIds.delete(idStr);
      this.cachedFavorites = this.cachedFavorites.filter((p) => String(p.id) !== idStr);
      await this.persistLocally();
      this.notify();

      try {
        await api.delete(`/favorites/${idStr}`);
      } catch {
        // Enregistré localement
      }
      return false;
    } else {
      this.favoriteIds.add(idStr);
      if (property) {
        if (!this.cachedFavorites.some((p) => String(p.id) === idStr)) {
          this.cachedFavorites.push(property);
        }
      }
      await this.persistLocally();
      this.notify();

      try {
        await api.post(`/favorites/${idStr}`);
      } catch {
        // Enregistré localement
      }
      return true;
    }
  }
}

export const favoritesApiService = FavoritesApiService.getInstance();
