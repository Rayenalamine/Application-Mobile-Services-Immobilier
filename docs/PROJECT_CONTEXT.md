# CONTEXTE ET CHARTE DU PROJET DARLINK

**Projet :** DarLink — Application Mobile de Services Immobiliers en Tunisie  
**Cadre académique :** Mini Projet Défi — Université  
**Enseignant responsable :** M. Wahid Hamdi  
**Taille de l'équipe :** Exactement 3 étudiants : **Membre 1** (Propriétaire du Dépôt / Owner), **Membre 2** (Coéquipier 1 / Teammate 1), **Membre 3** (Coéquipier 2 / Teammate 2)  
**Date limite de livraison :** 26 novembre 2026  
**Dépôt officiel :** [https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git](https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git)

---

## 1. VISION DU PROJET

DarLink est une plateforme mobile immobilière moderne conçue pour le marché tunisien. Elle permet aux acquéreurs, locataires et propriétaires de :
- Consulter et rechercher des annonces de vente et location dans les villes tunisiennes (Tunis, Sousse, Djerba, etc.).
- Filtrer les biens par critères (ville, type de bien, budget en Dinars Tunisiens TND).
- Consulter les fiches détaillées et photographies des biens.
- Gérer leurs annonces et leurs biens favoris.
- Échanger directement avec les propriétaires.

---

## 2. PRINCIPES DIRECTEURS NON-NÉGOCIABLES

1. **Parité mobile Flutter / React Native :** Les deux applications mobiles sont développées en parallèle et offrent une expérience métier équivalente.
2. **Backend unique et partagé :** Un seul serveur Spring Boot 3 (Java 21) dessert les deux applications mobiles à travers des API REST conformes à la RFC 9457 (`application/problem+json`).
3. **Persistance PostgreSQL :** Une seule base de données relationnelle locale (`darlink_db`), versionnée rigoureusement via Flyway.
4. **Non-spécialisation permanente :** Aucun étudiant n'est assigné de manière statique à une seule technologie (aucun "spécialiste frontend" ni "spécialiste backend"). Les responsabilités tournent à chaque tâche.
5. **Participation tripartite obligatoire :** Chaque tâche comporte trois assignations techniques substantielles. Les trois membres doivent maîtriser l'ensemble de la chaîne technique pour la soutenance orale.
6. **Priorisation stricte de l'échéance du 26 novembre :** Le flux complet de bout en bout (`Mobiles` $\rightarrow$ `Spring Boot` $\rightarrow$ `PostgreSQL` $\rightarrow$ `Affichage des biens`) constitue le cœur absolu du MVP (P1). Aucune fioriture ou filtre complexe ne peut compromettre cette livraison.
7. **Rigueur et sincérité des vérifications :** Aucun test ou résultat d'exécution n'est consigné sans avoir été réellement exécuté dans l'environnement. Les environnements de test (Web vs Natif) sont rigoureusement distingués.

