// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL LUXE MODERNE (Flutter)
// Chargement direct Cloud Firestore, zéro donnée fictive.
// ============================================================

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../data/property_api_service.dart';
import '../../domain/models/property.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../navigation/presentation/screens/search_screen.dart';
import '../../../notifications/data/notification_service.dart';
import '../../../notifications/presentation/screens/notification_screen.dart';
import '../widgets/property_card.dart';
import 'add_property_screen.dart';

class EcranAccueil extends StatefulWidget {
  const EcranAccueil({super.key});

  @override
  State<EcranAccueil> createState() => _EcranAccueilState();
}

class _EcranAccueilState extends State<EcranAccueil> {
  String _filtreActif = 'Tous';
  List<Propriete> _proprietes = [];
  bool _isLoading = true;
  late final ScrollController _scrollController;
  bool _headerVisible = true;
  double _lastScrollOffset = 0.0;

  final List<String> _filtres = const [
    'Tous',
    'Appartement',
    'Villa',
    'Maison',
    'Terrain',
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    _chargerBiens();
    AuthState.instance.addListener(_onStateChange);
    AppLocale.instance.addListener(_onStateChange);
    NotificationService.instance.addListener(_onStateChange);
    NotificationService.instance.refreshUnreadCount();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final currentOffset = _scrollController.offset;
    final diff = currentOffset - _lastScrollOffset;
    if (currentOffset <= 10) {
      if (!_headerVisible) setState(() => _headerVisible = true);
    } else if (diff > 12 && currentOffset > 50) {
      if (_headerVisible) setState(() => _headerVisible = false);
    } else if (diff < -8) {
      if (!_headerVisible) setState(() => _headerVisible = true);
    }
    _lastScrollOffset = currentOffset;
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    AuthState.instance.removeListener(_onStateChange);
    AppLocale.instance.removeListener(_onStateChange);
    NotificationService.instance.removeListener(_onStateChange);
    super.dispose();
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  Future<void> _chargerBiens() async {
    final list = await PropertyApiService.instance.getProperties(limit: 40);
    if (mounted) {
      setState(() {
        _proprietes = list;
        _isLoading = false;
      });
    }
  }

  List<Propriete> get _proprietesFiltrees {
    return _proprietes.where((p) {
      if (_filtreActif == 'Tous') return true;
      return p.type.toLowerCase() == _filtreActif.toLowerCase();
    }).toList();
  }

  String _nomFiltre(String f) {
    switch (f) {
      case 'Tous':
        return AppLocale.instance.tr('filter_all');
      case 'Appartement':
        return AppLocale.instance.tr('filter_apartment');
      case 'Villa':
        return AppLocale.instance.tr('filter_villa');
      case 'Maison':
        return AppLocale.instance.tr('filter_house');
      default:
        return f;
    }
  }

  Widget _buildDiagnosticBanner(BuildContext context, bool isDark) {
    final diag = AuthService.instance.getDiagnosticInfo();
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isDark ? const Color(0x331E293B) : const Color(0xCCF1F5F9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0x33FFFFFF) : const Color(0x22000000),
            width: 0.8,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${diag['projectId']} • ${diag['platform']}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                  ),
                ),
              ],
            ),
            Text(
              'UID: ${diag['authUid']}',
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w500,
                color: isDark ? const Color(0xFF64748B) : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
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

    final authUser = AuthState.instance.currentUser;
    final isAuth = AuthState.instance.isAuthenticated;
    final userName = isAuth && authUser != null ? authUser.fullName : AppLocale.instance.tr('guest');
    final monogram = isAuth && authUser != null && authUser.fullName.isNotEmpty
        ? authUser.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'DL';
    final greeting = isAuth ? AppLocale.instance.tr('greeting') : AppLocale.instance.tr('welcome_guest');

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // 1. BANNIÈRE DEV & EN-TÊTE COLLAPSIBLE AU SCROLL
            AnimatedCrossFade(
              duration: const Duration(milliseconds: 220),
              crossFadeState: _headerVisible ? CrossFadeState.showFirst : CrossFadeState.showSecond,
              secondChild: const SizedBox.shrink(),
              firstChild: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (kDebugMode) _buildDiagnosticBanner(context, isDark),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
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
                                    fontSize: 15,
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
                                  style: TextStyle(color: textSec, fontSize: 12, fontWeight: FontWeight.w500),
                                ),
                                Text(
                                  userName,
                                  style: TextStyle(color: textPrim, fontSize: 17, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            const Opacity(
                              opacity: 0.0,
                              child: SizedBox(width: 1, height: 1, child: Text('Services Immobilier')),
                            ),
                            _HeaderCircleButton(
                              icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                              tooltip: isDark ? 'Passer au mode clair' : 'Passer au mode sombre',
                              isDark: isDark,
                              onTap: () => AppTheme.basculerTheme(),
                            ),
                            const SizedBox(width: 8),
                            _HeaderCircleButton(
                              icon: Icons.add_business_outlined,
                              tooltip: 'Déposer une annonce',
                              isDark: isDark,
                              onTap: () {
                                Navigator.of(context)
                                    .push(MaterialPageRoute(builder: (_) => const EcranDepotAnnonce()))
                                    .then((_) => _chargerBiens());
                              },
                            ),
                            const SizedBox(width: 8),
                            _HeaderCircleButton(
                              icon: Icons.notifications_none_rounded,
                              tooltip: 'Centre de notifications',
                              isDark: isDark,
                              badgeCount: NotificationService.instance.unreadCount,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const EcranNotifications()),
                                );
                              },
                            ),
                            const SizedBox(width: 8),
                            _HeaderCircleButton(
                              icon: Icons.map_outlined,
                              tooltip: 'Afficher la carte',
                              isDark: isDark,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const EcranCarteInteractive()),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // 2. BARRE DE RECHERCHE
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: GestureDetector(
                key: const Key('home_search_bar_clickable'),
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EcranRecherche()));
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
                          'Tunis, Sousse, Sfax, Bizerte, Nabeul...',
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
                          child: Icon(Icons.tune, color: isDark ? Colors.white : const Color(0xFF111827), size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // 3. FILTRES HORIZONTAUX
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: _filtres.map((filtre) {
                  final isSelected = _filtreActif == filtre;
                  final pillBg = isSelected ? (isDark ? Colors.white : const Color(0xFF111827)) : cardBg;
                  final pillText = isSelected ? (isDark ? const Color(0xFF0F1015) : Colors.white) : textSec;
                  final pillBorder = isSelected ? Colors.transparent : borderColor;

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2.5),
                      child: GestureDetector(
                        onTap: () => setState(() => _filtreActif = filtre),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: pillBg,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: pillBorder, width: 1),
                          ),
                          child: Center(
                            child: Text(
                              _nomFiltre(filtre),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
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

            // 4. BANNIÈRE ET COMPTEUR RÉEL
            SectionBienvenue(isDark: isDark, count: _proprietesFiltrees.length),

            // 5. LISTE DES ANNONCES RÉELLES
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 820),
                  child: RefreshIndicator(
                    onRefresh: _chargerBiens,
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _proprietesFiltrees.isEmpty
                            ? ListView(
                                controller: _scrollController,
                                children: [
                                  const SizedBox(height: 60),
                                  Center(
                                    child: Column(
                                      children: [
                                        Icon(Icons.search_off_rounded, size: 48, color: textSec),
                                        const SizedBox(height: 12),
                                        Text(
                                          AppLocale.instance.tr('empty_search'),
                                          style: TextStyle(color: textSec, fontSize: 14),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              )
                            : ListView.builder(
                                controller: _scrollController,
                                padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                                itemCount: _proprietesFiltrees.length,
                                itemBuilder: (context, index) => CartePropriete(propriete: _proprietesFiltrees[index]),
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
  final int count;

  const SectionBienvenue({super.key, required this.isDark, this.count = 0});

  @override
  Widget build(BuildContext context) {
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
                        AppLocale.instance.tr('welcome_banner_title'),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.accentBlue),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  AppLocale.instance.tr('welcome_banner_sub'),
                  style: TextStyle(fontSize: 12, color: textSec, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  AppLocale.instance.tr('our_properties'),
                  style: TextStyle(fontSize: 18, fontWeight: '800' == '800' ? FontWeight.w800 : FontWeight.bold, color: textPrim),
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
                  '$count annonce(s)',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: textSec),
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
  final int badgeCount;

  const _HeaderCircleButton({
    required this.icon,
    required this.tooltip,
    required this.isDark,
    required this.onTap,
    this.badgeCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF181920) : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: isDark ? const Color(0x28FFFFFF) : const Color(0x18000000), width: 1),
              ),
              child: Icon(icon, color: isDark ? Colors.white : const Color(0xFF111827), size: 19),
            ),
            if (badgeCount > 0)
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Center(
                    child: Text(
                      badgeCount > 9 ? '9+' : '$badgeCount',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
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
