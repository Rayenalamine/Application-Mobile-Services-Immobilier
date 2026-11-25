// ============================================================
// DARLINK — APPLE-INSPIRED LUXURY PALETTE & LIQUID GLASS TOKENS (Flutter)
// Warm Alabaster Light Mode + Obsidian Dark Mode + Restrained Accents
// ============================================================

import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // ------------------------------------------------------------
  // LIGHT LUXURY PALETTE (WARM ALABASTER & CHARCOAL)
  // ------------------------------------------------------------
  static const Color lightBackground = Color(0xFFFBFBFD);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFF2F2F7);
  static const Color lightGlassBackground = Color(0xCCFFFFFF);
  static const Color lightGlassCard = Color(0xD9FFFFFF);
  static const Color lightBorder = Color(0x141D1D1F);
  static const Color lightBorderSubtle = Color(0x0A1D1D1F);
  static const Color lightTextPrimary = Color(0xFF1D1D1F);
  static const Color lightTextSecondary = Color(0xFF6E6E73);
  static const Color lightTextTertiary = Color(0xFFAEAEB2);

  // ------------------------------------------------------------
  // DARK LUXURY PALETTE (OBSIDIAN & SMOKED GLASS)
  // ------------------------------------------------------------
  static const Color darkBackground = Color(0xFF0B0C0F);
  static const Color darkSurface = Color(0xFF15171C);
  static const Color darkSurfaceElevated = Color(0xFF1E2128);
  static const Color darkGlassBackground = Color(0xB8181A20);
  static const Color darkGlassCard = Color(0xCC14161B);
  static const Color darkBorder = Color(0x24FFFFFF);
  static const Color darkBorderSubtle = Color(0x12FFFFFF);
  static const Color darkTextPrimary = Color(0xFFF5F5F7);
  static const Color darkTextSecondary = Color(0xFF98989D);
  static const Color darkTextTertiary = Color(0xFF636366);

  // ------------------------------------------------------------
  // RESTRAINED LUXURY ACCENTS & SEMANTICS
  // ------------------------------------------------------------
  static const Color accentObsidian = Color(0xFF1D1D1F);
  static const Color accentChampagne = Color(0xFF9A7B4F);
  static const Color accentGreen = Color(0xFF16A34A);
  static const Color accentBlue = Color(0xFF0A66C2);
  static const Color accentIndigo = Color(0xFF4F46E5);
  static const Color accentRed = Color(0xFFDC2626);
  static const Color accentAmber = Color(0xFFD97706);
  static const Color error = Color(0xFFDC2626);

  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  // ------------------------------------------------------------
  // ADAPTIVE CONTEXT SELECTORS
  // ------------------------------------------------------------
  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color backgroundOf(BuildContext context) =>
      isDark(context) ? darkBackground : lightBackground;

  static Color surfaceOf(BuildContext context) =>
      isDark(context) ? darkSurface : lightSurface;

  static Color surfaceElevatedOf(BuildContext context) =>
      isDark(context) ? darkSurfaceElevated : lightSurfaceElevated;

  static Color glassBackgroundOf(BuildContext context) =>
      isDark(context) ? darkGlassBackground : lightGlassBackground;

  static Color glassCardOf(BuildContext context) =>
      isDark(context) ? darkGlassCard : lightGlassCard;

  static Color borderOf(BuildContext context) =>
      isDark(context) ? darkBorder : lightBorder;

  static Color borderSubtleOf(BuildContext context) =>
      isDark(context) ? darkBorderSubtle : lightBorderSubtle;

  static Color textPrimaryOf(BuildContext context) =>
      isDark(context) ? darkTextPrimary : lightTextPrimary;

  static Color textSecondaryOf(BuildContext context) =>
      isDark(context) ? darkTextSecondary : lightTextSecondary;

  static Color textTertiaryOf(BuildContext context) =>
      isDark(context) ? darkTextTertiary : lightTextTertiary;

  static Color primaryActionBgOf(BuildContext context) =>
      isDark(context) ? white : lightTextPrimary;

  static Color primaryActionFgOf(BuildContext context) =>
      isDark(context) ? lightTextPrimary : white;
}
