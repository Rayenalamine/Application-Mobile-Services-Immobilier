# CONTRATS D'API OFFICIELS (API CONTRACTS)

> [!IMPORTANT]
> **RÈGLE API-FIRST :** Ce document est le contrat de référence partagé entre le Backend Spring Boot, l'application Flutter et l'application React Native. Aucun modèle de données mobile ni contrôleur backend ne peut dévier de cette spécification. Le contrat final des biens immobiliers sera formellement ratifié lors de la tâche **V5-T00**.

---

## 1. ENDPOINT DE SANTÉ SYSTÈME (HEALTHCHECK - V3)

### `GET /api/v1/health`
- **Description :** Vérifie que le serveur Spring Boot est en ligne et accessible.
- **Sécurité :** Public (aucun token requis).
- **Réponse HTTP 200 OK :**
  ```json
  {
    "status": "UP",
    "timestamp": "2026-11-18T20:55:00Z"
  }
  ```

---

## 2. ENDPOINTS DES BIENS IMMOBILIERS (PROPERTIES - V5)

### 2.1 Liste paginée des biens : `GET /api/v1/properties`
- **Description :** Récupère la liste des annonces immobilières avec pagination et filtres optionnels.
- **Paramètres de requête (Query Params) :**
  - `page` (entier, défaut: `0`) : Numéro de page.
  - `size` (entier, défaut: `10`) : Nombre d'éléments par page.
  - `city` (chaîne, optionnel) : Ville tunisienne (ex: `Tunis`, `Sousse`, `Djerba`).
  - `type` (chaîne, optionnel) : Type de bien (`APPARTEMENT`, `MAISON`, `VILLA`).
  - `minPrice` (nombre, optionnel) : Prix minimal en TND.
  - `maxPrice` (nombre, optionnel) : Prix maximal en TND.
- **Réponse HTTP 200 OK :**
  ```json
  {
    "content": [
      {
        "id": 1,
        "title": "Superbe villa avec piscine",
        "description": "Magnifique villa située dans un quartier calme avec grand jardin et piscine privée.",
        "location": "Djerba",
        "price": 450000.0,
        "type": "VILLA",
        "imageUrl": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "bedrooms": 4,
        "bathrooms": 3,
        "surfaceM2": 280.0,
        "createdAt": "2026-11-18T10:00:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 4,
    "totalPages": 1,
    "last": true
  }
  ```

---

### 2.2 Consultation du détail d'un bien : `GET /api/v1/properties/{id}`
- **Description :** Retourne les informations complètes d'un bien immobilier par son identifiant unique.
- **Paramètre de chemin (Path Variable) :** `id` (entier long obligatoire).
- **Réponse HTTP 200 OK :**
  ```json
  {
    "id": 1,
    "title": "Superbe villa avec piscine",
    "description": "Magnifique villa située dans un quartier calme avec grand jardin et piscine privée.",
    "location": "Djerba",
    "price": 450000.0,
    "type": "VILLA",
    "imageUrl": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
    "galleryUrls": [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
    ],
    "bedrooms": 4,
    "bathrooms": 3,
    "surfaceM2": 280.0,
    "ownerName": "Foulen Ben Foulen",
    "ownerPhone": "+216 20 123 456",
    "createdAt": "2026-11-18T10:00:00Z"
  }
  ```
- **Réponse HTTP 404 Not Found (RFC 9457) :**
  ```json
  {
    "type": "https://api.darlink.tn/errors/not-found",
    "title": "Ressource introuvable",
    "status": 404,
    "detail": "Aucun bien immobilier trouvé avec l'identifiant 99.",
    "instance": "/api/v1/properties/99",
    "timestamp": "2026-11-18T20:55:00Z"
  }
  ```

