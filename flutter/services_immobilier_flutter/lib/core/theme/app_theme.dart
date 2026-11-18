// ============================================================
// DARLINK — SYSTÈME OFFICIEL DE THÈMES ET TYPOGRAPHIE (V2-T02)
// Implémentation conforme à docs/THEME_SPECIFICATION.md (Membre 2)
// ============================================================

import 'package:flutter/material.dart';

/// Gestionnaire officiel des thèmes clair et sombre pour l'application DarLink.
/// Respecte strictement les ratios d'accessibilité WCAG 2.1 AA définis par le Membre 1.
class AppTheme {
  AppTheme._();

  // ------------------------------------------------------------
  // PALETTE SÉMANTIQUE — MODE CLAIR (LIGHT MODE)
  // ------------------------------------------------------------
  static const Color lightPrimary = Color(0xFF1E88E5);
  static const Color lightPrimaryDark = Color(0xFF1565C0);
  static const Color lightSecondary = Color(0xFF26A69A);
  static const Color lightBackground = Color(0xFFF5F5F7);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightOnPrimary = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF1C1B1F);
  static const Color lightTextSecondary = Color(0xFF49454F);
  static const Color lightBorder = Color(0xFFE0E0E0);
  static const Color lightError = Color(0xFFB3261E);
  static const Color lightOnError = Color(0xFFFFFFFF);

  // ------------------------------------------------------------
  // PALETTE SÉMANTIQUE — MODE SOMBRE (DARK MODE)
  // ------------------------------------------------------------
  static const Color darkPrimary = Color(0xFF90CAF9);
  static const Color darkSecondary = Color(0xFF80CBC4);
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkSurfaceVariant = Color(0xFF2C2C2C);
  static const Color darkOnPrimary = Color(0xFF0D47A1);
  static const Color darkTextPrimary = Color(0xFFE6E1E5);
  static const Color darkTextSecondary = Color(0xFFCAC4D0);
  static const Color darkBorder = Color(0xFF333333);
  static const Color darkError = Color(0xFFF2B8B5);
  static const Color darkOnError = Color(0xFF601410);

  // ------------------------------------------------------------
  // GESTION RÉACTIVE DU MODE DE THÈME (ThemeMode)
  // ------------------------------------------------------------
  static final ValueNotifier<ThemeMode> themeModeNotifier =
      ValueNotifier<ThemeMode>(ThemeMode.light);

  /// Bascule réactive entre le mode clair et le mode sombre.
  static void basculerTheme() {
    if (themeModeNotifier.value == ThemeMode.dark) {
      themeModeNotifier.value = ThemeMode.light;
    } else {
      themeModeNotifier.value = ThemeMode.dark;
    }
  }

  /// Définit explicitement le mode de thème.
  static void definirThemeMode(ThemeMode mode) {
    themeModeNotifier.value = mode;
  }

  // ------------------------------------------------------------
  // ÉCHELLE TYPOGRAPHIQUE STANDARDISÉE (docs/THEME_SPECIFICATION.md)
  // ------------------------------------------------------------
  static TextTheme _construireTextTheme({required Color textPrimary, required Color textSecondary}) {
    return TextTheme(
      displayLarge: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 34 / 28,
        letterSpacing: -0.2,
        color: textPrimary,
      ),
      headlineMedium: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 26 / 20,
        letterSpacing: 0.0,
        color: textPrimary,
      ),
      titleMedium: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        height: 24 / 18,
        letterSpacing: 0.1,
        color: textPrimary,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 22 / 16,
        letterSpacing: 0.2,
        color: textPrimary,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 20 / 14,
        letterSpacing: 0.2,
        color: textSecondary,
      ),
      labelLarge: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 20 / 14,
        letterSpacing: 0.1,
      ),
      labelSmall: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        height: 16 / 11,
        letterSpacing: 0.4,
      ),
    );
  }

  // ------------------------------------------------------------
  // CONFIGURATION DU THÈME CLAIR (LIGHT THEME)
  // ------------------------------------------------------------
  static ThemeData get lightTheme {
    final colorScheme = const ColorScheme.light(
      primary: lightPrimary,
      onPrimary: lightOnPrimary,
      secondary: lightSecondary,
      surface: lightSurface,
      error: lightError,
      onError: lightOnError,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: lightBackground,
      textTheme: _construireTextTheme(
        textPrimary: lightTextPrimary,
        textSecondary: lightTextSecondary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightPrimary,
        foregroundColor: lightOnPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: lightSurface,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: lightBorder, width: 0.8),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: lightSurface,
        indicatorColor: lightPrimary.withValues(alpha: 0.15),
        elevation: 3,
      ),
    );
  }

  // ------------------------------------------------------------
  // CONFIGURATION DU THÈME SOMBRE (DARK THEME)
  // ------------------------------------------------------------
  static ThemeData get darkTheme {
    final colorScheme = const ColorScheme.dark(
      primary: darkPrimary,
      onPrimary: darkOnPrimary,
      secondary: darkSecondary,
      surface: darkSurface,
      error: darkError,
      onError: darkOnError,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: darkBackground,
      textTheme: _construireTextTheme(
        textPrimary: darkTextPrimary,
        textSecondary: darkTextSecondary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: darkTextPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: darkBorder, width: 0.8),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: darkSurface,
        indicatorColor: darkPrimary.withValues(alpha: 0.25),
        elevation: 3,
      ),
    );
  }
}
