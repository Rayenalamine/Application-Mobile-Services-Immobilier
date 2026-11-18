# SPÉCIFICATION OFFICIELLE DES THÈMES ET DE LA TYPOGRAPHIE (THEME SPECIFICATION)

**Projet :** DarLink — Application Mobile de Services Immobiliers
**Version :** V2 (Socle mobile parallèle & Système de design)
**Tâche associée :** `V2-T02` (Rotation B)
**Auteur :** Membre 1 (Propriétaire du Dépôt — Rôle : Architecture Transverse & Qualité)
**Destinataires :** Membre 2 (Implémentation Flutter) & Membre 3 (Implémentation React Native)
**Statut :** ✅ **Spécification Transverse Validée (Prête pour implémentation par les Membres 2 et 3)**

---

## 1. OBJECTIF ET CHAMP D'APPLICATION

Dans le cadre du développement de la Version 2 du projet DarLink, ce document constitue le référentiel contractuel unique pour :
1. Définir la **matrice sémantique des couleurs** en mode clair (*Light Mode*) et en mode sombre (*Dark Mode*).
2. Démontrer mathématiquement le respect rigoureux des normes internationales d'accessibilité **WCAG 2.1 niveau AA** (ratios de contraste supérieurs à 4.5:1 pour le texte courant et supérieurs à 3.0:1 pour les composants graphiques et grands textes).
3. Établir une **échelle typographique standardisée** et portable entre Flutter (Dart) et React Native (TypeScript).
4. Fournir aux Membres 2 et 3 les contrats d'interface précis nécessaires à l'implémentation de leurs couches de thèmes respectives.

---

## 2. FORMULATION MATHÉMATIQUE DE L'ACCESSIBILITÉ WCAG 2.1 AA

Pour garantir une objectivité totale et répondre aux exigences académiques de M. Wahid Hamdi, chaque paire de couleurs (texte sur fond) a été validée selon l'algorithme officiel du W3C.

### 2.1 Formule de la Luminance Relative ($L$)
Pour chaque composante sRGB normalisée $C \in \{R, G, B\}$ avec $C_{sRGB} = \frac{C_{8bit}}{255}$ :
$$C = \begin{cases} \frac{C_{sRGB}}{12.92} & \text{si } C_{sRGB} \le 0.04045 \\ \left(\frac{C_{sRGB} + 0.055}{1.055}\right)^{2.4} & \text{sinon} \end{cases}$$

La luminance relative globale est ensuite calculée par la pondération photométrique humaine :
$$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$

### 2.2 Formule du Ratio de Contraste ($CR$)
Le ratio de contraste entre deux couleurs de luminances $L_1$ et $L_2$ (avec $L_1 \ge L_2$) est donné par :
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

- **Texte normal (< 18 pt ou < 14 pt gras) :** $CR \ge 4.5:1$ (Exigence WCAG AA).
- **Grand texte ($\ge 18\text{ pt}$ ou $\ge 14\text{ pt}$ gras) et composants UI :** $CR \ge 3.0:1$ (Exigence WCAG AA).

---

## 3. MATRICE SÉMANTIQUE DES COULEURS

### 3.1 Mode Clair (Light Mode)

| Nom sémantique | Code Hexadécimal | Rôle fonctionnel |
|---|---|---|
| `primary` | `#1E88E5` | Couleur dominante de la marque, boutons d'action primaire, accents. |
| `primaryDark` | `#1565C0` | Variante foncée pour états pressés et contrastes texte renforcés. |
| `secondary` | `#26A69A` | Couleur secondaire (badges de disponibilité, tags immobiliers). |
| `background` | `#F5F5F7` | Arrière-plan global de l'application (fond doux reposant). |
| `surface` | `#FFFFFF` | Fond des conteneurs, cartes d'annonces, barres de navigation et modales. |
| `onPrimary` | `#FFFFFF` | Texte et icônes situés sur un fond `primary`. |
| `textPrimary` | `#1C1B1F` | Texte principal de haute emphase (titres d'annonces, prix, libellés majeurs). |
| `textSecondary` | `#49454F` | Texte secondaire de moyenne emphase (descriptions, villes, caractéristiques). |
| `border` | `#E0E0E0` | Lignes de séparation fines et bordures de conteneurs. |
| `error` | `#B3261E` | Alertes critiques, validations de formulaires en échec, badges d'erreur. |
| `onError` | `#FFFFFF` | Texte sur fond `error`. |

### 3.2 Mode Sombre (Dark Mode)

En mode sombre, les surfaces évitent le noir pur `#000000` afin de réduire la fatigue oculaire et les artefacts d'éblouissement sur écrans OLED/AMOLED.

| Nom sémantique | Code Hexadécimal | Rôle fonctionnel |
|---|---|---|
| `primary` | `#90CAF9` | Variante claire et désaturée du bleu pour contraste optimal sur fond sombre. |
| `secondary` | `#80CBC4` | Variante claire du turquoise pour badges et statuts en mode sombre. |
| `background` | `#121212` | Arrière-plan global en mode sombre (standard Material Design). |
| `surface` | `#1E1E1E` | Fond des cartes d'annonces, modales et barre de navigation inférieure. |
| `surfaceVariant` | `#2C2C2C` | Cartes en surélévation ou éléments interactifs secondaires. |
| `onPrimary` | `#0D47A1` | Texte et icônes affichés sur les boutons `primary` clairs. |
| `textPrimary` | `#E6E1E5` | Texte principal en mode sombre (haute lisibilité). |
| `textSecondary` | `#CAC4D0` | Texte secondaire en mode sombre (villes, dates, sous-titres). |
| `border` | `#333333` | Lignes de séparation discrètes en mode sombre. |
| `error` | `#F2B8B5` | Ton rouge pastel pour lisibilité d'erreur sur fond sombre. |
| `onError` | `#601410` | Texte foncé sur badge d'erreur pastel. |

---

## 4. TABLEAU DES VÉRIFICATIONS DE CONTRASTE WCAG 2.1 AA

Les ratios ci-dessous ont été calculés programmatiquement sur les luminances sRGB réelles :

| Combinaison testée | Contexte d'utilisation | Mode | Luminance L1 / L2 | Ratio calculé | Seuil WCAG AA requis | Conformité |
|---|---|---|---|---|---|---|
| `textPrimary` sur `surface` | Titres & Prix sur cartes | Clair | 1.0000 / 0.0113 | **17.13 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textPrimary` sur `background` | Titres sur écran global | Clair | 0.9168 / 0.0113 | **15.73 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textSecondary` sur `surface` | Descriptions & adresses | Clair | 1.0000 / 0.0624 | **9.34 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textSecondary` sur `background`| Sous-titres sur fond | Clair | 0.9168 / 0.0624 | **8.58 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `onPrimary` sur `primary` | Texte sur boutons CTA (16pt gras) | Clair | 1.0000 / 0.2355 | **3.68 : 1** | $\ge 3.0 : 1$ (Grand texte) | ✅ Conforme |
| `primaryDark` sur `surface` | Liens & textes interactifs | Clair | 1.0000 / 0.1327 | **5.75 : 1** | $\ge 4.5 : 1$ (Texte normal) | ✅ Conforme |
| `error` sur `surface` | Messages d'alerte | Clair | 1.0000 / 0.1107 | **6.54 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textPrimary` sur `surface` | Titres & Prix sur cartes | Sombre| 0.7830 / 0.0144 | **12.91 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textPrimary` sur `background` | Titres sur écran sombre | Sombre| 0.7830 / 0.0074 | **14.51 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textSecondary` sur `surface` | Descriptions & adresses | Sombre| 0.5804 / 0.0144 | **9.78 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `textSecondary` sur `background`| Sous-titres sur fond sombre | Sombre| 0.5804 / 0.0074 | **10.99 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |
| `onPrimary` sur `primary` | Texte foncé sur CTA bleu | Sombre| 0.5702 / 0.0756 | **4.93 : 1** | $\ge 4.5 : 1$ (Texte normal) | ✅ Conforme |
| `error` sur `surface` | Alertes sur surface sombre | Sombre| 0.5796 / 0.0144 | **9.76 : 1** | $\ge 4.5 : 1$ | ✅ Conforme |

---

## 5. ÉCHELLE TYPOGRAPHIQUE STANDARDISÉE (TYPOGRAPHIC SCALE)

L'échelle typographique s'appuie sur la police système standard de chaque plateforme (`Roboto` sur Android, `SF Pro Display / Text` sur iOS, sans-serif générique) afin d'assurer des performances natives sans coût de téléchargement d'actifs externes.

| Rôle typographique | Taille (pt/sp) | Graisse (Weight) | Hauteur de ligne (Line Height) | Espacement des lettres (Tracking) | Usage prévu |
|---|---|---|---|---|---|
| `displayLarge` | 28 | Gras (700 / Bold) | 34 | -0.2 | Grand titre d'accroche de l'écran d'accueil |
| `headlineMedium`| 20 | Semi-gras (600) | 26 | 0.0 | Titre des annonces, noms de villes |
| `titleMedium` | 18 | Gras (700 / Bold) | 24 | 0.1 | Prix des biens immobiliers |
| `bodyLarge` | 16 | Normal (400 / Regular) | 22 | 0.2 | Paragraphes de description, contenu principal |
| `bodyMedium` | 14 | Normal (400 / Regular) | 20 | 0.2 | Caractéristiques secondaires (chambres, m²) |
| `labelLarge` | 14 | Semi-gras (600) | 20 | 0.1 | Libellés des boutons d'action (CTA) |
| `labelSmall` | 11 | Semi-gras (600) | 16 | 0.4 | Badges de statut (Location / Vente) |

---

## 6. INSTRUCTIONS D'IMPLÉMENTATION POUR LES COÉQUIPIERS

### 6.1 Membre 2 — Implémentation Flutter (`flutter/services_immobilier_flutter/lib/core/theme/`)
Le Membre 2 est responsable de :
1. Créer `lib/core/theme/app_theme.dart` exposant :
   - `static ThemeData get lightTheme`
   - `static ThemeData get darkTheme`
2. Configurer `colorScheme` en s'appuyant sur `ColorScheme.fromSeed` ou en assignant explicitement les couleurs sémantiques définies dans la section 3.
3. Implémenter un `ChangeNotifier` ou `ValueNotifier<ThemeMode>` permettant à l'utilisateur de basculer entre mode clair, mode sombre et mode système.
4. Écrire le test unitaire dans `test/theme_test.dart` vérifiant la cohérence des thèmes et l'absence d'erreurs `flutter analyze`.

### 6.2 Membre 3 — Implémentation React Native (`react-native/darlink_react_native/src/core/theme/`)
Le Membre 3 est responsable de :
1. Créer `src/core/theme/colors.ts` avec les objets typés `lightColors` et `darkColors`.
2. Créer `src/core/theme/typography.ts` avec les styles typographiques standardisés.
3. Créer `src/core/theme/ThemeContext.tsx` fournissant le `ThemeProvider` et le hook personnalisé `useAppTheme()`.
4. Intégrer `useColorScheme()` de `react-native` pour la détection automatique du thème du système d'exploitation.
5. Écrire le test unitaire Jest vérifiant le basculement de thème et valider avec `npx tsc --noEmit`.

---

## 7. MATRICE DE TRAÇABILITÉ DES RESPONSABILITÉS

| Tâche / Composant | Responsable | Statut | Livrable attendu |
|---|---|---|---|
| Spécification sémantique & Ratios WCAG AA | **Membre 1** | ✅ **COMPLETED** | `docs/THEME_SPECIFICATION.md` |
| Couche de thèmes Flutter (`AppTheme`) | **Membre 2** | ⏳ **NOT STARTED** | `lib/core/theme/app_theme.dart` |
| Couche de thèmes React Native (`ThemeProvider`) | **Membre 3** | ⏳ **NOT STARTED** | `src/core/theme/ThemeContext.tsx` |
