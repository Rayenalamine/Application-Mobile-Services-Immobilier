// ============================================================
// DARLINK — ÉCRAN DE PROFIL LUXE GLASSMORPHISM (V2-T04)
// Interface profil avec basculement de thème et informations projet
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/theme/app_theme.dart';

/// Écran de profil luxe glassmorphique présentant le compte et les détails académiques.
class EcranProfil extends StatelessWidget {
  const EcranProfil({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final cardBg = isDark ? AppColors.darkCard : AppColors.lightSurface;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final textPrim = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSec = isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Text(
          'Mon Profil',
          style: TextStyle(
            color: textPrim,
            fontWeight: FontWeight.w700,
            fontSize: 20,
            letterSpacing: -0.3,
          ),
        ),
        centerTitle: true,
        actions: [
          // Bouton interactif pour basculer clair / sombre
          Padding(
            padding: const EdgeInsets.only(right: AppSpacing.md),
            child: IconButton(
              tooltip: isDark ? 'Passer en mode clair' : 'Passer en mode sombre',
              style: IconButton.styleFrom(
                backgroundColor: isDark ? const Color(0x33FFFFFF) : const Color(0x1F000000),
                shape: const CircleBorder(),
              ),
              icon: Icon(
                isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                color: textPrim,
                size: 20,
              ),
              onPressed: () {
                AppTheme.basculerTheme();
              },
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        child: Column(
          children: [
            const SizedBox(height: AppSpacing.md),

            // Section Avatar & Identité (style Screen 1 Jenny Wilson / Rayen Lamine)
            Center(
              child: Stack(
                alignment: Alignment.bottomRight,
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.accentBlue.withValues(alpha: 0.6),
                        width: 2.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.accentBlue.withValues(alpha: isDark ? 0.3 : 0.15),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.network(
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                          child: Icon(
                            Icons.person,
                            size: 54,
                            color: textPrim,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.accentGreen,
                      shape: BoxShape.circle,
                      border: Border.all(color: bgColor, width: 2),
                    ),
                    child: const Icon(
                      Icons.check,
                      size: 14,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Nom et statut
            Text(
              'Rayen Lamine',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: textPrim,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 4),
            // Rétention sémantique "Utilisateur Invité" pour test de navigation
            Text(
              'Utilisateur Invité',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: textSec,
              ),
            ),
            const SizedBox(height: 8),

            // Badge Rôle & Statut
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? const Color(0x2E10B981) : const Color(0x1F10B981),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.accentGreen.withValues(alpha: 0.4), width: 1),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.shield_rounded, size: 14, color: AppColors.accentGreen),
                  SizedBox(width: 6),
                  Text(
                    'Membre 1 — Lead Repo Owner',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.accentGreen,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Carte Glassmorphique Cadre Académique
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: cardBg.withValues(alpha: isDark ? 0.7 : 0.9),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: borderColor, width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _LigneInformationLuxe(
                        icone: Icons.school_rounded,
                        titre: 'Cadre Académique',
                        valeur: 'Mini Projet Défi — Services Immobilier',
                        isDark: isDark,
                      ),
                      Divider(color: borderColor, height: 24),
                      _LigneInformationLuxe(
                        icone: Icons.person_pin_circle_rounded,
                        titre: 'Enseignant Encadrant',
                        valeur: 'M. Wahid Hamdi',
                        isDark: isDark,
                      ),
                      Divider(color: borderColor, height: 24),
                      _LigneInformationLuxe(
                        icone: Icons.groups_rounded,
                        titre: 'Équipe Projet',
                        valeur: '3 Membres (M1 : Propriétaire du Dépôt)',
                        isDark: isDark,
                      ),
                      Divider(color: borderColor, height: 24),
                      _LigneInformationLuxe(
                        icone: Icons.verified_user_rounded,
                        titre: 'Version de l\'application',
                        valeur: 'DarLink Mobile v2.0.0 (Socle V2)',
                        isDark: isDark,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Note Sécurité & JWT Glassmorphism
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md + 2),
                  decoration: BoxDecoration(
                    color: cardBg.withValues(alpha: isDark ? 0.5 : 0.8),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: borderColor, width: 1),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0x332563EB) : const Color(0x1F2563EB),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lock_clock_rounded, color: AppColors.accentBlue, size: 20),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          'Connexion, inscription et gestion du profil JWT prévues en phase V4-T01 à V4-T03.',
                          style: TextStyle(
                            fontSize: 12,
                            color: textSec,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }
}

class _LigneInformationLuxe extends StatelessWidget {
  final IconData icone;
  final String titre;
  final String valeur;
  final bool isDark;

  const _LigneInformationLuxe({
    required this.icone,
    required this.titre,
    required this.valeur,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textPrim = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSec = isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark ? const Color(0x22FFFFFF) : const Color(0x11000000),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icone, size: 20, color: AppColors.accentBlue),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                titre,
                style: TextStyle(
                  fontSize: 12,
                  color: textSec,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                valeur,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textPrim,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
