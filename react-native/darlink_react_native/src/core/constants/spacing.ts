// ============================================================
// DARLINK — ÉCHELLE D'ESPACEMENT, TYPOGRAPHIE & OMBRES (Design System)
// Échelle cohérente basée sur une grille de 4px
// ============================================================

import { Platform } from 'react-native';

export const AppSpacing = {
  /** 4px : micros-espacements */
  xs: 4,
  /** 8px : espacement compact */
  s: 8,
  /** 12px : espacement moyen-faible */
  m: 12,
  /** 16px : espacement standard par défaut */
  l: 16,
  /** 20px : marge horizontale des écrans */
  screenPadding: 20,
  /** 24px : espacement aéré pour les sections */
  xl: 24,
  /** 32px : grand espacement pour les en-têtes */
  xxl: 32,
  /** 16px : rayon de courbure standard des cartes */
  cardRadius: 20,
  /** 12px : rayon de courbure moyen */
  radiusMd: 14,
  /** 10px : rayon de courbure des badges */
  badgeRadius: 10,
  /** Hauteur de la barre de navigation flottante */
  bottomNavHeight: 68,
} as const;

export const AppTypography = {
  heroTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.6 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.3 },
  cardTitle: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.2 },
  priceLarge: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.4 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodyMedium: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '600' as const },
} as const;

export const AppShadows = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
    },
  }),
  floatingNav: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
  }),
} as const;

export type AppSpacingKey = keyof typeof AppSpacing;
