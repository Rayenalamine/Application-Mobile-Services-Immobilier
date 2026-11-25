# DARLINK — GUIDE OFFICIEL DE PRODUCTION & LIVRAISON ANDROID (APK / AAB)

Ce document décrit la configuration certifiée et les commandes de compilation pour générer l'APK et l'Android App Bundle (AAB) de production pour DarLink dès autorisation.

---

## 1. Identité et Paramètres de l'Application

| Paramètre | Valeur Flutter | Valeur React Native (Expo) |
|---|---|---|
| **Nom de l'application** | `DarLink` (`AndroidManifest.xml`) | `DarLink` (`app.json`) |
| **Identifiant Unique (Package / ApplicationId)** | `tn.darlink.app` (`build.gradle.kts`) | `tn.darlink.app` (`app.json`) |
| **Version Code** | `1` | `1` |
| **Version Name** | `1.0.0` | `1.0.0` |
| **Version SDK Minimale** | Android 21 (Lollipop 5.0) | Android 21 (Lollipop 5.0) |
| **Version SDK Cible** | Android 34 (Android 14) | Android 34 (Android 14) |

---

## 2. Permissions Android Auditées (`AndroidManifest.xml`)

Les permissions sont strictement restreintes aux besoins fonctionnels réels :
- `android.permission.INTERNET` : Requis pour les requêtes Cloud Firestore, Firebase Auth, Firebase Storage et les tuiles cartographiques CARTO.
- `android.permission.ACCESS_FINE_LOCATION` : Requis pour centrer la carte sur la position GPS de l'utilisateur en Tunisie.
- `android.permission.ACCESS_COARSE_LOCATION` : Fallback réseau pour la géolocalisation approximative.
- Zéro permission intrusive (caméra non obligatoire, pas de lecture de contacts, pas de stockage externe non protégé).

---

## 3. Génération de la Clé de Signature de Production (Keystore)

Pour signer l'application pour le Google Play Store ou pour une distribution APK standalone sécurisée :

```bash
keytool -genkey -v -keystore darlink-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias darlink -storepass [VOTRE_MOT_DE_PASSE] -keypass [VOTRE_MOT_DE_PASSE] -dname "CN=DarLink Team, OU=Mobile Dev, O=DarLink Inc, L=Tunis, ST=Tunis, C=TN"
```

### Configuration Gradle (`android/key.properties`)
```properties
storePassword=[VOTRE_MOT_DE_PASSE]
keyPassword=[VOTRE_MOT_DE_PASSE]
keyAlias=darlink
storeFile=../darlink-release-key.jks
```

---

## 4. Commandes de Compilation de Production

> [!IMPORTANT]
> Conformément aux consignes strictes de la Phase 11, la génération de l'APK final est mise en attente de l'autorisation explicite de l'utilisateur. Dès validation, exécuter la commande ci-dessous.

### Flutter — Génération APK Release
```bash
cd flutter/services_immobilier_flutter
flutter build apk --release --split-per-abi
# Ou APK universel autonome :
flutter build apk --release
```
*Emplacement de sortie :* `build/app/outputs/flutter-apk/app-release.apk`

### Flutter — Génération Android App Bundle (AAB pour Google Play Store)
```bash
cd flutter/services_immobilier_flutter
flutter build appbundle --release
```
*Emplacement de sortie :* `build/app/outputs/bundle/release/app-release.aab`

### React Native (Expo) — Génération via EAS Build
```bash
cd react-native/darlink_react_native
# Configuration du profil de production dans eas.json puis :
eas build --platform android --profile production
```
