# SCHÉMA DE LA BASE DE DONNÉES POSTGRESQL (DATABASE SCHEMA)

**Nom de la base relationnelle :** `darlink_db`  
**Moteur :** PostgreSQL 18.x  
**Outil de migration :** Flyway

---

## 1. TABLE INITIALE : `properties` (MIGRATION V2)

La table `properties` stocke les annonces immobilières de la plateforme.

```sql
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    type VARCHAR(30) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    surface_m2 NUMERIC(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Données d'initialisation (Seed) :
La migration Flyway `V2__create_property_table.sql` insère les **4 biens fictifs utilisés comme données de démonstration et de test** :
1. Villa à Djerba (450 000 TND)
2. Appartement S+2 à Tunis (280 000 TND)
3. Maison traditionnelle à Sousse (320 000 TND)
4. Appartement vue mer à Djerba (190 000 TND)

---

## 2. TABLES PLANIFIÉES POUR LES EXTENSIONS (P2)
- `users` (Version 4) : Stockage des comptes utilisateurs avec mot de passe haché par BCrypt.
- `favorites` (Version 6) : Table d'association entre `users` et `properties`.

