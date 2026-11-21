// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES MULTICRITÈRES (V5-T02)
// Recherche textuelle réelle, filtres dynamiques, budget & thèmes
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/widgets/property_card.dart';

/// Écran de recherche avancée interconnecté avec le backend PostgreSQL Spring Boot.
class EcranRecherche extends StatefulWidget {
  final String? initialSearch;
  const EcranRecherche({super.key, this.initialSearch});

  @override
  State<EcranRecherche> createState() => _EcranRechercheState();
}

class _EcranRechercheState extends State<EcranRecherche> {
  final TextEditingController _searchController = TextEditingController();
  String _segmentActif = 'Tous';
  String _typeBienSelectionne = 'Tous';
  String _chambreSelectionnee = 'Tous';
  String _villeSelectionnee = '';
  RangeValues _priceRange = const RangeValues(0, 1500000);
  bool _isLoading = false;
  List<Propriete> _proprietesTrouvees = [];

  final List<String> _segments = const ['Tous', 'Acheter', 'Louer'];
  final List<String> _typesBien = const ['Tous', 'Appartement', 'Villa', 'Maison', 'Penthouse'];
  final List<String> _chambres = const ['Tous', 'Studio', '1+', '2+', '3+', '4+'];
  final List<String> _villes = const [
    'Tunis',
    'La Marsa',
    'Sousse',
    'Hammamet',
    'Djerba',
    'Monastir',
    'Sfax',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialSearch != null && widget.initialSearch!.isNotEmpty) {
      _searchController.text = widget.initialSearch!;
    }
    _appliquerRechercheBackend();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _appliquerRechercheBackend() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    int? minCh;
    if (_chambreSelectionnee == '1+') minCh = 1;
    if (_chambreSelectionnee == '2+') minCh = 2;
    if (_chambreSelectionnee == '3+') minCh = 3;
    if (_chambreSelectionnee == '4+') minCh = 4;

    final query = _searchController.text.trim();
    final results = await PropertyApiService.instance.getProperties(
      search: query.isNotEmpty ? query : null,
      city: _villeSelectionnee.isNotEmpty ? _villeSelectionnee : null,
      type: _typeBienSelectionne != 'Tous' ? _typeBienSelectionne : null,
      isRental: _segmentActif == 'Louer' ? true : (_segmentActif == 'Acheter' ? false : null),
      minBedrooms: minCh,
      minPrice: _priceRange.start > 0 ? _priceRange.start : null,
      maxPrice: _priceRange.end < 1500000 ? _priceRange.end : null,
    );

    if (mounted) {
      setState(() {
        _proprietesTrouvees = results;
        _isLoading = false;
      });
    }
  }

  void _reinitialiserFiltres() {
    _searchController.clear();
    setState(() {
      _segmentActif = 'Tous';
      _typeBienSelectionne = 'Tous';
      _villeSelectionnee = '';
      _chambreSelectionnee = 'Tous';
      _priceRange = const RangeValues(0, 1500000);
    });
    _appliquerRechercheBackend();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final segmentedBg = isDark ? const Color(0xFF181920) : const Color(0xFFE9EBF0);
    final bottomDockBg = isDark ? const Color(0xF00F1015) : const Color(0xF2FFFFFF);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // 1. BARRE SUPÉRIEURE FLOTTANTE
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _GlassCircleBtn(
                        icon: Icons.arrow_back_ios_new_rounded,
                        isDark: isDark,
                        onTap: () {
                          if (Navigator.of(context).canPop()) {
                            Navigator.of(context).pop();
                          }
                        },
                      ),
                      Text(
                        'Recherche de biens',
                        style: TextStyle(
                          color: textPrim,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Row(
                        children: [
                          _GlassCircleBtn(
                            icon: Icons.map_outlined,
                            isDark: isDark,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const EcranCarteInteractive(),
                                ),
                              );
                            },
                          ),
                          const SizedBox(width: 8),
                          _GlassCircleBtn(
                            icon: Icons.restart_alt_rounded,
                            isDark: isDark,
                            onTap: _reinitialiserFiltres,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // CORPS DE LA RECHERCHE & DES FILTRES
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 2. CHAMP DE RECHERCHE TEXTUELLE RÉEL (V5)
                        Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: borderColor),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: TextField(
                            key: const Key('search_text_input'),
                            controller: _searchController,
                            style: TextStyle(color: textPrim, fontSize: 14),
                            decoration: InputDecoration(
                              hintText: 'Rechercher par titre, quartier, mot-clé...',
                              hintStyle: TextStyle(color: textSec, fontSize: 14),
                              prefixIcon: const Icon(Icons.search, color: AppColors.accentBlue, size: 22),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: Icon(Icons.clear, size: 18, color: textSec),
                                      onPressed: () {
                                        _searchController.clear();
                                        _appliquerRechercheBackend();
                                      },
                                    )
                                  : null,
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            ),
                            onSubmitted: (_) => _appliquerRechercheBackend(),
                            onChanged: (_) {
                              setState(() {});
                              _appliquerRechercheBackend();
                            },
                          ),
                        ),

                        // 3. CONTRÔLEUR SEGMENTÉ : TOUS / ACHETER / LOUER
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: segmentedBg,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: borderColor),
                          ),
                          child: Row(
                            children: _segments.map((segment) {
                              final isSelected = _segmentActif == segment;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _segmentActif = segment;
                                    });
                                    _appliquerRechercheBackend();
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: isSelected ? AppColors.accentBlue : Colors.transparent,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: AppColors.accentBlue.withValues(alpha: 0.3),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : [],
                                    ),
                                    child: Center(
                                      child: Text(
                                        segment,
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : textSec,
                                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),

                        const SizedBox(height: 22),

                        // 4. SÉLECTION DU TYPE DE BIEN
                        Text(
                          'Type de bien',
                          style: TextStyle(
                            color: textPrim,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _typesBien.map((type) {
                            final isSelected = _typeBienSelectionne == type;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _typeBienSelectionne = type;
                                });
                                _appliquerRechercheBackend();
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.accentBlue : cardBg,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? AppColors.accentBlue : borderColor,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: AppColors.accentBlue.withValues(alpha: 0.3),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ]
                                      : [],
                                ),
                                child: Text(
                                  type,
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : textSec,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 22),

                        // 5. BUDGET ESTIMÉ (INTERVALLE DE PRIX DT)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Fourchette de prix (DT)',
                              style: TextStyle(
                                color: textPrim,
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              '${_priceRange.start.toInt()} - ${_priceRange.end.toInt()} DT',
                              style: const TextStyle(
                                color: AppColors.accentBlue,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        RangeSlider(
                          values: _priceRange,
                          min: 0,
                          max: 1500000,
                          divisions: 30,
                          activeColor: AppColors.accentBlue,
                          inactiveColor: isDark ? const Color(0xFF2C2D35) : const Color(0xFFE2E8F0),
                          labels: RangeLabels(
                            '${_priceRange.start.toInt()} DT',
                            '${_priceRange.end.toInt()} DT',
                          ),
                          onChanged: (values) {
                            setState(() {
                              _priceRange = values;
                            });
                          },
                          onChangeEnd: (_) => _appliquerRechercheBackend(),
                        ),

                        const SizedBox(height: 18),

                        // 6. NOMBRE DE CHAMBRES
                        Text(
                          'Chambres',
                          style: TextStyle(
                            color: textPrim,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _chambres.map((chambre) {
                            final isSelected = _chambreSelectionnee == chambre;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _chambreSelectionnee = chambre;
                                });
                                _appliquerRechercheBackend();
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.accentBlue : cardBg,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? AppColors.accentBlue : borderColor,
                                  ),
                                ),
                                child: Text(
                                  chambre,
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : textSec,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 22),

                        // 7. VILLES POPULAIRES EN TUNISIE
                        Text(
                          'Villes populaires en Tunisie',
                          style: TextStyle(
                            color: textPrim,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _villes.map((ville) {
                            final isSelected = _villeSelectionnee == ville;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _villeSelectionnee = isSelected ? '' : ville;
                                });
                                _appliquerRechercheBackend();
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.accentBlue
                                      : cardBg,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: isSelected ? AppColors.accentBlue : borderColor,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.location_on_rounded,
                                      size: 14,
                                      color: isSelected ? Colors.white : textSec,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      ville,
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : textSec,
                                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                        fontSize: 12.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 26),

                        // 8. SECTION RÉSULTATS DYNAMIQUES EN TEMPS RÉEL (V5-V8)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Résultats correspondants (${_proprietesTrouvees.length})',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: textPrim,
                              ),
                            ),
                            if (_villeSelectionnee.isNotEmpty ||
                                _typeBienSelectionne != 'Tous' ||
                                _chambreSelectionnee != 'Tous' ||
                                _segmentActif != 'Tous' ||
                                _searchController.text.isNotEmpty ||
                                _priceRange.start > 0 ||
                                _priceRange.end < 1500000)
                              GestureDetector(
                                onTap: _reinitialiserFiltres,
                                child: const Text(
                                  'Réinitialiser',
                                  style: TextStyle(
                                    color: AppColors.accentBlue,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        if (_isLoading)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 40),
                              child: CircularProgressIndicator(),
                            ),
                          )
                        else if (_proprietesTrouvees.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: borderColor),
                            ),
                            child: Column(
                              children: [
                                const Icon(Icons.search_off_rounded, size: 44, color: AppColors.accentBlue),
                                const SizedBox(height: 12),
                                Text(
                                  'Aucun bien ne correspond à ces critères',
                                  style: TextStyle(color: textPrim, fontWeight: FontWeight.w700, fontSize: 15),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Essayez d\'élargir vos filtres ou de réinitialiser la recherche.',
                                  style: TextStyle(color: textSec, fontSize: 13),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: _reinitialiserFiltres,
                                  icon: const Icon(Icons.refresh_rounded, size: 16),
                                  label: const Text('Tout réinitialiser'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.accentBlue,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          ..._proprietesTrouvees.map((prop) => Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: CartePropriete(
                                  propriete: prop,
                                ),
                              )),

                        const SizedBox(height: 90),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // 9. DOCK FLOTTANT EN BAS
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: bottomDockBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 4,
                      child: OutlinedButton(
                        onPressed: _reinitialiserFiltres,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: textPrim,
                          side: BorderSide(color: borderColor),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          'Réinitialiser',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 5,
                      child: ElevatedButton(
                        onPressed: () async {
                          await _appliquerRechercheBackend();
                          if (!mounted || !context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${_proprietesTrouvees.length} bien(s) trouvé(s) depuis PostgreSQL !'),
                              duration: const Duration(seconds: 2),
                              backgroundColor: AppColors.accentBlue,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Appliquer les filtres',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
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

class _GlassCircleBtn extends StatelessWidget {
  final IconData icon;
  final bool isDark;
  final VoidCallback onTap;

  const _GlassCircleBtn({
    required this.icon,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF181920) : Colors.white,
          shape: BoxShape.circle,
          border: Border.all(
            color: isDark ? const Color(0x28FFFFFF) : const Color(0x18000000),
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
          size: 18,
        ),
      ),
    );
  }
}
