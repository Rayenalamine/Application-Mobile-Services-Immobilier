# Application Mobile – Services Immobilier

Projet universitaire collaboratif de développement d'applications mobiles pour la recherche, la consultation et la publication d'annonces immobilières en Tunisie.

---

## 📌 Présentation du projet

Dans le cadre de notre cursus universitaire, notre groupe développe une solution mobile nommée **Services Immobilier**.

Afin d'étudier et comparer les technologies cross-platform modernes, le projet prévoit la réalisation de **deux applications distinctes** partageant le même périmètre métier :
1. **Application Flutter** (Dart / Material 3) : Version 1 (prototype fonctionnel achevé).
2. **Application React Native** (JavaScript/TypeScript) : planifiée pour les étapes suivantes.

---

## 📂 Structure du dépôt

Le dépôt est structuré de manière modulaire pour accueillir les deux environnements technologiques :

```text
Application-Mobile-Services-Immobilier/
├── .gitignore              # Règles d'exclusion Git pour Flutter, React Native et les IDE
├── CONTRIBUTING.md         # Guide de contribution pour les membres du groupe (forks, branches, PRs)
├── README.md               # Présentation générale du projet et organisation de l'équipe
├── docs/                   # Documentation globale et diagrammes d'architecture C4
├── flutter/                # Espace dédié à l'application mobile Flutter
│   └── services_immobilier_flutter/   # Projet Flutter (Version 1 achevée)
└── react-native/           # Espace réservé pour la future application React Native
```

---

## 📱 État d'avancement des versions

| Technologie | Répertoire | Version actuelle | État |
|---|---|---|---|
| **Flutter** | `flutter/services_immobilier_flutter/` | **Version 1** | ✅ Terminé et testé (0 erreur `flutter analyze`, tests unitaires passés) |
| **React Native** | `react-native/` | *À venir* | ⏳ En attente de démarrage |

Pour consulter les détails d'implémentation de la version Flutter (architecture C4 complète, fonctionnement du code, guide d'exécution et questions d'examen), reportez-vous au fichier dédié :  
👉 [`flutter/services_immobilier_flutter/README.md`](flutter/services_immobilier_flutter/README.md).

---

## 👥 Organisation du travail en groupe

Ce projet applique les bonnes pratiques professionnelles de collaboration via GitHub :
- **Dépôt central officiel :** `https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git`
- **Flux de travail :** Modèle Forking Workflow (Fork personnel → Branche de fonctionnalité → Pull Request).
- **Règle absolue :** Aucun push direct sur la branche `main`. Toutes les modifications sont examinées et fusionnées via des Pull Requests (PR) validées par le propriétaire du dépôt.

👉 **Avant toute contribution, veuillez lire attentivement le guide : [`CONTRIBUTING.md`](CONTRIBUTING.md)**.

