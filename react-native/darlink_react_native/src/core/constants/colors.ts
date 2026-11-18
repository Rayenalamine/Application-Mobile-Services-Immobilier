// ============================================================
// DARLINK — SYSTÈME DE COULEURS LUXE MODERNE & GLASSMORPHISM (React Native)
// Palette Dark & Light adaptative miroir de Flutter (Screen 1, 2, 3)
// ============================================================

export const LightThemeColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F2F5',
  glassCard: 'rgba(255, 255, 255, 0.95)',
  glassBackground: 'rgba(255, 255, 255, 0.92)',
  border: 'rgba(0, 0, 0, 0.08)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#0F1015',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  accentGreen: '#10B981',
  accentBlue: '#2563EB',
  accentRed: '#EF4444',
  segmentedBg: '#E9EBF0',
  activeSegmentBg: '#FFFFFF',
  activeSegmentText: '#0F1015',
  topPillBg: 'rgba(255, 255, 255, 0.90)',
  topPillBorder: 'rgba(0, 0, 0, 0.08)',
  dockBg: 'rgba(255, 255, 255, 0.95)',
  dockBorder: 'rgba(0, 0, 0, 0.08)',
  dockActiveBg: '#0F1015',
  dockActiveIcon: '#FFFFFF',
  dockInactiveIcon: '#6B7280',
} as const;

export const DarkThemeColors = {
  background: '#0F1015',
  surface: '#181920',
  surfaceElevated: '#22242D',
  glassCard: 'rgba(19, 20, 28, 0.88)',
  glassBackground: 'rgba(24, 25, 32, 0.85)',
  border: 'rgba(255, 255, 255, 0.14)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  accentGreen: '#10B981',
  accentBlue: '#2563EB',
  accentRed: '#EF4444',
  segmentedBg: '#181920',
  activeSegmentBg: '#FFFFFF',
  activeSegmentText: '#0F1015',
  topPillBg: 'rgba(24, 25, 32, 0.75)',
  topPillBorder: 'rgba(255, 255, 255, 0.16)',
  dockBg: 'rgba(19, 20, 28, 0.90)',
  dockBorder: 'rgba(255, 255, 255, 0.14)',
  dockActiveBg: '#FFFFFF',
  dockActiveIcon: '#0F1015',
  dockInactiveIcon: '#9CA3AF',
} as const;

export const AppColors = {
  // ------------------------------------------------------------
  // PALETTE FLAGSHIP — DARK LUXURY
  // ------------------------------------------------------------
  darkBackground: DarkThemeColors.background,
  darkSurface: DarkThemeColors.surface,
  darkSurfaceElevated: DarkThemeColors.surfaceElevated,
  darkGlassBackground: DarkThemeColors.glassBackground,
  darkGlassCard: DarkThemeColors.glassCard,
  darkBorder: DarkThemeColors.border,
  darkBorderSubtle: DarkThemeColors.borderSubtle,
  darkTextPrimary: DarkThemeColors.textPrimary,
  darkTextSecondary: DarkThemeColors.textSecondary,
  darkTextTertiary: DarkThemeColors.textTertiary,

  // ------------------------------------------------------------
  // PALETTE MODERNE — LIGHT LUXURY (PAR DÉFAUT)
  // ------------------------------------------------------------
  lightBackground: LightThemeColors.background,
  lightSurface: LightThemeColors.surface,
  lightSurfaceElevated: LightThemeColors.surfaceElevated,
  lightGlassBackground: LightThemeColors.glassBackground,
  lightGlassCard: LightThemeColors.glassCard,
  lightBorder: LightThemeColors.border,
  lightBorderSubtle: LightThemeColors.borderSubtle,
  lightTextPrimary: LightThemeColors.textPrimary,
  lightTextSecondary: LightThemeColors.textSecondary,
  lightTextTertiary: LightThemeColors.textTertiary,

  // ------------------------------------------------------------
  // ACCENTS & STATUTS
  // ------------------------------------------------------------
  accentGreen: '#10B981',
  accentBlue: '#2563EB',
  accentIndigo: '#4F46E5',
  accentRed: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',

  // ------------------------------------------------------------
  // ALIAS RÉTRO-COMPATIBLES (DÉFAUT BLANC LUXE)
  // ------------------------------------------------------------
  primary: '#2563EB',
  secondary: '#10B981',
  background: LightThemeColors.background,
  surface: LightThemeColors.surface,
  textPrimary: LightThemeColors.textPrimary,
  textSecondary: LightThemeColors.textSecondary,
  border: LightThemeColors.border,
  placeholder: '#E5E7EB',
  error: '#EF4444',
} as const;

export type AppColorKey = keyof typeof AppColors;
