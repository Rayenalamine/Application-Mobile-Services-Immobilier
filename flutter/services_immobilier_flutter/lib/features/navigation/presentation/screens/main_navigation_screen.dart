// ============================================================
// DARLINK — FLOATING LIQUID GLASS NAVIGATION BAR (Flutter)
// Custom pill-dock with zero rectangular ink artifacts, smooth
// scale/color transitions, RTL support & full i18n labels.
// ============================================================

import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/localization/app_locale.dart';
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
  void initState() {
    super.initState();
    AppLocale.instance.addListener(_onLocaleChange);
  }

  @override
  void dispose() {
    AppLocale.instance.removeListener(_onLocaleChange);
    super.dispose();
  }

  void _onLocaleChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final bgColor = AppColors.backgroundOf(context);
    final dockFill = isDark ? const Color(0xCC15171C) : const Color(0xD9FFFFFF);
    final dockBorder = isDark ? const Color(0x2BFFFFFF) : const Color(0x161D1D1F);
    final activeBg = isDark ? const Color(0xFFF5F5F7) : const Color(0xFF1D1D1F);
    final activeIcon = isDark ? const Color(0xFF1D1D1F) : Colors.white;
    final inactiveIcon = isDark ? const Color(0xFF98989D) : const Color(0xFF6E6E73);
    final activeLabel = isDark ? const Color(0xFFF5F5F7) : const Color(0xFF1D1D1F);
    final inactiveLabel = isDark ? const Color(0xFF8E8E93) : const Color(0xFF6E6E73);

    final items = [
      (
        icon: Icons.explore_outlined,
        selectedIcon: Icons.explore_rounded,
        label: AppLocale.instance.tr('nav_home'),
      ),
      (
        icon: Icons.search_rounded,
        selectedIcon: Icons.search_rounded,
        label: AppLocale.instance.tr('nav_search'),
      ),
      (
        icon: Icons.favorite_outline_rounded,
        selectedIcon: Icons.favorite_rounded,
        label: AppLocale.instance.tr('nav_favorites'),
      ),
      (
        icon: Icons.person_outline_rounded,
        selectedIcon: Icons.person_rounded,
        label: AppLocale.instance.tr('nav_profile'),
      ),
    ];

    return Scaffold(
      backgroundColor: bgColor,
      extendBody: true,
      body: IndexedStack(
        index: _indexCourant,
        children: _ecrans,
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
                  color: Colors.black.withValues(alpha: isDark ? 0.42 : 0.08),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
                child: Container(
                  height: 68,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
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
                            : Colors.white.withValues(alpha: 0.9),
                        dockFill,
                      ],
                    ),
                  ),
                  child: Row(
                    children: List.generate(items.length, (i) {
                      final item = items[i];
                      final selected = _indexCourant == i;
                      return Expanded(
                        child: _NavDockItem(
                          icon: selected ? item.selectedIcon : item.icon,
                          label: item.label,
                          selected: selected,
                          activeBg: activeBg,
                          activeIcon: activeIcon,
                          inactiveIcon: inactiveIcon,
                          activeLabel: activeLabel,
                          inactiveLabel: inactiveLabel,
                          onTap: () {
                            if (_indexCourant != i) {
                              HapticFeedback.selectionClick();
                              setState(() => _indexCourant = i);
                            }
                          },
                        ),
                      );
                    }),
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

class _NavDockItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final Color activeBg;
  final Color activeIcon;
  final Color inactiveIcon;
  final Color activeLabel;
  final Color inactiveLabel;
  final VoidCallback onTap;

  const _NavDockItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.activeBg,
    required this.activeIcon,
    required this.inactiveIcon,
    required this.activeLabel,
    required this.inactiveLabel,
    required this.onTap,
  });

  @override
  State<_NavDockItem> createState() => _NavDockItemState();
}

class _NavDockItemState extends State<_NavDockItem> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapCancel: () => setState(() => _pressed = false),
      onTapUp: (_) => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _pressed ? 0.9 : 1.0,
        duration: const Duration(milliseconds: 110),
        curve: Curves.easeOutCubic,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              width: widget.selected ? 50 : 38,
              height: 30,
              decoration: BoxDecoration(
                color: widget.selected ? widget.activeBg : Colors.transparent,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(
                widget.icon,
                size: 20,
                color: widget.selected ? widget.activeIcon : widget.inactiveIcon,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              widget.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: widget.selected ? FontWeight.w600 : FontWeight.w500,
                color: widget.selected ? widget.activeLabel : widget.inactiveLabel,
                letterSpacing: -0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
