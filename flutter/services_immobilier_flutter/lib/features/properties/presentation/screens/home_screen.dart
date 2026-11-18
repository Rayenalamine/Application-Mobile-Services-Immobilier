// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL : LISTE DES BIENS (V2-T01)
// Affiche l'entête de bienvenue et les annonces disponibles
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../data/mock_properties.dart';
import '../widgets/property_card.dart';

/// Écran principal de l'application DarLink.
/// Affiche la bannière d'accueil, le titre de section et la liste déroulante des annonces.
class EcranAccueil extends StatelessWidget {
  const EcranAccueil({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      // Barre supérieure avec titre centré
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Services Immobilier',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 2,
      ),

      // Corps de page composé de la section bienvenue et de la liste
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section de bienvenue stylisée avec dégradé
          const SectionBienvenue(),

          // Titre de section "Nos biens immobiliers"
          const Padding(
            padding: EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            child: Text(
              'Nos biens immobiliers',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),

          // Liste verticale déroulante des propriétés fictives
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              itemCount: listeProprietes.length,
              itemBuilder: (context, index) {
                return CartePropriete(
                  propriete: listeProprietes[index],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// Bannière de bienvenue affichée en haut de l'écran d'accueil avec dégradé de couleur.
class SectionBienvenue extends StatelessWidget {
  const SectionBienvenue({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withAlpha(200),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bienvenue sur Services Immobilier',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Trouvez le bien immobilier de vos rêves en Tunisie.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

