// ============================================================
// DARLINK — TESTS AUTOMATISÉS : ÉCRAN DES FAVORIS & PERSISTANCE (QA)
// Valide l'état vide, l'actualisation et l'affichage des annonces enregistrées
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/navigation/presentation/screens/favorites_screen.dart';
import 'package:services_immobilier_flutter/features/favorites/data/favorites_api_service.dart';
import 'package:services_immobilier_flutter/core/localization/app_locale.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    HttpOverrides.global = MockHttpOverrides();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranFavoris(),
    );
  }

  group('Tests UI d\'interaction — Écran des favoris (EcranFavoris)', () {
    testWidgets('1. Affichage de l\'en-tête et de l\'état vide par défaut', (tester) async {
      FavoritesApiService.instance.favoriteIds.clear();

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Mes Favoris'), findsOneWidget);
      expect(find.text('Aucun favori enregistré'), findsOneWidget);
      expect(find.text('Vos favoris sont sauvegardés et synchronisés'), findsOneWidget);
    });

    testWidgets('2. Déclenchement de l\'action d\'actualisation via l\'AppBar', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final refreshIcon = find.byIcon(Icons.refresh_rounded);
      expect(refreshIcon, findsOneWidget);

      await tester.tap(refreshIcon);
      await tester.pumpAndSettle();

      expect(find.text('Mes Favoris'), findsOneWidget);
    });

    testWidgets('3. Isolation des favoris : déconnexion vide les données locales', (tester) async {
      FavoritesApiService.instance.favoriteIds.add('99');
      expect(FavoritesApiService.instance.isFavorite('99'), isTrue);

      FavoritesApiService.instance.clear();
      expect(FavoritesApiService.instance.isFavorite('99'), isFalse);
    });

    testWidgets('4. Basculement de langue trilingue (FR, AR, EN) et direction RTL', (tester) async {
      await AppLocale.instance.setLanguage('fr');
      expect(AppLocale.instance.tr('favorites_title'), 'Mes Favoris');
      expect(AppLocale.instance.textDirection, TextDirection.ltr);

      await AppLocale.instance.setLanguage('ar');
      expect(AppLocale.instance.tr('favorites_title'), 'عقاراتي المفضلة');
      expect(AppLocale.instance.textDirection, TextDirection.rtl);

      await AppLocale.instance.setLanguage('en');
      expect(AppLocale.instance.tr('favorites_title'), 'My Favorites');
      expect(AppLocale.instance.textDirection, TextDirection.ltr);

      await AppLocale.instance.setLanguage('fr');
    });
  });
}
