// ============================================================
// DARLINK — ÉCRAN DE PROFIL CLIENT LUXE & PROFESSIONNEL (V2)
// Profil utilisateur épuré, sans photo, orienté client et immobilier
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../properties/presentation/screens/add_property_screen.dart';
import '../../../contact/data/contact_api_service.dart';

/// Écran de profil client haut de gamme avec gestion des préférences et du thème.
class EcranProfil extends StatefulWidget {
  const EcranProfil({super.key});

  @override
  State<EcranProfil> createState() => _EcranProfilState();
}

class _EcranProfilState extends State<EcranProfil> {
  void _afficherModalConnexion(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = AppColors.surfaceOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final borderColor = AppColors.borderOf(context);

    final emailCtrl = TextEditingController(text: 'rayen.lamine@darlink.tn');
    final passCtrl = TextEditingController(text: 'password123');
    final nameCtrl = TextEditingController(text: 'Rayen Lamine');
    bool isRegister = false;
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 32,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: borderColor,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    isRegister ? 'Créer un compte DarLink' : 'Connexion à votre compte',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: textPrim,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 18),
                  if (isRegister) ...[
                    TextField(
                      controller: nameCtrl,
                      decoration: InputDecoration(
                        labelText: 'Nom complet',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: emailCtrl,
                    decoration: InputDecoration(
                      labelText: 'Adresse e-mail',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: passCtrl,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Mot de passe',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () async {
                            setModalState(() => isLoading = true);
                            bool ok = false;
                            if (isRegister) {
                              ok = await AuthService.instance.register(
                                fullName: nameCtrl.text.trim(),
                                email: emailCtrl.text.trim(),
                                password: passCtrl.text.trim(),
                              );
                            } else {
                              ok = await AuthService.instance.login(
                                email: emailCtrl.text.trim(),
                                password: passCtrl.text.trim(),
                              );
                            }
                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                              setState(() {});
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(ok
                                      ? 'Session mise à jour avec succès !'
                                      : 'Échec de connexion.'),
                                ),
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? Colors.white : const Color(0xFF0F1015),
                      foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(
                      isLoading
                          ? 'Chargement...'
                          : (isRegister ? 'Créer mon compte' : 'Se connecter'),
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () {
                      setModalState(() => isRegister = !isRegister);
                    },
                    child: Text(
                      isRegister
                          ? 'Déjà un compte ? Se connecter'
                          : 'Pas encore de compte ? S\'inscrire',
                      style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _afficherModalEditionProfil(BuildContext context) {
    final user = AuthState.instance.currentUser;
    final nameCtrl = TextEditingController(text: user?.fullName ?? 'Rayen Lamine');
    final phoneCtrl = TextEditingController(text: user?.phone ?? '+216 20 123 456');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Modifier mes coordonnées'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Nom complet'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              decoration: const InputDecoration(labelText: 'Numéro de téléphone'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentBlue, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await AuthService.instance.updateProfile(
                fullName: nameCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
              );
              if (!mounted || !context.mounted) return;
              setState(() {});
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(ok ? 'Profil mis à jour dans PostgreSQL !' : 'Mise à jour locale effectuée'),
                  backgroundColor: AppColors.accentGreen,
                ),
              );
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _afficherModalDemandesContact(BuildContext context) async {
    final cardBg = AppColors.surfaceOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final demandes = await ContactApiService.instance.getReceivedRequests();

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(24),
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.7),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Demandes de contact reçues (${demandes.length})',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: textPrim),
              ),
              const SizedBox(height: 16),
              if (demandes.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Center(
                    child: Text('Aucune demande de contact reçue pour le moment.', style: TextStyle(color: textSec)),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    itemCount: demandes.length,
                    separatorBuilder: (_, index) => const Divider(),
                    itemBuilder: (context, i) {
                      final d = demandes[i];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: AppColors.accentBlue.withValues(alpha: 0.2),
                          child: Text(d.senderName.isNotEmpty ? d.senderName[0] : 'C', style: const TextStyle(color: AppColors.accentBlue)),
                        ),
                        title: Text(d.senderName, style: TextStyle(fontWeight: FontWeight.w700, color: textPrim)),
                        subtitle: Text('${d.senderEmail} • ${d.senderPhone ?? ""}\n"${d.message}"', style: TextStyle(color: textSec, fontSize: 13)),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: const Color(0x1F10B981), borderRadius: BorderRadius.circular(8)),
                          child: Text(d.status, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.accentGreen)),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final user = AuthState.instance.currentUser;
    final userName = user?.fullName ?? 'Rayen Lamine';
    final userEmail = user?.email ?? 'rayen.lamine@darlink.tn';
    final initiales = userName.trim().split(' ').map((e) => e.isNotEmpty ? e[0].toUpperCase() : '').take(2).join();

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
                    child: Center(
                      child: Text(
                        initiales.isNotEmpty ? initiales : 'RL',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppColors.accentBlue,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Nom du client avec bouton d'édition
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        userName,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: textPrim,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _afficherModalEditionProfil(context),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.accentBlue.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit_outlined, size: 16, color: AppColors.accentBlue),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Email professionnel client
                  Text(
                    userEmail,
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
                  icone: Icons.add_circle_outline_rounded,
                  titre: 'Déposer une annonce',
                  sousTitre: 'Publier un bien immobilier haut standing (V7)',
                  isDark: isDark,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const EcranDepotAnnonce(),
                      ),
                    );
                  },
                ),
                _LigneActionLuxe(
                  icone: Icons.map_outlined,
                  titre: 'Carte des biens en Tunisie',
                  sousTitre: 'Cartographie et repères GPS interactifs (V8)',
                  isDark: isDark,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const EcranCarteInteractive(),
                      ),
                    );
                  },
                ),
                _LigneActionLuxe(
                  icone: Icons.favorite_border_rounded,
                  titre: 'Annonces favorites',
                  sousTitre: 'Retrouver vos biens coup de cœur',
                  badge: '4',
                  isDark: isDark,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Consultez l\'onglet Favoris dans la barre inférieure.')),
                    );
                  },
                ),
                _LigneActionLuxe(
                  icone: Icons.mark_email_unread_outlined,
                  titre: 'Demandes de visite reçues',
                  sousTitre: 'Consulter les messages des acheteurs',
                  isDark: isDark,
                  onTap: () => _afficherModalDemandesContact(context),
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

            // 5. BOUTON DÉCONNEXION & CHANGEMENT DE COMPTE (V4)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: TextButton.icon(
                onPressed: () => _afficherModalConnexion(context),
                icon: const Icon(Icons.swap_horiz_rounded, color: AppColors.accentBlue, size: 20),
                label: const Text(
                  'Changer de compte / Se connecter',
                  style: TextStyle(
                    color: AppColors.accentBlue,
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
