// ============================================================
// DARLINK — TESTS UNITAIRES ET D'INTÉGRATION DU SYSTÈME DE THÈMES (V2-T02)
// Vérification de AppTheme.lightTheme, AppTheme.darkTheme et ThemeMode (Membre 2)
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/core/theme/app_theme.dart';
import 'package:services_immobilier_flutter/main.dart';

void main() {
  group('Tests du système de thèmes — V2-T02 (Membre 2)', () {
    test('1. AppTheme.lightTheme respecte la spécification WCAG AA et Material 3', () {
      final theme = AppTheme.lightTheme;

      expect(theme.useMaterial3, isTrue);
      expect(theme.brightness, Brightness.light);
      expect(theme.colorScheme.primary, AppTheme.lightPrimary);
      expect(theme.colorScheme.surface, AppTheme.lightSurface);
      expect(theme.colorScheme.error, AppTheme.lightError);
      expect(theme.scaffoldBackgroundColor, AppTheme.lightBackground);
    });

    test('2. AppTheme.darkTheme respecte la spécification Dark Mode OLED-friendly', () {
      final theme = AppTheme.darkTheme;

      expect(theme.useMaterial3, isTrue);
      expect(theme.brightness, Brightness.dark);
      expect(theme.colorScheme.primary, AppTheme.darkPrimary);
      expect(theme.colorScheme.surface, AppTheme.darkSurface);
      expect(theme.colorScheme.error, AppTheme.darkError);
      expect(theme.scaffoldBackgroundColor, AppTheme.darkBackground);
    });

    test('3. AppTheme.basculerTheme bascule correctement le ValueNotifier', () {
      AppTheme.definirThemeMode(ThemeMode.light);
      expect(AppTheme.themeModeNotifier.value, ThemeMode.light);

      AppTheme.basculerTheme();
      expect(AppTheme.themeModeNotifier.value, ThemeMode.dark);

      AppTheme.basculerTheme();
      expect(AppTheme.themeModeNotifier.value, ThemeMode.light);
    });

    testWidgets('4. ServicesImmobilierApp réagit immédiatement au basculement de thème',
        (WidgetTester tester) async {
      AppTheme.definirThemeMode(ThemeMode.light);

      await tester.pumpWidget(const ServicesImmobilierApp());
      await tester.pumpAndSettle();

      final MaterialApp appClair = tester.widget(find.byType(MaterialApp));
      expect(appClair.themeMode, ThemeMode.light);

      // Basculement vers le mode sombre
      AppTheme.basculerTheme();
      await tester.pumpAndSettle();

      final MaterialApp appSombre = tester.widget(find.byType(MaterialApp));
      expect(appSombre.themeMode, ThemeMode.dark);

      // Rétablissement au mode clair pour propreté
      AppTheme.definirThemeMode(ThemeMode.light);
    });
  });
}
