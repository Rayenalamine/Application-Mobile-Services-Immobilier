// ============================================================
// DARLINK — TESTS AUTOMATISÉS : RECHERCHE & FILTRES DYNAMIQUES (QA)
// Valide le champ de recherche textuelle, les segments, filtres et reset
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/navigation/presentation/screens/search_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranRecherche(),
    );
  }

  group('Tests UI d\'interaction — Écran de recherche multicritères (EcranRecherche)', () {
    testWidgets('1. Affichage du champ de recherche textuelle, des filtres et du bouton', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Recherche de biens'), findsOneWidget);
      expect(find.byKey(const Key('search_text_input')), findsOneWidget);
      expect(find.text('Acheter'), findsOneWidget);
      expect(find.text('Louer'), findsOneWidget);
      expect(find.text('Appartement'), findsOneWidget);
      expect(find.text('Villa'), findsOneWidget);
      expect(find.text('Appliquer les filtres'), findsOneWidget);
    });

    testWidgets('2. Saisie d\'un texte de recherche dans le champ textuel', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final searchInput = find.byKey(const Key('search_text_input'));
      await tester.enterText(searchInput, 'Villa Djerba');
      await tester.pumpAndSettle();

      expect(find.text('Villa Djerba'), findsOneWidget);
    });

    testWidgets('3. Sélection d\'un type de bien (Villa) et bascule de segment', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final villaChip = find.text('Villa');
      await tester.tap(villaChip);
      await tester.pumpAndSettle();

      final rentSegment = find.text('Louer');
      await tester.tap(rentSegment);
      await tester.pumpAndSettle();
    });

    testWidgets('4. Déclenchement de l\'application des filtres vers PostgreSQL', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final applyBtn = find.text('Appliquer les filtres');
      await tester.tap(applyBtn);
      await tester.pumpAndSettle();

      expect(find.textContaining('trouvé(s) depuis PostgreSQL !'), findsOneWidget);
    });
  });
}
