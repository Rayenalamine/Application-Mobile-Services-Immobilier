# AI_ONBOARDING — GUIDE D'ACCUEIL POUR NOUVEL ASSISTANT IA

> [!IMPORTANT]
> **RÈGLE FONDAMENTALE :** Avant de modifier le moindre fichier ou de répondre à une requête de code, tout nouvel assistant IA doit impérativement lire le présent fichier ainsi que [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md), [`PROJECT_STATUS.md`](PROJECT_STATUS.md), [`WORK_PROTOCOL.md`](WORK_PROTOCOL.md) et la spécification de la tâche active dans `docs/TASKS/`. Ne présumez jamais de l'historique de conversation précédent.

---

## 1. IDENTITÉ ET CADRE DU PROJET

- **Nom du projet :** DarLink — Application Mobile de Services Immobiliers en Tunisie.
- **Cadre académique :** Mini Projet Défi — Développement Mobile (Enseignant : M. Wahid Hamdi).
- **Date limite de livraison :** 26 novembre 2026.
- **Dépôt officiel GitHub :** `https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git`.
- **Organisation de l'équipe :** Exactement 3 étudiants : **Membre 1** (Propriétaire du Dépôt / Repository Owner), **Membre 2** (Coéquipier 1 / Teammate 1), et **Membre 3** (Coéquipier 2 / Teammate 2). Cette cartographie officielle est formalisée dans [`docs/TEAM_ROLES.md`](TEAM_ROLES.md).

---

## 2. ARCHITECTURE GLOBALE ET MULTI-PROJETS

Le projet est constitué de **deux applications mobiles distinctes** partageant **un backend unique** et **une base de données relationnelle unique** :
1. **Application Mobile Flutter :** `flutter/services_immobilier_flutter/` (Dart / Material 3).
2. **Application Mobile React Native :** `react-native/darlink_react_native/` (TypeScript / Expo - *planifiée*).
3. **Backend partagé :** `backend/darlink-backend/` (Java 21 / Spring Boot 3 / Maven - *planifié*).
4. **Base de données relationnelle :** PostgreSQL (service `postgresql-x64-18`, base `darlink_db` - *planifiée*).

---

## 3. ÉTAT RÉEL DU DÉPÔT (EXISTANT VS PLANIFIÉ)

| Répertoire / Fichier | Statut réel vérifié | Description |
|---|---|---|
| `flutter/services_immobilier_flutter/` | **EXISTE ET OPÉRATIONNEL** | Prototype V1 terminé, testé et documenté (~380 lignes de code Dart, 4 biens fictifs). |
| `docs/` | **EXISTE ET OPÉRATIONNEL** | Registre documentaire officiel du projet. |
| `react-native/` | **PLANIFIÉ** | Ne contient actuellement qu'un marqueur `.gitkeep`. Le projet `darlink_react_native` n'est pas encore initialisé. |
| `backend/` | **PLANIFIÉ** | Répertoire non encore créé. Le projet `darlink-backend` sera initialisé en Version 3. |
| `.gitignore`, `CONTRIBUTING.md`, `README.md` | **EXISTE** | Configuration racine du dépôt Git. |

---

## 4. LES TROIS RÈGLES D'OR DE DÉVELOPPEMENT

1. **Règle tripartite et rotation continue :**
   Toute tâche de développement comporte obligatoirement **trois assignations techniques substantielles** (Membre 1, Membre 2, Membre 3). Aucune tâche ne peut être confiée à un membre unique ni comporter une assignation purement superficielle (ex: "rédiger la doc"). Les rôles tournent à chaque tâche (Rotations A, B, C).
2. **Démarche API-First stricte :**
   Avant toute implémentation cliente ou serveur d'une ressource métier, le contrat d'API doit être formellement rédigé dans [`docs/API/API_CONTRACTS.md`](API/API_CONTRACTS.md), respectant la **RFC 9457** (`application/problem+json`) pour les erreurs et soumis à l'approbation du propriétaire.
3. **Porte d'approbation et arrêt systématique :**
   L'assistant présente la planification d'une tâche, attend l'autorisation explicite du propriétaire, implémente uniquement l'assignation autorisée, exécute et consigne les tests réels, met à jour la documentation, puis **S'ARRÊTE COMPLÈTEMENT**. Il est strictement interdit d'enchaîner sur la tâche suivante sans une nouvelle instruction explicite.

---

## 5. WORKFLOW GIT

- Le propriétaire du dépôt travaille sur le dépôt officiel via des branches de fonctionnalités `feature/V<X>-T<YY>-<sujet>` et des Pull Requests vers `main`.
- Les deux autres membres travaillent sur leurs **Forks personnels**, créent des branches de fonctionnalités et soumettent des Pull Requests vers `main` du dépôt officiel.
- **Règle absolue :** Aucun push direct sur la branche `main`.

---

## 6. OU CONSULTER L'ÉTAT DU PROJET ?

- Pour connaître la version, le sprint et la tâche active : [`docs/PROJECT_STATUS.md`](PROJECT_STATUS.md).
- Pour lire le compte-rendu de la dernière intervention : [`docs/HANDOFF/CURRENT_HANDOFF.md`](HANDOFF/CURRENT_HANDOFF.md).
- Pour le détail des protocoles de travail : [`docs/WORK_PROTOCOL.md`](WORK_PROTOCOL.md).

