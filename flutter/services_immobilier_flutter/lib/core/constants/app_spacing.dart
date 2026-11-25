// ============================================================
// DARLINK — SPACING, RADIUS & TYPOGRAPHY SCALE (Flutter)
// ============================================================

import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();

  static const double xxs = 2.0;
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 20.0;
  static const double xl = 28.0;
  static const double xxl = 40.0;

  static const double radiusXS = 8.0;
  static const double radiusSM = 12.0;
  static const double radiusMD = 18.0;
  static const double radiusLG = 26.0;
  static const double radiusXL = 34.0;
  static const double radiusPill = 999.0;
}

class AppTypography {
  AppTypography._();

  static TextStyle heroDisplay(Color color) => TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        height: 1.12,
        letterSpacing: -0.85,
        color: color,
      );

  static TextStyle pageTitle(Color color) => TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.18,
        letterSpacing: -0.55,
        color: color,
      );

  static TextStyle sectionTitle(Color color) => TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.25,
        letterSpacing: -0.3,
        color: color,
      );

  static TextStyle cardTitle(Color color) => TextStyle(
        fontSize: 16.5,
        fontWeight: FontWeight.w600,
        height: 1.25,
        letterSpacing: -0.25,
        color: color,
      );

  static TextStyle priceDisplay(Color color) => TextStyle(
        fontSize: 21,
        fontWeight: FontWeight.w700,
        height: 1.15,
        letterSpacing: -0.5,
        fontFeatures: const [FontFeature.tabularFigures()],
        color: color,
      );

  static TextStyle body(Color color) => TextStyle(
        fontSize: 14.5,
        fontWeight: FontWeight.w400,
        height: 1.45,
        letterSpacing: -0.1,
        color: color,
      );

  static TextStyle caption(Color color) => TextStyle(
        fontSize: 12.5,
        fontWeight: FontWeight.w500,
        height: 1.3,
        letterSpacing: 0.05,
        color: color,
      );

  static TextStyle micro(Color color) => TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        height: 1.2,
        letterSpacing: 0.35,
        color: color,
      );
}
