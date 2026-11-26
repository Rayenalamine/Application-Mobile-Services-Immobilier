// ============================================================
// DARLINK — APPLE LIQUID GLASS SEARCH & FILTERS (Flutter)
// 24 Gouvernorats, transaction segment, type, budget, area,
// rooms/bath pills, sort, and frosted floating apply dock.
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/constants/tunisia_locations.dart';
import '../../../../core/design_system/liquid_glass.dart';
import '../../../../core/localization/app_locale.dart';
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
    HapticFeedback.lightImpact();
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
    final bgColor = AppColors.backgroundOf(context);
    final cardBg = AppColors.surfaceOf(context);
    final elevatedBg = AppColors.surfaceElevatedOf(context);
    final borderColor = AppColors.borderOf(context);
    final textPrim = AppColors.textPrimaryOf(context);
    final textSec = AppColors.textSecondaryOf(context);
    final activeBg = AppColors.primaryActionBgOf(context);
    final activeFg = AppColors.primaryActionFgOf(context);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Column(
              children: [
                // Editorial Top Bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                  child: Row(
                    children: [
                      if (Navigator.of(context).canPop()) ...[
                        GlassOrbButton(
                          icon: Icons.arrow_back_ios_new_rounded,
                          size: 40,
                          iconSize: 18,
                          onTap: () => Navigator.of(context).pop(),
                        ),
                        const SizedBox(width: 12),
                      ],
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('EXPLORATION', style: AppTypography.micro(AppColors.accentChampagne)),
                            Text('Recherche de biens', style: AppTypography.pageTitle(textPrim).copyWith(fontSize: 21)),
                          ],
                        ),
                      ),
                      GlassOrbButton(
                        icon: Icons.map_outlined,
                        size: 40,
                        iconColor: AppColors.accentChampagne,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const EcranCarteInteractive()),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GlassOrbButton(
                        icon: Icons.restart_alt_rounded,
                        size: 40,
                        onTap: _reinitialiserFiltres,
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(20, 6, 20, Navigator.of(context).canPop() ? 110 : 124),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Frosted Search Bar
                        LiquidGlassSurface(
                          borderRadius: AppSpacing.radiusPill,
                          blurSigma: 18,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                          child: TextField(
                            key: const Key('search_text_input'),
                            controller: _searchController,
                            style: AppTypography.body(textPrim),
                            decoration: InputDecoration(
                              filled: false,
                              hintText: 'Rechercher par ville, gouvernorat, mot-clé...',
                              hintStyle: AppTypography.body(textSec).copyWith(fontSize: 13.5),
                              prefixIcon: Icon(Icons.search_rounded, color: textSec, size: 20),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: Icon(Icons.close_rounded, size: 18, color: textSec),
                                      onPressed: () {
                                        _searchController.clear();
                                        _appliquerRechercheBackend();
                                      },
                                    )
                                  : null,
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                            ),
                            onSubmitted: (_) => _appliquerRechercheBackend(),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Segmented Transaction Control
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: elevatedBg,
                            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                            border: Border.all(color: borderColor, width: 0.8),
                          ),
                          child: Row(
                            children: _segments.map((segment) {
                              final isSel = _segmentActif == segment;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    HapticFeedback.selectionClick();
                                    setState(() => _segmentActif = segment);
                                    _appliquerRechercheBackend();
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 180),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: isSel ? cardBg : Colors.transparent,
                                      borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                      boxShadow: isSel
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.06),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Center(
                                      child: Text(
                                        segment,
                                        style: TextStyle(
                                          color: isSel ? textPrim : textSec,
                                          fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
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
                        const SizedBox(height: 14),

                        if (!Navigator.of(context).canPop())
                          Padding(
                            padding: const EdgeInsets.only(bottom: 18),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 4,
                                  child: OutlinedButton(
                                    onPressed: _reinitialiserFiltres,
                                    style: OutlinedButton.styleFrom(
                                      shape: const StadiumBorder(),
                                      side: BorderSide(color: borderColor),
                                      minimumSize: const Size(0, 44),
                                    ),
                                    child: const Text('Réinitialiser'),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  flex: 6,
                                  child: ElevatedButton(
                                    onPressed: () async {
                                      await _appliquerRechercheBackend();
                                      if (!mounted || !context.mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          behavior: SnackBarBehavior.floating,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                          content: Text('${_proprietesTrouvees.length} bien(s) trouvé(s) sur Cloud Firestore !'),
                                          duration: const Duration(seconds: 2),
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: activeBg,
                                      foregroundColor: activeFg,
                                      elevation: 0,
                                      minimumSize: const Size(0, 44),
                                      shape: const StadiumBorder(),
                                    ),
                                    child: const Text('Appliquer les filtres', style: TextStyle(fontWeight: FontWeight.w600)),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        Text('Gouvernorats de Tunisie (24)', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 15)),
                        const SizedBox(height: 10),
                        SizedBox(
                          height: 36,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: tunisiaGovernorates.length,
                            separatorBuilder: (_, _) => const SizedBox(width: 8),
                            itemBuilder: (_, idx) {
                              final g = tunisiaGovernorates[idx];
                              final active = _gouvernoratSelectionne == g.nameFr;
                              return GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() => _gouvernoratSelectionne = active ? '' : g.nameFr);
                                  _appliquerRechercheBackend();
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: active ? activeBg : cardBg,
                                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                    border: Border.all(color: active ? Colors.transparent : borderColor, width: 0.9),
                                  ),
                                  child: Text(
                                    g.nameFr,
                                    style: TextStyle(
                                      color: active ? activeFg : textSec,
                                      fontSize: 12.5,
                                      fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 20),

                        Text('Type de bien', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 15)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _typesBien.map((type) {
                            final active = _typeBienSelectionne == type;
                            return GestureDetector(
                              onTap: () {
                                HapticFeedback.selectionClick();
                                setState(() => _typeBienSelectionne = type);
                                _appliquerRechercheBackend();
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: active ? activeBg : cardBg,
                                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                                  border: Border.all(color: active ? Colors.transparent : borderColor, width: 0.9),
                                ),
                                child: Text(
                                  type,
                                  style: TextStyle(
                                    color: active ? activeFg : textSec,
                                    fontSize: 12.5,
                                    fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),

                        // Budget & Surface Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: borderColor, width: 0.9),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Budget (DT)', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5)),
                                  Text(
                                    '${_priceRange.start.toInt()} - ${_priceRange.end.toInt()} DT',
                                    style: AppTypography.caption(AppColors.accentChampagne),
                                  ),
                                ],
                              ),
                              RangeSlider(
                                values: _priceRange,
                                min: 0,
                                max: 1500000,
                                divisions: 30,
                                activeColor: AppColors.accentChampagne,
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
                                      style: AppTypography.body(textPrim).copyWith(fontSize: 13.5),
                                      decoration: InputDecoration(
                                        labelText: 'Surface min (m²)',
                                        filled: true,
                                        fillColor: elevatedBg,
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(14),
                                          borderSide: BorderSide.none,
                                        ),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: TextField(
                                      controller: _maxAreaCtrl,
                                      keyboardType: TextInputType.number,
                                      style: AppTypography.body(textPrim).copyWith(fontSize: 13.5),
                                      decoration: InputDecoration(
                                        labelText: 'Surface max (m²)',
                                        filled: true,
                                        fillColor: elevatedBg,
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(14),
                                          borderSide: BorderSide.none,
                                        ),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),

                        Text('Chambres & Salles de bain', style: AppTypography.cardTitle(textPrim).copyWith(fontSize: 14.5)),
                        const SizedBox(height: 10),
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
                        const SizedBox(height: 14),

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

                        EditorialSectionHeader(
                          title: AppLocale.instance.trParams('results_count', {'count': _proprietesTrouvees.length}),
                          trailing: GestureDetector(
                            onTap: _reinitialiserFiltres,
                            child: Text(AppLocale.instance.tr('btn_reset'), style: AppTypography.caption(AppColors.accentChampagne)),
                          ),
                        ),
                        const SizedBox(height: 14),

                        if (_isLoading)
                          const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(strokeWidth: 2)))
                        else if (_proprietesTrouvees.isEmpty)
                          LuxuryEmptyState(
                            icon: Icons.search_off_rounded,
                            title: AppLocale.instance.tr('empty_search'),
                            message: AppLocale.instance.tr('welcome_banner_sub'),
                            actionLabel: AppLocale.instance.tr('btn_reset'),
                            onAction: _reinitialiserFiltres,
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

            // Floating Frosted Bottom Apply Bar ONLY when pushed standalone
            if (Navigator.of(context).canPop())
              Positioned(
                left: 18,
                right: 18,
                bottom: 16,
                child: LiquidGlassSurface(
                  borderRadius: 28,
                  blurSigma: 22,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 4,
                        child: OutlinedButton(
                          onPressed: _reinitialiserFiltres,
                          style: OutlinedButton.styleFrom(
                            shape: const StadiumBorder(),
                            side: BorderSide(color: borderColor),
                            minimumSize: const Size(0, 44),
                          ),
                          child: const Text('Réinitialiser'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 6,
                        child: ElevatedButton(
                          onPressed: () async {
                            await _appliquerRechercheBackend();
                            if (!mounted || !context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                content: Text('${_proprietesTrouvees.length} bien(s) trouvé(s) sur Cloud Firestore !'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: activeBg,
                            foregroundColor: activeFg,
                            elevation: 0,
                            minimumSize: const Size(0, 44),
                            shape: const StadiumBorder(),
                          ),
                          child: const Text('Appliquer les filtres', style: TextStyle(fontWeight: FontWeight.w600)),
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
