// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPERTY (React Native Luxe)
// Représente une annonce immobilière avec caractéristiques enrichies
// ============================================================

export type PropertyType = 'Appartement' | 'Maison' | 'Villa';

/**
 * Interface immuable représentant un bien immobilier dans l'application DarLink.
 */
export interface Property {
  /** Identifiant unique ou titre clé */
  readonly id?: string;
  /** Titre de l'annonce immobilière */
  readonly titre: string;
  /** Localisation (quartier, ville en Tunisie) */
  readonly localisation: string;
  /** Prix en Dinars Tunisiens (TND) */
  readonly prix: number;
  /** Type de bien : 'Appartement' | 'Maison' | 'Villa' */
  readonly type: PropertyType;
  /** URL de l'image principale distante (Unsplash) */
  readonly imageUrl: string;
  /** Nombre de chambres à coucher */
  readonly nombreChambres: number;
  /** Nombre de salles de bain */
  readonly nombreSallesDeBain: number;
  /** Description complète du bien */
  readonly description: string;

  /** Surface habitable en m² */
  readonly surfaceM2?: number;
  /** Année de construction */
  readonly anneeConstruction?: number;
  /** Niveau de standing (ex: 'Haut standing', 'Prestige') */
  readonly standing?: string;
  /** Indique si le bien est proposé à la location */
  readonly estLocation?: boolean;
  /** Galerie de photos intérieures complémentaires */
  readonly imagesGalerie?: string[];
  /** Atouts & commodités (ex: Piscine, Vue mer, Jardin, Climatisation) */
  readonly commodites?: string[];
  /** Nom de l'agent immobilier dédié */
  readonly agentNom?: string;
  /** Téléphone de contact de l'agent */
  readonly agentTel?: string;
  /** Prix au mètre carré */
  readonly prixParM2?: number;
  /** État de favori */
  readonly isFavorite?: boolean;
}

/**
 * Formate un montant en Dinars Tunisiens avec séparateur de milliers (ex: 320000 -> "320 000 DT").
 */
export function formatPrice(price: number): string {
  const integerPart = Math.floor(price).toString();
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} DT`;
}
