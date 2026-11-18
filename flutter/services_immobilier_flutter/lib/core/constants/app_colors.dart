// ============================================================
// DARLINK — SYSTÈME DE COULEURS LUXE MODERNE & GLASSMORPHISM
// Palette Dark & Light adaptative pour design haut standing
// ============================================================

import 'package:flutter/material.dart';

/// Palette de couleurs experte pour l'application DarLink.
/// Offre une prise en charge complète du Light Mode épuré (par défaut)
/// et du Dark Mode de luxe (anthracite, verre dépoli, accents émeraude et bleu).
class AppColors {
  AppColors._();

  // ------------------------------------------------------------
  // PALETTE MODERNE — LIGHT LUXURY (BLANC PAR DÉFAUT)
  // ------------------------------------------------------------
  /// Fond général clair raffiné
  static const Color lightBackground = Color(0xFFF7F8FA);

  /// Fond de surface blanc pur
  static const Color lightSurface = Color(0xFFFFFFFF);

  /// Surface surélevée (cartes, pills)
  static const Color lightSurfaceElevated = Color(0xFFF1F3F6);

  /// Verre dépoli clair translucide
  static const Color lightGlassBackground = Color(0xF2FFFFFF);

  /// Carte en verre clair
  static const Color lightGlassCard = Color(0xE6FFFFFF);

  /// Bordure subtile claire
  static const Color lightBorder = Color(0x18000000);

  /// Bordure ultra-fine discrète
  static const Color lightBorderSubtle = Color(0x0F000000);

  /// Texte principal foncé éclatant
  static const Color lightTextPrimary = Color(0xFF111827);

  /// Texte secondaire gris ardoise
  static const Color lightTextSecondary = Color(0xFF4B5563);

  /// Texte tertiaire gris clair
  static const Color lightTextTertiary = Color(0xFF9CA3AF);

  // ------------------------------------------------------------
  // PALETTE FLAGSHIP — DARK LUXURY (Anthracite & Verre sombre)
  // ------------------------------------------------------------
  /// Fond principal profond (Charcoal / Anthracite foncé)
  static const Color darkBackground = Color(0xFF0F1015);

  /// Fond de surface pour cartes et conteneurs
  static const Color darkSurface = Color(0xFF181920);

  /// Fond de surface surélevé (survol, modals)
  static const Color darkSurfaceElevated = Color(0xFF22242D);

  /// Verre dépoli translucide pour les conteneurs flottants (Glassmorphism)
  static const Color darkGlassBackground = Color(0xD9181920);

  /// Verre dépoli plus transparent pour les cartes d'annonces
  static const Color darkGlassCard = Color(0xCC13141C);

  /// Bordure lumineuse subtile (effet biseauté de verre)
  static const Color darkBorder = Color(0x28FFFFFF);

  /// Bordure ultra-fine discrète
  static const Color darkBorderSubtle = Color(0x14FFFFFF);

  /// Texte principal blanc éclatant
  static const Color darkTextPrimary = Color(0xFFFFFFFF);

  /// Texte secondaire gris acier doux
  static const Color darkTextSecondary = Color(0xFF9CA3AF);

  /// Texte tertiaire / métadonnées gris ardoise
  static const Color darkTextTertiary = Color(0xFF6B7280);

  // ------------------------------------------------------------
  // ACCENTS & STATUTS
  // ------------------------------------------------------------
  /// Vert émeraude vibrant (Point vert de statut "À Vendre" / "Disponible")
  static const Color accentGreen = Color(0xFF10B981);

  /// Bleu royal moderne pour boutons et accents d'action
  static const Color accentBlue = Color(0xFF2563EB);

  /// Indigo / Violet doux pour tags
  static const Color accentIndigo = Color(0xFF4F46E5);

  /// Rouge alerte et favori
  static const Color accentRed = Color(0xFFEF4444);
  static const Color error = Color(0xFFEF4444);

  /// Blanc pur et noir pur
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  // ------------------------------------------------------------
  // SÉLECTEURS ADAPTATIFS DE THÈME
  // ------------------------------------------------------------
  static Color backgroundOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkBackground : lightBackground;

  static Color surfaceOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkSurface : lightSurface;

  static Color surfaceElevatedOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkSurfaceElevated : lightSurfaceElevated;

  static Color glassBackgroundOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkGlassBackground : lightGlassBackground;

  static Color glassCardOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkGlassCard : lightGlassCard;

  static Color borderOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkBorder : lightBorder;

  static Color borderSubtleOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkBorderSubtle : lightBorderSubtle;

  static Color textPrimaryOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkTextPrimary : lightTextPrimary;

  static Color textSecondaryOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkTextSecondary : lightTextSecondary;

  static Color textTertiaryOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkTextTertiary : lightTextTertiary;

  // ------------------------------------------------------------
  // ALIAS POUR COMPATIBILITÉ RÉTROACTIVE
  // ------------------------------------------------------------
  static const Color primary = accentBlue;
  static const Color secondary = accentGreen;
  static const Color background = lightBackground;
  static const Color surface = lightSurface;
  static const Color darkCard = darkSurface;
  static const Color textPrimary = lightTextPrimary;
  static const Color textSecondary = lightTextSecondary;
  static const Color border = lightBorder;
  static const Color placeholder = Color(0xFFE2E4E9);
}
