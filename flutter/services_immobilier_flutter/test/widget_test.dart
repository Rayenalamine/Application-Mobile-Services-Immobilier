// ============================================================
// DARLINK — TESTS DE WIDGETS ET DE COMPORTEMENT (V2-T01)
// Vérifie le démarrage, l'affichage des 4 biens, la navigation et le retour
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/main.dart';

void main() {
  group("Suite de tests fonctionnels et d'interface — Services Immobilier", () {
    // ------------------------------------------------------------
    // TEST 1 : Démarrage et affichage de l'écran d'accueil
    // ------------------------------------------------------------
    testWidgets("1. L'application démarre et affiche l'accueil et sa bannière",
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Vérification du titre principal dans l'AppBar
      expect(find.text('Services Immobilier'), findsOneWidget);

      // Vérification de la bannière de bienvenue
      expect(find.text('Bienvenue sur Services Immobilier'), findsOneWidget);
      expect(
        find.text('Trouvez le bien immobilier de vos rêves en Tunisie.'),
        findsOneWidget,
      );

      // Vérification du titre de section
      expect(find.text('Nos biens immobiliers'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 2 : Présence des 4 annonces fictives de test (avec défilement ListView)
    // ------------------------------------------------------------
    testWidgets("2. Les 4 annonces immobilières fictives sont présentes",
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Première propriété visible immédiatement en haut de la liste
      expect(find.text('Appartement moderne à Tunis'), findsOneWidget);

      final listFinder = find.byType(Scrollable);

      // Défilement pour vérifier la présence des annonces suivantes
      await tester.scrollUntilVisible(
        find.text('Villa avec piscine à Sousse'),
        150,
        scrollable: listFinder,
      );
      expect(find.text('Villa avec piscine à Sousse'), findsOneWidget);

      await tester.scrollUntilVisible(
        find.text('Maison traditionnelle à Djerba'),
        150,
        scrollable: listFinder,
      );
      expect(find.text('Maison traditionnelle à Djerba'), findsOneWidget);

      await tester.scrollUntilVisible(
        find.text('Appartement vue mer à Hammamet'),
        150,
        scrollable: listFinder,
      );
      expect(find.text('Appartement vue mer à Hammamet'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 3 : Navigation vers l'écran de détails et affichage complet
    // ------------------------------------------------------------
    testWidgets(
        "3. Clic sur 'Voir détails' ouvre la fiche complète avec caractéristiques",
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // On clique sur le premier bouton "Voir détails"
      final premierBoutonDetails =
          find.widgetWithText(ElevatedButton, 'Voir détails').first;
      expect(premierBoutonDetails, findsOneWidget);

      await tester.tap(premierBoutonDetails);
      await tester.pumpAndSettle(); // Attente de la transition de navigation

      // Vérification que l'AppBar affiche "Détails du bien"
      expect(find.text('Détails du bien'), findsOneWidget);

      // Vérification des informations du bien sélectionné (Appartement moderne à Tunis)
      expect(find.text('Appartement moderne à Tunis'), findsOneWidget);
      expect(find.text('Les Berges du Lac, Tunis'), findsOneWidget);
      expect(find.text('Prix : 320 000 TND'), findsOneWidget);

      // Vérification de la présence des sections caractéristiques et description
      expect(find.text('Caractéristiques'), findsOneWidget);
      expect(find.text('Chambres'), findsOneWidget);
      expect(find.text('Salles de bain'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
      expect(find.text('Retour à la liste'), findsOneWidget);
    });

    // ------------------------------------------------------------
    // TEST 4 : Navigation retour vers l'écran d'accueil
    // ------------------------------------------------------------
    testWidgets(
        "4. Le bouton 'Retour à la liste' ramène fidèlement à l'écran d'accueil",
        (WidgetTester tester) async {
      await tester.pumpWidget(const ServicesImmobilierApp());

      // Ouverture de l'écran de détails
      final boutonDetails =
          find.widgetWithText(ElevatedButton, 'Voir détails').first;
      await tester.tap(boutonDetails);
      await tester.pumpAndSettle();

      expect(find.text('Détails du bien'), findsOneWidget);

      // Défilement jusqu'au bouton retour si nécessaire et clic
      final boutonRetour =
          find.widgetWithText(OutlinedButton, 'Retour à la liste');
      await tester.ensureVisible(boutonRetour);
      await tester.tap(boutonRetour);
      await tester.pumpAndSettle(); // Attente de la transition retour

      // Vérification qu'on est bien revenu sur l'écran d'accueil
      expect(find.text('Services Immobilier'), findsOneWidget);
      expect(find.text('Détails du bien'), findsNothing);
      expect(find.text('Bienvenue sur Services Immobilier'), findsOneWidget);
    });
  });
}
