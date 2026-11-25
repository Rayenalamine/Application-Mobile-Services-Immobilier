// ============================================================
// DARLINK — SERVICE DES PROPRIÉTÉS CLOUD FIRESTORE (React Native)
// Synchronisation cloud temps réel avec Cloud Firestore & résilience locale
// ============================================================

import { firestoreEngine } from '../../../core/firebase/firestoreEngine';
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
  ownerId?: string;
}

export interface SpringPropertyDto {
  id: number | string;
  title?: string;
  titre?: string;
  description: string;
  type: string;
  price?: number;
  prix?: number;
  location?: string;
  localisation?: string;
  city?: string;
  bedrooms?: number;
  nombreChambres?: number;
  bathrooms?: number;
  nombreSallesDeBain?: number;
  surfaceM2: number;
  yearBuilt?: number;
  anneeConstruction?: number;
  standing?: string;
  isRental?: boolean;
  estLocation?: boolean;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  galleryUrls?: string[];
  imagesGalerie?: string[];
  amenities?: string[];
  commodites?: string[];
  agentName?: string;
  agentNom?: string;
  agentPhone?: string;
  agentTel?: string;
  ownerId?: string;
}

class PropertyApiService {
  private static instance: PropertyApiService;
  private cachedProperties: Property[] = [...mockProperties];
  private isSeeded = false;

  private constructor() {
    this.seedFirestoreIfEmpty();
  }

  public static getInstance(): PropertyApiService {
    if (!PropertyApiService.instance) {
      PropertyApiService.instance = new PropertyApiService();
    }
    return PropertyApiService.instance;
  }

  /**
   * Initialise la collection Cloud Firestore avec le catalogue initial si vide
   */
  private async seedFirestoreIfEmpty(): Promise<void> {
    if (this.isSeeded) return;
    try {
      const existing = await firestoreEngine.getCollection<SpringPropertyDto>('properties');
      if (!existing || existing.length === 0) {
        // Enregistrer les 13 propriétés dans Cloud Firestore
        for (const prop of mockProperties) {
          const docId = prop.id || String(Date.now());
          await firestoreEngine.setDocument('properties', docId, {
            id: docId,
            title: prop.titre,
            description: prop.description,
            location: prop.localisation || '',
            city: (prop.localisation || '').split(',').pop()?.trim() || 'Tunis',
            price: prop.prix,
            type: prop.type,
            imageUrl: prop.imageUrl,
            galleryUrls: prop.imagesGalerie || [],
            bedrooms: prop.nombreChambres,
            bathrooms: prop.nombreSallesDeBain,
            surfaceM2: prop.surfaceM2,
            yearBuilt: prop.anneeConstruction,
            standing: prop.standing,
            isRental: prop.estLocation,
            latitude: prop.latitude || 36.8,
            longitude: prop.longitude || 10.2,
            amenities: prop.commodites || [],
            agentName: prop.agentNom,
            agentPhone: prop.agentTel,
            ownerId: 'user_admin_1',
            createdAt: new Date().toISOString(),
          });
        }
      }
      this.isSeeded = true;
    } catch {
      // Ignorer si hors-ligne
    }
  }

  public async getProperties(params?: PropertyFilterParams): Promise<Property[]> {
    try {
      const docs = await firestoreEngine.getCollection<SpringPropertyDto>('properties');
      if (Array.isArray(docs) && docs.length > 0) {
        this.cachedProperties = docs.map((d) => this.mapDtoToProperty(d));
      }
    } catch {
      // Utiliser le cache
    }
    return this.filterLocal(params);
  }

  public async getMapProperties(): Promise<Property[]> {
    try {
      const docs = await firestoreEngine.getCollection<SpringPropertyDto>('properties');
      if (Array.isArray(docs) && docs.length > 0) {
        this.cachedProperties = docs.map((d) => this.mapDtoToProperty(d));
      }
    } catch {
      // Utiliser le cache
    }
    return this.cachedProperties.filter((p) => p.latitude !== undefined && p.longitude !== undefined);
  }

  public async getUserProperties(ownerId?: string): Promise<Property[]> {
    try {
      const docs = await firestoreEngine.getCollection<SpringPropertyDto>('properties');
      if (Array.isArray(docs) && docs.length > 0) {
        this.cachedProperties = docs.map((d) => this.mapDtoToProperty(d));
      }
    } catch {
      // Utiliser le cache
    }

    if (ownerId) {
      const userProps = this.cachedProperties.filter((p) => p.agentNom === ownerId || p.id === '1' || p.id === '2');
      return userProps.length > 0 ? userProps : this.cachedProperties.slice(0, 2);
    }
    return this.cachedProperties.slice(0, 2);
  }

  public async getMyProperties(): Promise<Property[]> {
    return this.getUserProperties();
  }

  public async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    const newId = String(Date.now());
    const propertyData = {
      id: newId,
      title: payload.title,
      description: payload.description,
      location: payload.location,
      city: payload.city || payload.location.split(',').pop()?.trim() || 'Tunis',
      price: payload.price,
      type: payload.type,
      imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      galleryUrls: payload.galleryUrls || [],
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      surfaceM2: payload.surfaceM2,
      yearBuilt: payload.yearBuilt ?? 2024,
      standing: payload.standing ?? 'Haut Standing',
      isRental: payload.isRental ?? false,
      latitude: payload.latitude ?? 36.8065,
      longitude: payload.longitude ?? 10.1815,
      amenities: payload.amenities ?? ['Climatisation', 'Ascenseur'],
      agentName: payload.agentName || 'Propriétaire',
      agentPhone: payload.agentPhone || '+216 71 888 999',
      ownerId: payload.ownerId || 'current_user',
      createdAt: new Date().toISOString(),
    };

    // Persistance dans Cloud Firestore
    await firestoreEngine.setDocument('properties', newId, propertyData);

    const prop = this.mapDtoToProperty(propertyData);
    this.cachedProperties.unshift(prop);
    return prop;
  }

  public async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property | null> {
    const existing = this.cachedProperties.find((p) => p.id === id);
    const updatedData = {
      title: payload.title || existing?.titre || 'Titre mis à jour',
      description: payload.description || existing?.description || '',
      location: payload.location || existing?.localisation || 'Tunis, Tunisie',
      city: payload.city || 'Tunis',
      type: payload.type || existing?.type || 'Appartement',
      price: payload.price ?? existing?.prix ?? 200000,
      bedrooms: payload.bedrooms ?? existing?.nombreChambres ?? 2,
      bathrooms: payload.bathrooms ?? existing?.nombreSallesDeBain ?? 1,
      surfaceM2: payload.surfaceM2 ?? existing?.surfaceM2 ?? 100,
      isRental: payload.isRental ?? existing?.estLocation ?? false,
      imageUrl: payload.imageUrl || existing?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      amenities: payload.amenities ?? existing?.commodites ?? [],
      updatedAt: new Date().toISOString(),
    };

    // Mise à jour dans Cloud Firestore
    await firestoreEngine.setDocument('properties', id, updatedData);

    const index = this.cachedProperties.findIndex((p) => p.id === id);
    if (index !== -1) {
      const current = this.cachedProperties[index];
      const updated: Property = {
        ...current,
        titre: updatedData.title,
        prix: updatedData.price,
        description: updatedData.description,
        localisation: updatedData.location,
        type: (updatedData.type as PropertyType) || current.type,
        imageUrl: updatedData.imageUrl,
        nombreChambres: updatedData.bedrooms,
        nombreSallesDeBain: updatedData.bathrooms,
      };
      this.cachedProperties[index] = updated;
      return updated;
    }
    return null;
  }

  public async deleteProperty(id: string | number): Promise<boolean> {
    const strId = String(id);
    // Suppression dans Cloud Firestore
    await firestoreEngine.deleteDocument('properties', strId);
    this.cachedProperties = this.cachedProperties.filter((p) => p.id !== strId);
    return true;
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
      titre: dto.title || dto.titre || 'Propriété Prestige',
      localisation: dto.location || dto.localisation || 'Tunis, Tunisie',
      prix: dto.price ?? dto.prix ?? 0,
      type: ((dto.type as PropertyType) || 'Appartement'),
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      nombreChambres: dto.bedrooms ?? dto.nombreChambres ?? 1,
      nombreSallesDeBain: dto.bathrooms ?? dto.nombreSallesDeBain ?? 1,
      surfaceM2: dto.surfaceM2 || 100,
      anneeConstruction: dto.yearBuilt ?? dto.anneeConstruction ?? 2022,
      standing: dto.standing || 'Haut Standing',
      estLocation: dto.isRental ?? dto.estLocation ?? false,
      latitude: dto.latitude,
      longitude: dto.longitude,
      imagesGalerie: dto.galleryUrls || dto.imagesGalerie || [],
      commodites: dto.amenities || dto.commodites || [],
      description: dto.description || '',
      agentNom: dto.agentName || dto.agentNom || 'Propriétaire',
      agentTel: dto.agentPhone || dto.agentTel || '+216 71 888 999',
    };
  }
}

export const propertyApiService = PropertyApiService.getInstance();
