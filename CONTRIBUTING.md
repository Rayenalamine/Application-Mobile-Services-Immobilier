# Guide de Contribution – Projet Services Immobilier

Ce document décrit le flux de travail Git et GitHub obligatoire pour tous les membres du groupe.

L'objectif est d'assurer une collaboration propre, sans conflits de code et avec une traçabilité claire de chaque fonctionnalité.

---

## 📋 Principes de base

1. **La branche `main` est protégée :** Personne ne développe ni ne pousse directement sur la branche `main` du dépôt d'origine.
2. **Modèle de Fork :** Chaque membre du groupe travaille sur son propre fork GitHub.
3. **Branches de fonctionnalité :** Chaque tâche ou fonctionnalité est développée sur une branche dédiée.
4. **Revue de code via Pull Request (PR) :** Toutes les contributions sont intégrées au projet principal via une Pull Request validée et fusionnée par le propriétaire du dépôt (`Rayenalamine`).

---

## 🚀 Guide étape par étape pour les membres du groupe

### Étape 1 : Créer votre Fork sur GitHub
1. Rendez-vous sur le dépôt officiel :  
   👉 `https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier`
2. En haut à droite de la page, cliquez sur le bouton **Fork**.
3. Confirmez pour créer une copie du dépôt sous votre propre compte GitHub (ex: `https://github.com/VOTRE_PSEUDO/Application-Mobile-Services-Immobilier`).

---

### Étape 2 : Cloner votre Fork sur votre machine
Ouvrez un terminal sur votre ordinateur et clonez **votre** fork (remplacez `VOTRE_PSEUDO` par votre nom d'utilisateur GitHub) :

```bash
git clone https://github.com/VOTRE_PSEUDO/Application-Mobile-Services-Immobilier.git
cd Application-Mobile-Services-Immobilier
```

Configurez ensuite le dépôt d'origine comme remote distant `upstream` (à faire une seule fois) :

```bash
git remote add upstream https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git
git remote -v
```

Vous devez voir deux remotes :
- `origin` : pointe vers votre fork personnel.
- `upstream` : pointe vers le dépôt officiel du groupe.

---

### Étape 3 : Créer une branche pour votre travail
Avant de commencer à coder, assurez-vous d'être à jour avec `upstream/main` et créez une nouvelle branche nommée d'après votre fonctionnalité :

```bash
# Se placer sur main et récupérer les dernières modifications
git checkout main
git pull upstream main

# Créer et basculer sur votre branche de travail
git checkout -b feature/nom-de-votre-fonctionnalite
```

*Exemples de noms de branches clairs :*
- `feature/flutter-filtres-recherche`
- `feature/react-native-init`
- `docs/diagramme-composants-v2`
- `fix/correction-affichage-prix`

---

### Étape 4 : Développer et tester localement
1. Travaillez sur vos fichiers dans le bon dossier (`flutter/` ou `react-native/`).
2. Testez systématiquement votre code :
   ```bash
   # Pour Flutter :
   cd flutter/services_immobilier_flutter
   flutter analyze
   flutter test
   ```
3. N'ajoutez pas de fichiers temporaires, de caches ou de binaires. Le fichier `.gitignore` à la racine s'en occupe automatiquement.

---

### Étape 5 : Enregistrer vos modifications (Commit)
Faites des commits réguliers avec des messages clairs en français :

```bash
git status
git add .
git commit -m "feat(flutter): ajout du filtre par ville sur l'écran d'accueil"
```

---

### Étape 6 : Pousser votre branche sur votre Fork
Envoyez votre branche sur votre fork GitHub (`origin`) :

```bash
git push -u origin feature/nom-de-votre-fonctionnalite
```

---

### Étape 7 : Ouvrir une Pull Request (PR)
1. Allez sur votre fork sur GitHub. Un bandeau jaune apparaît proposant **« Compare & pull request »**. Cliquez dessus.
2. Vérifiez bien les branches :
   - **Base repository :** `Rayenalamine/Application-Mobile-Services-Immobilier` (branche `main`)
   - **Head repository :** `VOTRE_PSEUDO/Application-Mobile-Services-Immobilier` (votre branche `feature/...`)
3. Donnez un titre explicite à votre PR et décrivez vos modifications :
   - Qu'avez-vous ajouté ou modifié ?
   - Les tests `flutter analyze` et `flutter test` passent-ils ?
4. Cliquez sur **« Create pull request »**.

---

### Étape 8 : Revue et fusion (par le responsable du dépôt)
- Le propriétaire du dépôt (`Rayenalamine`) examine le code proposé dans la PR.
- S'il y a des remarques, apportez les corrections sur votre branche locale et faites `git push origin feature/...` (la PR se mettra à jour automatiquement).
- Une fois approuvée, la PR est fusionnée dans `main`.

---

### Étape 9 : Mettre à jour votre fork après une fusion
Une fois votre PR (ou celle d'un camarade) fusionnée dans `main`, synchronisez votre fork :

```bash
git checkout main
git pull upstream main
git push origin main
```

Vous pouvez ensuite supprimer votre branche locale devenue inutile :
```bash
git branch -d feature/nom-de-votre-fonctionnalite
```

---

## ⚠️ Règles d'or à retenir

- ❌ **Ne jamais faire de push sur `upstream/main` directement.**
- ❌ **Ne jamais utiliser `git push --force`.**
- ❌ **Ne jamais committer de mots de passe, clés secrètes ou fichiers `local.properties`.**
- ✅ **Toujours exécuter les tests avant d'ouvrir une Pull Request.**
- ✅ **Toujours synchroniser votre branche avec `upstream main` avant de commencer.**
