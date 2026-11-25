// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPERTY (React Native Luxe)
// Modèle enrichi : gouvernorats, statuts légaux, traçabilité source,
// précision géographique et relations propriétaire / agence.
// ============================================================

export type PropertyType =
  | 'Appartement'
  | 'Maison'
  | 'Villa'
  | 'Studio'
  | 'Terrain'
  | 'Commercial';

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SOLD'
  | 'RENTED'
  | 'ARCHIVED';

export type ListingCategory = 'VERIFIED_LISTING' | 'DEVELOPMENT_REFERENCE';

export type SourceType = 'OWNER_SUBMISSION' | 'AGENCY_SUBMISSION' | 'INSTITUTIONAL_PORTAL';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED_LISTING'
  | 'VERIFIED_INSTITUTIONAL_REFERENCE'
  | 'ARCHIVED_PLACEHOLDER';

export type CoordinatePrecision =
  | 'VERIFIED'
  | 'APPROXIMATE'
  | 'CITY_CENTER'
  | 'UNVERIFIED';

export type AddressVisibility = 'AREA_ONLY' | 'PUBLIC';

export type ImagePermissionStatus =
  | 'OWNER_UPLOADED'
  | 'LICENSED'
  | 'NONE_PLACEHOLDER_USED';

/**
 * Interface immuable représentant un bien immobilier dans l'application DarLink.
 */
export interface Property {
  readonly id?: string;
  readonly titre: string;
  readonly localisation: string;
  readonly governorate?: string;
  readonly city?: string;
  readonly neighborhood?: string;
  readonly prix: number;
  readonly priceOnRequest?: boolean;
  readonly type: PropertyType;
  readonly imageUrl: string;
  readonly nombreChambres: number;
  readonly nombreSallesDeBain: number;
  readonly description: string;

  readonly surfaceM2?: number;
  readonly anneeConstruction?: number;
  readonly standing?: string;
  readonly estLocation?: boolean;
  readonly imagesGalerie?: string[];
  readonly commodites?: string[];
  readonly agentNom?: string;
  readonly agentTel?: string;
  readonly ownerId?: string;
  readonly agencyId?: string;
  readonly agentId?: string;
  readonly prixParM2?: number;

  // Géolocalisation & confidentialité
  readonly latitude?: number;
  readonly longitude?: number;
  readonly coordinatePrecision?: CoordinatePrecision;
  readonly addressVisibility?: AddressVisibility;

  // Cycle de vie & traçabilité catalogue
  readonly listingStatus?: ListingStatus;
  readonly listingCategory?: ListingCategory;
  readonly sourceType?: SourceType;
  readonly verificationStatus?: VerificationStatus;
  readonly availabilityStatus?: string;
  readonly currency?: string;
  readonly publishedAt?: string;
  readonly lastVerifiedAt?: string;
  readonly collectedAt?: string;
  readonly sourceName?: string;
  readonly sourceUrl?: string;
  readonly republicationAuthorized?: boolean;
  readonly imagePermissionStatus?: ImagePermissionStatus;
  readonly imageAttribution?: string;
  readonly createdAt?: string;

  readonly isFavorite?: boolean;
}

/**
 * Formate un montant en Dinars Tunisiens avec séparateur de milliers (ex: 320000 -> "320 000 DT").
 */
export function formatPrice(
  price: number,
  isRental: boolean = false,
  priceOnRequest: boolean = false
): string {
  if (priceOnRequest || !price || price <= 0) {
    return 'Prix sur demande';
  }
  const integerPart = Math.floor(price).toString();
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return isRental ? `${formatted} DT/mois` : `${formatted} DT`;
}
