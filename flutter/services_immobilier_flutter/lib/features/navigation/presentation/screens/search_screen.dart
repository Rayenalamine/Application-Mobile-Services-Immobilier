// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES LUXE (Screen 3)
// Contrôles segmented, sélecteur de prix, chambres et villes
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Écran de recherche avancée inspiré de Screen 3 de la maquette.
class EcranRecherche extends StatefulWidget {
  const EcranRecherche({super.key});

  @override
  State<EcranRecherche> createState() => _EcranRechercheState();
}

class _EcranRechercheState extends State<EcranRecherche> {
  int _indexSegment = 0; // 0: Acheter, 1: Louer, 2: Vendu
  String _typeBienSelectionne = 'Tous';
  String _modePrixSelectionne = 'Prix total';
  String _chambreSelectionnee = 'Tous';
  String _villeSelectionnee = 'Tunis';

  final List<String> _segments = const ['Acheter', 'Louer', 'Vendu'];
  final List<String> _types = const ['Tous', 'Villa', 'Appartement', 'Maison'];
  final List<String> _chambres = const ['Tous', 'Studio', '1+', '2+', '3+', '4+'];
  final List<String> _villes = const ['Tunis', 'Sousse', 'Djerba', 'Hammamet'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1015),
      body: SafeArea(
        child: Column(
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
                    icon: Icons.arrow_back,
                    onTap: () {},
                  ),
                  const Text(
                    'Recherche de biens',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Row(
                    children: [
                      _GlassCircleBtn(
                        icon: Icons.map_outlined,
                        onTap: () {},
                      ),
                      const SizedBox(width: 8),
                      _GlassCircleBtn(
                        icon: Icons.more_horiz,
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
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 2. CONTRÔLE SEGMENTÉ (Acheter, Louer, Vendu)
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF181920),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: const Color(0x1FFFFFFF)),
                      ),
                      child: Row(
                        children: List.generate(_segments.length, (index) {
                          final isSelected = _indexSegment == index;
                          return Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _indexSegment = index),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSelected ? Colors.white : Colors.transparent,
                                  borderRadius: BorderRadius.circular(26),
                                ),
                                child: Center(
                                  child: Text(
                                    _segments[index],
                                    style: TextStyle(
                                      color: isSelected ? const Color(0xFF0F1015) : const Color(0xFF9CA3AF),
                                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 3. TYPE DE BIEN
                    const Text(
                      'Type de bien',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _types.map((t) {
                        final isSel = _typeBienSelectionne == t;
                        return GestureDetector(
                          onTap: () => setState(() => _typeBienSelectionne = t),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSel ? Colors.white : const Color(0xFF181920),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: isSel ? Colors.white : const Color(0x1FFFFFFF)),
                            ),
                            child: Text(
                              t,
                              style: TextStyle(
                                color: isSel ? const Color(0xFF0F1015) : const Color(0xFFCAC4D0),
                                fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),

                    // 4. SÉLECTION DU MODE DE PRIX
                    Row(
                      children: ['Prix total', 'Paiement mensuel'].map((m) {
                        final isSel = _modePrixSelectionne == m;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _modePrixSelectionne = m),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0x2AFFFFFF) : const Color(0xFF181920),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: isSel ? Colors.white : const Color(0x1FFFFFFF)),
                              ),
                              child: Center(
                                child: Text(
                                  m,
                                  style: TextStyle(
                                    color: isSel ? Colors.white : const Color(0xFF9CA3AF),
                                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 20),

                    // 5. FOURCHETTE DE BUDGET (Min -> Max)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF181920),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0x1FFFFFFF)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Budget Min', style: TextStyle(color: Color(0xFF6B7280), fontSize: 11)),
                              SizedBox(height: 4),
                              Text('50 000 DT', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                            ],
                          ),
                          const Icon(Icons.arrow_forward, color: Color(0xFF6B7280), size: 18),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: const [
                              Text('Budget Max', style: TextStyle(color: Color(0xFF6B7280), fontSize: 11)),
                              SizedBox(height: 4),
                              Text('1 000 000+ DT', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 6. NOMBRE DE CHAMBRES
                    const Text(
                      'Chambres',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _chambres.length,
                        separatorBuilder: (context, _) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final c = _chambres[index];
                          final isSel = _chambreSelectionnee == c;
                          return GestureDetector(
                            onTap: () => setState(() => _chambreSelectionnee = c),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18),
                              decoration: BoxDecoration(
                                color: isSel ? Colors.white : const Color(0xFF181920),
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(color: isSel ? Colors.white : const Color(0x1FFFFFFF)),
                              ),
                              child: Center(
                                child: Text(
                                  c,
                                  style: TextStyle(
                                    color: isSel ? const Color(0xFF0F1015) : const Color(0xFFCAC4D0),
                                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 7. VILLES POPULAIRES EN TUNISIE
                    const Text(
                      'Villes populaires en Tunisie',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _villes.map((v) {
                        final isSel = _villeSelectionnee == v;
                        return GestureDetector(
                          onTap: () => setState(() => _villeSelectionnee = v),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSel ? const Color(0x332563EB) : const Color(0xFF181920),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: isSel ? AppColors.accentBlue : const Color(0x1FFFFFFF)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.location_on, size: 14, color: isSel ? AppColors.accentBlue : const Color(0xFF6B7280)),
                                const SizedBox(width: 4),
                                Text(
                                  v,
                                  style: TextStyle(
                                    color: isSel ? Colors.white : const Color(0xFFCAC4D0),
                                    fontSize: 12,
                                    fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),

                    // 8. BANDEAU DE ROADMAP
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0x1A2563EB),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0x332563EB)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Color(0xFF60A5FA), size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Recherche dynamique en préparation',
                                  style: TextStyle(
                                    color: Color(0xFF93C5FD),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Les filtres seront connectés à l\'API Spring Boot en V5-T02.',
                                  style: TextStyle(color: Color(0xFF93C5FD), fontSize: 12, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
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
  final VoidCallback onTap;

  const _GlassCircleBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: const Color(0xFF181920),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0x1FFFFFFF)),
        ),
        child: Icon(icon, color: Colors.white, size: 18),
      ),
    );
  }
}
