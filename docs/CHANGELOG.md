# JOURNAL DES MODIFICATIONS (CHANGELOG)

Toutes les modifications notables apportées au projet DarLink sont consignées chronologiquement dans ce document.

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
