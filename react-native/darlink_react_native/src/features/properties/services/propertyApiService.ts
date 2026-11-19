// ============================================================
// DARLINK — SERVICE REST DES PROPRIÉTÉS (React Native V5-V8)
// Intégration backend Spring Boot & fallback local hors-ligne
// ============================================================

import { api } from '../../../core/network/apiClient';
import { mockProperties } from '../data/mockProperties';
import { Property, PropertyType } from '../domain/models/property';

export interface PropertyFilterParams {
  city?: string;
  type?: string;
  isRental?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  search?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  surfaceM2: number;
  yearBuilt?: number;
  standing?: string;
  isRental?: boolean;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  galleryUrls?: string[];
  amenities?: string[];
  agentName?: string;
  agentPhone?: string;
}

export interface SpringPropertyDto {
  id: number;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  surfaceM2: number;
  yearBuilt: number;
  standing: string;
  isRental: boolean;
  latitude: number;
  longitude: number;
  imageUrl: string;
  galleryUrls: string[];
  amenities: string[];
  agentName: string;
  agentPhone: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

class PropertyApiService {
  private static instance: PropertyApiService;
  private cachedProperties: Property[] = [...mockProperties];

  private constructor() {}

  public static getInstance(): PropertyApiService {
    if (!PropertyApiService.instance) {
      PropertyApiService.instance = new PropertyApiService();
    }
    return PropertyApiService.instance;
  }

  public async getProperties(params?: PropertyFilterParams): Promise<Property[]> {
    try {
      const response = await api.get<PageResponse<SpringPropertyDto>>('/properties', {
        city: params?.city !== 'Toutes' ? params?.city : undefined,
        type: params?.type !== 'Tous' ? params?.type : undefined,
        isRental: params?.isRental,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        minBedrooms: params?.minBedrooms,
        search: params?.search,
        sort: params?.sort,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      });

      if (response && Array.isArray(response.content) && response.content.length > 0) {
        const mapped = response.content.map(this.mapDtoToProperty);
        this.cachedProperties = mapped;
        return mapped;
      }
      return this.cachedProperties;
    } catch {
      // Fallback local hors-ligne en cas d'indisponibilité réseau
      return this.filterLocal(params);
    }
  }

  public async getMapProperties(): Promise<Property[]> {
    try {
      const list = await api.get<SpringPropertyDto[]>('/properties/map');
      if (Array.isArray(list) && list.length > 0) {
        return list.map(this.mapDtoToProperty);
      }
      return this.cachedProperties;
    } catch {
      return this.cachedProperties;
    }
  }

  public async getUserProperties(): Promise<Property[]> {
    try {
      const list = await api.get<SpringPropertyDto[]>('/users/me/properties');
      if (Array.isArray(list) && list.length > 0) {
        return list.map(this.mapDtoToProperty);
      }
      return this.cachedProperties.slice(0, 2);
    } catch {
      return this.cachedProperties.slice(0, 2);
    }
  }

  public async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    try {
      const dto = await api.post<SpringPropertyDto>('/properties', payload);
      const prop = this.mapDtoToProperty(dto);
      this.cachedProperties.unshift(prop);
      return prop;
    } catch {
      // Simulation locale si hors-ligne
      const fallback: Property = {
        id: String(this.cachedProperties.length + 1),
        titre: payload.title,
        localisation: payload.location,
        prix: payload.price,
        type: (payload.type as PropertyType) || 'Appartement',
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        nombreChambres: payload.bedrooms,
        nombreSallesDeBain: payload.bathrooms,
        surfaceM2: payload.surfaceM2,
        anneeConstruction: payload.yearBuilt ?? 2024,
        standing: payload.standing ?? 'Haut Standing',
        estLocation: payload.isRental ?? false,
        commodites: payload.amenities ?? ['Climatisation', 'Ascenseur'],
        description: payload.description,
        latitude: payload.latitude ?? 36.8,
        longitude: payload.longitude ?? 10.2,
      };
      this.cachedProperties.unshift(fallback);
      return fallback;
    }
  }

  public async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property | null> {
    try {
      const dto = await api.put<SpringPropertyDto>(`/properties/${id}`, payload);
      const prop = this.mapDtoToProperty(dto);
      const index = this.cachedProperties.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.cachedProperties[index] = prop;
      }
      return prop;
    } catch {
      return null;
    }
  }

  public async deleteProperty(id: string): Promise<boolean> {
    try {
      await api.delete(`/properties/${id}`);
      this.cachedProperties = this.cachedProperties.filter((p) => p.id !== id);
      return true;
    } catch {
      this.cachedProperties = this.cachedProperties.filter((p) => p.id !== id);
      return true;
    }
  }

  private filterLocal(params?: PropertyFilterParams): Property[] {
    return this.cachedProperties.filter((p) => {
      if (params?.city && params.city !== 'Toutes' && !p.localisation.toLowerCase().includes(params.city.toLowerCase())) {
        return false;
      }
      if (params?.type && params.type !== 'Tous' && p.type.toLowerCase() !== params.type.toLowerCase()) {
        return false;
      }
      if (params?.isRental !== undefined && p.estLocation !== params.isRental) {
        return false;
      }
      if (params?.minPrice && p.prix < params.minPrice) return false;
      if (params?.maxPrice && p.prix > params.maxPrice) return false;
      if (params?.minBedrooms && p.nombreChambres < params.minBedrooms) return false;
      if (params?.search) {
        const query = params.search.toLowerCase();
        return (
          p.titre.toLowerCase().includes(query) ||
          p.localisation.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }

  public mapDtoToProperty(dto: SpringPropertyDto): Property {
    return {
      id: String(dto.id),
      titre: dto.title,
      localisation: dto.location,
      prix: dto.price,
      type: (dto.type as PropertyType) || 'Appartement',
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      nombreChambres: dto.bedrooms,
      nombreSallesDeBain: dto.bathrooms,
      surfaceM2: dto.surfaceM2,
      anneeConstruction: dto.yearBuilt,
      standing: dto.standing,
      estLocation: dto.isRental,
      latitude: dto.latitude,
      longitude: dto.longitude,
      imagesGalerie: dto.galleryUrls || [],
      commodites: dto.amenities || [],
      description: dto.description || '',
      agentNom: dto.agentName || 'DarLink Prestige Agent',
      agentTel: dto.agentPhone || '+216 71 888 999',
    };
  }
}

export const propertyApiService = PropertyApiService.getInstance();
