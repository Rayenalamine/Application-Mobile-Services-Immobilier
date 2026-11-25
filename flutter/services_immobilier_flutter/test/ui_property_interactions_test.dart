// ============================================================
// DARLINK — TESTS AUTOMATISÉS D'INTERACTION : FICHE DÉTAILS & CONTACT (QA)
// Valide le bouton favori, le formulaire de contact, l'édition/suppression propriétaire
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/auth/domain/models/auth_state.dart';
import 'package:services_immobilier_flutter/features/properties/domain/models/property.dart';
import 'package:services_immobilier_flutter/features/properties/presentation/screens/property_details_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  final testPropriete = Propriete(
    id: '99',
    proprietaireId: '1', // Propriétaire = utilisateur par défaut (1)
    titre: 'Villa de Luxe Test Hammamet',
    localisation: 'Yasmine Hammamet, Tunisie',
    prix: 750000.0,
    type: 'Villa',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    nombreChambres: 4,
    nombreSallesDeBain: 3,
    surfaceM2: 320,
    description: 'Magnifique villa contemporaine avec piscine à débordement et vue mer imprenable.',
    standing: 'Très Haut Standing',
    anneeConstruction: 2024,
    estLocation: false,
    commodites: ['Piscine', 'Vue mer', 'Jardin', 'Climatisation'],
    agentNom: 'Karim Trabelsi',
    agentTel: '+216 71 888 999',
  );

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: EcranDetails(propriete: testPropriete),
    );
  }

  group('Tests UI d\'interaction — Fiche détaillée du bien (EcranDetails)', () {
    testWidgets('1. Affichage des caractéristiques essentielles et du prix', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Villa de Luxe Test Hammamet'), findsOneWidget);
      expect(find.text('Yasmine Hammamet, Tunisie'), findsOneWidget);
      expect(find.text('750 000 DT'), findsOneWidget);
      expect(find.text('À Vendre'), findsOneWidget);
      expect(find.text('320 m²'), findsOneWidget);
    });

    testWidgets('2. Basculement du bouton favori', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final favButtonFinder = find.byIcon(Icons.favorite_border);
      expect(favButtonFinder, findsOneWidget);

      await tester.tap(favButtonFinder);
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets('3. Boutons d\'administration réservés au propriétaire connecté (Édition & Suppression)', (tester) async {
      AuthState.instance.setSession(
        user: const ClientUser(id: 1, fullName: 'Karim Trabelsi', email: 'owner@darlink.tn', role: 'PROPRIETAIRE'),
        token: 'fake_jwt_token',
      );

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.edit_note_rounded), findsOneWidget);
      expect(find.byIcon(Icons.delete_outline_rounded), findsOneWidget);

      await tester.tap(find.byIcon(Icons.delete_outline_rounded));
      await tester.pumpAndSettle();

      expect(find.text('Supprimer ce bien ?'), findsOneWidget);
      expect(find.text('Annuler'), findsOneWidget);
      expect(find.text('Supprimer'), findsOneWidget);

      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
      expect(find.text('Supprimer ce bien ?'), findsNothing);

      AuthState.instance.logout();
    });

    testWidgets('4. Boutons d\'administration masqués pour un non-propriétaire ou invité', (tester) async {
      AuthState.instance.logout();

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.edit_note_rounded), findsNothing);
      expect(find.byIcon(Icons.delete_outline_rounded), findsNothing);
    });

    testWidgets('5. Ouverture du formulaire modal de visite et saisie des champs', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final contactButton = find.text('Planifier une visite');
      expect(contactButton, findsOneWidget);
      await tester.tap(contactButton);
      await tester.pumpAndSettle();

      expect(find.text('Contacter l\'agent / Propriétaire'), findsOneWidget);
      expect(find.text('Envoyer la demande'), findsOneWidget);

      final messageField = find.widgetWithText(TextField, 'Votre message');
      expect(messageField, findsOneWidget);
      await tester.enterText(messageField, 'Visite souhaitée samedi à 10h');
      await tester.pumpAndSettle();

      await tester.tap(find.text('Envoyer la demande'));
      await tester.pumpAndSettle();

      expect(find.text('Demande de visite transmise et enregistrée dans Cloud Firestore !'), findsOneWidget);
    });

    testWidgets('6. Bouton d\'appel et lien téléphone natif pour contacter le propriétaire', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      final callButton = find.byKey(const Key('details_call_button'));
      await tester.ensureVisible(callButton);
      await tester.pumpAndSettle();
      expect(callButton, findsOneWidget);

      final phoneLink = find.byKey(const Key('details_phone_link'));
      expect(phoneLink, findsOneWidget);
      expect(find.text('+216 71 888 999'), findsOneWidget);

      await tester.tap(callButton);
      await tester.pumpAndSettle();

      await tester.tap(phoneLink);
      await tester.pumpAndSettle();
    });
  });
}
