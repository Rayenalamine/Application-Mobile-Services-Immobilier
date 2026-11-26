// ============================================================
// DARLINK — APPLE-LEVEL HOME DISCOVERY SCREEN (Flutter)
// Editorial typography, frosted glass search & action orbs,
// horizontal architectural showcase + vertical live Firestore feed.
// ============================================================

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/data/auth_service.dart';
import '../../../auth/domain/models/auth_state.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../navigation/presentation/screens/search_screen.dart';
import '../../../notifications/data/notification_service.dart';
import '../../../notifications/presentation/screens/notification_screen.dart';
import '../../data/property_api_service.dart';
import '../../domain/models/property.dart';
import '../screens/property_details_screen.dart';
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
    _scrollController = ScrollController()..addListener(_onScroll);
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
    if (currentOffset <= 12) {
      if (!_headerVisible) setState(() => _headerVisible = true);
    } else if (diff > 14 && currentOffset > 60) {
      if (_headerVisible) setState(() => _headerVisible = false);
    } else if (diff < -10) {
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
    return AppLocale.instance.translatePropertyType(f);
  }

  Widget _buildDiagnosticPill(BuildContext context, bool isDark) {
    final diag = AuthService.instance.getDiagnosticInfo();
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 6, 20, 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.surfaceElevatedOf(context),
              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              border: Border.all(color: AppColors.borderSubtleOf(context)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.accentGreen,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  '${diag['projectId']} • ${diag['authUid']}',
                  style: AppTypography.micro(AppColors.textSecondaryOf(context))
                      .copyWith(fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final bgColor = AppColors.backgroundOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final authUser = AuthState.instance.currentUser;
    final isAuth = AuthState.instance.isAuthenticated;
    final firstName = isAuth && authUser != null && authUser.fullName.trim().isNotEmpty
        ? authUser.fullName.trim().split(' ').first
        : '';
    final monogram = isAuth && authUser != null && authUser.fullName.isNotEmpty
        ? authUser.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'DL';
    final subtitleGreeting = isAuth && firstName.isNotEmpty ? 'Bonjour, $firstName' : 'Explorer la Tunisie';
    final filtered = _proprietesFiltrees;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Collapsible Editorial Top Bar + Frosted Orbs
            AnimatedCrossFade(
              duration: const Duration(milliseconds: 220),
              crossFadeState: _headerVisible ? CrossFadeState.showFirst : CrossFadeState.showSecond,
              secondChild: const SizedBox.shrink(),
              firstChild: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (kDebugMode) _buildDiagnosticPill(context, isDark),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryActionBgOf(context),
                          ),
                          child: Center(
                            child: Text(
                              monogram,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryActionFgOf(context),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Services Immobilier',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.micro(AppColors.accentChampagne),
                              ),
                              Text(
                                subtitleGreeting,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.cardTitle(textPrim),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        GlassOrbButton(
                          icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                          size: 38,
                          iconSize: 17,
                          tooltip: AppLocale.instance.tr('dark_mode'),
                          onTap: () => AppTheme.basculerTheme(),
                        ),
                        const SizedBox(width: 6),
                        GlassOrbButton(
                          icon: Icons.add_rounded,
                          size: 38,
                          iconSize: 18,
                          tooltip: AppLocale.instance.tr('add_title'),
                          onTap: () {
                            Navigator.of(context)
                                .push(MaterialPageRoute(builder: (_) => const EcranDepotAnnonce()))
                                .then((_) => _chargerBiens());
                          },
                        ),
                        const SizedBox(width: 6),
                        GlassOrbButton(
                          icon: Icons.notifications_none_rounded,
                          size: 38,
                          iconSize: 17,
                          tooltip: AppLocale.instance.tr('notifications_title'),
                          badgeCount: NotificationService.instance.unreadCount,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const EcranNotifications()),
                            );
                          },
                        ),
                        const SizedBox(width: 6),
                        GlassOrbButton(
                          icon: Icons.map_outlined,
                          size: 38,
                          iconSize: 17,
                          tooltip: AppLocale.instance.tr('nav_map'),
                          iconColor: AppColors.accentChampagne,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const EcranCarteInteractive()),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Main Scrollable Discovery Feed
            Expanded(
              child: RefreshIndicator(
                onRefresh: _chargerBiens,
                child: ListView(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 120),
                  children: [
                    // Editorial Hero Headline
                    Text(
                      'Bienvenue sur Services Immobilier',
                      style: AppTypography.micro(AppColors.accentChampagne),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Trouvez le bien immobilier de vos rêves en Tunisie.',
                      style: AppTypography.heroDisplay(textPrim).copyWith(fontSize: 27),
                    ),
                    const SizedBox(height: 18),

                    // Floating Liquid Glass Search Bar
                    GestureDetector(
                      key: const Key('home_search_bar_clickable'),
                      onTap: () {
                        HapticFeedback.selectionClick();
                        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EcranRecherche()));
                      },
                      child: LiquidGlassSurface(
                        borderRadius: AppSpacing.radiusPill,
                        blurSigma: 20,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        child: Row(
                          children: [
                            Icon(Icons.search_rounded, color: textSec, size: 21),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Tunis, Sousse, Sfax, Bizerte, Nabeul...',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.body(textSec).copyWith(fontSize: 13.5),
                              ),
                            ),
                            Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceElevatedOf(context),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(Icons.tune_rounded, color: textPrim, size: 17),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Category Navigation Pills
                    SizedBox(
                      height: 38,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _filtres.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 8),
                        itemBuilder: (context, idx) {
                          final filtre = _filtres[idx];
                          final isSelected = _filtreActif == filtre;
                          return GestureDetector(
                            onTap: () {
                              HapticFeedback.selectionClick();
                              setState(() => _filtreActif = filtre);
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primaryActionBgOf(context)
                                    : AppColors.surfaceOf(context),
                                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                border: Border.all(
                                  color: isSelected ? Colors.transparent : AppColors.borderOf(context),
                                  width: 0.9,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  _nomFiltre(filtre),
                                  style: TextStyle(
                                    color: isSelected
                                        ? AppColors.primaryActionFgOf(context)
                                        : textSec,
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Main Vertical Catalogue Section (visible above the fold)
                    EditorialSectionHeader(
                      title: 'Nos biens immobiliers',
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevatedOf(context),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                        ),
                        child: Text(
                          '${filtered.length} ${filtered.length <= 1 ? 'bien' : 'biens'}',
                          style: AppTypography.micro(textSec),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    if (_isLoading)
                      const _LuxuryLoadingFeed()
                    else if (filtered.isEmpty)
                      LuxuryEmptyState(
                        icon: Icons.real_estate_agent_outlined,
                        title: AppLocale.instance.tr('empty_search'),
                        message: AppLocale.instance.tr('welcome_banner_sub'),
                        actionLabel: AppLocale.instance.tr('btn_reset'),
                        onAction: () => setState(() => _filtreActif = 'Tous'),
                      )
                    else ...[
                      CartePropriete(propriete: filtered.first),
                      if (filtered.length > 1) ...[
                        const SizedBox(height: 6),
                        EditorialSectionHeader(
                          title: AppLocale.instance.tr('section_exclusive'),
                          subtitle: AppLocale.instance.tr('section_nearby'),
                          trailing: Text(
                            '${filtered.length}',
                            style: AppTypography.caption(AppColors.accentChampagne),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 192,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: filtered.take(6).length,
                            separatorBuilder: (_, _) => const SizedBox(width: 14),
                            itemBuilder: (context, idx) {
                              return _HorizontalCollectionTile(propriete: filtered[idx]);
                            },
                          ),
                        ),
                        const SizedBox(height: 22),
                        ...filtered.skip(1).map((prop) => CartePropriete(propriete: prop)),
                      ],
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HorizontalCollectionTile extends StatelessWidget {
  final Propriete propriete;

  const _HorizontalCollectionTile({required this.propriete});

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final priceDisplay = propriete.priceOnRequest || propriete.prix <= 0
        ? AppLocale.instance.tr('price_on_request')
        : AppLocale.instance.formatCurrency(propriete.prix, isRental: propriete.estLocation);

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => EcranDetails(propriete: propriete)),
        );
      },
      child: Container(
        width: 240,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF171A21) : const Color(0xFFEFECE5),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.borderOf(context), width: 0.9),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(21),
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (propriete.imageUrl.isNotEmpty)
                LuxuryNetworkImage(
                  imageUrl: propriete.imageUrl,
                  fit: BoxFit.cover,
                  memCacheWidth: 600,
                  fallbackBuilder: (_) => const Center(
                    child: Icon(Icons.apartment_rounded, size: 32, color: AppColors.accentChampagne),
                  ),
                )
              else
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 72),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.apartment_rounded, size: 30, color: AppColors.accentChampagne),
                        const SizedBox(height: 6),
                        Text(
                          propriete.governorate,
                          style: AppTypography.micro(AppColors.accentChampagne),
                        ),
                      ],
                    ),
                  ),
                ),
              Positioned(
                left: 10,
                right: 10,
                bottom: 10,
                child: Container(
                  padding: const EdgeInsets.all(11),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xD914161B) : const Color(0xEBFFFFFF),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.14)
                          : Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        priceDisplay,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${AppLocale.instance.translatePropertyType(propriete.type)} • ${propriete.governorate}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.caption(textSec),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LuxuryLoadingFeed extends StatelessWidget {
  const _LuxuryLoadingFeed();

  @override
  Widget build(BuildContext context) {
    final fill = AppColors.surfaceElevatedOf(context);
    return Column(
      children: List.generate(
        2,
        (_) => Container(
          height: 320,
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: fill,
            borderRadius: BorderRadius.circular(AppSpacing.radiusLG),
          ),
          child: const Center(
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      ),
    );
  }
}
