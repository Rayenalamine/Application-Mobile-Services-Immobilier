# RELATIONS ET CARDINALITÉS DE LA BASE (DATABASE RELATIONSHIPS)

---

## 1. MODÈLE ENTITÉ-ASSOCIATION (CIBLE MVP ET EXTENSIONS)

```mermaid
erDiagram
    PROPERTIES {
        bigint id PK
        varchar title
        text description
        varchar location
        numeric price
        varchar type
        varchar image_url
        int bedrooms
        int bathrooms
        numeric surface_m2
        timestamp created_at
    }

    USERS {
        bigint id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar phone
        varchar role
        timestamp created_at
    }

    FAVORITES {
        bigint id PK
        bigint user_id FK
        bigint property_id FK
        timestamp created_at
    }

    USERS ||--o{ PROPERTIES : "publie (P3)"
    USERS ||--o{ FAVORITES : "enregistre (P2)"
    PROPERTIES ||--o{ FAVORITES : "est favori de (P2)"
```

---

## 2. EXPLICATION DES CARDINALITÉS

- **Pour le MVP P1 (Version 5) :** La table `properties` fonctionne de manière autonome avec les 4 biens fictifs de démonstration.
- **Pour l'extension P2 (Version 6) :** Un utilisateur peut enregistrer zéro, un ou plusieurs biens en favoris (`1:N`). Un bien immobilier peut être mis en favori par zéro, un ou plusieurs utilisateurs (`1:N`). La table de liaison `favorites` garantit l'unicité du couple `(user_id, property_id)`.

