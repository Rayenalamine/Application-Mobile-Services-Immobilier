// ============================================================
// DARLINK — SYSTÈME DE COULEURS LUXE MODERNE & GLASSMORPHISM (React Native)
// Palette Dark & Light adaptative miroir de Flutter (Screen 1, 2, 3)
// ============================================================

export const LightThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  glassCard: 'rgba(255, 255, 255, 0.96)',
  glassBackground: 'rgba(255, 255, 255, 0.94)',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#111827',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  accentGreen: '#10B981',
  accentBlue: '#2563EB',
  accentBlueSecondary: '#3B82F6',
  accentBlueSoft: 'rgba(37, 99, 235, 0.10)',
  accentRed: '#EF4444',
  segmentedBg: '#E2E8F0',
  activeSegmentBg: '#FFFFFF',
  activeSegmentText: '#111827',
  topPillBg: 'rgba(255, 255, 255, 0.94)',
  topPillBorder: '#E2E8F0',
  dockBg: '#FFFFFF',
  dockBorder: '#E2E8F0',
  dockActiveBg: '#2563EB',
  dockActiveIcon: '#2563EB',
  dockInactiveIcon: '#64748B',
} as const;

export const DarkThemeColors = {
  background: '#0B1120',
  surface: '#151E32',
  surfaceElevated: '#1E293B',
  glassCard: 'rgba(21, 30, 50, 0.92)',
  glassBackground: 'rgba(15, 23, 42, 0.90)',
  border: 'rgba(148, 163, 184, 0.18)',
  borderSubtle: 'rgba(148, 163, 184, 0.10)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  accentGreen: '#10B981',
  accentBlue: '#2563EB',
  accentBlueSecondary: '#3B82F6',
  accentBlueSoft: 'rgba(59, 130, 246, 0.16)',
  accentRed: '#EF4444',
  segmentedBg: '#1E293B',
  activeSegmentBg: '#2563EB',
  activeSegmentText: '#FFFFFF',
  topPillBg: 'rgba(21, 30, 50, 0.88)',
  topPillBorder: 'rgba(148, 163, 184, 0.18)',
  dockBg: '#151E32',
  dockBorder: 'rgba(148, 163, 184, 0.20)',
  dockActiveBg: '#3B82F6',
  dockActiveIcon: '#3B82F6',
  dockInactiveIcon: '#94A3B8',
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
  accentBlueSecondary: '#3B82F6',
  accentIndigo: '#4F46E5',
  accentRed: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',

  // ------------------------------------------------------------
  // ALIAS RÉTRO-COMPATIBLES (DÉFAUT BLANC LUXE)
  // ------------------------------------------------------------
  primary: '#2563EB',
  primarySecondary: '#3B82F6',
  secondary: '#10B981',
  background: LightThemeColors.background,
  surface: LightThemeColors.surface,
  textPrimary: LightThemeColors.textPrimary,
  textSecondary: LightThemeColors.textSecondary,
  border: LightThemeColors.border,
  placeholder: '#E2E8F0',
  error: '#EF4444',
} as const;

export type AppColorKey = keyof typeof AppColors;
