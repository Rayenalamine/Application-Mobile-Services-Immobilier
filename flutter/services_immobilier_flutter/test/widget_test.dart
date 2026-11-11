// Test de base pour l'application Services Immobilier
// Ce fichier vérifie que l'application démarre correctement

import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/main.dart';

void main() {
  testWidgets("L'application démarre et affiche l'écran d'accueil",
      (WidgetTester tester) async {
    // On lance l'application
    await tester.pumpWidget(const ServicesImmobilierApp());

    // On vérifie que le titre de l'application est bien affiché
    expect(find.text('Services Immobilier'), findsOneWidget);

    // On vérifie que le message de bienvenue est présent
    expect(find.text('Bienvenue sur Services Immobilier'), findsOneWidget);

    // On vérifie que la section des biens est présente
    expect(find.text('Nos biens immobiliers'), findsOneWidget);
  });
}
