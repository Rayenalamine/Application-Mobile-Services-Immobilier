# JOURNAL DES MODIFICATIONS (CHANGELOG)

Toutes les modifications notables apportées au projet DarLink sont consignées chronologiquement dans ce document.

---

## [8.2.0] - 2026-11-21

### Implémentation Complète V1–V13 End-to-End & Cartographie Réelle OpenStreetMap
- **Base de données & Migration Flyway V4 (`V4__messages_and_notifications.sql`) :**
  - Création de la table `messages` (`sender_id`, `receiver_id`, `property_id`, `content`, `created_at`, `is_read`) avec clés étrangères et index.
  - Création de la table `notifications` (`user_id`, `title`, `body`, `type`, `reference_id`, `is_read`, `created_at`) avec index.
  - Ajout des entités JPA `MessageEntity` et `NotificationEntity` avec chargement explicite EAGER et transactions sécurisées.
- **Backend Spring Boot 3.3.5 (Java 21) :**
  - Contrôleur de messagerie instantanée `MessageController` (`POST /api/v1/messages`, `GET /api/v1/messages/conversations`, `GET /api/v1/messages/conversation/{otherUserId}`, `PATCH /api/v1/messages/{id}/read`, `GET /api/v1/messages/unread-count`).
  - Contrôleur de notifications `NotificationController` (`GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`, `PATCH /api/v1/notifications/read-all`, `GET /api/v1/notifications/unread-count`).
  - Contrôleur d'administration et de modération `AdminController` (`GET /api/v1/admin/stats`, `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/role`).
  - Endpoint de changement de mot de passe sécurisé `POST /api/v1/users/me/change-password` avec validation de l'ancien mot de passe et hachage BCrypt.
  - Extension de la suite de tests JUnit 5 `FullWorkflowBackendTest` à 17 étapes couvrant l'ensemble du cycle de vie : 17/17 tests réussis (`BUILD SUCCESS`).
- **Cartographie Réelle OpenStreetMap (V8) sans Dépendance Native Défaillante :**
  - **Moteur Slippy Map Standard Web Mercator :** Remplacement de tout faux canvas/CustomPainter par un véritable moteur de rendu de tuiles raster OpenStreetMap (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
  - **Flutter (`map_screen.dart`) :** Formules mathématiques Web Mercator pures (`latToY`, `lngToX`, `sinh`), gestion du pan tactile par glissement, zoom avant/arrière (+/-), géolocalisation "Ma position" centrée sur Tunis, sélecteurs rapides par ville (Tunis, La Marsa, Sousse, Hammamet, Djerba, Sfax), épingles réelles issues de PostgreSQL avec pilule de prix et carte de sélection interactive. Attribution légale OpenStreetMap incluse.
  - **React Native (`MapScreen.tsx`) :** Implémentation paritaire en TypeScript avec `PanResponder`, grille de tuiles dynamiques OpenStreetMap, marqueurs GPS connectés à `propertyApiService.getMapProperties()` et carte glassmorphique flottante.
- **Gestion Réelle des Comptes et Authentification Strictement Sans Mock :**
  - Suppression intégrale des sessions fictives en dur ("Rayen Lamine"). L'application démarre déconnectée par défaut.
  - Flux complets d'inscription (`register`), de connexion (`login`), de déconnexion (`logout`), d'édition de profil et de changement de mot de passe reliés directement à l'API Spring Boot et à la base PostgreSQL 18.
  - Écran de profil dynamique : carte d'authentification lorsque déconnecté ; avatar monogramme, statut de rôle, liste des annonces publiées avec suppression réelle, et paramètres lorsque connecté.
- **Moteur de Recherche Dynamique et Filtres Multi-Critères (V5) :**
  - Recherche textuelle dynamique avec debounce.
  - Filtre de budget par RangeSlider interactif (0 à 1 500 000 DT).
  - Filtres multi-critères : type de transaction (Vente/Location), type de bien (Villa, Appartement, etc.), gouvernorat/ville, et nombre de chambres.
  - Absence totale de repli vers des données factices : affichage d'un état vide propre et informatif en cas d'absence de résultat.
- **Validation Complète & Assurance Qualité (QA) :**
  - **17/17** tests Maven JUnit 5 réussis.
  - **0** avertissement ni erreur `flutter analyze`.
  - **30/30** tests de widgets Flutter passés avec succès (`100% All tests passed`).
  - **0** erreur de compilation TypeScript (`tsc --noEmit`).
  - **22/22** tests unitaires et d'intégration React Native réussis (`100% SUCCESS`).
  - **10/10** parcours de bout en bout validés en direct sur PostgreSQL (`scripts/e2e_journeys_1_to_10.ps1`).

---

## [8.1.0] - 2026-11-19

### Finalisation Full-Stack End-to-End & Validation de Soutenance (V8)
- **Base de données & Migration Flyway V3 :**
  - Ajout de la colonne `owner_id` avec contrainte de clé étrangère sur `users(id)` dans `properties`.
  - Création de la table `property_images` (`property_id`, `image_url`, `is_primary`).
  - Création de la table `contact_requests` (`property_id`, `sender_id`, `sender_name`, `sender_email`, `sender_phone`, `message`, `status`).
  - Ajout des index de performance (`idx_properties_owner`, `idx_property_images_property`, `idx_contact_requests_property`, `idx_contact_requests_sender`, `idx_contact_requests_status`).
- **Backend Spring Boot 3.3.5 :**
  - CRUD complet avec vérification stricte de propriété (`PropertyService.updateProperty`, `PropertyService.deleteProperty`) levant `ForbiddenException` (`HTTP 403 Forbidden` standardisé RFC 9457) si un non-propriétaire tente une altération.
  - Ajout du contrôleur `UserController` (`/api/v1/users/me`, `/api/v1/users/me/properties`, `/api/v1/users/me/favorites`).
  - Ajout du contrôleur `ContactRequestController` (`POST /api/v1/contact-requests`, `GET /api/v1/contact-requests/received`, `GET /api/v1/contact-requests/sent`, `PATCH /api/v1/contact-requests/{id}/status`).
  - Service de stockage local de photos `FileStorageService` et mapping `/uploads/**`.
  - Suite de tests `FullWorkflowBackendTest` (11 étapes ordonnées couvrant l'ensemble du cycle de vie). Total JUnit 5 : 13/13 tests réussis.
- **Frontend Flutter :**
  - Support de l'édition et suppression de bien pour le propriétaire légitime sur `PropertyDetailsScreen`.
  - Formulaire de demande de contact et de visite persistant dans la base de données.
  - Synchronisation de l'écran des favoris avec la base de données (cartes cliquables et état vide).
  - Modal d'édition des coordonnées dans le profil et consultation des demandes de visite reçues.
  - 13/13 tests Flutter validés, `flutter analyze` 0 issue.
- **Frontend React Native Expo :**
  - Parité stricte TypeScript : suppression de bien, demande de visite avec modal persistant, édition du profil.
  - Affichage dynamique des favoris avec pull-to-refresh et transition fluide vers les détails.
  - 0 erreur TypeScript (`tsc --noEmit`), bundler Metro opérationnel.
- **Outillage & Automatisation :**
  - `docker-compose.yml` pour le service PostgreSQL 18.
  - `.env.example` complet pour le projet et chaque sous-projet.
  - Script de test automatisé des 6 flux réels `scripts/e2e_live_test.ps1`.
  - Rapport académique complet `docs/RAPPORT_DEFENSE_ACADEMIQUE.md`.

## [2.0.0 à 8.0.0] - 2026-11-19

### V8.0.0 - Cartographie Interactive & Géolocalisation GPS (V8)
- **Backend Spring Boot :** Endpoint `GET /api/v1/properties/map` fournissant les coordonnées GPS complètes (latitude, longitude, ville, prix, image) pour l'ensemble des annonces en Tunisie.
- **Flutter :** Écran `EcranCarteInteractive` (`lib/features/map/presentation/screens/map_screen.dart`) avec repères cartographiques (Golfe de Tunis, Sahel, Djerba), pins interactifs avec badges de prix, et carte aperçu flottante au clic menant vers la vue détaillée.
- **React Native :** Écran `MapScreen.tsx` avec quadrillage stylisé, sélecteur de villes (Tunis, Sousse, Hammamet, Djerba, Monastir), pins animés et prévisualisation glassmorphique.

### V7.0.0 - Dépôt d'Annonce Immobilière & Multi-Critères (V7)
- **Backend Spring Boot :** Endpoint `POST /api/v1/properties` avec validation bean (`@Valid`), génération d'identifiant et persistance dans PostgreSQL `darlink_db`.
- **Flutter :** Écran `EcranAjouterPropriete` (`add_property_screen.dart`) avec saisie de titre, loyer/prix, surface, compteurs de chambres/salles de bain, sélecteur de ville et tags de commodités (Piscine, Vue mer, Climatisation, etc.).
- **React Native :** Écran `AddPropertyScreen.tsx` paritaire avec formulaire fluide, validation réactive et ajout immédiat dans le catalogue.

### V6.0.0 - Persistance & Synchronisation des Favoris (V6)
- **Backend Spring Boot :** Contrôleur `FavoriteController` (`POST /api/v1/favorites/{id}`, `DELETE /api/v1/favorites/{id}`, `GET /api/v1/favorites/ids`) avec entité `FavoriteEntity` liée aux utilisateurs et propriétés.
- **Flutter & React Native :** `FavoritesApiService` assurant la persistance locale hors-ligne et la synchronisation avec le serveur REST.

### V5.0.0 - API REST des Propriétés & Filtrage Dynamique (V5)
- **Backend Spring Boot :** `PropertyController` avec spécification JPA dynamique (`JpaSpecificationExecutor`) permettant le filtrage combiné par ville, type de bien, prix minimum, prix maximum et recherche textuelle insensible à la casse.
- **Base de données :** Migration Flyway `V2__seed_properties.sql` insérant des données réalistes de biens d'exception tunisiens avec images Unsplash HD.

### V4.0.0 - Sécurité JWT & Profil Client Épuré (V4)
- **Backend Spring Boot :** Authentification stateless JWT avec `JwtUtil`, `JwtAuthenticationFilter`, mot de passe haché par `BCryptPasswordEncoder`, et endpoints `/api/v1/auth/register` & `/api/v1/auth/login`.
- **Mobile :** Nettoyage complet des vues de profil (suppression des mentions académiques/enseignants), adoption d'un profil client professionnel avec monogramme d'initiales (« RL ») et gestion de session.

### V3.0.0 - Socle Backend Spring Boot 3 & PostgreSQL 18 (V3)
- **Architecture :** Création du backend Java 21 / Spring Boot 3.3.5 dans `backend/darlink-backend/` sur le port non conflictuel `8085`.
- **Base de données :** Initialisation du serveur PostgreSQL 18 avec la base `darlink_db`, pool de connexions HikariCP et migrations automatisées Flyway `V1__init_schema.sql`.
- **Standardisation :** Implémentation du format d'erreur RFC 9457 (`ProblemDetailResponse`), contrôleur de santé `/api/v1/health` et documentation interactive Swagger UI `/swagger-ui/index.html`.
- **Tests :** Suite de tests Maven JUnit 5 validée à 100% avec base H2 in-memory.

### V2.0.0 - Refonte UI Haut Standing & Parité Complète (V2)
- **Design :** Nouvelle identité visuelle ultra-moderne inspirée des références de luxe : design Clair (Blanc Luxe) par défaut, bascule réactive vers un Mode Sombre haute précision, composants glassmorphism transparents avec micro-bordures et ombres douces.
- **Double Navigation :** Barre de navigation Material 3 sur Flutter et barre paritaire sur React Native (4 onglets : Accueil, Recherche, Favoris, Profil).
- **Validation :** 13 tests de widgets Flutter passés avec succès (100%), 0 avertissement `flutter analyze`, 0 erreur TypeScript React Native.

---

## [1.0.0] - 2026-11-11

### Ajouté
- Prototype fonctionnel initial Version 1 en Flutter dans `flutter/services_immobilier_flutter/`.
- Écran d'accueil affichant 4 biens immobiliers fictifs situés en Tunisie (Tunis, Sousse, Djerba).
- Écran de détails d'une annonce avec bouton de retour.
