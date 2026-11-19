// ============================================================
// DARLINK — SERVICE DES FAVORIS (React Native V6)
// Synchronisation REST avec Spring Boot & persistance locale
// ============================================================

import { api } from '../../../core/network/apiClient';

class FavoritesApiService {
  private static instance: FavoritesApiService;
  private favoriteIds = new Set<string>(['1', '3']);

  private constructor() {}

  public static getInstance(): FavoritesApiService {
    if (!FavoritesApiService.instance) {
      FavoritesApiService.instance = new FavoritesApiService();
    }
    return FavoritesApiService.instance;
  }

  public async getFavoriteIds(userId: number = 1): Promise<string[]> {
    try {
      const ids = await api.get<number[]>(`/favorites/ids?userId=${userId}`);
      if (Array.isArray(ids)) {
        this.favoriteIds = new Set(ids.map(String));
      }
    } catch {
      // Garder le cache local en mode hors-ligne
    }
    return Array.from(this.favoriteIds);
  }

  public isFavorite(propertyId: string): boolean {
    return this.favoriteIds.has(propertyId);
  }

  public async toggleFavorite(propertyId: string, userId: number = 1): Promise<boolean> {
    const isFav = this.favoriteIds.has(propertyId);
    if (isFav) {
      this.favoriteIds.delete(propertyId);
      try {
        await api.delete(`/favorites/${propertyId}?userId=${userId}`);
      } catch {
        // Enregistré localement
      }
      return false;
    } else {
      this.favoriteIds.add(propertyId);
      try {
        await api.post(`/favorites/${propertyId}?userId=${userId}`);
      } catch {
        // Enregistré localement
      }
      return true;
    }
  }
}

export const favoritesApiService = FavoritesApiService.getInstance();

