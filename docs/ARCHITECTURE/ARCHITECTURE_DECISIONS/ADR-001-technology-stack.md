# ADR-001 — CHOIX DE LA PILE TECHNOLOGIQUE DU PROJET DARLINK

**Date :** 18 novembre 2026  
**Statut :** Accepté  
**Décideurs :** Équipe étudiante & Enseignant (M. Wahid Hamdi)

---

## 1. CONTEXTE ET PROBLÉMATIQUE

Dans le cadre du mini-projet défi académique, l'équipe doit concevoir une solution mobile complète pour la recherche et la publication de services immobiliers. L'objectif pédagogique est double :
- Comparer de manière empirique les deux technologies mobiles cross-platform majeures du marché : **Flutter** et **React Native**.
- Construire un backend robuste, typé et professionnel connecté à une base relationnelle standardisée.

---

## 2. DÉCISION

La pile technologique suivante est formellement arrêtée :
1. **Mobile 1 :** Flutter (Dart 3 / Material 3).
2. **Mobile 2 :** React Native (TypeScript / Expo).
3. **Backend :** Java 21 LTS avec Spring Boot 3.3.x et Maven.
4. **Base de données :** PostgreSQL (service local versionné via Flyway).
5. **Gestion d'erreur HTTP :** Norme RFC 9457 (`application/problem+json`).

---

## 3. CONSÉQUENCES ET AVANTAGES

- **Points positifs :**
  - Respect strict des consignes universitaires.
  - Découpage net entre la logique client et le traitement serveur.
  - Maîtrise d'un écosystème d'entreprise très recherché sur le marché du travail (Spring Boot + PostgreSQL + Flutter/React Native).
- **Points d'attention / Risques :**
  - Nécessite de maintenir deux applications mobiles en parfaite synchronisation fonctionnelle.
  - Rigueur absolue sur la spécification des contrats d'API (approche API-First).

