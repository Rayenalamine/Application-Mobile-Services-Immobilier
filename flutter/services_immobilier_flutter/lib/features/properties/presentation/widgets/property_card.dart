// ============================================================
// DARLINK — ARCHITECTURAL LIQUID GLASS PROPERTY CARD (Flutter)
// Editorial 410px tall visual showcase, frosted glass bottom sheet,
// architectural blueprint fallback when photo rights unavailable,
// tactile scale & heart animations.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/localization/app_locale.dart';
import '../../../favorites/data/favorites_api_service.dart';
import '../../domain/models/property.dart';
import '../screens/property_details_screen.dart';

class CartePropriete extends StatefulWidget {
  final Propriete propriete;

  const CartePropriete({
    super.key,
    required this.propriete,
  });

  @override
  State<CartePropriete> createState() => _CarteProprieteState();
}

class _CarteProprieteState extends State<CartePropriete> {
  late bool _isFavorite;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _isFavorite = FavoritesApiService.instance.isFavorite(widget.propriete.id);
    FavoritesApiService.instance.addListener(_onFavoritesUpdated);
  }

  @override
  void dispose() {
    FavoritesApiService.instance.removeListener(_onFavoritesUpdated);
    super.dispose();
  }

  void _onFavoritesUpdated() {
    if (mounted) {
      final fav = FavoritesApiService.instance.isFavorite(widget.propriete.id);
      if (fav != _isFavorite) {
        setState(() => _isFavorite = fav);
      }
    }
  }

  void _basculerFavori() {
    HapticFeedback.lightImpact();
    FavoritesApiService.instance.toggleFavorite(widget.propriete.id);
    setState(() => _isFavorite = !_isFavorite);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        content: Text(
          _isFavorite
              ? AppLocale.instance.tr('added_to_favorites')
              : AppLocale.instance.tr('removed_from_favorites'),
        ),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _ouvrirDetails(BuildContext context) {
    HapticFeedback.selectionClick();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EcranDetails(propriete: widget.propriete),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.propriete;
    final isDark = AppColors.isDark(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final primaryBg = AppColors.primaryActionBgOf(context);
    final primaryFg = AppColors.primaryActionFgOf(context);

    final priceDisplay = p.priceOnRequest || p.prix <= 0
        ? AppLocale.instance.tr('price_on_request')
        : AppLocale.instance.formatCurrency(p.prix, isRental: p.estLocation);

    final statusLabel = p.isInstitutionalReference
        ? AppLocale.instance.tr('institutional_ref')
        : (p.estLocation
            ? AppLocale.instance.tr('for_rent')
            : AppLocale.instance.tr('for_sale'));

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapCancel: () => setState(() => _isPressed = false),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTap: () => _ouvrirDetails(context),
      child: AnimatedScale(
        scale: _isPressed ? 0.985 : 1.0,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOutCubic,
        child: Container(
          margin: const EdgeInsets.only(bottom: 22),
          decoration: BoxDecoration(
            color: AppColors.surfaceOf(context),
            borderRadius: BorderRadius.circular(AppSpacing.radiusLG),
            border: Border.all(color: borderColor, width: 0.9),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.36 : 0.06),
                blurRadius: 24,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLG - 1),
            child: SizedBox(
              height: 396,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (p.imageUrl.isNotEmpty)
                    LuxuryNetworkImage(
                      imageUrl: p.imageUrl,
                      fit: BoxFit.cover,
                      memCacheWidth: 900,
                      fallbackBuilder: (_) => _ArchitecturalBlueprintFallback(propriete: p),
                    )
                  else
                    _ArchitecturalBlueprintFallback(propriete: p),

                  // Subtle cinematic gradient scrim for contrast without obscuring photography
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: isDark ? 0.35 : 0.14),
                            Colors.transparent,
                            Colors.black.withValues(alpha: isDark ? 0.55 : 0.28),
                          ],
                          stops: const [0.0, 0.42, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Top Row: Liquid Glass Status Pill + Tactile Heart Orb
                  Positioned(
                    top: 14,
                    left: 14,
                    right: 14,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        LiquidGlassSurface(
                          borderRadius: AppSpacing.radiusPill,
                          blurSigma: 16,
                          elevatedShadow: false,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: p.isInstitutionalReference
                                      ? AppColors.accentChampagne
                                      : AppColors.accentGreen,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 7),
                              Text(
                                statusLabel,
                                style: TextStyle(
                                  color: textPrim,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: -0.1,
                                ),
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: _basculerFavori,
                          child: LiquidGlassSurface(
                            borderRadius: 21,
                            blurSigma: 16,
                            elevatedShadow: false,
                            child: SizedBox(
                              width: 40,
                              height: 40,
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 200),
                                child: Icon(
                                  _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                  key: ValueKey(_isFavorite),
                                  color: _isFavorite ? AppColors.accentRed : textPrim,
                                  size: 19,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Bottom Frosted Liquid Glass Info Sheet (lightweight translucent surface for 60fps scroll)
                  Positioned(
                    left: 12,
                    right: 12,
                    bottom: 12,
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xD914161B)
                            : const Color(0xEBFFFFFF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.16)
                              : Colors.white.withValues(alpha: 0.9),
                          width: 0.9,
                        ),
                      ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          priceDisplay,
                                          style: AppTypography.priceDisplay(textPrim),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          p.titre,
                                          style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  ElevatedButton(
                                    onPressed: () => _ouvrirDetails(context),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: primaryBg,
                                      foregroundColor: primaryFg,
                                      elevation: 0,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                      minimumSize: const Size(0, 38),
                                      shape: const StadiumBorder(),
                                    ),
                                    child: Text(
                                      AppLocale.instance.tr('btn_details'),
                                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.location_on_outlined, size: 14, color: AppColors.accentChampagne),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      p.localisation,
                                      style: AppTypography.caption(textSec),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  _SpecPill(icon: Icons.bed_outlined, label: '${p.nombreChambres} ${AppLocale.instance.tr('bedrooms_short')}'),
                                  const SizedBox(width: 6),
                                  _SpecPill(icon: Icons.bathtub_outlined, label: '${p.nombreSallesDeBain} ${AppLocale.instance.tr('bathrooms_short')}'),
                                  const SizedBox(width: 6),
                                  _SpecPill(icon: Icons.square_foot_rounded, label: '${p.surfaceM2} ${AppLocale.instance.tr('area_unit')}'),
                                  if (p.sourceName != null && p.sourceName!.isNotEmpty) ...[
                                    const Spacer(),
                                    Text(
                                      p.sourceName!.split(' ').first,
                                      style: AppTypography.micro(AppColors.accentChampagne),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SpecPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SpecPill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final textSec = AppColors.textSecondaryOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.045),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: textSec),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: textSec),
          ),
        ],
      ),
    );
  }
}

class _ArchitecturalBlueprintFallback extends StatelessWidget {
  final Propriete propriete;

  const _ArchitecturalBlueprintFallback({required this.propriete});

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final bgTop = isDark ? const Color(0xFF171A21) : const Color(0xFFF3F1EC);
    final bgBottom = isDark ? const Color(0xFF0E1015) : const Color(0xFFE7E2D8);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [bgTop, bgBottom],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _ArchitecturalGridPainter(
                lineColor: isDark
                    ? Colors.white.withValues(alpha: 0.035)
                    : Colors.black.withValues(alpha: 0.04),
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 108, left: 28, right: 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.06)
                          : Colors.white.withValues(alpha: 0.72),
                      border: Border.all(
                        color: AppColors.accentChampagne.withValues(alpha: 0.45),
                      ),
                    ),
                    child: const Icon(
                      Icons.apartment_rounded,
                      size: 28,
                      color: AppColors.accentChampagne,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    propriete.sourceName != null && propriete.sourceName!.isNotEmpty
                        ? propriete.sourceName!.toUpperCase()
                        : propriete.type.toUpperCase(),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.micro(AppColors.accentChampagne),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    propriete.governorate,
                    style: AppTypography.cardTitle(textPrim),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    propriete.isInstitutionalReference
                        ? AppLocale.instance.tr('official_portal_visuals')
                        : AppLocale.instance.tr('no_photo'),
                    textAlign: TextAlign.center,
                    style: AppTypography.caption(textSec).copyWith(fontSize: 11.5),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ArchitecturalGridPainter extends CustomPainter {
  final Color lineColor;
  const _ArchitecturalGridPainter({required this.lineColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 0.8;
    const step = 28.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _ArchitecturalGridPainter oldDelegate) =>
      oldDelegate.lineColor != lineColor;
}
