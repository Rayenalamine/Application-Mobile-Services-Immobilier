// ============================================================
// DARLINK — CONSTANTES DE COULEURS PARTAGÉES (V2-T01 - Membre 2)
// Palette miroir de l'application mobile React Native
// ============================================================

export const AppColors = {
  /** Couleur primaire : bleu moderne pour les éléments d'action */
  primary: '#1E88E5',
  /** Couleur secondaire : vert d'eau pour les éléments d'accentuation */
  secondary: '#26A69A',
  /** Fond général clair de l'application */
  background: '#F5F5F7',
  /** Surface des cartes et conteneurs */
  surface: '#FFFFFF',
  /** Couleur principale du texte (titres et éléments majeurs) */
  textPrimary: '#1C1B1F',
  /** Couleur secondaire du texte (descriptions, sous-titres, libellés) */
  textSecondary: '#49454F',
  /** Couleur d'erreur ou d'alerte */
  error: '#B3261E',
  /** Couleur grise pour les bordures légères */
  border: '#E0E0E0',
  /** Gris clair pour les placeholders et fonds d'images en chargement */
  placeholder: '#EEEEEE',
} as const;

export type AppColorKey = keyof typeof AppColors;
