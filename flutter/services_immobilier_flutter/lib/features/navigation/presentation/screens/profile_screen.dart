// ============================================================
// DARLINK — ÉCRAN DE PROFIL CLIENT LUXE & PROFESSIONNEL (V2)
// Profil utilisateur épuré, sans photo, orienté client et immobilier
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';

/// Écran de profil client haut de gamme avec gestion des préférences et du thème.
class EcranProfil extends StatelessWidget {
  const EcranProfil({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

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
            fontWeight: FontWeight.w800,
            fontSize: 20,
            letterSpacing: -0.3,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          children: [
            const SizedBox(height: 12),

            // 1. CARTE PROFIL CLIENT (AVATAR MONOGRAMME SANS PHOTO)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: borderColor, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.04),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Monogramme minimaliste et élégant (aucun fichier photo)
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0x332563EB) : const Color(0x182563EB),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.accentBlue.withValues(alpha: 0.5),
                        width: 2,
                      ),
                    ),
                    child: const Center(
                      child: Text(
                        'RL',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppColors.accentBlue,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Nom du client
                  Text(
                    'Rayen Lamine',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: textPrim,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Email professionnel client
                  Text(
                    'rayen.lamine@darlink.tn',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: textSec,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Badge Compte Particulier Vérifié
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0x1F10B981),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x4D10B981)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 14, color: AppColors.accentGreen),
                        SizedBox(width: 6),
                        Text(
                          'Compte Client Vérifié',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.accentGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // 2. SECTION APPARENCE : BASCULEUR THÈME SOMBRE / CLAIR
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0x2860A5FA) : const Color(0x1F2563EB),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                      color: AppColors.accentBlue,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mode sombre',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: textPrim,
                          ),
                        ),
                        Text(
                          isDark ? 'Thème sombre actif (OLED)' : 'Thème blanc actif (Par défaut)',
                          style: TextStyle(
                            fontSize: 12,
                            color: textSec,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: isDark,
                    activeTrackColor: AppColors.accentBlue,
                    onChanged: (val) {
                      AppTheme.basculerTheme();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // 3. SECTION MES ACTIVITÉS IMMOBILIÈRES
            _SectionGroupeLuxe(
              titre: 'Mes activités immobilières',
              isDark: isDark,
              enfants: [
                _LigneActionLuxe(
                  icone: Icons.favorite_border_rounded,
                  titre: 'Annonces favorites',
                  sousTitre: 'Retrouver vos biens coup de cœur',
                  badge: '4',
                  isDark: isDark,
                  onTap: () {},
                ),
                _LigneActionLuxe(
                  icone: Icons.bookmark_border_rounded,
                  titre: 'Recherches enregistrées',
                  sousTitre: 'Alertes prix et nouveaux biens',
                  isDark: isDark,
                  onTap: () {},
                ),
                _LigneActionLuxe(
                  icone: Icons.calendar_month_outlined,
                  titre: 'Visites planifiées',
                  sousTitre: 'Historique des demandes de rendez-vous',
                  isDark: isDark,
                  onTap: () {},
                ),
              ],
            ),

            const SizedBox(height: 18),

            // 4. SECTION PARAMÈTRES & SUPPORT
            _SectionGroupeLuxe(
              titre: 'Préférences & Support',
              isDark: isDark,
              enfants: [
                _LigneActionLuxe(
                  icone: Icons.notifications_none_rounded,
                  titre: 'Notifications push',
                  sousTitre: 'Nouveaux biens et baisses de prix',
                  isDark: isDark,
                  onTap: () {},
                ),
                _LigneActionLuxe(
                  icone: Icons.support_agent_rounded,
                  titre: 'Assistance & Conciergerie',
                  sousTitre: 'Conseillers immobiliers disponibles 7j/7',
                  isDark: isDark,
                  onTap: () {},
                ),
                _LigneActionLuxe(
                  icone: Icons.description_outlined,
                  titre: 'Conditions & Confidentialité',
                  sousTitre: 'Mentions légales et RGPD',
                  isDark: isDark,
                  onTap: () {},
                ),
              ],
            ),

            const SizedBox(height: 24),

            // 5. BOUTON DÉCONNEXION CLIENT
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Session sécurisée fermée.'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
                icon: const Icon(Icons.logout_rounded, color: AppColors.accentRed, size: 20),
                label: const Text(
                  'Déconnexion du compte',
                  style: TextStyle(
                    color: AppColors.accentRed,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _SectionGroupeLuxe extends StatelessWidget {
  final String titre;
  final bool isDark;
  final List<Widget> enfants;

  const _SectionGroupeLuxe({
    required this.titre,
    required this.isDark,
    required this.enfants,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            titre.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: textSec,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: List.generate(enfants.length, (index) {
              return Column(
                children: [
                  enfants[index],
                  if (index < enfants.length - 1)
                    Divider(
                      height: 1,
                      indent: 52,
                      endIndent: 16,
                      color: borderColor,
                    ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _LigneActionLuxe extends StatelessWidget {
  final IconData icone;
  final String titre;
  final String sousTitre;
  final String? badge;
  final bool isDark;
  final VoidCallback onTap;

  const _LigneActionLuxe({
    required this.icone,
    required this.titre,
    required this.sousTitre,
    this.badge,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDark ? const Color(0x22FFFFFF) : const Color(0x0A000000),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icone, size: 20, color: AppColors.accentBlue),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titre,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textPrim,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sousTitre,
                    style: TextStyle(
                      fontSize: 12,
                      color: textSec,
                    ),
                  ),
                ],
              ),
            ),
            if (badge != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.accentBlue,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right_rounded, color: textSec, size: 20),
          ],
        ),
      ),
    );
  }
}
