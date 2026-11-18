// ============================================================
// DARLINK — CARTE DE BIEN IMMOBILIER LUXE GLASSMORPHISM (V2)
// Design ultra-moderne avec superposition translucide (Screen 1)
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/property.dart';
import '../screens/property_details_screen.dart';

/// Carte immobilière avec arrière-plan immersif et dock flottant translucide.
class CartePropriete extends StatefulWidget {
  final Propriete propriete;

  const CartePropriete({super.key, required this.propriete});

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

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      height: 390,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: const [
          BoxShadow(
            color: Color(0x55000000),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ------------------------------------------------------------
            // 1. IMAGE D'ARRIÈRE-PLAN HAUTE DÉFINITION
            // ------------------------------------------------------------
            Image.network(
              p.imageUrl,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Container(
                  color: const Color(0xFF181920),
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.accentBlue,
                      strokeWidth: 2,
                    ),
                  ),
                );
              },
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: const Color(0xFF1E1F26),
                  child: const Center(
                    child: Icon(Icons.broken_image, size: 48, color: Colors.white38),
                  ),
                );
              },
            ),

            // Dégradé sombre supérieur pour faire ressortir les badges
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0x99000000), Colors.transparent],
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
                      color: const Color(0x8A181920),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x33FFFFFF), width: 1),
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
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
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
                        color: const Color(0x8A181920),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0x33FFFFFF), width: 1),
                      ),
                      child: Icon(
                        _isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: _isFavorite ? const Color(0xFFEF4444) : Colors.white,
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
                      color: const Color(0xCC13141C),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: const Color(0x28FFFFFF), width: 1),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x40000000),
                          blurRadius: 16,
                          offset: Offset(0, 4),
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
                                    style: const TextStyle(
                                      color: Colors.white,
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
                                    style: const TextStyle(
                                      color: Color(0xFFE0E0E6),
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
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF0F1015),
                                elevation: 0,
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
                                  Icon(Icons.arrow_forward, size: 16),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),

                        // Localisation avec icône
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              size: 15,
                              color: Color(0xFF9CA3AF),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                p.localisation,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Color(0xFF9CA3AF),
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
                            ),
                            const SizedBox(width: 8),
                            _PillCarac(
                              icone: Icons.bathtub_outlined,
                              valeur: '${p.nombreSallesDeBain} Ba',
                            ),
                            const SizedBox(width: 8),
                            _PillCarac(
                              icone: Icons.crop_square,
                              valeur: '${p.surfaceM2} m²',
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
    );
  }
}

/// Pastille de caractéristique individuelle translucide
class _PillCarac extends StatelessWidget {
  final IconData icone;
  final String valeur;

  const _PillCarac({required this.icone, required this.valeur});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0x1AFFFFFF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0x1AFFFFFF), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icone, size: 15, color: const Color(0xFFCAC4D0)),
          const SizedBox(width: 5),
          Text(
            valeur,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
