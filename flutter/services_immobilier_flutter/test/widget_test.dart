// ============================================================
// DARLINK — TESTS DE WIDGETS ET DE COMPORTEMENT (V2-T01)
// Vérifie le démarrage, l'affichage des biens, la navigation et le retour
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/properties/data/property_api_service.dart';
import 'package:services_immobilier_flutter/main.dart';
import 'fixtures/test_properties.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
    PropertyApiService.instance.injectTestFixtures(testFixtureProperties);
  });

  group("Suite de tests fonctionnels et d'interface — Services Immobilier", () {
    testWidgets("1. L'application démarre et affiche l'accueil et sa bannière",
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(const ServicesImmobilierApp());
      await tester.pumpAndSettle();

      expect(find.text('Services Immobilier'), findsOneWidget);
      expect(find.text('Bienvenue sur Services Immobilier'), findsOneWidget);
      expect(
        find.text('Trouvez le bien immobilier de vos rêves en Tunisie.'),
        findsOneWidget,
      );
      expect(find.text('Nos biens immobiliers'), findsOneWidget);
    });

    testWidgets("2. Les annonces immobilières sont chargées et affichées",
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(const ServicesImmobilierApp());
      await tester.pumpAndSettle();

      final firstCard = find.text('Appartement moderne à Tunis');
      expect(firstCard, findsOneWidget);
    });

    testWidgets(
        "3. Clic sur une annonce ouvre la fiche complète avec caractéristiques",
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(const ServicesImmobilierApp());
      await tester.pumpAndSettle();

      final btnDetails = find.widgetWithText(ElevatedButton, 'Voir détails').first;
      expect(btnDetails, findsOneWidget);
      await tester.ensureVisible(btnDetails);
      await tester.tap(btnDetails);
      await tester.pumpAndSettle();

      expect(find.text('Détails du bien'), findsOneWidget);
      expect(find.text('Appartement moderne à Tunis'), findsOneWidget);
      expect(find.text('Les Berges du Lac, Tunis'), findsOneWidget);
    });

    testWidgets(
        "4. Le bouton retour ramène fidèlement à l'écran d'accueil",
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(const ServicesImmobilierApp());
      await tester.pumpAndSettle();

      final btnDetails = find.widgetWithText(ElevatedButton, 'Voir détails').first;
      await tester.ensureVisible(btnDetails);
      await tester.tap(btnDetails);
      await tester.pumpAndSettle();

      expect(find.text('Détails du bien'), findsOneWidget);

      final backButton = find.byIcon(Icons.arrow_back_ios_new_rounded);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle();

      expect(find.text('Détails du bien'), findsNothing);
      expect(find.text('Services Immobilier'), findsOneWidget);
    });
  });
}
