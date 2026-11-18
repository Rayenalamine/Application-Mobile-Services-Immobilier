// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPERTY (V2-T01 - Membre 2)
// Représente une annonce immobilière avec ses caractéristiques
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
}

/**
 * Formate un montant en Dinars Tunisiens avec séparateur de milliers (ex: 320000 -> "320 000 DT").
 */
export function formatPrice(price: number): string {
  const integerPart = Math.floor(price).toString();
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} DT`;
}
