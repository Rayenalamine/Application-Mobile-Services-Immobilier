// ============================================================
// DARLINK — POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION (V2-T01)
// Initialise et configure MaterialApp avec le thème et l'écran d'accueil
// ============================================================

import 'package:flutter/material.dart';
import 'core/constants/app_colors.dart';
import 'features/properties/presentation/screens/home_screen.dart';

/// Point d'entrée standard de l'application Flutter DarLink.
void main() {
  runApp(const ServicesImmobilierApp());
}

/// Widget racine configurant MaterialApp, le titre global et le thème Material 3.
class ServicesImmobilierApp extends StatelessWidget {
  const ServicesImmobilierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Services Immobilier',
      debugShowCheckedModeBanner: false,

      // Configuration du thème général s'appuyant sur les Design Tokens provisoires
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          brightness: Brightness.light,
          primary: AppColors.primary,
          surface: AppColors.surface,
          error: AppColors.error,
        ),
        scaffoldBackgroundColor: AppColors.background,
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),

      // Définition de l'écran initial de l'application
      home: const EcranAccueil(),
    );
  }
}
