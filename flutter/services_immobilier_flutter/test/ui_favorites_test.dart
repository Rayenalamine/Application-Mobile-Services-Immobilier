// ============================================================
// DARLINK — TESTS AUTOMATISÉS : ÉCRAN DES FAVORIS & PERSISTANCE (QA)
// Valide l'état vide, l'actualisation et l'affichage des annonces enregistrées
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/navigation/presentation/screens/favorites_screen.dart';
import 'package:services_immobilier_flutter/features/favorites/data/favorites_api_service.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
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
  });
}
