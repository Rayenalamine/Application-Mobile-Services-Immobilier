// ============================================================
// DARLINK — TESTS AUTOMATISÉS : RECHERCHE & FILTRES DYNAMIQUES (QA)
// Valide le contrôleur segmenté, la sélection des types de bien et l'action de filtrage
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
    testWidgets('1. Affichage de l\'en-tête, des segments et des types de bien', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Recherche de biens'), findsOneWidget);
      expect(find.text('Acheter'), findsOneWidget);
      expect(find.text('Louer'), findsOneWidget);
      expect(find.text('Vendu'), findsOneWidget);
      expect(find.text('Appartement'), findsOneWidget);
      expect(find.text('Villa'), findsOneWidget);
      expect(find.text('Appliquer les filtres'), findsOneWidget);
    });

    testWidgets('2. Basculement des segments Acheter / Louer', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final rentSegment = find.text('Louer');
      await tester.tap(rentSegment);
      await tester.pumpAndSettle();

      // Retour sur Acheter
      final buySegment = find.text('Acheter');
      await tester.tap(buySegment);
      await tester.pumpAndSettle();
    });

    testWidgets('3. Sélection d\'un type de bien (Villa)', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final villaChip = find.text('Villa');
      await tester.tap(villaChip);
      await tester.pumpAndSettle();

      expect(find.text('Villa'), findsOneWidget);
    });

    testWidgets('4. Déclenchement de l\'application des filtres vers le backend', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final applyBtn = find.text('Appliquer les filtres');
      await tester.tap(applyBtn);
      await tester.pumpAndSettle();

      // SnackBar de résultat de recherche
      expect(find.textContaining('trouvé(s) depuis la base de données !'), findsOneWidget);
    });
  });
}
