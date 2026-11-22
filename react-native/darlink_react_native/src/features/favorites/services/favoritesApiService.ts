// ============================================================
// DARLINK — SERVICE DES FAVORIS (React Native V6 & V9)
// Synchronisation REST avec Spring Boot & persistance réelle
// ============================================================

import { api } from '../../../core/network/apiClient';
import { Property } from '../../properties/domain/models/property';
import { propertyApiService, SpringPropertyDto } from '../../properties/services/propertyApiService';

class FavoritesApiService {
  private static instance: FavoritesApiService;
  private favoriteIds = new Set<string>();
  private cachedFavorites: Property[] = [];
  private listeners = new Set<() => void>();

  private constructor() {}

  public static getInstance(): FavoritesApiService {
    if (!FavoritesApiService.instance) {
      FavoritesApiService.instance = new FavoritesApiService();
    }
    return FavoritesApiService.instance;
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

  public clear(): void {
    this.favoriteIds.clear();
    this.cachedFavorites = [];
    this.notify();
  }

  public async getFavorites(): Promise<Property[]> {
    try {
      const list = await api.get<SpringPropertyDto[]>('/favorites');
      if (Array.isArray(list)) {
        const mapped = list.map((dto) => propertyApiService.mapDtoToProperty(dto));
        this.favoriteIds = new Set(mapped.map((p) => String(p.id)));
        this.cachedFavorites = mapped;
        this.notify();
        return mapped;
      }
    } catch {
      // Retourner le cache mémoire en cas d'indisponibilité
    }
    return this.cachedFavorites;
  }

  public async getFavoriteIds(): Promise<string[]> {
    try {
      const ids = await api.get<number[]>('/favorites/ids');
      if (Array.isArray(ids)) {
        this.favoriteIds = new Set(ids.map(String));
        this.notify();
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
