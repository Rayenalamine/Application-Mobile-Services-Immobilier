# ADR-002 — STRATÉGIE DE DÉVELOPPEMENT MOBILE EN PARALLÈLE

**Date :** 18 novembre 2026  
**Statut :** Accepté  
**Décideurs :** Équipe étudiante

---

## 1. CONTEXTE ET PROBLÉMATIQUE

Le projet impose de livrer deux applications mobiles distinctes (Flutter et React Native) offrant les mêmes fonctionnalités métier. Le risque principal est de développer entièrement une application (par exemple Flutter), puis de manquer de temps pour terminer l'autre avant la date limite du 26 novembre 2026.

---

## 2. DÉCISION

L'équipe adopte une approche de développement **strictement parallèle par fonctionnalité (Feature-based)** :
- Chaque version et chaque tâche est découpée pour avancer de front sur les deux technologies.
- Dès la Version 2, l'application React Native est initialisée pour rattraper le prototype Flutter V1.
- Pour chaque tâche mobile, un membre est assigné à Flutter, un membre à React Native, et le troisième à l'architecture transverse partagée (tokens, validation, tests).
- Aucune fonctionnalité métier n'est déclarée terminée si elle n'est pas opérationnelle sur les **deux** applications.

---

## 3. CONSÉQUENCES

- Garantie d'une parité visuelle et fonctionnelle constante.
- Détection immédiate des ambiguïtés dans les contrats d'API.
- Entraînement équitable des trois étudiants sur les deux frameworks grâce à la matrice de rotation continue.

