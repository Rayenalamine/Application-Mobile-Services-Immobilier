// ============================================================
// DARLINK — ÉCRAN DE PROFIL UTILISATEUR (V2-T04)
// Interface préparatoire pour l'authentification et profil (V4-T03)
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';

/// Écran de profil présentant le compte utilisateur invité et les informations du projet.
/// Prépare l'authentification JWT et l'endpoint /users/me de la phase V4.
class EcranProfil extends StatelessWidget {
  const EcranProfil({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Mon Profil',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          children: [
            const SizedBox(height: AppSpacing.md),
            // Avatar utilisateur
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 46,
                    backgroundColor: AppColors.primary.withAlpha(40),
                    child: const Icon(
                      Icons.person,
                      size: 52,
                      color: AppColors.primary,
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.secondary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Nom et statut de l'utilisateur
            const Text(
              'Utilisateur Invité',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.secondary.withAlpha(30),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Session Démonstration',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondary,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Carte d'informations académiques
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  children: [
                    _LigneInformation(
                      icone: Icons.school,
                      titre: 'Cadre Académique',
                      valeur: 'Mini Projet Défi — Services Immobilier',
                    ),
                    Divider(),
                    _LigneInformation(
                      icone: Icons.person_pin,
                      titre: 'Enseignant Encadrant',
                      valeur: 'M. Wahid Hamdi',
                    ),
                    Divider(),
                    _LigneInformation(
                      icone: Icons.group,
                      titre: 'Équipe Projet',
                      valeur: '3 Membres (M1 : Propriétaire du Dépôt)',
                    ),
                    Divider(),
                    _LigneInformation(
                      icone: Icons.verified,
                      titre: 'Version de l\'application',
                      valeur: 'DarLink Mobile v2.0.0 (Socle V2)',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Note sur l'authentification JWT
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE0E0E0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_outline, color: AppColors.primary),
                  SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Connexion, inscription et gestion du profil JWT prévues en phase V4-T01 à V4-T03.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
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

class _LigneInformation extends StatelessWidget {
  final IconData icone;
  final String titre;
  final String valeur;

  const _LigneInformation({
    required this.icone,
    required this.titre,
    required this.valeur,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icone, size: 22, color: AppColors.primary),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titre,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  valeur,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
