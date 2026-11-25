// ============================================================
// DARLINK — SPACING & RADIUS TOKENS (React Native)
// ============================================================

export const AppSpacing = {
  xxs: 2,
  xs: 4,
  s: 8,
  sm: 8,
  m: 12,
  md: 16,
  l: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  cardRadius: 26,
  badgeRadius: 999,
  sheetRadius: 34,
} as const;

export type AppSpacingKey = keyof typeof AppSpacing;
