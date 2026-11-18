// ============================================================
// DARLINK — CONSTANTES D'ESPACEMENTS ET RAYONS DE COURBURE (V2-T01)
// Centralise les espacements standardisés de l'application
// ============================================================

/// Échelle d'espacements standardisés (Spacing Tokens) et rayons de courbure.
/// NOTE : Ces valeurs constituent les jetons d'espacement PROVISOIRES d'implémentation
/// utilisés par le Membre 1, en attente de la validation et finalisation du document
/// officiel du Design System par le Membre 3.
class AppSpacing {
  AppSpacing._();

  /// Espacement extra-petit : 4.0 px
  static const double xs = 4.0;

  /// Espacement petit : 8.0 px
  static const double sm = 8.0;

  /// Espacement moyen (standard) : 16.0 px
  static const double md = 16.0;

  /// Espacement grand : 24.0 px
  static const double lg = 24.0;

  /// Espacement très grand : 32.0 px
  static const double xl = 32.0;

  /// Espacement extra large : 48.0 px
  static const double xxl = 48.0;

  // ------------------------------------------------------------
  // Rayons de courbure des coins arrondis (Border Radius)
  // ------------------------------------------------------------

  /// Petit arrondi : 8.0 px (boutons, badges)
  static const double radiusSM = 8.0;

  /// Arrondi moyen : 12.0 px (cartes d'annonces)
  static const double radiusMD = 12.0;

  /// Grand arrondi : 16.0 px (modales, feuilles de dialogue)
  static const double radiusLG = 16.0;
}

