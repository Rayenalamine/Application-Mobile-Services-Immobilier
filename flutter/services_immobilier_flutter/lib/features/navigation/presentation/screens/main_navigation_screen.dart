// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (GLASSMORPHISM)
// Barre flottante type dock centrée (Screen 1 & 2)
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../properties/presentation/screens/home_screen.dart';
import 'favorites_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';

/// Conteneur de navigation avec dock flottant translucide.
class EcranNavigationPrincipale extends StatefulWidget {
  const EcranNavigationPrincipale({super.key});

  @override
  State<EcranNavigationPrincipale> createState() =>
      _EcranNavigationPrincipaleState();
}

class _EcranNavigationPrincipaleState extends State<EcranNavigationPrincipale> {
  int _indexCourant = 0;

  final List<Widget> _ecrans = const [
    EcranAccueil(),
    EcranRecherche(),
    EcranFavoris(),
    EcranProfil(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1015),
      body: _ecrans[_indexCourant],
      bottomNavigationBar: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(40),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              height: 70,
              decoration: BoxDecoration(
                color: const Color(0xD9161720),
                borderRadius: BorderRadius.circular(40),
                border: Border.all(color: const Color(0x33FFFFFF), width: 1.2),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x80000000),
                    blurRadius: 30,
                    offset: Offset(0, 12),
                  ),
                ],
              ),
              child: NavigationBarTheme(
                data: NavigationBarThemeData(
                  backgroundColor: Colors.transparent,
                  indicatorColor: Colors.white,
                  elevation: 0,
                  iconTheme: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return const IconThemeData(color: Color(0xFF0F1015), size: 22);
                    }
                    return const IconThemeData(color: Color(0xFF9CA3AF), size: 22);
                  }),
                  labelTextStyle: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      );
                    }
                    return const TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    );
                  }),
                ),
                child: NavigationBar(
                  selectedIndex: _indexCourant,
                  onDestinationSelected: (index) {
                    setState(() {
                      _indexCourant = index;
                    });
                  },
                  labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                  destinations: const [
                    NavigationDestination(
                      icon: Icon(Icons.grid_view_outlined),
                      selectedIcon: Icon(Icons.grid_view_rounded),
                      label: 'Accueil',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.search_outlined),
                      selectedIcon: Icon(Icons.search),
                      label: 'Recherche',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.favorite_outline),
                      selectedIcon: Icon(Icons.favorite),
                      label: 'Favoris',
                    ),
                    NavigationDestination(
                      icon: Icon(Icons.person_outline),
                      selectedIcon: Icon(Icons.person),
                      label: 'Profil',
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
