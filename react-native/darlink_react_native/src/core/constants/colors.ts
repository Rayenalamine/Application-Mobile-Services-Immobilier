// ============================================================
// DARLINK — SYSTÈME DE COULEURS LUXE MODERNE & GLASSMORPHISM (React Native)
// Palette Dark & Light miroir de Flutter (Screen 1, 2, 3)
// ============================================================

export const AppColors = {
  // ------------------------------------------------------------
  // PALETTE FLAGSHIP — DARK LUXURY (Charcoal & Verre dépoli)
  // ------------------------------------------------------------
  darkBackground: '#0F1015',
  darkSurface: '#181920',
  darkSurfaceElevated: '#22242D',
  darkGlassBackground: 'rgba(24, 25, 32, 0.85)',
  darkGlassCard: 'rgba(19, 20, 28, 0.88)',
  darkBorder: 'rgba(255, 255, 255, 0.14)',
  darkBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#9CA3AF',
  darkTextTertiary: '#6B7280',

  // ------------------------------------------------------------
  // PALETTE MODERNE — LIGHT LUXURY
  // ------------------------------------------------------------
  lightBackground: '#F3F4F8',
  lightSurface: '#FFFFFF',
  lightSurfaceElevated: '#FFFFFF',
  lightGlassBackground: 'rgba(255, 255, 255, 0.90)',
  lightGlassCard: 'rgba(255, 255, 255, 0.85)',
  lightBorder: 'rgba(0, 0, 0, 0.08)',
  lightTextPrimary: '#111827',
  lightTextSecondary: '#4B5563',
  lightTextTertiary: '#9CA3AF',

  // ------------------------------------------------------------
  // ACCENTS & STATUTS
  // ------------------------------------------------------------
  accentGreen: '#10B981', // Statut "À Vendre" / Disponible
  accentBlue: '#2563EB',  // Boutons et liens d'action
  accentIndigo: '#4F46E5',
  accentRed: '#EF4444',   // Bouton favori et alertes
  white: '#FFFFFF',
  black: '#000000',

  // ------------------------------------------------------------
  // ALIAS RÉTRO-COMPATIBLES
  // ------------------------------------------------------------
  primary: '#2563EB',
  secondary: '#10B981',
  background: '#0F1015',
  surface: '#181920',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.14)',
  placeholder: '#1F2128',
  error: '#EF4444',
} as const;

export type AppColorKey = keyof typeof AppColors;
