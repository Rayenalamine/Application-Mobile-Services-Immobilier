// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (GLASSMORPHISM)
// Barre flottante type dock centrée adaptative Blanc & Sombre
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../properties/presentation/screens/home_screen.dart';
import 'favorites_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';

/// Conteneur de navigation avec dock flottant translucide adaptatif.
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = AppColors.backgroundOf(context);
    final dockBg = isDark ? const Color(0xD9161720) : const Color(0xF2FFFFFF);
    final dockBorder = isDark ? const Color(0x33FFFFFF) : const Color(0x18000000);
    final indicatorColor = isDark ? Colors.white : const Color(0xFF111827);
    final selectedIconColor = isDark ? const Color(0xFF0F1015) : Colors.white;
    final unselectedIconColor = isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);
    final selectedLabelColor = isDark ? Colors.white : const Color(0xFF111827);
    final unselectedLabelColor = isDark ? const Color(0xFF6B7280) : const Color(0xFF9CA3AF);

    return Scaffold(
      backgroundColor: bgColor,
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
                color: dockBg,
                borderRadius: BorderRadius.circular(40),
                border: Border.all(color: dockBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.08),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: NavigationBarTheme(
                data: NavigationBarThemeData(
                  backgroundColor: Colors.transparent,
                  indicatorColor: indicatorColor,
                  elevation: 0,
                  iconTheme: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return IconThemeData(color: selectedIconColor, size: 22);
                    }
                    return IconThemeData(color: unselectedIconColor, size: 22);
                  }),
                  labelTextStyle: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return TextStyle(
                        color: selectedLabelColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      );
                    }
                    return TextStyle(
                      color: unselectedLabelColor,
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
