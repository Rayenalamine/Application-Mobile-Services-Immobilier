# REGISTRE GÉNÉRAL DES TÂCHES DU PROJET (TASK REGISTER)

---

## 1. INVENTAIRE EXHAUSTIF DES TÂCHES DE LA VERSION 2 (V2)

Conformément au protocole de gouvernance et à la matrice de rotation tripartite, le tableau ci-dessous dresse l'état rigoureux de chaque sous-tâche de la Version 2, en distinguant strictement les responsabilités du **Membre 1 (Propriétaire du Dépôt)** de celles de ses coéquipiers **Membre 2** et **Membre 3**.

| ID Tâche | Périmètre & Description de la Tâche | Membre Assigné | Statut | Preuves Concrètes & Vérifications |
|---|---|---|---|---|
| **V2-T01** | Modularisation Flutter (Architecture propre `core`/`features`, préservation V1) | **Membre 1** | **COMPLETED** | Commit `99348a7`, 4 tests widgets passés, `flutter analyze` 0 issue, build web validé, branche `feature/V2-T01-member-1-flutter` poussée. |
| **V2-T01** | Initialisation React Native Expo TypeScript (`react-native/darlink_react_native/`) | Membre 2 | **NOT STARTED** | Dossier vide réservé (`.gitkeep`). En attente du Membre 2. |
| **V2-T01** | Spécification officielle des Design Tokens (`docs/DESIGN_SYSTEM.md`) | Membre 3 | **NOT STARTED** | Tokens provisoires documentés dans Flutter. En attente du Membre 3. |
| **V2-T02** | Spécification sémantique des thèmes & matrice de contraste WCAG AA | **Membre 1** | **COMPLETED** | Livrable [`docs/THEME_SPECIFICATION.md`](THEME_SPECIFICATION.md), 13 tests de contraste validés programmatiquement, commit `8d641a8`, branche `feature/V2-T02-member-1-theme-spec` poussée. |
| **V2-T02** | Implémentation Flutter des thèmes `AppTheme.light` et `AppTheme.dark` | Membre 2 | **NOT STARTED** | En attente de l'implémentation par le Membre 2. |
| **V2-T02** | Implémentation React Native `ThemeProvider` & `useAppTheme` | Membre 3 | **NOT STARTED** | En attente de l'implémentation par le Membre 3. |
| **V2-T03** | Composants UI React Native (`PropertyCard.tsx`, `PrimaryButton.tsx`, etc.) | **Membre 1** | **BLOCKED** | **Bloqué :** `react-native/darlink_react_native/` non initialisé (dépendance Membre 2 sur V2-T01) et protection stricte du périmètre. |
| **V2-T03** | Spécification des états UI (`docs/UI_COMPONENTS_SPEC.md`) | Membre 2 | **NOT STARTED** | En attente du Membre 2. |
| **V2-T03** | Widgets UI Flutter équivalents dans `lib/core/widgets/` | Membre 3 | **NOT STARTED** | En attente du Membre 3. |
| **V2-T04** | Barre de navigation Material 3 (4 onglets : Accueil, Recherche, Favoris, Profil) Flutter | **Membre 1** | **COMPLETED** | Composant `EcranNavigationPrincipale` (IndexedStack), 3 écrans créés, `main.dart` connecté, 9 tests de widgets passés (100%), `flutter analyze` 0 issue, build web validé. |
| **V2-T04** | Navigation par onglets React Native (`@react-navigation/bottom-tabs`) | Membre 2 | **NOT STARTED** | En attente du Membre 2. |
| **V2-T04** | Spécification du routage transverse & back button (`docs/NAVIGATION.md`) | Membre 3 | **NOT STARTED** | En attente du Membre 3. |

---

## 2. SYNTHÈSE DE LA CHARGE DU MEMBRE 1 SUR LA VERSION 2

Sur les 4 tâches composant la Version 2, l'état de responsabilité du **Membre 1** s'établit comme suit :
1. **V2-T01 (Membre 1 — Flutter) :** **COMPLETED** (Exécuté, audité, documenté, poussé sur remote).
2. **V2-T02 (Membre 1 — Architecture Transverse) :** **COMPLETED** (Spécifié, validé mathématiquement WCAG AA, documenté, poussé sur remote).
3. **V2-T03 (Membre 1 — React Native) :** **BLOCKED** (Bloqué légitimement par l'absence du projet React Native qui doit être initialisé par le Membre 2 dans V2-T01).
4. **V2-T04 (Membre 1 — Flutter) :** **COMPLETED** (NavigationBar Material 3 implémentée, écrans reliés, 9 tests validés, build web validé).

> **Conclusion sur le périmètre V2 du Membre 1 :**
> L'intégralité du travail autonome et exécutable assigné au Membre 1 pour la Version 2 est **100% achevé**. La seule tâche restante (V2-T03) est formellement bloquée en attente des livrables de ses coéquipiers.

---

## 3. TABLEAU DE SUIVI DES TÂCHES PAR VERSION DU PROJET GLOBAL

| ID Tâche | Titre & Description | Priorité | Rotation | Statut Global |
|---|---|---|---|---|
| **V1-T01** | Initialisation du prototype Flutter statique (4 annonces fictives) | P1 | - | ✅ **Terminé** |
| **V2-T01** | Initialisation React Native (TypeScript) & Structuration Modulaire | P1 | Rotation A | 🟡 En cours (M1 Terminé ✅) |
| **V2-T02** | Système de thèmes (Dark/Light) et Composants Typographiques | P1 | Rotation B | 🟡 En cours (M1 Terminé ✅) |
| **V2-T03** | Composants UI Atomes & Molécules (Boutons, Cartes, Squelettes) | P1 | Rotation C | ⏳ Bloqué / Planifié |
| **V2-T04** | Navigation Principale (BottomTabs) & Écran d'Accueil Paritaire | P1 | Rotation A | 🟡 En cours (M1 Terminé ✅) |
| **V3-T01** | Initialisation Spring Boot 3, Maven & Architecture en Couches | P1 | Rotation B | ⏳ Planifié |
| **V3-T02** | Démarrage PostgreSQL, DataSource HikariCP & Migration Flyway V1 | P1 | Rotation C | ⏳ Planifié |
| **V3-T03** | Spécification OpenAPI / Swagger UI & Gestion d'erreur RFC 9457 | P1 | Rotation A | ⏳ Planifié |
| **V5-T00** | Spécification & Approbation du Contrat d'API REST Biens Immobiliers | P1 | Tripartite | ⏳ Planifié |
| **V5-T01** | Entité Property, Données fictives Flyway & Consommation Mobile | P1 | Rotation B | ⏳ Planifié |
| **V5-T02** | Recherche Multicritère Simplifiée (Ville / Type) & Pagination | P1 | Rotation C | ⏳ Planifié |
| **V4-T01** | Modèle Utilisateur, Spring Security & Hachage BCrypt | P2 (Optionnel) | Rotation B | 💤 En attente |
| **V4-T02** | Filtre JWT & Stockage sécurisé du Token sur Mobile | P2 (Optionnel) | Rotation C | 💤 En attente |
| **V4-T03** | Endpoint `/users/me` et Écran Profil Utilisateur Mobile | P2 (Optionnel) | Rotation A | 💤 En attente |
| **V6-T01** | Écran Détails enrichi avec Galerie de photos & Appel direct | P2 (Optionnel) | Rotation A | 💤 En attente |
| **V6-T02** | Gestion des Favoris (Ajout, suppression, persistance) | P2 (Optionnel) | Rotation B | 💤 En attente |
| **V7–V13** | Tâches de la feuille de route post-académique (V7 à V13) | P3 (Futur) | - | 💤 En attente |
