// ============================================================
// DARLINK — TESTS DE NAVIGATION PRINCIPALE PAR ONGLETS (V2-T04)
// Vérifie la NavigationBar Material 3, les 4 onglets et le basculement
// ============================================================

import 'dart:io';
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

  group('Tests de navigation principale Material 3 — V2-T04 (Membre 1)', () {
    // ------------------------------------------------------------
    // TEST 1 : Présence des 4 destinations de la NavigationBar
    // ------------------------------------------------------------
    testWidgets('1. La barre de navigation Material 3 affiche les 4 destinations',
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Vérification des 4 libellés d'onglets du dock Liquid Glass
      expect(find.text('Accueil'), findsOneWidget);
      expect(find.text('Recherche'), findsOneWidget);
      expect(find.text('Favoris'), findsOneWidget);
      expect(find.text('Profil'), findsOneWidget);

      // Par défaut, l'écran Accueil est actif
      expect(find.text('Services Immobilier'), findsOneWidget);
      expect(find.text('Nos biens immobiliers'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 2 : Basculement vers l'onglet Recherche
    // ------------------------------------------------------------
    testWidgets('2. Le clic sur l\'onglet Recherche affiche l\'écran de recherche et ses filtres',
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Clic sur la destination Recherche
      await tester.tap(find.text('Recherche'));
      await tester.pumpAndSettle();

      // Vérification du titre de l'écran recherche
      expect(find.text('Recherche de biens'), findsOneWidget);
      expect(find.text('Type de bien'), findsOneWidget);
      expect(find.text('Gouvernorats de Tunisie (24)'), findsOneWidget);
      expect(find.text('Appliquer les filtres'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 3 : Basculement vers l'onglet Favoris
    // ------------------------------------------------------------
    testWidgets('3. Le clic sur l\'onglet Favoris affiche la vue d\'état vide',
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Clic sur la destination Favoris
      await tester.tap(find.text('Favoris'));
      await tester.pumpAndSettle();

      // Vérification du titre et de l'état vide
      expect(find.text('Mes Favoris'), findsOneWidget);
      expect(find.text('Aucun favori enregistré'), findsOneWidget);
      expect(
        find.text('Vos favoris sont sauvegardés et synchronisés'),
        findsOneWidget,
      );
    });

    // ------------------------------------------------------------
    // TEST 4 : Basculement vers l'onglet Profil
    // ------------------------------------------------------------
    testWidgets('4. Le clic sur l\'onglet Profil affiche les informations du profil client',
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Clic sur la destination Profil
      await tester.tap(find.text('Profil'));
      await tester.pumpAndSettle();

      // Vérification des données de profil
      expect(find.text('Bienvenue sur DarLink'), findsOneWidget);
      expect(find.text('Se connecter'), findsWidgets);
      expect(find.text('Mode sombre'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 5 : Cycle complet et retour vers l'Accueil
    // ------------------------------------------------------------
    testWidgets('5. Cycle de navigation complet et retour fluide vers l\'écran Accueil',
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Navigation vers Recherche
      await tester.tap(find.text('Recherche'));
      await tester.pumpAndSettle();
      expect(find.text('Recherche de biens'), findsOneWidget);

      // Navigation vers Profil
      await tester.tap(find.text('Profil'));
      await tester.pumpAndSettle();
      expect(find.text('Bienvenue sur DarLink'), findsOneWidget);

      // Retour vers Accueil
      await tester.tap(find.text('Accueil'));
      await tester.pumpAndSettle();
      expect(find.text('Services Immobilier'), findsOneWidget);
      expect(find.text('Nos biens immobiliers'), findsOneWidget);
      expect(find.text('Appartement moderne à Tunis'), findsOneWidget);
    });
  });
}
