# GUIDE DES TESTS ET ENVIRONNEMENTS DE VÉRIFICATION (TESTING GUIDE)

---

## 1. TYPOLOGIE DES ENVIRONNEMENTS DE TEST

Pour garantir l'intégrité académique des rapports, chaque environnement de test est clairement caractérisé :

| Environnement | Périmètre validé | Limites & Ce qu'il NE valide PAS |
|---|---|---|
| **Flutter Web (Chrome/Edge)** | Logique métier Dart, layout des widgets Material 3, interactions de base. | Ne valide **pas** les plugins natifs Android/iOS (stockage sécurisé natif, permissions caméra, cycle de vie OS). |
| **Expo Web** | Composants TypeScript React Native, styling Flexbox. | Ne valide pas les APIs natives mobiles non supportées sur le Web. |
| **Expo Go (Smartphone Wi-Fi)** | Écran tactile réel, navigation tactile, rendu mobile réel. | Dépendant du réseau Wi-Fi local et du conteneur Expo Go. |
| **Émulateur Android (AVD)** | Système Android complet, pont natif, gestion du clavier virtuel. | Nécessite la configuration complète d'Android Studio (`cmdline-tools`). |
| **Build Natif APK** | Binaire final ARM64/x86 déployable hors ligne. | Temps de compilation long, signature d'application requise. |

> [!WARNING]
> **Règle absolue :** Un test exécuté sur Flutter Web ou Expo Web ne doit **jamais** être décrit comme une preuve de compatibilité Android native. Le rapport de tâche doit toujours mentionner l'environnement exact du test.

---

## 2. COMMANDES DE TEST PAR COMPOSANT

### 2.1 Application Flutter (`flutter/services_immobilier_flutter/`)
```bash
cd flutter/services_immobilier_flutter

# 1. Analyse statique (doit afficher "No issues found!")
flutter analyze

# 2. Exécution des tests unitaires et de widgets
flutter test --reporter expanded
```

### 2.2 Application React Native (`react-native/darlink_react_native/`)
```bash
cd react-native/darlink_react_native

# 1. Vérification du typage TypeScript (0 erreur tolérée)
npx tsc --noEmit

# 2. Exécution des tests de composants (Jest)
npm test
```

### 2.3 Backend Spring Boot (`backend/darlink-backend/`)
```bash
cd backend/darlink-backend

# 1. Exécution de la suite de tests unitaires et d'intégration
mvn test
```

