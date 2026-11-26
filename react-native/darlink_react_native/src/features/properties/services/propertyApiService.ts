// ============================================================
// DARLINK — SERVICE DES PROPRIÉTÉS CLOUD FIRESTORE (React Native)
// Zéro donnée fictive en production. Requêtes structurées Firestore (:runQuery),
// pagination, filtres multicritères, statuts d'annonce et relations réelles.
// ============================================================

import { collection, limit as fsLimit, onSnapshot, query, where } from 'firebase/firestore';
import { resolveFallbackCoordinates } from '../../../core/constants/tunisiaLocations';
import {
  firestoreEngine,
  StructuredFieldFilter,
  StructuredOrderBy,
} from '../../../core/firebase/firestoreEngine';
import { getFirebaseDb } from '../../../core/firebase/firebaseSdk';
import { authService } from '../../auth/services/authService';
import { ListingStatus, Property, PropertyType } from '../domain/models/property';

export interface PropertyFilterParams {
  governorate?: string;
  city?: string;
  neighborhood?: string;
  type?: string;
  isRental?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  limit?: number;
  offset?: number;
}

export interface CreatePropertyPayload {
  id?: string;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  governorate?: string;
  city: string;
  neighborhood?: string;
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
  listingStatus?: ListingStatus;
}

export interface FirestorePropertyDto {
  id: string;
  title?: string;
  titre?: string;
  description?: string;
  type?: string;
  price?: number;
  prix?: number;
  priceOnRequest?: boolean;
  location?: string;
  localisation?: string;
  governorate?: string;
  city?: string;
  neighborhood?: string;
  bedrooms?: number;
  nombreChambres?: number;
  bathrooms?: number;
  nombreSallesDeBain?: number;
  surfaceM2?: number;
  yearBuilt?: number;
  anneeConstruction?: number;
  standing?: string;
  isRental?: boolean;
  estLocation?: boolean;
  latitude?: number;
  longitude?: number;
  coordinatePrecision?: 'VERIFIED' | 'APPROXIMATE' | 'CITY_CENTER' | 'UNVERIFIED';
  addressVisibility?: 'AREA_ONLY' | 'PUBLIC';
  imageUrl?: string;
  galleryUrls?: string[];
  imagePermissionStatus?: 'OWNER_UPLOADED' | 'LICENSED' | 'NONE_PLACEHOLDER_USED';
  imageAttribution?: string;
  amenities?: string[];
  agentName?: string;
  agentPhone?: string;
  ownerId?: string;
  agencyId?: string;
  agentId?: string;
  listingStatus?: ListingStatus;
  listingCategory?: 'VERIFIED_LISTING' | 'DEVELOPMENT_REFERENCE';
  sourceType?: 'OWNER_SUBMISSION' | 'AGENCY_SUBMISSION' | 'INSTITUTIONAL_PORTAL';
  verificationStatus?: string;
  currency?: string;
  publishedAt?: string;
  lastVerifiedAt?: string;
  collectedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  republicationAuthorized?: boolean;
  createdAt?: string;
}

class PropertyApiService {
  private static instance: PropertyApiService;
  private cachedProperties: Property[] = [];
  private testFixtures: Property[] | null = null;

  private constructor() {}

  public static getInstance(): PropertyApiService {
    if (!PropertyApiService.instance) {
      PropertyApiService.instance = new PropertyApiService();
    }
    return PropertyApiService.instance;
  }

  /**
   * Uniquement destiné aux tests unitaires isolés
   */
  public injectTestFixtures(fixtures: Property[] | null): void {
    this.testFixtures = fixtures;
    if (fixtures) {
      this.cachedProperties = [...fixtures];
    }
  }

  public subscribeToPublishedProperties(
    onData: (properties: Property[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, 'properties'),
        where('listingStatus', '==', 'PUBLISHED'),
        fsLimit(50)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const mapped = snapshot.docs.map((d) =>
            this.mapDtoToProperty({ ...(d.data() as FirestorePropertyDto), id: d.id })
          );
          this.cachedProperties = mapped;
          onData(mapped);
        },
        (err) => {
          if (onError) onError(err);
        }
      );
    } catch (err) {
      if (onError && err instanceof Error) onError(err);
      return () => {};
    }
  }

  public async getProperties(params?: PropertyFilterParams): Promise<Property[]> {
    if (this.testFixtures) {
      return this.applySecondaryFilters(this.testFixtures, params);
    }

    const limit = params?.limit ?? 30;
    const offset = params?.offset ?? 0;

    const whereFilters: StructuredFieldFilter[] = [
      {
        field: { fieldPath: 'listingStatus' },
        op: 'EQUAL',
        value: { stringValue: 'PUBLISHED' },
      },
    ];

    if (params?.governorate && params.governorate !== 'Tous') {
      whereFilters.push({
        field: { fieldPath: 'governorate' },
        op: 'EQUAL',
        value: { stringValue: params.governorate },
      });
    }
    if (params?.type && params.type !== 'Tous') {
      whereFilters.push({
        field: { fieldPath: 'type' },
        op: 'EQUAL',
        value: { stringValue: params.type },
      });
    }
    if (params?.isRental !== undefined) {
      whereFilters.push({
        field: { fieldPath: 'isRental' },
        op: 'EQUAL',
        value: { booleanValue: params.isRental },
      });
    }

    const orderBy: StructuredOrderBy[] = [];
    if (params?.sort === 'price_asc') {
      orderBy.push({ field: { fieldPath: 'price' }, direction: 'ASCENDING' });
    } else if (params?.sort === 'price_desc') {
      orderBy.push({ field: { fieldPath: 'price' }, direction: 'DESCENDING' });
    } else {
      orderBy.push({ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' });
    }

    let docs = await firestoreEngine.runStructuredQuery<FirestorePropertyDto>({
      collectionId: 'properties',
      whereFilters,
      orderBy,
      limit,
      offset,
    });

    if (docs.length === 0 && whereFilters.length > 1) {
      docs = await firestoreEngine.runStructuredQuery<FirestorePropertyDto>({
        collectionId: 'properties',
        whereFilters: whereFilters.slice(0, 1),
        limit,
        offset,
      });
    }
    if (docs.length === 0 && offset === 0) {
      docs = await firestoreEngine.getCollection<FirestorePropertyDto>('properties', limit);
    }

    const mapped = docs.map((d) => this.mapDtoToProperty(d));
    if (offset === 0) {
      this.cachedProperties = mapped;
    } else {
      this.cachedProperties = [...this.cachedProperties, ...mapped];
    }

    return this.applySecondaryFilters(mapped, params);
  }

  public async getMapProperties(governorate?: string): Promise<Property[]> {
    return this.getProperties({ governorate, limit: 60 });
  }

  public async getUserProperties(): Promise<Property[]> {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const docs = await firestoreEngine.runStructuredQuery<FirestorePropertyDto>({
      collectionId: 'properties',
      whereFilters: [
        {
          field: { fieldPath: 'ownerId' },
          op: 'EQUAL',
          value: { stringValue: user.id },
        },
      ],
      limit: 50,
    });
    return docs.map((d) => this.mapDtoToProperty(d));
  }

  public async getMyProperties(): Promise<Property[]> {
    return this.getUserProperties();
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    const cached = this.cachedProperties.find((p) => p.id === id);
    if (cached) return cached;
    const doc = await firestoreEngine.getDocument<FirestorePropertyDto>('properties', id);
    return doc ? this.mapDtoToProperty(doc) : null;
  }

  public async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('Authentification requise pour publier une annonce.');
    }

    const fallback = resolveFallbackCoordinates(payload.governorate || payload.city);
    const hasCoords = payload.latitude !== undefined && payload.longitude !== undefined;
    const gov = payload.governorate || fallback.governorate;
    const newId = payload.id?.trim() || `prop_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const img = (payload.imageUrl || '').trim();

    const safeStatus: ListingStatus = payload.listingStatus === 'DRAFT' ? 'DRAFT' : 'PENDING_REVIEW';

    const docData: Record<string, unknown> = {
      id: newId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      governorate: gov,
      city: payload.city.trim(),
      neighborhood: payload.neighborhood?.trim() || '',
      price: payload.price,
      priceOnRequest: payload.price <= 0,
      type: payload.type,
      imageUrl: img,
      galleryUrls: payload.galleryUrls || [],
      imagePermissionStatus: img ? 'OWNER_UPLOADED' : 'NONE_PLACEHOLDER_USED',
      imageAttribution: img ? `Photo fournie par ${user.fullName}` : '',
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      surfaceM2: payload.surfaceM2,
      yearBuilt: payload.yearBuilt ?? new Date().getFullYear(),
      standing: payload.standing ?? 'Standard',
      isRental: payload.isRental ?? false,
      latitude: payload.latitude ?? fallback.latitude,
      longitude: payload.longitude ?? fallback.longitude,
      coordinatePrecision: hasCoords ? 'VERIFIED' : 'CITY_CENTER',
      addressVisibility: 'AREA_ONLY',
      amenities: payload.amenities ?? [],
      agentName: user.fullName,
      agentPhone: user.phone || '',
      ownerId: user.id,
      agencyId: user.agencyId || '',
      listingStatus: safeStatus,
      listingCategory: 'VERIFIED_LISTING',
      sourceType: 'OWNER_SUBMISSION',
      verificationStatus: 'PENDING_VERIFICATION',
      currency: 'TND',
      republicationAuthorized: true,
      sourceName: 'DarLink Direct',
      lastVerifiedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const ok = await firestoreEngine.setDocument('properties', newId, docData);
    if (!ok) {
      throw new Error('Échec de l’enregistrement dans Cloud Firestore (vérifiez vos droits).');
    }

    const prop = this.mapDtoToProperty(docData as unknown as FirestorePropertyDto);
    this.cachedProperties.unshift(prop);
    return prop;
  }

  public async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property | null> {
    const safePatch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (payload.title !== undefined) safePatch.title = payload.title.trim();
    if (payload.description !== undefined) safePatch.description = payload.description.trim();
    if (payload.location !== undefined) safePatch.location = payload.location.trim();
    if (payload.governorate !== undefined) safePatch.governorate = payload.governorate;
    if (payload.city !== undefined) safePatch.city = payload.city;
    if (payload.type !== undefined) safePatch.type = payload.type;
    if (payload.price !== undefined) {
      safePatch.price = payload.price;
      safePatch.priceOnRequest = payload.price <= 0;
    }
    if (payload.bedrooms !== undefined) safePatch.bedrooms = payload.bedrooms;
    if (payload.bathrooms !== undefined) safePatch.bathrooms = payload.bathrooms;
    if (payload.surfaceM2 !== undefined) safePatch.surfaceM2 = payload.surfaceM2;
    if (payload.isRental !== undefined) safePatch.isRental = payload.isRental;
    if (payload.imageUrl !== undefined) {
      safePatch.imageUrl = payload.imageUrl;
      if (payload.imageUrl.trim()) {
        safePatch.imagePermissionStatus = 'OWNER_UPLOADED';
      }
    }
    if (payload.galleryUrls !== undefined) safePatch.galleryUrls = payload.galleryUrls;
    if (payload.amenities !== undefined) safePatch.amenities = payload.amenities;
    if (payload.listingStatus !== undefined) safePatch.listingStatus = payload.listingStatus;

    const ok = await firestoreEngine.patchFields('properties', id, safePatch);
    if (!ok) return null;

    const fresh = await firestoreEngine.getDocument<FirestorePropertyDto>('properties', id);
    if (fresh) {
      const updated = this.mapDtoToProperty(fresh);
      const idx = this.cachedProperties.findIndex((p) => p.id === id);
      if (idx !== -1) this.cachedProperties[idx] = updated;
      return updated;
    }
    return null;
  }

  public async deleteProperty(id: string | number): Promise<boolean> {
    const strId = String(id);
    const ok = await firestoreEngine.deleteDocument('properties', strId);
    if (ok) {
      this.cachedProperties = this.cachedProperties.filter((p) => p.id !== strId);
    }
    return ok;
  }

  private applySecondaryFilters(input: Property[], params?: PropertyFilterParams): Property[] {
    const filtered = input.filter((p) => {
      if (p.listingStatus && p.listingStatus !== 'PUBLISHED') return false;
      if (params?.governorate && params.governorate !== 'Tous') {
        if ((p.governorate || '').toLowerCase() !== params.governorate.toLowerCase()) return false;
      }
      if (params?.city && params.city !== 'Toutes') {
        const c = params.city.toLowerCase();
        if (
          !p.localisation.toLowerCase().includes(c) &&
          !(p.city || '').toLowerCase().includes(c) &&
          !(p.governorate || '').toLowerCase().includes(c)
        ) {
          return false;
        }
      }
      if (params?.neighborhood) {
        const n = params.neighborhood.toLowerCase();
        if (!(p.neighborhood || '').toLowerCase().includes(n) && !p.localisation.toLowerCase().includes(n)) {
          return false;
        }
      }
      if (params?.type && params.type !== 'Tous' && p.type.toLowerCase() !== params.type.toLowerCase()) {
        return false;
      }
      if (params?.isRental !== undefined && Boolean(p.estLocation) !== params.isRental) return false;
      if (params?.minPrice && (p.priceOnRequest || p.prix < params.minPrice)) return false;
      if (params?.maxPrice && p.prix > params.maxPrice) return false;
      if (params?.minArea && (p.surfaceM2 ?? 0) < params.minArea) return false;
      if (params?.maxArea && (p.surfaceM2 ?? 0) > params.maxArea) return false;
      if (params?.minBedrooms && p.nombreChambres < params.minBedrooms) return false;
      if (params?.minBathrooms && p.nombreSallesDeBain < params.minBathrooms) return false;
      if (params?.search) {
        const q = params.search.toLowerCase();
        return (
          p.titre.toLowerCase().includes(q) ||
          p.localisation.toLowerCase().includes(q) ||
          (p.governorate || '').toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (params?.sort === 'price_asc') {
      filtered.sort((a, b) => a.prix - b.prix);
    } else if (params?.sort === 'price_desc') {
      filtered.sort((a, b) => b.prix - a.prix);
    }
    return filtered;
  }

  public mapDtoToProperty(dto: FirestorePropertyDto): Property {
    const city = dto.city || 'Tunis';
    const fallback = resolveFallbackCoordinates(dto.governorate || city);
    const hasCoords =
      typeof dto.latitude === 'number' &&
      typeof dto.longitude === 'number' &&
      Math.abs(dto.latitude) > 0.1 &&
      Math.abs(dto.longitude) > 0.1;

    return {
      id: String(dto.id),
      titre: dto.title || dto.titre || 'Bien immobilier',
      localisation: dto.location || dto.localisation || `${city}, ${fallback.governorate}`,
      governorate: dto.governorate || fallback.governorate,
      city,
      neighborhood: dto.neighborhood || '',
      prix: dto.price ?? dto.prix ?? 0,
      priceOnRequest: dto.priceOnRequest ?? false,
      type: (dto.type as PropertyType) || 'Appartement',
      imageUrl: dto.imageUrl || '',
      nombreChambres: dto.bedrooms ?? dto.nombreChambres ?? 1,
      nombreSallesDeBain: dto.bathrooms ?? dto.nombreSallesDeBain ?? 1,
      surfaceM2: dto.surfaceM2 ?? 0,
      anneeConstruction: dto.yearBuilt ?? dto.anneeConstruction ?? 2024,
      standing: dto.standing || 'Standard',
      estLocation: dto.isRental ?? dto.estLocation ?? false,
      latitude: hasCoords ? dto.latitude : fallback.latitude,
      longitude: hasCoords ? dto.longitude : fallback.longitude,
      coordinatePrecision: hasCoords ? dto.coordinatePrecision || 'APPROXIMATE' : 'CITY_CENTER',
      addressVisibility: dto.addressVisibility || 'AREA_ONLY',
      imagesGalerie: dto.galleryUrls || [],
      commodites: dto.amenities || [],
      description: dto.description || '',
      agentNom: dto.agentName || 'Propriétaire',
      agentTel: dto.agentPhone || '',
      ownerId: dto.ownerId || '',
      agencyId: dto.agencyId || '',
      agentId: dto.agentId || '',
      listingStatus: dto.listingStatus || 'DRAFT',
      listingCategory: dto.listingCategory || (dto.sourceName && !dto.republicationAuthorized ? 'DEVELOPMENT_REFERENCE' : 'VERIFIED_LISTING'),
      sourceType: dto.sourceType || 'OWNER_SUBMISSION',
      verificationStatus: (dto.verificationStatus as Property['verificationStatus']) || 'UNVERIFIED',
      currency: dto.currency || 'TND',
      publishedAt: dto.publishedAt,
      lastVerifiedAt: dto.lastVerifiedAt,
      collectedAt: dto.collectedAt,
      sourceName: dto.sourceName,
      sourceUrl: dto.sourceUrl,
      republicationAuthorized: dto.republicationAuthorized ?? false,
      imagePermissionStatus: dto.imagePermissionStatus || 'NONE_PLACEHOLDER_USED',
      imageAttribution: dto.imageAttribution,
      createdAt: dto.createdAt,
    };
  }
}

export const propertyApiService = PropertyApiService.getInstance();
