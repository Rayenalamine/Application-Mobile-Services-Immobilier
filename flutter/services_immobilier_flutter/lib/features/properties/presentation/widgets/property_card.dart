// ============================================================
// DARLINK — COMPOSANT CARTE DE BIEN IMMOBILIER (V2-T01)
// Affiche une annonce immobilière dans la liste principale
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../domain/models/property.dart';
import '../screens/property_details_screen.dart';

/// Carte représentant un bien immobilier dans la liste.
/// Affiche la photographie, le type, le titre, la ville, le prix en TND
/// et un bouton interactif "Voir détails".
class CartePropriete extends StatelessWidget {
  final Propriete propriete;

  const CartePropriete({super.key, required this.propriete});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMD),
      ),
      elevation: 3,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image du bien avec état de chargement et fallback
          ImagePropriete(
            imageUrl: propriete.imageUrl,
            hauteur: 200,
          ),

          // Informations textuelles et prix
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badge du type de bien
                BadgeType(type: propriete.type),
                const SizedBox(height: AppSpacing.sm),

                // Titre du bien
                Text(
                  propriete.titre,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),

                // Localisation géographique avec icône
                Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        propriete.localisation,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Ligne séparatrice
                const Divider(height: 1, color: AppColors.border),
                const SizedBox(height: 10),

                // Prix et bouton "Voir détails" sur la même ligne
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Prix en Dinars Tunisiens
                    Text(
                      '${propriete.prixFormate} TND',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),

                    // Bouton d'action pour ouvrir l'écran de détails
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusSM),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                      ),
                      onPressed: () {
                        // Navigation vers l'écran de détails avec la propriété sélectionnée
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                EcranDetails(propriete: propriete),
                          ),
                        );
                      },
                      child: const Text('Voir détails'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Widget réutilisable pour afficher une image distante avec gestion d'état :
/// - Chargement en cours : CircularProgressIndicator
/// - Erreur de chargement (URL invalide, pas de réseau) : icône de maison et message de fallback
class ImagePropriete extends StatelessWidget {
  final String imageUrl;
  final double hauteur;

  const ImagePropriete({
    super.key,
    required this.imageUrl,
    required this.hauteur,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: hauteur,
      width: double.infinity,
      child: Image.network(
        imageUrl,
        fit: BoxFit.cover,
        // Pendant le téléchargement de l'image
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: AppColors.placeholder,
            child: const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        },
        // En cas d'erreur de chargement (réseau ou URL)
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: const Color(0xFFE0E0E0),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.home, size: 60, color: AppColors.textSecondary),
                SizedBox(height: AppSpacing.sm),
                Text(
                  'Image non disponible',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Badge arrondi pour mettre en valeur le type de bien (Appartement, Maison, Villa).
class BadgeType extends StatelessWidget {
  final String type;

  const BadgeType({super.key, required this.type});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFE3F2FD), // Teinte bleutée très claire
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        type,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
      ),
    );
  }
}

