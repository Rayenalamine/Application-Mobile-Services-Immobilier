// ============================================================
// DARLINK — APPLE LIQUID GLASS FAVORITES SCREEN (Flutter)
// Editorial header, frosted refresh orb, live Firestore sync,
// Apple-inspired empty state and architectural feed.
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../favorites/data/favorites_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/widgets/property_card.dart';

class EcranFavoris extends StatefulWidget {
  const EcranFavoris({super.key});

  @override
  State<EcranFavoris> createState() => _EcranFavorisState();
}

class _EcranFavorisState extends State<EcranFavoris> {
  final FavoritesApiService _favService = FavoritesApiService.instance;
  List<Propriete> _favoris = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _chargerFavoris();
    _favService.addListener(_onFavoritesChanged);
  }

  @override
  void dispose() {
    _favService.removeListener(_onFavoritesChanged);
    super.dispose();
  }

  void _onFavoritesChanged() {
    if (mounted) {
      setState(() {
        _favoris = _favService.favoriteProperties;
      });
    }
  }

  Future<void> _chargerFavoris() async {
    setState(() => _isLoading = true);
    final liste = await _favService.getFavorites();
    if (mounted) {
      setState(() {
        _favoris = liste;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = AppColors.backgroundOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Editorial Top Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('COLLECTION', style: AppTypography.micro(AppColors.accentChampagne)),
                      const SizedBox(height: 2),
                      Text(
                        AppLocale.instance.tr('favorites_title'),
                        style: AppTypography.pageTitle(textPrim),
                      ),
                    ],
                  ),
                  GlassOrbButton(
                    icon: Icons.refresh_rounded,
                    tooltip: 'Actualiser',
                    onTap: _chargerFavoris,
                  ),
                ],
              ),
            ),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : _favoris.isEmpty
                      ? _buildEmptyState(context, textPrim, textSec)
                      : RefreshIndicator(
                          onRefresh: _chargerFavoris,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
                            itemCount: _favoris.length,
                            itemBuilder: (context, index) {
                              return CartePropriete(propriete: _favoris[index]);
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, Color textPrim, Color textSec) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(28, 24, 28, 120),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            LiquidGlassSurface(
              borderRadius: 46,
              blurSigma: 20,
              child: const SizedBox(
                width: 92,
                height: 92,
                child: Icon(
                  Icons.favorite_rounded,
                  size: 40,
                  color: AppColors.accentRed,
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              AppLocale.instance.tr('empty_favorites_title'),
              style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 22),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 300),
              child: Text(
                AppLocale.instance.tr('empty_favorites_hint'),
                style: AppTypography.body(textSec),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
            LiquidGlassSurface(
              borderRadius: AppSpacing.radiusPill,
              blurSigma: 16,
              elevatedShadow: false,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.bookmark_added_outlined,
                    size: 16,
                    color: AppColors.accentChampagne,
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      AppLocale.instance.tr('empty_favorites_sub'),
                      style: AppTypography.caption(textSec),
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
