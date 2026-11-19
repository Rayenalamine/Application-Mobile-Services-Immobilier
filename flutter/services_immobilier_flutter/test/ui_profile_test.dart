// ============================================================
// DARLINK — TESTS AUTOMATISÉS : PROFIL CLIENT & INTERACTIONS (QA)
// Valide le monogramme, consultation des données, modal d'édition et demandes reçues
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/navigation/presentation/screens/profile_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranProfil(),
    );
  }

  group('Tests UI d\'interaction — Écran Profil client (EcranProfil)', () {
    testWidgets('1. Affichage de l\'en-tête, monogramme et informations du profil', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Mon Profil'), findsOneWidget);
      expect(find.text('RL'), findsOneWidget);
      expect(find.text('Rayen Lamine'), findsOneWidget);
      expect(find.text('Compte Client Vérifié'), findsOneWidget);
    });

    testWidgets('2. Ouverture du modal de modification du profil', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final editIcon = find.byIcon(Icons.edit_outlined).first;
      await tester.tap(editIcon);
      await tester.pumpAndSettle();

      expect(find.text('Modifier mes coordonnées'), findsOneWidget);
      expect(find.text('Nom complet'), findsOneWidget);
      expect(find.text('Numéro de téléphone'), findsOneWidget);
      expect(find.text('Annuler'), findsOneWidget);
      expect(find.text('Enregistrer'), findsOneWidget);

      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
      expect(find.text('Modifier mes coordonnées'), findsNothing);
    });
  });
}
