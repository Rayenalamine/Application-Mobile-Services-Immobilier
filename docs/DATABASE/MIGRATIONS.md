# REGISTRE DES MIGRATIONS FLYWAY (MIGRATIONS)

Toutes les évolutions du schéma PostgreSQL sont gérées exclusivement à travers des scripts Flyway ordonnés stockés dans `backend/darlink-backend/src/main/resources/db/migration/`.

---

## 1. HISTORIQUE ET PLAN DES MIGRATIONS

| Version Flyway | Fichier SQL | Description du changement | Version projet | Statut |
|---|---|---|---|---|
| `V1` | `V1__init_schema.sql` | Baseline et initialisation des extensions (ex: `uuid-ossp`) | Version 3 | ⏳ Planifié |
| `V2` | `V2__create_property_table.sql` | Création de la table `properties` et insertion des 4 annonces fictives de test | Version 5 | ⏳ Planifié |
| `V3` | `V3__create_users_table.sql` | Création de la table `users` pour l'authentification | Version 4 (P2) | 💤 En attente |
| `V4` | `V4__create_favorites_table.sql` | Création de la table `favorites` | Version 6 (P2) | 💤 En attente |

---

## 2. RÈGLES DE MIGRATION STRICTES
1. **Immutabilité :** Un script Flyway déjà exécuté sur une base ne doit jamais être modifié. Toute modification ultérieure passe par une nouvelle version (`V3__...`, `V4__...`).
2. **Reproductibilité :** Chaque script doit pouvoir s'exécuter sur une base PostgreSQL vierge sans intervention manuelle.

