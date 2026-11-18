// ============================================================
// DARLINK — ÉCHELLE D'ESPACEMENT (V2-T01 - Membre 2)
// Échelle de marges et de paddings basée sur une grille de 4px
// ============================================================

export const AppSpacing = {
  /** 4px : micros-espacements */
  xs: 4,
  /** 8px : espacement compact */
  s: 8,
  /** 12px : espacement moyen-faible */
  m: 12,
  /** 16px : espacement standard par défaut */
  l: 16,
  /** 24px : espacement aéré pour les sections */
  xl: 24,
  /** 32px : grand espacement pour les en-têtes */
  xxl: 32,
  /** 12px : rayon de courbure standard des cartes */
  cardRadius: 12,
  /** 8px : rayon de courbure des badges */
  badgeRadius: 8,
} as const;

export type AppSpacingKey = keyof typeof AppSpacing;
