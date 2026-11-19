// ============================================================
// DARLINK — ÉCRAN DE CARTOGRAPHIE INTERACTIVE & GPS (Flutter V8)
// Visualisation des biens géolocalisés en Tunisie avec pins interactifs
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/presentation/screens/property_details_screen.dart';

class EcranCarteInteractive extends StatefulWidget {
  const EcranCarteInteractive({super.key});

  @override
  State<EcranCarteInteractive> createState() => _EcranCarteInteractiveState();
}

class _EcranCarteInteractiveState extends State<EcranCarteInteractive> {
  List<Propriete> _proprietes = [];
  Propriete? _proprieteSelectionnee;
  String _villeFiltre = 'Toutes';
  bool _isLoading = true;

  final List<String> _villes = const ['Toutes', 'Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir'];

  @override
  void initState() {
    super.initState();
    _chargerBiens();
  }

  Future<void> _chargerBiens() async {
    final list = await PropertyApiService.instance.getMapProperties();
    if (mounted) {
      setState(() {
        _proprietes = list;
        if (list.isNotEmpty) {
          _proprieteSelectionnee = list.first;
        }
        _isLoading = false;
      });
    }
  }

  // Coordonnées relatives sur la carte de Tunisie
  Offset _calculerOffset(String ville, Size size) {
    final v = ville.toLowerCase();
    if (v.contains('tunis')) return Offset(size.width * 0.48, size.height * 0.22);
    if (v.contains('hammamet')) return Offset(size.width * 0.58, size.height * 0.32);
    if (v.contains('sousse')) return Offset(size.width * 0.54, size.height * 0.44);
    if (v.contains('monastir')) return Offset(size.width * 0.62, size.height * 0.48);
    if (v.contains('djerba')) return Offset(size.width * 0.68, size.height * 0.78);
    return Offset(size.width * 0.5, size.height * 0.5);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);

    final biensFiltres = _proprietes.where((p) {
      if (_villeFiltre == 'Toutes') return true;
      return p.localisation.toLowerCase().contains(_villeFiltre.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            // 1. CARTE STYLISÉE EN ARRIÈRE-PLAN
            LayoutBuilder(
              builder: (context, constraints) {
                final size = Size(constraints.maxWidth, constraints.maxHeight);
                return Container(
                  width: double.infinity,
                  height: double.infinity,
                  color: isDark ? const Color(0xFF0B0D13) : const Color(0xFFE5E9F0),
                  child: Stack(
                    children: [
                      // Quadrillage cartographique
                      CustomPaint(
                        size: size,
                        painter: _MapGridPainter(isDark: isDark),
                      ),

                      // Pins géolocalisés sur la carte
                      ...biensFiltres.map((prop) {
                        final offset = _calculerOffset(prop.localisation, size);
                        final isSelected = _proprieteSelectionnee?.id == prop.id;

                        return Positioned(
                          left: offset.dx - 45,
                          top: offset.dy - 35,
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _proprieteSelectionnee = prop);
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.accentBlue
                                    : (isDark ? const Color(0xFF181920) : Colors.white),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isSelected ? Colors.white : borderColor,
                                  width: isSelected ? 2 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.15),
                                    blurRadius: isSelected ? 12 : 6,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.location_on_rounded,
                                    size: 14,
                                    color: isSelected ? Colors.white : AppColors.accentBlue,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    prop.estLocation ? '${prop.prixFormate} DT/m' : '${prop.prixFormate} DT',
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : textPrim,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 11.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),

                      if (_isLoading)
                        const Center(
                          child: CircularProgressIndicator(color: AppColors.accentBlue),
                        ),
                    ],
                  ),
                );
              },
            ),

            // 2. BARRE SUPÉRIEURE FLOTTANTE
            Positioned(
              top: 14,
              left: 20,
              right: 20,
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: cardBg,
                        shape: BoxShape.circle,
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8),
                        ],
                      ),
                      child: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: textPrim),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: borderColor),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.map_rounded, color: AppColors.accentBlue, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Carte des biens en Tunisie (${biensFiltres.length})',
                            style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 3. BARRE DE FILTRES DES VILLES
            Positioned(
              top: 68,
              left: 0,
              right: 0,
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _villes.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final ville = _villes[index];
                  final isSelected = _villeFiltre == ville;

                  return GestureDetector(
                    onTap: () => setState(() => _villeFiltre = ville),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? (isDark ? Colors.white : const Color(0xFF0F1015))
                            : cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isSelected ? Colors.transparent : borderColor),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4),
                        ],
                      ),
                      child: Text(
                        ville,
                        style: TextStyle(
                          color: isSelected
                              ? (isDark ? const Color(0xFF0F1015) : Colors.white)
                              : textSec,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 12.5,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // 4. CARTE APERÇU DU BIEN SÉLECTIONNÉ FLOTTANTE EN BAS
            if (_proprieteSelectionnee != null)
              Positioned(
                bottom: 20,
                left: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => EcranDetails(propriete: _proprieteSelectionnee!),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.12),
                          blurRadius: 18,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            _proprieteSelectionnee!.imageUrl,
                            width: 86,
                            height: 86,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _proprieteSelectionnee!.estLocation
                                    ? '${_proprieteSelectionnee!.prixFormate} DT/mois'
                                    : '${_proprieteSelectionnee!.prixFormate} DT',
                                style: TextStyle(
                                  color: textPrim,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 17,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _proprieteSelectionnee!.titre,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: textSec,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '📍 ${_proprieteSelectionnee!.localisation}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: AppColors.accentBlue,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 11.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white : const Color(0xFF0F1015),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.arrow_forward_rounded,
                            color: isDark ? const Color(0xFF0F1015) : Colors.white,
                            size: 18,
                          ),
                        ),
                      ],
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

class _MapGridPainter extends CustomPainter {
  final bool isDark;
  _MapGridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = isDark ? const Color(0x12FFFFFF) : const Color(0x10000000)
      ..strokeWidth = 1.0;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), linePaint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

