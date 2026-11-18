# LEXIQUE DU PROJET (GLOSSARY)

Ce lexique définit la terminologie métier, technique et méthodologique employée dans le projet DarLink.

---

### Termes Méthodologiques & Organisationnels
- **Approval Gate (Porte d'approbation) :** Point d'arrêt obligatoire où l'assistant ou le développeur doit obtenir l'autorisation explicite du propriétaire du projet avant de modifier le code ou de créer des fichiers applicatifs.
- **Definition of Done (DoD) :** Ensemble de critères vérifiables et obligatoires (compilation, tests, documentation, revue tripartite) sans lesquels une tâche ne peut pas être déclarée terminée.
- **Mob Programming :** Pratique collaborative où les 3 étudiants travaillent ensemble sur un même écran avec rotation des rôles (Conducteur / Navigateur / Vérificateur).
- **Rotation Tripartite :** Mécanisme d'affectation garantissant qu'aucun étudiant n'est spécialisé à titre permanent (Rotations A, B, C alternant Flutter, React Native et Backend).

---

### Termes Techniques & Architecturaux
- **API-First :** Pratique de conception consistant à spécifier, formaliser et faire approuver les contrats d'API REST (endpoints, structures JSON, statuts HTTP) avant d'écrire la moindre ligne de code client ou serveur.
- **Design Tokens :** Valeurs fondamentales et atomiques de design (codes couleurs hexadécimaux, échelles de typographie, espacements en pixels) partagées à l'identique entre Flutter et React Native.
- **Flyway :** Outil de migration et de versionnement de base de données relationnelle exécutant des scripts SQL ordonnés (`V1__...sql`, `V2__...sql`) au démarrage de Spring Boot.
- **HikariCP :** Gestionnaire de pool de connexions JDBC haute performance utilisé par défaut par Spring Boot pour optimiser les accès à PostgreSQL.
- **RFC 9457 :** Norme internationale définissant le format standardisé des détails d'erreur pour les API HTTP (`application/problem+json`), rendant obsolète la précédente RFC 7807.
- **Swagger / OpenAPI :** Standard de description des API REST permettant la documentation interactive et l'exploration des endpoints via une interface Web (`/swagger-ui.html`).

---

### Termes Métier (Immobilier Tunisien)
- **Bien Immobilier / Property :** Entité représentant un logement proposé sur la plateforme (Appartement, Maison, Villa).
- **Dinar Tunisien (TND) :** Monnaie légale utilisée pour l'affichage et le stockage des prix des biens immobiliers.
- **Données de démonstration et de test :** Les 4 annonces fictives initiales situées en Tunisie (Tunis, Sousse, Djerba) servant d'échantillon de test pour valider l'affichage et la persistance.

