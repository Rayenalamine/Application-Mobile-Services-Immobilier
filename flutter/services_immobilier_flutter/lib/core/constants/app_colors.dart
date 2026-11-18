// ============================================================
// DARLINK — SYSTÈME DE COULEURS LUXE MODERNE & GLASSMORPHISM
// Palette Dark & Light inspirée du Design System Moderne
// ============================================================

import 'package:flutter/material.dart';

/// Palette de couleurs experte pour l'application DarLink.
/// Offre une prise en charge complète du Dark Mode de luxe (fond anthracite,
/// verre dépoli translucide, accents émeraude et bleu roi) et d'un Light Mode épuré.
class AppColors {
  AppColors._();

  // ------------------------------------------------------------
  // PALETTE FLAGSHIP — DARK LUXURY (Inspirée de la maquette de référence)
  // ------------------------------------------------------------
  /// Fond principal profond (Charcoal / Anthracite foncé)
  static const Color darkBackground = Color(0xFF0F1015);

  /// Fond de surface pour cartes et conteneurs
  static const Color darkSurface = Color(0xFF181920);

  /// Fond de surface surélevé (survol, modals)
  static const Color darkSurfaceElevated = Color(0xFF22242D);

  /// Verre dépoli translucide pour les conteneurs flottants (Glassmorphism)
  static const Color darkGlassBackground = Color(0xCC181920);

  /// Verre dépoli plus transparent pour les cartes d'annonces
  static const Color darkGlassCard = Color(0xAA181920);

  /// Bordure lumineuse subtile (effet biseauté de verre)
  static const Color darkBorder = Color(0x24FFFFFF);

  /// Bordure ultra-fine discrète
  static const Color darkBorderSubtle = Color(0x12FFFFFF);

  /// Texte principal blanc éclatant
  static const Color darkTextPrimary = Color(0xFFFFFFFF);

  /// Texte secondaire gris acier doux
  static const Color darkTextSecondary = Color(0xFF9CA3AF);

  /// Texte tertiaire / métadonnées gris ardoise
  static const Color darkTextTertiary = Color(0xFF6B7280);

  // ------------------------------------------------------------
  // PALETTE MODERNE — LIGHT LUXURY
  // ------------------------------------------------------------
  /// Fond général clair
  static const Color lightBackground = Color(0xFFF3F4F8);

  /// Fond de surface blanc pur
  static const Color lightSurface = Color(0xFFFFFFFF);

  /// Surface surélevée
  static const Color lightSurfaceElevated = Color(0xFFFFFFFF);

  /// Verre dépoli clair
  static const Color lightGlassBackground = Color(0xEEFFFFFF);

  /// Carte en verre clair
  static const Color lightGlassCard = Color(0xCCFFFFFF);

  /// Bordure subtile claire
  static const Color lightBorder = Color(0x14000000);

  /// Texte principal foncé
  static const Color lightTextPrimary = Color(0xFF111827);

  /// Texte secondaire gris
  static const Color lightTextSecondary = Color(0xFF4B5563);

  /// Texte tertiaire gris clair
  static const Color lightTextTertiary = Color(0xFF9CA3AF);

  // ------------------------------------------------------------
  // ACCENTS & STATUTS
  // ------------------------------------------------------------
  /// Vert émeraude vibrant (Point vert de statut "À Vendre" / "Disponible")
  static const Color accentGreen = Color(0xFF10B981);

  /// Bleu royal moderne pour boutons et accents d'action
  static const Color accentBlue = Color(0xFF2563EB);

  /// Indigo / Violet doux pour tags
  static const Color accentIndigo = Color(0xFF4F46E5);

  /// Rouge alerte
  static const Color error = Color(0xFFEF4444);

  /// Blanc pur et noir pur
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  // ------------------------------------------------------------
  // ALIAS POUR COMPATIBILITÉ RÉTROACTIVE
  // ------------------------------------------------------------
  static const Color primary = accentBlue;
  static const Color secondary = accentGreen;
  static const Color background = darkBackground;
  static const Color surface = darkSurface;
  static const Color darkCard = darkSurface;
  static const Color accentRed = Color(0xFFEF4444);
  static const Color textPrimary = darkTextPrimary;
  static const Color textSecondary = darkTextSecondary;
  static const Color border = darkBorder;
  static const Color placeholder = Color(0xFF1F2128);
}
