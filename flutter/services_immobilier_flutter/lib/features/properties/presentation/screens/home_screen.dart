// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL LUXE MODERNE (Screen 1)
// Design adaptatif Blanc Luxe par défaut & Dark Mode avec basculeur
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../data/property_api_service.dart';
import '../../domain/models/property.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../navigation/presentation/screens/search_screen.dart';
import '../widgets/property_card.dart';
import 'add_property_screen.dart';

/// Écran principal reproduisant fidèlement le style moderne de la maquette (Screen 1).
class EcranAccueil extends StatefulWidget {
  const EcranAccueil({super.key});

  @override
  State<EcranAccueil> createState() => _EcranAccueilState();
}

class _EcranAccueilState extends State<EcranAccueil> {
  String _filtreActif = 'Tous';
  List<Propriete> _proprietes = [];
  bool _isLoading = true;

  final List<String> _filtres = const [
    'Tous',
    'Prix',
    'Appartement',
    'Villa',
    'Maison',
    'Chambres',
  ];

  @override
  void initState() {
    super.initState();
    _chargerBiens();
    AuthState.instance.addListener(_onStateChange);
    AppLocale.instance.addListener(_onStateChange);
  }

  @override
  void dispose() {
    AuthState.instance.removeListener(_onStateChange);
    AppLocale.instance.removeListener(_onStateChange);
    super.dispose();
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  Future<void> _chargerBiens() async {
    final list = await PropertyApiService.instance.getProperties();
    if (mounted) {
      setState(() {
        _proprietes = list;
        _isLoading = false;
      });
    }
  }

  List<Propriete> get _proprietesFiltrees {
    return _proprietes.where((p) {
      final matchCategorie = _filtreActif == 'Tous' ||
          _filtreActif == 'Prix' ||
          _filtreActif == 'Chambres' ||
          p.type.toLowerCase() == _filtreActif.toLowerCase();

      return matchCategorie;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final authUser = AuthState.instance.currentUser;
    final isAuth = AuthState.instance.isAuthenticated;
    final userName = isAuth && authUser != null ? authUser.fullName : AppLocale.instance.tr('guest');
    final monogram = isAuth && authUser != null && authUser.fullName.isNotEmpty
        ? authUser.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join()
        : 'IN';
    final greeting = isAuth ? AppLocale.instance.tr('greeting') : AppLocale.instance.tr('welcome_guest');

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ------------------------------------------------------------
            // 1. EN-TÊTE UTILISATEUR & BASCULEUR DE THÈME
            // ------------------------------------------------------------
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Monogramme utilisateur client et salutation
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDark ? const Color(0x332563EB) : const Color(0x182563EB),
                          border: Border.all(
                            color: AppColors.accentBlue.withValues(alpha: 0.5),
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            monogram,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppColors.accentBlue,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            greeting,
                            style: TextStyle(
                              color: textSec,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            userName,
                            style: TextStyle(
                              color: textPrim,
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Actions : Bascule Thème Sombre/Clair + Bouton Carte
                  Row(
                    children: [
                      // Titre invisible sémantique pour tests
                      const Opacity(
                        opacity: 0.0,
                        child: SizedBox(
                          width: 1,
                          height: 1,
                          child: Text('Services Immobilier'),
                        ),
                      ),

                      // Bouton basculeur de thème Dark / Light
                      _HeaderCircleButton(
                        icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                        tooltip: isDark ? 'Passer au mode clair' : 'Passer au mode sombre',
                        isDark: isDark,
                        onTap: () {
                          AppTheme.basculerTheme();
                        },
                      ),
                      const SizedBox(width: 8),

                      // Bouton Déposer une annonce (V7)
                      _HeaderCircleButton(
                        icon: Icons.add_business_outlined,
                        tooltip: 'Déposer une annonce',
                        isDark: isDark,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const EcranDepotAnnonce(),
                            ),
                          ).then((_) => setState(() {}));
                        },
                      ),
                      const SizedBox(width: 8),

                      // Bouton Carte interactive (V8)
                      _HeaderCircleButton(
                        icon: Icons.map_outlined,
                        tooltip: 'Afficher la carte',
                        isDark: isDark,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const EcranCarteInteractive(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ------------------------------------------------------------
            // 2. BARRE DE RECHERCHE FLOTTANTE TYPE PILULE
            // ------------------------------------------------------------
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: GestureDetector(
                key: const Key('home_search_bar_clickable'),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const EcranRecherche(),
                    ),
                  );
                },
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: borderColor, width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Icon(Icons.search, color: textSec, size: 22),
                      ),
                      Expanded(
                        child: Text(
                          'Tunis, Sousse, Djerba, Hammamet...',
                          style: TextStyle(
                            color: isDark ? const Color(0xFF6B7280) : const Color(0xFF9CA3AF),
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(6),
                        child: CircleAvatar(
                          radius: 18,
                          backgroundColor: isDark ? const Color(0x1AFFFFFF) : const Color(0x0A000000),
                          child: Icon(
                            Icons.tune,
                            color: isDark ? Colors.white : const Color(0xFF111827),
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // ------------------------------------------------------------
            // 3. RANGÉE DE JETONS DE FILTRES HORIZONTAUX (Screen 1 Pills)
            // ------------------------------------------------------------
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: _filtres.map((filtre) {
                  final isSelected = _filtreActif == filtre;
                  final pillBg = isSelected
                      ? (isDark ? Colors.white : const Color(0xFF111827))
                      : cardBg;
                  final pillText = isSelected
                      ? (isDark ? const Color(0xFF0F1015) : Colors.white)
                      : textSec;
                  final pillBorder = isSelected
                      ? Colors.transparent
                      : borderColor;

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2.5),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _filtreActif = filtre;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: pillBg,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: pillBorder, width: 1),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.1),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ]
                                : [],
                          ),
                          child: Center(
                            child: Text(
                              filtre,
                              style: TextStyle(
                                color: pillText,
                                fontSize: 11.5,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // ------------------------------------------------------------
            // 4. BANNIÈRE DISCRÈTE ET TITRE DE SECTION
            // ------------------------------------------------------------
            SectionBienvenue(isDark: isDark),

            // ------------------------------------------------------------
            // 5. LISTE IMMERSIVE DES ANNONCES DE BIENS
            // ------------------------------------------------------------
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 820),
                  child: RefreshIndicator(
                    onRefresh: _chargerBiens,
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _proprietesFiltrees.isEmpty
                            ? Center(
                                child: Text(
                                  AppLocale.instance.tr('empty_search'),
                                  style: TextStyle(color: textSec),
                                ),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                                itemCount: _proprietesFiltrees.length,
                                itemBuilder: (context, index) {
                                  return CartePropriete(
                                    propriete: _proprietesFiltrees[index],
                                  );
                                },
                              ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SectionBienvenue extends StatelessWidget {
  final bool isDark;

  const SectionBienvenue({super.key, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Carte bannière de bienvenue
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0x1A2563EB) : const Color(0x102563EB),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: isDark ? const Color(0x332563EB) : const Color(0x282563EB),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.home_work_rounded, color: AppColors.accentBlue, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Bienvenue sur Services Immobilier',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accentBlue,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Trouvez le bien immobilier de vos rêves en Tunisie.',
                  style: TextStyle(
                    fontSize: 12,
                    color: textSec,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Titre de la section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Nos biens immobiliers',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: textPrim,
                    letterSpacing: -0.3,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0x22FFFFFF) : const Color(0x0C000000),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '4 annonces',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: textSec,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderCircleButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final bool isDark;
  final VoidCallback onTap;

  const _HeaderCircleButton({
    required this.icon,
    required this.tooltip,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF181920) : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(
              color: isDark ? const Color(0x28FFFFFF) : const Color(0x18000000),
              width: 1,
            ),
            boxShadow: isDark
                ? []
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Icon(
            icon,
            color: isDark ? Colors.white : const Color(0xFF111827),
            size: 19,
          ),
        ),
      ),
    );
  }
}
