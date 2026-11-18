# VUE D'ENSEMBLE DES API REST (API OVERVIEW)

---

## 1. CONVENTIONS GÉNÉRALES DE L'API

Toutes les interfaces de programmation (API) de la plateforme DarLink respectent les standards RESTful d'entreprise :
- **Préfixe des routes :** `/api/v1/`
- **Format des données échangées :** JSON (`application/json;charset=UTF-8`)
- **Nomenclature des champs :** *camelCase* strict (ex: `propertyId`, `priceTnd`, `createdAt`)
- **Gestion des erreurs :** Norme internationale **RFC 9457** (`application/problem+json`)
- **Documentation interactive :** Swagger UI disponible sur `http://localhost:8080/swagger-ui.html`

---

## 2. STATUTS HTTP UTILISÉS

| Code HTTP | Signification | Contexte d'utilisation dans DarLink |
|---|---|---|
| **200 OK** | Succès | Réponse positive à une requête `GET` ou `PUT`. |
| **201 Created** | Création réussie | Réponse positive à une requête `POST` (ex: publication de bien, inscription). |
| **204 No Content** | Succès sans contenu | Réponse à une suppression (`DELETE`) ou action sans retour de données. |
| **400 Bad Request** | Requête invalide | Échec de validation Jakarta Bean Validation (`@Valid`). |
| **401 Unauthorized** | Non authentifié | Absence ou invalidité du jeton JWT. |
| **403 Forbidden** | Accès refusé | Droits insuffisants (ex: modifier une annonce sans en être le propriétaire). |
| **404 Not Found** | Ressource introuvable | Identifiant de bien ou d'utilisateur inexistant. |
| **500 Internal Error** | Erreur serveur | Exception inattendue interceptée par le `GlobalExceptionHandler`. |

---

## 3. FORMAT NORMALISÉ DES RÉPONSES D'ERREUR (RFC 9457)

En cas d'échec (codes 4xx et 5xx), le backend retourne systématiquement un corps JSON conforme à la spécification **RFC 9457** :

```json
{
  "type": "https://api.darlink.tn/errors/not-found",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Le bien immobilier demandé avec l'identifiant 4 n'a pas été trouvé.",
  "instance": "/api/v1/properties/4",
  "timestamp": "2026-11-18T20:55:00Z"
}
```

