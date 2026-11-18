# ADR-003 — BACKEND UNIQUE SPRING BOOT 3 ET POSTGRESQL

**Date :** 18 novembre 2026  
**Statut :** Accepté  
**Décideurs :** Équipe étudiante

---

## 1. CONTEXTE ET PROBLÉMATIQUE

Le projet nécessite une couche de persistance centralisée pour gérer les annonces immobilières, les utilisateurs et les transactions futures. Nous devions choisir entre une solution Backend-as-a-Service (ex : Firebase, Supabase) ou un backend dédié (Spring Boot / PostgreSQL).

---

## 2. DÉCISION

L'équipe a choisi de construire un backend sur mesure avec **Java 21 / Spring Boot 3.3.x et PostgreSQL** :
- Le serveur est hébergé localement sur le port `8080`.
- La persistance s'appuie sur Spring Data JPA et le pool de connexions HikariCP.
- Le schéma de la base `darlink_db` est versionné avec **Flyway** (`db/migration/V...sql`).
- La documentation interactive est générée automatiquement avec `springdoc-openapi`.
- Les erreurs respectent le standard **RFC 9457** (`application/problem+json`).

---

## 3. CONSÉQUENCES

- **Avantages :**
  - Maîtrise totale des schémas relationnels, des contraintes d'intégrité et des transactions ACID.
  - Indépendance vis-à-vis de services cloud propriétaires ou payants.
  - Valorisation académique maximale pour le jury universitaire.
- **Contraintes :**
  - Nécessite d'exécuter localement le service PostgreSQL (`postgresql-x64-18`) et de configurer adéquatement les paramètres de connectivité réseau pour les appareils mobiles.

