# JOURNAL DES MODIFICATIONS (CHANGELOG)

Toutes les modifications notables apportées au projet DarLink sont consignées chronologiquement dans ce document.

---

## [Non publié] - 2026-11-18

### Ajouté
- **Tâche V2-T04 (Assignation Membre 1) :** Implémentation de la barre de navigation inférieure Material 3 (`NavigationBar`) dans l'application Flutter (`flutter/services_immobilier_flutter/lib/features/navigation/presentation/screens/main_navigation_screen.dart`).
- **Tâche V2-T04 (Assignation Membre 1) :** Création de 3 nouveaux écrans modulaires : `search_screen.dart` (recherche multicritère avec puces et filtres), `favorites_screen.dart` (état vide stylisé des favoris), et `profile_screen.dart` (profil utilisateur invité et métadonnées académiques).
- **Tâche V2-T04 (Assignation Membre 1) :** Création de la suite de tests de navigation `test/navigation_test.dart` (5 tests de widgets vérifiant la navigation et la persistance des états via `IndexedStack`, portant le total à 9 tests réussis).
- **Tâche V2-T02 (Assignation Membre 1) :** Spécification officielle et mathématique des thèmes (clair et sombre) et de la typographie dans `docs/THEME_SPECIFICATION.md` avec vérification de 13 ratios de contraste WCAG 2.1 AA (> 4.5:1).
- **Tâche V2-T01 (Assignation Membre 1) :** Refactorisation modulaire complète de l'application Flutter `flutter/services_immobilier_flutter/` (`core/constants/app_colors.dart`, `app_spacing.dart`, modèle `Propriete`, mock data, `property_card.dart`, `home_screen.dart`, `property_details_screen.dart`).
- Suite de tests de widgets Flutter enrichie dans `test/widget_test.dart` (4 tests comportementaux passés à 100%).
- Création du socle documentaire officiel unifié dans `docs/` (`PROJECT_CONTEXT.md`, `PROJECT_STATUS.md`, `WORK_PROTOCOL.md`, `AI_ONBOARDING.md`, `TEAM_ROLES.md`, `DEVELOPMENT_METHODOLOGY.md`, `VERSION_ROADMAP.md`, `TASK_REGISTER.md`).
- Définition de la tâche obligatoire API-First `V5-T00` pour la validation préalable des contrats d'API.
- Adoption de la norme RFC 9457 (`application/problem+json`) pour le format standardisé des erreurs.
- Clarification des environnements de test (Web vs Expo Go vs Émulateur Android vs Build natif).

### Corrigé
- Ajustement du défilement dans les tests de widgets Flutter (`test/widget_test.dart`) pour garantir l'interaction avec le bouton "Voir détails" en présence de la barre de navigation Material 3 dans le viewport 800x600 px.
- Révision de la tâche V3-T02 : suppression des modèles prématurés `audit.ts` et `audit.dart`, recentrage sur la configuration PostgreSQL, DataSource HikariCP, migration Flyway, test d'intégration Spring Boot et spécification réseau locale.
- Clarification de la séparation entre Propriétaire du dépôt et numérotation des membres (Membres 1, 2, 3).
- Qualification exacte des 4 annonces initiales en "4 biens fictifs utilisés comme données de démonstration et de test".
- Détection et consignation de l'état réel des outils physiques (Flutter 3.47.5 opérationnel, Java 21 opérationnel, Maven 3.9.6 opérationnel, Node v22.20.0 opérationnel, PostgreSQL service Windows arrêté, Android SDK cmdline-tools manquants).

---

## [1.0.0] - 2026-11-11

### Ajouté
- Prototype fonctionnel initial Version 1 en Flutter dans `flutter/services_immobilier_flutter/`.
- Écran d'accueil affichant 4 biens immobiliers fictifs situés en Tunisie (Tunis, Sousse, Djerba).
- Écran de détails d'une annonce avec bouton de retour.
- Images distantes Unsplash avec widgets de chargement et fallback en cas d'erreur.
- Test unitaire de widget vérifié dans `test/widget_test.dart` (1/1 passé).
- Documentation C4 complète et 20 questions/réponses d'examen dans `flutter/services_immobilier_flutter/README.md`.
