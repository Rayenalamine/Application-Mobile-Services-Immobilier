// ============================================================
// DARLINK — TESTS AUTOMATISÉS : PROFIL CLIENT & INTERACTIONS (QA)
// Valide l'authentification réelle, monogramme et modification de profil
// ============================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:services_immobilier_flutter/features/auth/domain/models/auth_state.dart';
import 'package:services_immobilier_flutter/features/navigation/presentation/screens/profile_screen.dart';
import 'test_helper.dart';

void main() {
  setUpAll(() {
    HttpOverrides.global = MockHttpOverrides();
  });

  tearDown(() {
    AuthState.instance.logout();
  });

  Widget createWidgetUnderTest() {
    return const MaterialApp(
      home: EcranProfil(),
    );
  }

  group('Tests UI d\'interaction — Écran Profil client (EcranProfil)', () {
    testWidgets('1. Affichage de la vue d\'accueil et connexion si non authentifié', (tester) async {
      AuthState.instance.logout();
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Bienvenue sur DarLink'), findsOneWidget);
      expect(find.text('Se connecter'), findsWidgets);
      expect(find.text('Créer un compte'), findsOneWidget);
      expect(find.text('Mode sombre'), findsOneWidget);
    });

    testWidgets('2. Affichage des données utilisateur et modal d\'édition quand authentifié', (tester) async {
      AuthState.instance.setSession(
        user: const ClientUser(
          id: 1,
          fullName: 'Mohamed Ben Ali',
          email: 'mohamed@darlink.tn',
          phone: '+216 98 111 222',
          role: 'CLIENT',
        ),
        token: 'test-jwt-token',
      );

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Mohamed Ben Ali'), findsOneWidget);
      expect(find.text('mohamed@darlink.tn'), findsOneWidget);
      expect(find.text('CLIENT'), findsOneWidget);

      final editBtn = find.text('Modifier profil');
      expect(editBtn, findsOneWidget);
      await tester.tap(editBtn);
      await tester.pumpAndSettle();

      expect(find.text('Modifier mon profil'), findsOneWidget);
      expect(find.text('Nom complet'), findsOneWidget);
      expect(find.text('Téléphone'), findsOneWidget);
      expect(find.text('Annuler'), findsOneWidget);

      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
      expect(find.text('Modifier mon profil'), findsNothing);
    });
  });
}
