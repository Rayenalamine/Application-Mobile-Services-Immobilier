// ============================================================
// DARLINK — NAVIGATION PRINCIPALE PAR ONGLETS (V2-T04)
// Implémente la NavigationBar Material 3 avec 4 onglets :
// Accueil, Recherche, Favoris, Profil
// ============================================================

import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../properties/presentation/screens/home_screen.dart';
import 'favorites_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';

/// Écran conteneur principal gérant la barre de navigation inférieure Material 3.
/// Utilise un [IndexedStack] pour préserver l'état et le défilement de chaque onglet.
class EcranNavigationPrincipale extends StatefulWidget {
  const EcranNavigationPrincipale({super.key});

  @override
  State<EcranNavigationPrincipale> createState() => _EcranNavigationPrincipaleState();
}

class _EcranNavigationPrincipaleState extends State<EcranNavigationPrincipale> {
  int _indexCourant = 0;

  // Liste ordonnée des 4 écrans principaux de l'application
  final List<Widget> _ecrans = const [
    EcranAccueil(),
    EcranRecherche(),
    EcranFavoris(),
    EcranProfil(),
  ];

  void _surChangementOnglet(int index) {
    if (_indexCourant != index) {
      setState(() {
        _indexCourant = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _indexCourant,
        children: _ecrans,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indexCourant,
        onDestinationSelected: _surChangementOnglet,
        indicatorColor: AppColors.primary.withAlpha(35),
        backgroundColor: AppColors.surface,
        elevation: 3,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppColors.primary),
            label: 'Accueil',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search, color: AppColors.primary),
            label: 'Recherche',
          ),
          NavigationDestination(
            icon: Icon(Icons.favorite_outline),
            selectedIcon: Icon(Icons.favorite, color: AppColors.primary),
            label: 'Favoris',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppColors.primary),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
