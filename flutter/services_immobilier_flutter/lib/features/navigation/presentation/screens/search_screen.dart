// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES AVANCÉS (Flutter)
// 24 Gouvernorats, transaction, type, budget, surface, chambres, SDB, tri & pagination.
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/widgets/property_card.dart';

class EcranRecherche extends StatefulWidget {
  final String? initialSearch;
  const EcranRecherche({super.key, this.initialSearch});

  @override
  State<EcranRecherche> createState() => _EcranRechercheState();
}

class _EcranRechercheState extends State<EcranRecherche> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _minAreaCtrl = TextEditingController();
  final TextEditingController _maxAreaCtrl = TextEditingController();

  String _segmentActif = 'Tous';
  String _typeBienSelectionne = 'Tous';
  String _chambreSelectionnee = 'Tous';
  String _sdbSelectionnee = 'Tous';
  String _gouvernoratSelectionne = '';
  String _sortBy = 'newest';
  int _limit = 20;
  RangeValues _priceRange = const RangeValues(0, 1500000);
  bool _isLoading = false;
  List<Propriete> _proprietesTrouvees = [];

  final List<String> _segments = const ['Tous', 'Acheter', 'Louer'];
  final List<String> _typesBien = const ['Tous', 'Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'];
  final List<String> _chambres = const ['Tous', '1+', '2+', '3+', '4+'];
  final List<String> _sdbs = const ['Tous', '1+', '2+', '3+'];

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
    _minAreaCtrl.dispose();
    _maxAreaCtrl.dispose();
    super.dispose();
  }

  int? _parseChipMin(String val) {
    if (val == '1+') return 1;
    if (val == '2+') return 2;
    if (val == '3+') return 3;
    if (val == '4+') return 4;
    return null;
  }

  Future<void> _appliquerRechercheBackend() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    final results = await PropertyApiService.instance.getProperties(
      search: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
      governorate: _gouvernoratSelectionne.isNotEmpty ? _gouvernoratSelectionne : null,
      type: _typeBienSelectionne != 'Tous' ? _typeBienSelectionne : null,
      isRental: _segmentActif == 'Louer' ? true : (_segmentActif == 'Acheter' ? false : null),
      minBedrooms: _parseChipMin(_chambreSelectionnee),
      minBathrooms: _parseChipMin(_sdbSelectionnee),
      minPrice: _priceRange.start > 0 ? _priceRange.start : null,
      maxPrice: _priceRange.end < 1500000 ? _priceRange.end : null,
      minArea: int.tryParse(_minAreaCtrl.text.trim()),
      maxArea: int.tryParse(_maxAreaCtrl.text.trim()),
      sort: _sortBy,
      limit: _limit,
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
    _minAreaCtrl.clear();
    _maxAreaCtrl.clear();
    setState(() {
      _segmentActif = 'Tous';
      _typeBienSelectionne = 'Tous';
      _gouvernoratSelectionne = '';
      _chambreSelectionnee = 'Tous';
      _sdbSelectionnee = 'Tous';
      _sortBy = 'newest';
      _limit = 20;
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
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _GlassCircleBtn(
                        icon: Icons.arrow_back_ios_new_rounded,
                        isDark: isDark,
                        onTap: () {
                          if (Navigator.of(context).canPop()) Navigator.of(context).pop();
                        },
                      ),
                      Text('Recherche de biens', style: TextStyle(color: textPrim, fontSize: 17, fontWeight: FontWeight.w700)),
                      Row(
                        children: [
                          _GlassCircleBtn(
                            icon: Icons.map_outlined,
                            isDark: isDark,
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const EcranCarteInteractive()),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _GlassCircleBtn(icon: Icons.restart_alt_rounded, isDark: isDark, onTap: _reinitialiserFiltres),
                        ],
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 110),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: borderColor)),
                          child: TextField(
                            key: const Key('search_text_input'),
                            controller: _searchController,
                            style: TextStyle(color: textPrim, fontSize: 14),
                            decoration: InputDecoration(
                              hintText: 'Rechercher par ville, gouvernorat, mot-clé...',
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
                            onChanged: (_) => setState(() {}),
                          ),
                        ),

                        // SEGMENT TRANSACTION
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(color: segmentedBg, borderRadius: BorderRadius.circular(24), border: Border.all(color: borderColor)),
                          child: Row(
                            children: _segments.map((segment) {
                              final isSel = _segmentActif == segment;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() => _segmentActif = segment);
                                    _appliquerRechercheBackend();
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: isSel ? AppColors.accentBlue : Colors.transparent,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Center(
                                      child: Text(
                                        segment,
                                        style: TextStyle(color: isSel ? Colors.white : textSec, fontWeight: FontWeight.w700, fontSize: 13),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),

                        const SizedBox(height: 18),
                        Text('Gouvernorats de Tunisie (24)', style: TextStyle(color: textPrim, fontSize: 15, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 36,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: tunisiaGovernorates.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 8),
                            itemBuilder: (_, idx) {
                              final g = tunisiaGovernorates[idx];
                              final active = _gouvernoratSelectionne == g.nameFr;
                              return GestureDetector(
                                onTap: () {
                                  setState(() => _gouvernoratSelectionne = active ? '' : g.nameFr);
                                  _appliquerRechercheBackend();
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: active ? AppColors.accentBlue : cardBg,
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(color: active ? AppColors.accentBlue : borderColor),
                                  ),
                                  child: Text(g.nameFr, style: TextStyle(color: active ? Colors.white : textSec, fontSize: 12.5, fontWeight: FontWeight.w600)),
                                ),
                              );
                            },
                          ),
                        ),

                        const SizedBox(height: 18),
                        Text('Type de bien', style: TextStyle(color: textPrim, fontSize: 15, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _typesBien.map((type) {
                            final active = _typeBienSelectionne == type;
                            return GestureDetector(
                              onTap: () {
                                setState(() => _typeBienSelectionne = type);
                                _appliquerRechercheBackend();
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: active ? AppColors.accentBlue : cardBg,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: active ? AppColors.accentBlue : borderColor),
                                ),
                                child: Text(type, style: TextStyle(color: active ? Colors.white : textSec, fontSize: 12.5, fontWeight: FontWeight.w600)),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 18),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Budget (DT)', style: TextStyle(color: textPrim, fontSize: 15, fontWeight: FontWeight.w700)),
                            Text('${_priceRange.start.toInt()} - ${_priceRange.end.toInt()} DT',
                                style: const TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.w700, fontSize: 12.5)),
                          ],
                        ),
                        RangeSlider(
                          values: _priceRange,
                          min: 0,
                          max: 1500000,
                          divisions: 30,
                          activeColor: AppColors.accentBlue,
                          onChanged: (v) => setState(() => _priceRange = v),
                          onChangeEnd: (_) => _appliquerRechercheBackend(),
                        ),

                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _minAreaCtrl,
                                keyboardType: TextInputType.number,
                                style: TextStyle(color: textPrim, fontSize: 13),
                                decoration: InputDecoration(
                                  labelText: 'Surface min (m²)',
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _maxAreaCtrl,
                                keyboardType: TextInputType.number,
                                style: TextStyle(color: textPrim, fontSize: 13),
                                decoration: InputDecoration(
                                  labelText: 'Surface max (m²)',
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),
                        Text('Chambres & Salles de bain', style: TextStyle(color: textPrim, fontSize: 14, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ..._chambres.map((c) {
                              final active = _chambreSelectionnee == c;
                              return ChoiceChip(
                                label: Text(c == 'Tous' ? 'Ch: Toutes' : 'Ch: $c'),
                                selected: active,
                                onSelected: (_) {
                                  setState(() => _chambreSelectionnee = c);
                                  _appliquerRechercheBackend();
                                },
                              );
                            }),
                            ..._sdbs.map((s) {
                              final active = _sdbSelectionnee == s;
                              return ChoiceChip(
                                label: Text(s == 'Tous' ? 'SDB: Toutes' : 'SDB: $s'),
                                selected: active,
                                onSelected: (_) {
                                  setState(() => _sdbSelectionnee = s);
                                  _appliquerRechercheBackend();
                                },
                              );
                            }),
                          ],
                        ),

                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 8,
                          children: [
                            ChoiceChip(
                              label: const Text('Plus récentes'),
                              selected: _sortBy == 'newest',
                              onSelected: (_) {
                                setState(() => _sortBy = 'newest');
                                _appliquerRechercheBackend();
                              },
                            ),
                            ChoiceChip(
                              label: const Text('Prix croissant'),
                              selected: _sortBy == 'price_asc',
                              onSelected: (_) {
                                setState(() => _sortBy = 'price_asc');
                                _appliquerRechercheBackend();
                              },
                            ),
                            ChoiceChip(
                              label: const Text('Prix décroissant'),
                              selected: _sortBy == 'price_desc',
                              onSelected: (_) {
                                setState(() => _sortBy = 'price_desc');
                                _appliquerRechercheBackend();
                              },
                            ),
                          ],
                        ),

                        const SizedBox(height: 22),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Résultats (${_proprietesTrouvees.length})',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: textPrim),
                            ),
                            GestureDetector(
                              onTap: _reinitialiserFiltres,
                              child: const Text('Réinitialiser', style: TextStyle(color: AppColors.accentBlue, fontWeight: FontWeight.w700, fontSize: 13)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        if (_isLoading)
                          const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                        else if (_proprietesTrouvees.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(28),
                            decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(20), border: Border.all(color: borderColor)),
                            child: Column(
                              children: [
                                const Icon(Icons.search_off_rounded, size: 42, color: AppColors.accentBlue),
                                const SizedBox(height: 10),
                                Text('Aucun bien ne correspond à ces critères', style: TextStyle(color: textPrim, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 14),
                                ElevatedButton(onPressed: _reinitialiserFiltres, child: const Text('Tout réinitialiser')),
                              ],
                            ),
                          )
                        else ...[
                          ..._proprietesTrouvees.map((prop) => CartePropriete(propriete: prop)),
                          if (_proprietesTrouvees.length >= _limit)
                            Center(
                              child: OutlinedButton(
                                onPressed: () {
                                  setState(() => _limit += 20);
                                  _appliquerRechercheBackend();
                                },
                                child: const Text('Charger plus'),
                              ),
                            ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),

            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(color: bottomDockBg, borderRadius: BorderRadius.circular(24), border: Border.all(color: borderColor)),
                child: Row(
                  children: [
                    Expanded(
                      flex: 4,
                      child: OutlinedButton(onPressed: _reinitialiserFiltres, child: const Text('Réinitialiser')),
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
                              content: Text('${_proprietesTrouvees.length} bien(s) trouvé(s) sur Cloud Firestore !'),
                              duration: const Duration(seconds: 2),
                              backgroundColor: AppColors.accentBlue,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentBlue, foregroundColor: Colors.white),
                        child: const Text('Appliquer les filtres'),
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

  const _GlassCircleBtn({required this.icon, required this.isDark, required this.onTap});

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
          border: Border.all(color: isDark ? const Color(0x28FFFFFF) : const Color(0x18000000)),
        ),
        child: Icon(icon, color: isDark ? Colors.white : const Color(0xFF111827), size: 18),
      ),
    );
  }
}
