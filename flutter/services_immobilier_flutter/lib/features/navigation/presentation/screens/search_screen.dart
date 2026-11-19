// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES LUXE (Screen 3)
// Contrôles segmented, sélecteur de prix, chambres et villes adaptatifs
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../map/presentation/screens/map_screen.dart';
import '../../../properties/data/property_api_service.dart';
import '../../../properties/domain/models/property.dart';
import '../../../properties/presentation/widgets/property_card.dart';

/// Écran de recherche avancée inspiré de Screen 3 de la maquette Darlink.
class EcranRecherche extends StatefulWidget {
  const EcranRecherche({super.key});

  @override
  State<EcranRecherche> createState() => _EcranRechercheState();
}

class _EcranRechercheState extends State<EcranRecherche> {
  String _segmentActif = 'Acheter';
  String _typeBienSelectionne = 'Tous';
  bool _prixTotalMode = true;
  String _chambreSelectionnee = 'Tous';
  String _villeSelectionnee = '';

  final List<String> _segments = const ['Acheter', 'Louer', 'Vendu'];
  final List<String> _typesBien = const ['Tous', 'Appartement', 'Villa', 'Maison'];
  final List<String> _chambres = const ['Tous', 'Studio', '1+', '2+', '3+', '4+'];
  final List<String> _villes = const [
    'Tunis',
    'Sousse',
    'Hammamet',
    'Djerba',
    'Monastir',
    'Sfax',
  ];

  @override
  void initState() {
    super.initState();
    _appliquerRechercheBackend();
  }

  Future<void> _appliquerRechercheBackend() async {
    int? minCh;
    if (_chambreSelectionnee == '1+') minCh = 1;
    if (_chambreSelectionnee == '2+') minCh = 2;
    if (_chambreSelectionnee == '3+') minCh = 3;
    if (_chambreSelectionnee == '4+') minCh = 4;

    await PropertyApiService.instance.getProperties(
      city: _villeSelectionnee.isNotEmpty ? _villeSelectionnee : null,
      type: _typeBienSelectionne != 'Tous' ? _typeBienSelectionne : null,
      isRental: _segmentActif == 'Louer' ? true : (_segmentActif == 'Acheter' ? false : null),
      minBedrooms: minCh,
    );
    if (mounted) {
      setState(() {});
    }
  }

  List<Propriete> get _resultatsFiltres {
    final list = PropertyApiService.instance.currentProperties;
    return list.where((prop) {
      if (_segmentActif == 'Louer' && !prop.estLocation) return false;
      if (_segmentActif == 'Acheter' && prop.estLocation) return false;

      if (_typeBienSelectionne != 'Tous' &&
          prop.type.toLowerCase() != _typeBienSelectionne.toLowerCase()) {
        return false;
      }

      if (_villeSelectionnee.isNotEmpty &&
          !prop.localisation.toLowerCase().contains(_villeSelectionnee.toLowerCase())) {
        return false;
      }

      if (_chambreSelectionnee != 'Tous') {
        int minCh = 1;
        if (_chambreSelectionnee == '2+') minCh = 2;
        if (_chambreSelectionnee == '3+') minCh = 3;
        if (_chambreSelectionnee == '4+') minCh = 4;
        if (prop.nombreChambres < minCh) return false;
      }

      return true;
    }).toList();
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
    final activeSegmentBg = isDark ? Colors.white : Colors.white;
    final activeSegmentText = const Color(0xFF0F1015);
    final bottomDockBg = isDark ? const Color(0xF00F1015) : const Color(0xF2FFFFFF);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // ------------------------------------------------------------
                // 1. BARRE SUPÉRIEURE FLOTTANTE
                // ------------------------------------------------------------
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
                            icon: Icons.more_horiz,
                            isDark: isDark,
                            onTap: () {},
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // ------------------------------------------------------------
                // CORPS DU FORMULAIRE DE FILTRAGE
                // ------------------------------------------------------------
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 2. CONTRÔLEUR SEGMENTÉ : ACHETER / LOUER / VENDU
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
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: isSelected ? activeSegmentBg : Colors.transparent,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
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
                                          color: isSelected ? activeSegmentText : textSec,
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

                        // 3. SÉLECTION DU TYPE DE BIEN
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
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? (isDark ? Colors.white : const Color(0xFF111827))
                                      : cardBg,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? Colors.transparent : borderColor,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.1),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ]
                                      : [],
                                ),
                                child: Text(
                                  type,
                                  style: TextStyle(
                                    color: isSelected
                                        ? (isDark ? const Color(0xFF0F1015) : Colors.white)
                                        : textSec,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 22),

                        // 4. BASCULE MODE DE PRIX
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _prixTotalMode = true;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: _prixTotalMode
                                        ? (isDark ? const Color(0x332563EB) : const Color(0x182563EB))
                                        : cardBg,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: _prixTotalMode ? AppColors.accentBlue : borderColor,
                                      width: _prixTotalMode ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Prix total (DT)',
                                      style: TextStyle(
                                        color: _prixTotalMode ? AppColors.accentBlue : textSec,
                                        fontWeight: _prixTotalMode ? FontWeight.w700 : FontWeight.w500,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _prixTotalMode = false;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: !_prixTotalMode
                                        ? (isDark ? const Color(0x332563EB) : const Color(0x182563EB))
                                        : cardBg,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: !_prixTotalMode ? AppColors.accentBlue : borderColor,
                                      width: !_prixTotalMode ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Paiement mensuel',
                                      style: TextStyle(
                                        color: !_prixTotalMode ? AppColors.accentBlue : textSec,
                                        fontWeight: !_prixTotalMode ? FontWeight.w700 : FontWeight.w500,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 18),

                        // 5. CARTE DE BUDGET ESTIMÉ
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: borderColor),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Budget minimum',
                                    style: TextStyle(color: textSec, fontSize: 11, fontWeight: FontWeight.w500),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '100 000 DT',
                                    style: TextStyle(color: textPrim, fontWeight: FontWeight.w800, fontSize: 15),
                                  ),
                                ],
                              ),
                              Container(width: 1, height: 30, color: borderColor),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'Budget maximum',
                                    style: TextStyle(color: textSec, fontSize: 11, fontWeight: FontWeight.w500),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '1 500 000 DT',
                                    style: TextStyle(color: textPrim, fontWeight: FontWeight.w800, fontSize: 15),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 22),

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
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? (isDark ? Colors.white : const Color(0xFF111827))
                                      : cardBg,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? Colors.transparent : borderColor,
                                  ),
                                ),
                                child: Text(
                                  chambre,
                                  style: TextStyle(
                                    color: isSelected
                                        ? (isDark ? const Color(0xFF0F1015) : Colors.white)
                                        : textSec,
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
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0x282563EB)
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
                                      color: isSelected ? AppColors.accentBlue : textSec,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      ville,
                                      style: TextStyle(
                                        color: isSelected ? AppColors.accentBlue : textSec,
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
                              'Résultats correspondants (${_resultatsFiltres.length})',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: textPrim,
                              ),
                            ),
                            if (_villeSelectionnee.isNotEmpty || _typeBienSelectionne != 'Tous' || _chambreSelectionnee != 'Tous' || _segmentActif != 'Acheter')
                              GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _segmentActif = 'Acheter';
                                    _typeBienSelectionne = 'Tous';
                                    _villeSelectionnee = '';
                                    _chambreSelectionnee = 'Tous';
                                  });
                                },
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

                        if (_resultatsFiltres.isEmpty)
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
                                  'Essayez de sélectionner une autre ville ou d\'élargir le type de bien.',
                                  style: TextStyle(color: textSec, fontSize: 13),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        else
                          ..._resultatsFiltres.map((prop) => Padding(
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

            // ------------------------------------------------------------
            // DOCK FLOTTANT EN BAS : CONTACTER UN AGENT / PLANIFIER VISITE
            // ------------------------------------------------------------
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
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Agent immobilier contacté (Sonia Ben Salem).'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: textPrim,
                          side: BorderSide(color: borderColor),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          'Contacter l\'agent',
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
                              content: Text('${_resultatsFiltres.length} bien(s) trouvé(s) depuis la base de données !'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isDark ? Colors.white : const Color(0xFF0F1015),
                          foregroundColor: isDark ? const Color(0xFF0F1015) : Colors.white,
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
