// ============================================================
// DARLINK — TESTS AUTOMATISÉS : CARTE INTERACTIVE & GPS (QA)
// Valide le rendu de la carte, sélecteur de villes, et repères géographiques
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/map/presentation/screens/map_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranCarteInteractive(),
    );
  }

  group('Tests UI d\'interaction — Carte interactive & GPS (EcranCarteInteractive)', () {
    testWidgets('1. Affichage du titre, bouton retour et filtres de villes', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.textContaining('Carte des biens en Tunisie'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back_ios_new_rounded), findsOneWidget);
      expect(find.text('Toutes'), findsOneWidget);
      expect(find.text('Tunis'), findsOneWidget);
      expect(find.text('Sousse'), findsOneWidget);
    });

    testWidgets('2. Filtrage interactif par ville', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final tunisChip = find.text('Tunis');
      await tester.tap(tunisChip);
      await tester.pumpAndSettle();

      final allChip = find.text('Toutes');
      await tester.tap(allChip);
      await tester.pumpAndSettle();
    });
  });
}
