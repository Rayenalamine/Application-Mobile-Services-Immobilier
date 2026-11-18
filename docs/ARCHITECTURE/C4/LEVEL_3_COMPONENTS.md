# C4 NIVEAU 3 — DIAGRAMME DES COMPOSANTS (COMPONENT DIAGRAM)

Ce diagramme détaille les composants logiciels internes du conteneur Backend Spring Boot 3 et leur interaction avec les couches mobiles et la persistance.

---

## 1. COMPOSANTS INTERNES DU BACKEND SPRING BOOT (CIBLE V3 / V5)

```mermaid
flowchart TD
    subgraph Mobiles ["Clients Mobiles (Flutter & React Native)"]
        Req["Requête HTTP GET /api/v1/properties"]
    end

    subgraph SpringBoot ["Conteneur API REST Spring Boot (backend/darlink-backend/)"]
        direction TB
        
        SecFilter["Filtre de Sécurité / CORS<br>[Spring Security]"]
        
        PropCtrl["PropertyController<br>[@RestController]<br>Expose les endpoints /api/v1/properties"]
        
        PropSrv["PropertyService<br>[@Service]<br>Logique métier & validation des requêtes"]
        
        PropRepo["PropertyRepository<br>[Spring Data JPA]<br>Interface d'accès aux données"]
        
        ErrAdvice["GlobalExceptionHandler<br>[@RestControllerAdvice]<br>Formate les erreurs selon la norme RFC 9457"]
    end

    subgraph Database ["Base de Données PostgreSQL"]
        TblProp[("Table 'properties'<br>(4 biens fictifs de test)")]
    end

    Req --> SecFilter
    SecFilter --> PropCtrl
    PropCtrl --> PropSrv
    PropCtrl -. "En cas d'exception" .-> ErrAdvice
    PropSrv --> PropRepo
    PropRepo -- "Requête SQL JDBC" --> TblProp
```

---

## 2. DESCRIPTION DES COMPOSANTS BACKEND

| Composant | Annotation / Type | Rôle technique et métier |
|---|---|---|
| **PropertyController** | `@RestController` | Réceptionne les requêtes HTTP, valide les paramètres d'interrogation (`@Valid`) et retourne les DTOs JSON. |
| **PropertyService** | `@Service` | Contient les règles de gestion, l'orchestration métier et l'application des filtres de recherche. |
| **PropertyRepository** | `JpaRepository` | Abstraction Spring Data JPA pour les opérations CRUD et la pagination sans code SQL brut. |
| **GlobalExceptionHandler** | `@RestControllerAdvice` | Intercepte les exceptions (`ResourceNotFoundException`, `MethodArgumentNotValidException`) et génère une réponse conforme à la **RFC 9457** (`application/problem+json`). |

---

## 3. COUPLAGE AVEC LES COMPOSANTS MOBILES

Côté Flutter et React Native, les composants de présentation (écrans `HomeScreen`, `SearchScreen`, `PropertyDetailsScreen`) interagissent avec une couche de données dédiée :
- **Flutter :** `PropertyRemoteDataSource` $\rightarrow$ `ApiClient` (gestion des headers, timeouts, et désérialisation via `PropertyModel.fromJson`).
- **React Native :** `propertyApi` $\rightarrow$ `apiClient` (instance Axios avec intercepteur d'erreurs et typage `interface Property`).

