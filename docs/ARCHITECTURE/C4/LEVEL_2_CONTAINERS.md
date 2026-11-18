# C4 NIVEAU 2 — DIAGRAMME DES CONTENEURS (CONTAINER DIAGRAM)

Un conteneur au sens C4 représente une unité logicielle exécutable de manière autonome (application mobile, serveur web, base de données).

---

## 1. DIAGRAMME C4 DES CONTENEURS (CIBLE MVP P1)

```mermaid
flowchart TD
    User["👤 Utilisateur Mobile"]

    subgraph DarLink_System ["Système DarLink"]
        FL["📱 Application Mobile Flutter<br>[Conteneur : Dart / Flutter / Material 3]<br>flutter/services_immobilier_flutter/<br><i>(Existant et opérationnel)</i>"]
        RN["📱 Application Mobile React Native<br>[Conteneur : TypeScript / React Native / Expo]<br>react-native/darlink_react_native/<br><i>(Planifié en V2)</i>"]
        
        API["⚙️ API REST Backend<br>[Conteneur : Java 21 / Spring Boot 3]<br>backend/darlink-backend/<br><i>(Planifié en V3)</i>"]
        
        DB[("🗄️ Base de Données Relationnelle<br>[Conteneur : PostgreSQL 18]<br>Base 'darlink_db'<br><i>(Planifié en V3)</i>")]
    end

    EXT["☁️ CDN Images (Unsplash)<br>[Système Externe]"]

    User -- "Interagit avec l'interface native" --> FL
    User -- "Interagit avec l'interface native" --> RN
    FL -- "Appels REST HTTPS / JSON (RFC 9457)" --> API
    RN -- "Appels REST HTTPS / JSON (RFC 9457)" --> API
    API -- "Requêtes SQL via JDBC / HikariCP" --> DB
    FL -.-> EXT
    RN -.-> EXT
```

---

## 2. INVENTAIRE DES CONTENEURS ET STATUT RÉEL

| Conteneur | Technologie | Emplacement dépôt | Statut dans le projet |
|---|---|---|---|
| **App Mobile Flutter** | Dart 3 / Flutter 3.47 / Material 3 | `flutter/services_immobilier_flutter/` | ✅ **Existant (V1 achevée)** |
| **App Mobile React Native** | TypeScript / React Native / Expo | `react-native/darlink_react_native/` | ⏳ **Planifié (Version 2)** |
| **API REST Backend** | Java 21 / Spring Boot 3 / Maven | `backend/darlink-backend/` | ⏳ **Planifié (Version 3)** |
| **Base de Données** | PostgreSQL 18 / Migrations Flyway | Service local `postgresql-x64-18` | ⏳ **Planifié (Version 3)** |

> [!NOTE]
> En Version 1, l'application Flutter s'exécute de manière autonome avec des données statiques en mémoire. Ce diagramme représente la cible architecturale du MVP P1 intégrant le backend et la base PostgreSQL.

