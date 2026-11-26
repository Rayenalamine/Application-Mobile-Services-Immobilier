// ============================================================
// DARLINK — FLOATING LIQUID GLASS NAVIGATION BAR (Flutter)
// extendBody: true lets content glide visibly behind the blurred dock.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../properties/presentation/screens/home_screen.dart';
import 'favorites_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';

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
    final isDark = AppColors.isDark(context);
    final bgColor = AppColors.backgroundOf(context);
    final dockFill = isDark ? const Color(0xBD15171C) : const Color(0xCCFFFFFF);
    final dockBorder = isDark ? const Color(0x2BFFFFFF) : const Color(0x161D1D1F);
    final indicatorColor = isDark ? const Color(0xFFF5F5F7) : const Color(0xFF1D1D1F);
    final selectedIconColor = isDark ? const Color(0xFF1D1D1F) : Colors.white;
    final unselectedIconColor = isDark ? const Color(0xFF98989D) : const Color(0xFF6E6E73);
    final selectedLabelColor = isDark ? const Color(0xFFF5F5F7) : const Color(0xFF1D1D1F);
    final unselectedLabelColor = isDark ? const Color(0xFF636366) : const Color(0xFF8E8E93);

    return Scaffold(
      backgroundColor: bgColor,
      extendBody: true,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 260),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        child: KeyedSubtree(
          key: ValueKey<int>(_indexCourant),
          child: _ecrans[_indexCourant],
        ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.45 : 0.08),
                  blurRadius: 28,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 26, sigmaY: 26),
                child: Container(
                  height: 72,
                  decoration: BoxDecoration(
                    color: dockFill,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
                    border: Border.all(color: dockBorder, width: 0.9),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.white.withValues(alpha: 0.88),
                        dockFill,
                      ],
                    ),
                  ),
                  child: NavigationBarTheme(
                    data: NavigationBarThemeData(
                      backgroundColor: Colors.transparent,
                      surfaceTintColor: Colors.transparent,
                      indicatorColor: indicatorColor,
                      indicatorShape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      elevation: 0,
                      height: 72,
                      iconTheme: WidgetStateProperty.resolveWith((states) {
                        if (states.contains(WidgetState.selected)) {
                          return IconThemeData(color: selectedIconColor, size: 20);
                        }
                        return IconThemeData(color: unselectedIconColor, size: 20);
                      }),
                      labelTextStyle: WidgetStateProperty.resolveWith((states) {
                        if (states.contains(WidgetState.selected)) {
                          return TextStyle(
                            color: selectedLabelColor,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.1,
                          );
                        }
                        return TextStyle(
                          color: unselectedLabelColor,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        );
                      }),
                    ),
                    child: NavigationBar(
                      selectedIndex: _indexCourant,
                      animationDuration: const Duration(milliseconds: 320),
                      onDestinationSelected: (index) {
                        HapticFeedback.selectionClick();
                        setState(() => _indexCourant = index);
                      },
                      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                      destinations: const [
                        NavigationDestination(
                          icon: Icon(Icons.explore_outlined),
                          selectedIcon: Icon(Icons.explore_rounded),
                          label: 'Accueil',
                        ),
                        NavigationDestination(
                          icon: Icon(Icons.search_rounded),
                          selectedIcon: Icon(Icons.search_rounded),
                          label: 'Recherche',
                        ),
                        NavigationDestination(
                          icon: Icon(Icons.favorite_outline_rounded),
                          selectedIcon: Icon(Icons.favorite_rounded),
                          label: 'Favoris',
                        ),
                        NavigationDestination(
                          icon: Icon(Icons.person_outline_rounded),
                          selectedIcon: Icon(Icons.person_rounded),
                          label: 'Profil',
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
