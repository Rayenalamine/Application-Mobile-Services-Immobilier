# SPÉCIFICATION OFFICIELLE DES COMPOSANTS UI ET DE LEURS ÉTATS (UI COMPONENTS SPEC)

**Projet :** DarLink — Application Mobile de Services Immobiliers en Tunisie  
**Version :** V2 (Socle mobile parallèle & Système de design)  
**Tâche associée :** `V2-T03` (Rotation C)  
**Auteur :** Membre 2 (Coéquipier 1 — Rôle : Architecture Transverse & Spécification UI)  
**Destinataires :** Membre 1 (Application React Native) & Membre 3 (Application Flutter)  
**Date :** 18 novembre 2026  
**Statut :** ✅ **Spécification Transverse Achevée & Validée (Débloque l'assignation du Membre 1 sur V2-T03)**

---

## 1. OBJECTIF ET CADRE ARCHITECTURAL

Ce document formalise le contrat visuel, technique et comportemental des quatre composants d'interface fondamentaux de la bibliothèque partagée DarLink :
1. **`PropertyCard`** : Carte d'affichage d'un bien immobilier.
2. **`PrimaryButton`** : Bouton d'action principal (CTA).
3. **`LoadingSkeleton`** : Squelette animé de chargement (Shimmer).
4. **`EmptyStateView`** : Écran d'état vide avec message et bouton d'action.

Il garantit la stricte parité visuelle et fonctionnelle entre l'implémentation **Flutter** (`flutter/services_immobilier_flutter/lib/core/widgets/`) réalisée par le Membre 3 et l'implémentation **React Native** (`react-native/darlink_react_native/src/core/components/`) réalisée par le Membre 1.

---

## 2. COMPOSANT 1 : CARTE D'ANNONCE IMMOBILIÈRE (`PropertyCard`)

### 2.1 Description fonctionnelle
Composant principal de liste présentant une annonce avec son image, son badge de type (Appartement, Maison, Villa), son prix en Dinars Tunisiens (TND), sa localisation et ses caractéristiques (chambres, salles de bain).

### 2.2 Contrat d'interface (Props / Paramètres)
| Propriété | Type portable | Obligatoire | Valeur par défaut | Description |
|---|---|---|---|---|
| `property` | `Property` / `Propriete` | Oui | - | Entité métier contenant les données de l'annonce. |
| `onTap` / `onPress` | `() -> void` | Non | `null` | Callback déclenché lors du clic sur la carte. |
| `showBadges` | `boolean` | Non | `true` | Indique si le badge de type doit être incrusté. |
| `elevation` | `number` | Non | `2` | Élévation visuelle de la surface (ombre portée). |

### 2.3 Matrice des 5 États UI
| État | Comportement visuel & rendu | Accessibilité & Rétroaction |
|---|---|---|
| **Normal (Idle)** | Surface blanche (`#FFFFFF` en clair / `#1E1E1E` en sombre), rayon de 12px, bordure 0.8px (`#E0E0E0` / `#333333`), ombre douce. | Label sémantique : `"[Titre], [Prix] DT, [Localisation]"`. |
| **Pressé (Pressed)** | Effet Ripple Material 3 (Flutter) ou `activeOpacity: 0.85` (React Native), élévation réduite à 1. | Rétroaction haptique légère recommandée sur mobile natif. |
| **Chargement (Loading)** | Affichage du placeholder `LoadingSkeleton` de dimension 100% largeur x 360px hauteur. | `aria-busy="true"` / `Semantics(liveRegion: true)`. |
| **Erreur d'image (Error Image)** | Remplacement de l'image distante en échec par un conteneur `#EEEEEE` avec icône `Icons.broken_image` / `image-off` et texte discret *"Image indisponible"*. | Remplacement du label alt par *"Image du bien indisponible"*. |
| **Désactivé (Disabled)** | Opacité générale fixée à 50% (`0.5`), interactions tactiles bloquées (`onTap = null`). | `Semantics(enabled: false)`. |

---

## 3. COMPOSANT 2 : BOUTON PRINCIPAL (`PrimaryButton`)

### 3.1 Description fonctionnelle
Bouton d'appel à l'action (Call-To-Action) utilisé pour les actions majeures : *"Voir détails"*, *"Contacter l'agence"*, *"Appliquer les filtres"*.

### 3.2 Contrat d'interface
| Propriété | Type portable | Obligatoire | Valeur par défaut | Description |
|---|---|---|---|---|
| `label` | `string` | Oui | - | Texte affiché sur le bouton. |
| `onPress` | `() -> void` | Oui | - | Action déclenchée au clic. |
| `icon` | `IconData` / `string` | Non | `null` | Icône facultative affichée avant le libellé. |
| `isLoading` | `boolean` | Non | `false` | Affiche l'indicateur de progression rotatif. |
| `disabled` | `boolean` | Non | `false` | Désactive les clics et passe le bouton en grisé. |
| `isFullWidth` | `boolean` | Non | `true` | Occupe toute la largeur disponible du parent. |

### 3.3 Matrice des 5 États UI
| État | Comportement visuel (Mode Clair) | Comportement visuel (Mode Sombre) |
|---|---|---|
| **Normal** | Fond `primary` (`#1E88E5`), texte `onPrimary` (`#FFFFFF`), hauteur 48px, rayon 8px. | Fond `primary` (`#90CAF9`), texte `onPrimary` (`#0D47A1`), hauteur 48px, rayon 8px. |
| **Pressé** | Fond `primaryDark` (`#1565C0`), feedback tactile immédiat. | Fond `#64B5F6`, opacité 0.9. |
| **Chargement** | Libellé masqué, indicateur circulaire `CircularProgressIndicator` (Flutter) ou `ActivityIndicator` (React Native) centré, couleur `onPrimary`. Interactions bloquées. | Même comportement avec couleur `onPrimary` sombre. |
| **Désactivé** | Fond gris désactivé `#BDBDBD`, texte `#757575`, curseur interdit. | Fond `#333333`, texte `#666666`. |
| **Erreur/Alerte** | Bordure clignotante ou passage temporaire en fond `error` (`#B3261E`). | Fond `error` pastel (`#F2B8B5`). |

---

## 4. COMPOSANT 3 : SQUELETTE DE CHARGEMENT (`LoadingSkeleton`)

### 4.1 Description fonctionnelle
Indicateur de chargement moderne remplaçant les "spinners" classiques pendant la récupération réseau ou l'instanciation des composants.

### 4.2 Contrat d'interface
| Propriété | Type | Valeur par défaut | Description |
|---|---|---|---|
| `width` | `number` / `string` | `'100%'` | Largeur du bloc squelette. |
| `height` | `number` | `20` | Hauteur en pixels logiques. |
| `borderRadius` | `number` | `8` | Rayon des angles arrondis. |
| `isCircle` | `boolean` | `false` | Si `true`, force un cercle parfait (pour avatars). |

### 4.3 Animation et États
- **Animation :** Gradient linéaire balayant horizontalement de gauche à droite sur une durée de 1200ms en boucle (`LinearEasing`).
- **Mode Clair :** Dégradé de `#EEEEEE` $\rightarrow$ `#E0E0E0` $\rightarrow$ `#EEEEEE`.
- **Mode Sombre :** Dégradé de `#242424` $\rightarrow$ `#333333` $\rightarrow$ `#242424`.

---

## 5. COMPOSANT 4 : VUE D'ÉTAT VIDE (`EmptyStateView`)

### 5.1 Description fonctionnelle
Écran ou encart informatif affiché lorsqu'une liste est vide (aucun favori, recherche sans résultat, erreur de connexion réseau).

### 5.2 Contrat d'interface
| Propriété | Type | Obligatoire | Valeur par défaut | Description |
|---|---|---|---|---|
| `title` | `string` | Oui | - | Titre court expliquant la situation. |
| `description` | `string` | Oui | - | Explication ou suggestion pour l'utilisateur. |
| `icon` | `IconData` / `string` | Oui | - | Illustration visuelle ou icône vectorielle d'état. |
| `actionLabel` | `string` | Non | `null` | Texte du bouton de rappel (ex: "Actualiser"). |
| `onAction` | `() -> void` | Non | `null` | Action exécutée au clic sur le bouton de rappel. |

---

## 6. JEUX DE DONNÉES DE TEST DE RENDU (TEST FIXTURES)

Pour valider l'affichage des 5 états sans dépendre du réseau, les composants doivent être testés avec les fixtures suivantes :

```json
{
  "propertyNormal": {
    "id": "mock-01",
    "titre": "Appartement moderne à Tunis",
    "localisation": "Les Berges du Lac, Tunis",
    "prix": 320000,
    "type": "Appartement",
    "imageUrl": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "nombreChambres": 3,
    "nombreSallesDeBain": 2,
    "description": "Bel appartement lumineux situé dans le quartier résidentiel."
  },
  "propertyBadImage": {
    "id": "mock-err",
    "titre": "Maison avec image cassée",
    "localisation": "Carthage, Tunis",
    "prix": 480000,
    "type": "Maison",
    "imageUrl": "https://invalid-domain-that-does-not-exist.tn/fake.jpg",
    "nombreChambres": 4,
    "nombreSallesDeBain": 2,
    "description": "Test de rendu du fallback d'erreur de chargement d'image."
  }
}
```

---

## 7. MATRICE DE CONFORMITÉ ACCESSIBILITÉ WCAG 2.1 AA

1. **Zones tactiles minimales :** Tous les composants interactifs (`PrimaryButton`, `PropertyCard`) offrent une surface de contact supérieure ou égale à **$48 \times 48\text{ dp}$**.
2. **Contraste de texte :** Tous les libellés (`labelLarge`, `titleMedium`) respectent un ratio supérieur à 4.5:1 sur leur arrière-plan respectif (selon `docs/THEME_SPECIFICATION.md`).
3. **Retour d'état sémantique :** Les états de chargement informent les technologies d'assistance (VoiceOver / TalkBack) sans bloquer la vocalisation.
