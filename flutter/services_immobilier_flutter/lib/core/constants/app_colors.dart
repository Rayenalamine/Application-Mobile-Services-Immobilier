// ============================================================
// DARLINK — CONSTANTES DE COULEURS PROVISOIRES (V2-T01)
// Centralise la palette de couleurs utilisée dans l'application
// ============================================================

import 'package:flutter/material.dart';

/// Palette de couleurs pour DarLink (Version 2 - Tâche V2-T01).
/// NOTE : Ces valeurs constituent les jetons de design PROVISOIRES d'implémentation
/// utilisés par le Membre 1, en attente de la validation et finalisation du document
/// officiel du Design System par le Membre 3.
class AppColors {
  // Constructeur privé pour empêcher l'instanciation de cette classe utilitaire
  AppColors._();

  /// Couleur primaire : bleu moderne pour les éléments d'action et AppBar
  static const Color primary = Color(0xFF1E88E5);

  /// Couleur secondaire : vert d'eau pour les éléments d'accentuation
  static const Color secondary = Color(0xFF26A69A);

  /// Fond général clair de l'application
  static const Color background = Color(0xFFF5F5F7);

  /// Surface des cartes et conteneurs
  static const Color surface = Color(0xFFFFFFFF);

  /// Couleur principale du texte (titres et éléments majeurs)
  static const Color textPrimary = Color(0xFF1C1B1F);

  /// Couleur secondaire du texte (descriptions, sous-titres, libellés)
  static const Color textSecondary = Color(0xFF49454F);

  /// Couleur d'erreur ou d'alerte
  static const Color error = Color(0xFFB3261E);

  /// Couleur grise pour les bordures légères
  static const Color border = Color(0xFFE0E0E0);

  /// Gris clair pour les placeholders et fonds d'images en chargement
  static const Color placeholder = Color(0xFFEEEEEE);
}

