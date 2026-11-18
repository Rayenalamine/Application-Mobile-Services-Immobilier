# GUIDE DU FLUX DE TRAVAIL GIT ET PULL REQUESTS (GIT WORKFLOW)

---

## 1. MODÈLE DE COLLABORATION (FORKING WORKFLOW)

- **Dépôt officiel (Upstream) :** `https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git`
- **Branche principale protégée :** `main`
- **Propriétaire du Dépôt :** Clone le dépôt officiel, crée des branches de fonctionnalités et soumet des PRs vers `main`.
- **Contributeurs (Membres sur Forks) :** Créent un Fork sur leur compte GitHub personnel, travaillent sur des branches de fonctionnalités sur leur fork, et soumettent des PRs vers le dépôt officiel `origin/main`.

---

## 2. RÈGLES DE NOMMAGE DES BRANCHES
Toute branche de travail est strictement dédiée à une tâche ou un correctif :
- Fonctionnalité : `feature/V<X>-T<YY>-<description-courte>` (ex: `feature/V2-T01-rn-init`)
- Correctif : `fix/V<X>-T<YY>-<description-courte>` (ex: `fix/V5-T01-property-cors`)

---

## 3. CHECKLIST AVANT DE SOUMETTRE UNE PULL REQUEST

Avant d'ouvrir une PR vers `main` :
- [ ] Aucun fichier sensible (.env, clés, mots de passe) n'est inclus.
- [ ] Aucun fichier généré non versionné (dossiers `build/`, `target/`, `.dart_tool/`, `node_modules/`) n'est présent.
- [ ] Les analyses statiques passent sans erreur (`flutter analyze`, `tsc --noEmit`).
- [ ] Les tests unitaires correspondants sont exécutés et réussis.
- [ ] La documentation de la tâche est complétée.
- [ ] La PR est relue et approuvée par au moins un autre membre de l'équipe avant fusion par le propriétaire.

