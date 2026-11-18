// ============================================================
// DARLINK — CARTE DE BIEN IMMOBILIER LUXE GLASSMORPHISM (V2)
// Design adaptatif Dark & Light (Blanc par défaut) avec dock flottant
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/property.dart';
import '../screens/property_details_screen.dart';

/// Carte immobilière avec arrière-plan immersif et dock flottant translucide.
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
    _isFavorite = widget.propriete.isFavorite;
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
          height: 390,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // ------------------------------------------------------------
              // 1. IMAGE PRINCIPALE HAUTE DÉFINITION
              // ------------------------------------------------------------
              Image.network(
                p.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: isDark ? const Color(0xFF1E1F26) : const Color(0xFFF1F3F6),
                  child: Center(
                    child: Icon(
                      Icons.apartment_rounded,
                      size: 64,
                      color: textSec.withValues(alpha: 0.5),
                    ),
                  ),
                ),
              ),

              // Gradient supérieur pour lisibilité des badges
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 90,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withValues(alpha: isDark ? 0.6 : 0.25),
                        Colors.transparent,
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // ------------------------------------------------------------
              // 2. BADGES FLOTTANTS SUPÉRIEURS (STATUT & FAVORI)
              // ------------------------------------------------------------
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
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.accentGreen,
                                  blurRadius: 6,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            p.estLocation ? 'À Louer' : 'À Vendre',
                            style: TextStyle(
                              color: isDark ? Colors.white : const Color(0xFF111827),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Bouton favori flottant en haut à droite
              Positioned(
                top: 16,
                right: 16,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _isFavorite = !_isFavorite;
                        });
                      },
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
                          color: _isFavorite ? AppColors.accentRed : (isDark ? Colors.white : const Color(0xFF111827)),
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // ------------------------------------------------------------
              // 3. CONTENEUR GLASSMORPHISME INFÉRIEUR (PRIX, ADRESSE, SPECS)
              // ------------------------------------------------------------
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
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Titre & Prix avec Bouton Flèche CTA
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.estLocation ? '${p.prixFormate} DT/mois' : '${p.prixFormate} DT',
                                      style: TextStyle(
                                        color: textPrim,
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      p.titre,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: isDark ? const Color(0xFFE0E0E6) : const Color(0xFF374151),
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Bouton d'action interactif stylisé (ElevatedButton pour validation test)
                              ElevatedButton(
                                onPressed: () => _ouvrirDetails(context),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isDark ? Colors.white : AppColors.accentBlue,
                                  foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
                                  elevation: isDark ? 0 : 2,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Voir détails',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward_rounded, size: 16),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 8),

                          // Localisation avec icône
                          Row(
                            children: [
                              Icon(
                                Icons.location_on_rounded,
                                size: 15,
                                color: isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280),
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  p.localisation,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 12),

                          // Ligne de caractéristiques (Chambres, Salles de bain, Surface)
                          Row(
                            children: [
                              _PillCarac(
                                icone: Icons.bed_outlined,
                                valeur: '${p.nombreChambres} Bd',
                                isDark: isDark,
                              ),
                              const SizedBox(width: 8),
                              _PillCarac(
                                icone: Icons.bathtub_outlined,
                                valeur: '${p.nombreSallesDeBain} Ba',
                                isDark: isDark,
                              ),
                              const SizedBox(width: 8),
                              _PillCarac(
                                icone: Icons.crop_square_rounded,
                                valeur: '${p.surfaceM2} m²',
                                isDark: isDark,
                              ),
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
          Icon(
            icone,
            size: 14,
            color: isDark ? const Color(0xFFCAC4D0) : const Color(0xFF4B5563),
          ),
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
