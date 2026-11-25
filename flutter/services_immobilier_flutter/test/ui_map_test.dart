// ============================================================
// DARLINK — TESTS AUTOMATISÉS : CARTE INTERACTIVE & GPS (QA)
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/map/presentation/screens/map_screen.dart';
import 'package:services_immobilier_flutter/features/properties/data/property_api_service.dart';
import 'fixtures/test_properties.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
    PropertyApiService.instance.injectTestFixtures(testFixtureProperties);
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(home: EcranCarteInteractive());
  }

  group('Tests UI d\'interaction — Carte interactive & GPS (EcranCarteInteractive)', () {
    testWidgets('1. Affichage du titre Carte Immobilière, contrôles zoom et filtres de gouvernorats', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.textContaining('Carte Immobilière Tunisie'), findsOneWidget);
      expect(find.textContaining('OpenStreetMap contributors'), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
      expect(find.byIcon(Icons.remove), findsOneWidget);
      expect(find.byIcon(Icons.my_location), findsOneWidget);
      expect(find.text('Tous'), findsOneWidget);
      expect(find.text('Tunis'), findsOneWidget);
      expect(find.text('Sousse'), findsOneWidget);
    });

    testWidgets('2. Filtrage par gouvernorat et dialogue de permission GPS', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tunis'));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.my_location));
      await tester.pumpAndSettle();
      expect(find.text('Accès à votre position GPS'), findsOneWidget);
      await tester.tap(find.text('Plus tard'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tous'));
      await tester.pumpAndSettle();
    });
  });
}
