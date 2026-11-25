// ============================================================
// DARLINK — CARTE DE BIEN IMMOBILIER LUXE GLASSMORPHISM (Flutter)
// Design adaptatif Dark & Light, attribution source & repli sobre sans image inventée.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
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
    FavoritesApiService.instance.toggleFavorite(widget.propriete.id);
    setState(() => _isFavorite = !_isFavorite);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isFavorite
              ? AppLocale.instance.tr('added_to_favorites')
              : AppLocale.instance.tr('removed_from_favorites'),
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: _isFavorite ? AppColors.accentBlue : AppColors.accentRed,
      ),
    );
  }

  void _ouvrirDetails(BuildContext context) {
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final glassDockBg = isDark ? const Color(0xCC13141C) : const Color(0xF2FFFFFF);
    final dockBorder = isDark ? const Color(0x28FFFFFF) : const Color(0x18000000);
    final topPillBg = isDark ? const Color(0x8A181920) : const Color(0xE6FFFFFF);
    final topPillBorder = isDark ? const Color(0x33FFFFFF) : const Color(0x18000000);

    final priceDisplay = p.priceOnRequest || p.prix <= 0
        ? 'Prix sur demande'
        : AppLocale.instance.formatCurrency(p.prix, isRental: p.estLocation);

    return Container(
      margin: const EdgeInsets.only(bottom: 22),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(25),
        child: SizedBox(
          height: 380,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (p.imageUrl.isNotEmpty)
                Image.network(
                  p.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => _buildPlaceholder(isDark, textSec, p),
                )
              else
                _buildPlaceholder(isDark, textSec, p),

              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 84,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withValues(alpha: isDark ? 0.55 : 0.18),
                        Colors.transparent,
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              Positioned(
                top: 16,
                left: 16,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: topPillBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: topPillBorder, width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.accentGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            p.isInstitutionalReference
                                ? 'Référence programme'
                                : (p.estLocation
                                    ? AppLocale.instance.tr('for_rent')
                                    : AppLocale.instance.tr('for_sale')),
                            style: TextStyle(
                              color: isDark ? Colors.white : const Color(0xFF111827),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              Positioned(
                top: 16,
                right: 16,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: GestureDetector(
                      onTap: _basculerFavori,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: topPillBg,
                          shape: BoxShape.circle,
                          border: Border.all(color: topPillBorder, width: 1),
                        ),
                        child: Icon(
                          _isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: _isFavorite
                              ? AppColors.accentRed
                              : (isDark ? Colors.white : const Color(0xFF111827)),
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              Positioned(
                bottom: 12,
                left: 12,
                right: 12,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: glassDockBg,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: dockBorder, width: 1),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      priceDisplay,
                                      style: TextStyle(
                                        color: textPrim,
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.4,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      p.titre,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: isDark ? const Color(0xFFE0E0E6) : const Color(0xFF374151),
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton(
                                onPressed: () => _ouvrirDetails(context),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isDark ? Colors.white : AppColors.accentBlue,
                                  foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      AppLocale.instance.tr('btn_details'),
                                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.arrow_forward_rounded, size: 16),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.location_on_rounded, size: 15, color: textSec),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  p.localisation,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              _PillCarac(icone: Icons.bed_outlined, valeur: '${p.nombreChambres} Ch', isDark: isDark),
                              const SizedBox(width: 8),
                              _PillCarac(icone: Icons.bathtub_outlined, valeur: '${p.nombreSallesDeBain} Sdb', isDark: isDark),
                              const SizedBox(width: 8),
                              _PillCarac(icone: Icons.crop_square_rounded, valeur: '${p.surfaceM2} m²', isDark: isDark),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder(bool isDark, Color textSec, Propriete p) {
    return Container(
      color: isDark ? const Color(0xFF181B24) : const Color(0xFFEEF2F7),
      padding: const EdgeInsets.only(bottom: 130, left: 24, right: 24),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.apartment_rounded,
              size: 48,
              color: AppColors.accentBlue.withValues(alpha: 0.75),
            ),
            const SizedBox(height: 8),
            Text(
              p.sourceName != null && p.sourceName!.isNotEmpty
                  ? 'Référence officielle • ${p.sourceName}'
                  : AppLocale.instance.tr('no_photo'),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: textSec,
                fontWeight: FontWeight.w600,
                fontSize: 12.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PillCarac extends StatelessWidget {
  final IconData icone;
  final String valeur;
  final bool isDark;

  const _PillCarac({
    required this.icone,
    required this.valeur,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? const Color(0x1AFFFFFF) : const Color(0x0C000000),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0x22FFFFFF) : const Color(0x10000000),
          width: 0.8,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icone, size: 14, color: isDark ? const Color(0xFFCAC4D0) : const Color(0xFF4B5563)),
          const SizedBox(width: 4),
          Text(
            valeur,
            style: TextStyle(
              color: isDark ? const Color(0xFFCAC4D0) : const Color(0xFF4B5563),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
