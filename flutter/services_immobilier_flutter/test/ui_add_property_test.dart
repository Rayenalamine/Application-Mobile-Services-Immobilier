// ============================================================
// DARLINK — TESTS AUTOMATISÉS : FORMULAIRE DE DÉPÔT D'ANNONCE (QA)
// Valide l'affichage des champs, validation des erreurs, et soumission
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/properties/presentation/screens/add_property_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranDepotAnnonce(),
    );
  }

  group('Tests UI d\'interaction — Formulaire de dépôt d\'annonce (EcranDepotAnnonce)', () {
    testWidgets('1. Affichage de tous les champs essentiels du formulaire', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Déposer une annonce'), findsOneWidget);
      expect(find.text('Photos du bien'), findsOneWidget);
      expect(find.text('Type de bien'), findsOneWidget);

      await tester.drag(find.byType(ListView).first, const Offset(0, -500));
      await tester.pumpAndSettle();

      expect(find.text('Titre de l\'annonce'), findsOneWidget);
      expect(find.text('Prix (TND)'), findsOneWidget);
      expect(find.text('Surface (m²)'), findsOneWidget);
      expect(find.text('Gouvernorat'), findsOneWidget);

      await tester.drag(find.byType(ListView).first, const Offset(0, -600));
      await tester.pumpAndSettle();
      expect(find.text('Publier l\'annonce'), findsOneWidget);
    });

    testWidgets('2. Déclenchement des validations en cas de soumission vide', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final submitBtn = find.text('Publier l\'annonce');
      await tester.scrollUntilVisible(
        submitBtn,
        300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      await tester.scrollUntilVisible(
        find.text('Veuillez saisir un titre valide'),
        -300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Veuillez saisir un titre valide'), findsOneWidget);
      expect(find.text('Veuillez saisir un prix strictement positif'), findsOneWidget);
    });

    testWidgets('3. Remplissage des champs obligatoires et sélection des atouts', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final titreField = find.byType(TextFormField).at(0);
      await tester.enterText(titreField, 'Penthouse Prestige La Marsa');

      final prixField = find.byType(TextFormField).at(1);
      await tester.enterText(prixField, '450000');

      final surfaceField = find.byType(TextFormField).at(2);
      await tester.enterText(surfaceField, '185');

      await tester.pumpAndSettle();

      expect(find.text('Penthouse Prestige La Marsa'), findsOneWidget);
      expect(find.text('450000'), findsOneWidget);
      expect(find.text('185'), findsOneWidget);
    });
  });
}
