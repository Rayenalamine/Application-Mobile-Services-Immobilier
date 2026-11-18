// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS D'UN BIEN IMMOBILIER (V2-T01)
// Affiche la fiche descriptive complète et ses caractéristiques
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../domain/models/property.dart';
import '../widgets/property_card.dart';

/// Écran complet présentant les détails d'un bien immobilier sélectionné.
/// Permet de consulter la photographie grand format, les caractéristiques (chambres, bains),
/// la description détaillée et propose un bouton de retour à la liste.
class EcranDetails extends StatelessWidget {
  final Propriete propriete;

  const EcranDetails({super.key, required this.propriete});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      // Barre de navigation supérieure avec bouton retour automatique
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Détails du bien',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 2,
      ),

      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Grande image du bien en tête de page
            ImagePropriete(
              imageUrl: propriete.imageUrl,
              hauteur: 260,
            ),

            // Contenu informatif
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge type de bien
                  BadgeType(type: propriete.type),
                  const SizedBox(height: AppSpacing.sm),

                  // Titre de l'annonce
                  Text(
                    propriete.titre,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Localisation avec icône
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          propriete.localisation,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Encadré mis en valeur pour le prix en TND
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusSM),
                      border: Border.all(
                        color: AppColors.primary.withAlpha(80),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.monetization_on,
                          color: AppColors.primary,
                          size: 24,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          'Prix : ${propriete.prixFormate} TND',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Titre de la section des caractéristiques
                  const Text(
                    'Caractéristiques',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Grille horizontale des caractéristiques (Chambres / Salles de bain)
                  Row(
                    children: [
                      Expanded(
                        child: CarteCaracteristique(
                          icone: Icons.bed,
                          valeur: '${propriete.nombreChambres}',
                          libelle: 'Chambres',
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: CarteCaracteristique(
                          icone: Icons.bathtub,
                          valeur: '${propriete.nombreSallesDeBain}',
                          libelle: 'Salles de bain',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Titre de la section description
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Corps de texte de la description
                  Text(
                    propriete.description,
                    style: const TextStyle(
                      fontSize: 15,
                      color: AppColors.textSecondary,
                      height: 1.6, // Hauteur de ligne aérée pour lisibilité
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Bouton explicite pour retourner à la liste des annonces
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusSM),
                        ),
                      ),
                      onPressed: () {
                        // Retourne à l'écran d'accueil précédent
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: const Text(
                        'Retour à la liste',
                        style: TextStyle(fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Carte réutilisable pour afficher une caractéristique chiffrée avec son icône.
class CarteCaracteristique extends StatelessWidget {
  final IconData icone;
  final String valeur;
  final String libelle;

  const CarteCaracteristique({
    super.key,
    required this.icone,
    required this.valeur,
    required this.libelle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSM),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icone, color: AppColors.primary, size: 28),
          const SizedBox(height: 6),
          Text(
            valeur,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            libelle,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

