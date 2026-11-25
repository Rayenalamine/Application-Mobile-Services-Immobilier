# DarLink — Real Estate Services Mobile Platform

[![Firebase Project: darlink-74715](https://img.shields.io/badge/Firebase-darlink--74715-orange.svg?logo=firebase)](https://console.firebase.google.com/project/darlink-74715)
[![Flutter](https://img.shields.io/badge/Flutter-3.13+-blue.svg?logo=flutter)](https://flutter.dev)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2058-black.svg?logo=react)](https://expo.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**DarLink** is a modern, cross-platform real estate marketplace mobile solution engineered for browsing, filtering, and managing luxury and prestige properties in Tunisia.

The platform provides two feature-equivalent, parallel client applications that connect to a single online **Google Firebase** cloud backend:
1. **Flutter Mobile & Web Application** (Dart / Material 3)
2. **React Native Mobile Application** (TypeScript / Expo Go)

Both applications share the exact same Cloud Firestore database, Firebase Authentication user directory, security policies, and real-time synchronized user favorites.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Firebase Cloud Architecture](#firebase-cloud-architecture)
  - [Cloud Firestore Collections](#cloud-firestore-collections)
  - [Authentication Flow](#authentication-flow)
  - [Firestore Security Rules](#firestore-security-rules)
- [Prerequisites](#prerequisites)
- [Quick Start & Installation](#quick-start--installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Run the React Native (Expo) Application](#3-run-the-react-native-expo-application)
  - [4. Run the Flutter (Web & Mobile) Application](#4-run-the-flutter-web--mobile-application)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Database Seeding](#database-seeding)
- [Cross-Platform Synchronization](#cross-platform-synchronization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Architectural Overview

```
                          ┌───────────────────────────┐
                          │   Firebase Cloud Backend  │
                          │      (darlink-74715)      │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
      ┌──────────▼──────────┐                       ┌──────────▼──────────┐
      │     Cloud Auth      │                       │   Cloud Firestore   │
      │  (Identity Toolkit) │                       │     (default DB)    │
      └──────────┬──────────┘                       └──────────┬──────────┘
                 │                                             │
        REST API │ JWT Token                          REST API │ JSON Docs
                 │                                             │
      ┌──────────┴─────────────────────────────────────────────┴──────────┐
      │                                                                    │
┌─────▼──────────────────────────────┐              ┌──────────────────────▼─────┐
│    React Native (Expo Client)      │              │    Flutter (Web & Android) │
│ - TypeScript & React 19            │              │ - Dart & Material 3        │
│ - Direct Firestore REST Engine     │              │ - Direct Firestore Client  │
│ - AsyncStorage Offline Resilience  │              │ - SharedPreferences Cache  │
│ - Interactive Slippy Map Engine    │              │ - Interactive Geo Map      │
│ - Trilingual i18n (FR, AR, EN)     │              │ - Trilingual i18n + RTL    │
└────────────────────────────────────┘              └────────────────────────────┘
```

Both mobile frontends employ a resilient, zero-dependency direct REST client architecture communicating with:
- **Cloud Firestore v1 REST API** (`https://firestore.googleapis.com/v1/projects/darlink-74715/databases/(default)/documents`)
- **Google Identity Toolkit v1 REST API** (`https://identitytoolkit.googleapis.com/v1`)

This guarantees complete compatibility with **Expo Go** and **Flutter Web** without requiring native Gradle plugins or custom Android/iOS build hooks.

---

## Technology Stack

| Layer | Flutter Application | React Native Application | Cloud Backend |
| :--- | :--- | :--- | :--- |
| **Language** | Dart 3.13+ | TypeScript 5.8+ / JavaScript | JSON / REST v1 |
| **Framework** | Flutter SDK 3.x | Expo SDK 58 / React Native 0.88 | Google Cloud Platform |
| **Design System** | Material 3 (Adaptive Light/Dark) | Custom Glassmorphic Dark/Light | Material Theme Guidelines |
| **Localization** | Trilingual (French, Arabic RTL, English) | Trilingual (French, Arabic RTL, English) | UTF-8 / Standard Geo |
| **Storage & Cache**| `shared_preferences` | `@react-native-async-storage` | Cloud Firestore |
| **Authentication** | Direct Firebase Identity Toolkit | Direct Firebase Identity Toolkit | Firebase Auth (Email/Pass) |
| **Mapping Engine** | Interactive Slippy Tile Grid | Interactive Slippy Tile Grid (Esri) | Global OSM / Esri ArcGIS |

---

## Repository Structure

```text
Application-Mobile-Services-Immobilier/
├── .env.example              # Public client configuration template
├── .firebaserc               # Firebase CLI project binding ("darlink-74715")
├── .gitignore                # Git exclusion rules (.env, build artifacts, etc.)
├── firebase.json             # Firebase deployment definition (rules & indexes)
├── firebase_seed_data.json   # 13 prestige properties catalog dataset
├── firestore.indexes.json    # Cloud Firestore database composite indexes
├── firestore.rules           # Granular security rules for Cloud Firestore
├── README.md                 # Primary documentation (this file)
├── CONTRIBUTING.md           # Collaboration, branches, and PR guidelines
│
├── flutter/
│   └── services_immobilier_flutter/   # Complete Flutter Mobile & Web application
│       ├── lib/                       # Clean architecture source code
│       │   ├── core/                  # Firebase client, themes, i18n, router
│       │   └── features/              # Properties, Auth, Favorites, Map, Profile
│       ├── test/                      # 34 automated unit and UI integration tests
│       └── pubspec.yaml               # Dart package manifest and dependencies
│
├── react-native/
│   └── darlink_react_native/          # Complete React Native Expo application
│       ├── src/                       # Modular TypeScript source code
│       │   ├── core/                  # Firebase REST engine, i18n, design tokens
│       │   └── features/              # Properties, Auth, Favorites, Map, Profile
│       ├── test/                      # 30 automated TypeScript test suites
│       ├── app.json                   # Expo application metadata & permissions
│       └── package.json               # Node.js dependencies and scripts
│
└── scripts/                           # Reproducible QA, seeder, and sync utilities
    ├── seed_live.js                   # Idempotent Cloud Firestore seeder (13 properties)
    ├── verify_cross_platform_sync.js  # Bidirectional React Native <-> Flutter sync test
    └── verify_e2e_cloud_firestore.js  # 6-step online Firebase verification audit
```

---

## Firebase Cloud Architecture

### Cloud Firestore Collections

The live database (`darlink-74715`) contains the following data structures:

1. **`properties`** (Collection):
   - Stores real estate listings.
   - Publicly readable by all visitors.
   - Creation restricted to authenticated users.
   - Fields: `id`, `title`, `description`, `location`, `city`, `price`, `type`, `imageUrl`, `galleryUrls`, `bedrooms`, `bathrooms`, `surfaceM2`, `yearBuilt`, `standing`, `isRental`, `latitude`, `longitude`, `amenities`, `agentName`, `agentPhone`, `ownerId`, `createdAt`.

2. **`users/{userId}`** (Collection):
   - Stores user profiles.
   - Publicly readable profile summary (agent info); write operations restricted strictly to `request.auth.uid == userId`.

3. **`users/{userId}/favorites/{propertyId}`** (Subcollection):
   - User favorites storage.
   - **Strict Per-User Isolation**: Only the authenticated user matching `userId` can read or write their favorites.

4. **`contact_requests`** (Collection):
   - Inspection visit and inquiry requests submitted by prospective buyers/tenants.

### Authentication Flow

Firebase Authentication is configured with the **Email/Password** provider:
- Users register or log in via standard REST endpoints (`accounts:signUp` and `accounts:signInWithPassword`).
- The returned JWT `idToken` is attached as `Authorization: Bearer <idToken>` on authenticated Firestore write/read operations.
- Offline persistence caches user tokens and favorites to provide an instant offline browsing experience.

### Firestore Security Rules

Deployable via `firebase deploy --only firestore:rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        resource.data.agentId == request.auth.uid ||
        request.auth.token.role == 'ADMIN'
      );
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      match /favorites/{propertyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /contact_requests/{requestId} {
      allow create: if true;
      allow read, update: if request.auth != null && (
        resource.data.senderId == request.auth.uid ||
        resource.data.propertyOwnerId == request.auth.uid ||
        resource.data.ownerId == request.auth.uid
      );
      allow delete: if request.auth != null && (
        resource.data.propertyOwnerId == request.auth.uid ||
        request.auth.token.role == 'ADMIN'
      );
    }
  }
}
```

---

## Prerequisites

Before setting up the repository, make sure you have:
- **Git** (version 2.30+)
- **Node.js** (version 18.0.0 or higher) & **npm**
- **Flutter SDK** (version 3.13.4 or higher) with Dart 3
- (Optional) **Expo CLI** (`npx expo`) for mobile testing

---

## Quick Start & Installation

### 1. Clone Repository

```bash
git clone https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier.git
cd Application-Mobile-Services-Immobilier
```

### 2. Environment Configuration

Copy the example environment template to your local `.env`:

```bash
cp .env.example .env
```

Open `.env` and configure your Firebase Web Client values:

```env
FIREBASE_API_KEY=your-firebase-web-api-key-here
FIREBASE_PROJECT_ID=darlink-74715

EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key-here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=darlink-74715
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=darlink-74715.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=darlink-74715.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-web-app-id
```

> **Note on Firebase Client Configurations:**
> Firebase Web API keys and App IDs are **public client identifiers** (not private service account secrets). They identify your mobile application to Google Cloud services. Keep your `.env` file gitignored.

---

### 3. Run the React Native (Expo) Application

1. Navigate to the React Native project:
   ```bash
   cd react-native/darlink_react_native
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run automated tests (30 suites):
   ```bash
   npm test
   ```

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

   - Press **`w`** in the terminal to launch in your Web Browser.
   - Or scan the displayed QR code with the **Expo Go** app on your physical iOS or Android device.

---

### 4. Run the Flutter (Web & Mobile) Application

1. Navigate to the Flutter directory:
   ```bash
   cd flutter/services_immobilier_flutter
   ```

2. Download Dart packages:
   ```bash
   flutter pub get
   ```

3. Run automated tests (34 tests):
   ```bash
   flutter test
   ```

4. Build or launch Flutter Web:
   ```bash
   # Launch live dev server in Chrome
   flutter run -d chrome

   # Or compile a release Web build
   flutter build web --release
   ```

5. (Optional) Run on connected Android device/emulator:
   ```bash
   flutter run -d android
   ```

---

## Testing & Quality Assurance

DarLink includes complete automated test coverage across both frontends and the live cloud backend:

```bash
# From the repository root:

# 1. Test live Cloud Firestore E2E operations (Auth, Properties, Isolation)
node scripts/verify_e2e_cloud_firestore.js

# 2. Test cross-platform synchronization (React Native <-> Flutter)
node scripts/verify_cross_platform_sync.js

# 3. Run all React Native unit and integration tests (30 tests)
cd react-native/darlink_react_native && npm test

# 4. Run all Flutter widget and unit tests (34 tests)
cd flutter/services_immobilier_flutter && flutter test
```

---

## Database Seeding

To safely seed or verify the 13 initial prestige properties into your Cloud Firestore database without overwriting existing data:

```bash
# From repository root:
node scripts/seed_live.js
```

The script is idempotent: it validates existing document IDs and only inserts missing records.

---

## Cross-Platform Synchronization

To test that a favorite added in React Native appears in Flutter, and deleting it in Flutter reflects in React Native:

```bash
node scripts/verify_cross_platform_sync.js
```

Expected output:
```text
[ÉTAPE 1] Enregistrement d'un compte utilisateur de test partagé...
  ✅ Compte partagé créé avec succès (UID : ...)

[ÉTAPE 2] [React Native] Ajout du Bien #1 aux Favoris dans Cloud Firestore...
  ✅ [React Native] Favori #1 écrit avec succès dans la sous-collection Firestore.

[ÉTAPE 3] [Flutter] Interrogation de Cloud Firestore pour récupérer les favoris...
  ✅ [Flutter] Le favori ajouté par React Native a bien été détecté en direct !

[ÉTAPE 4] [Flutter] Suppression du Bien #1 des Favoris via Cloud Firestore...
  ✅ [Flutter] Document favori #1 supprimé de Cloud Firestore avec succès.

[ÉTAPE 5] [React Native] Re-lecture des favoris pour vérifier la suppression...
  ✅ [React Native] Suppression confirmée : 0 favori restant.
```

---

## Troubleshooting

### 1. `Missing FIREBASE_API_KEY` when running test scripts
- **Cause**: No `.env` file found or environment variables are unset.
- **Fix**: Copy `.env.example` to `.env` in the root folder and provide your Firebase Web API key.

### 2. Expo Metro Cache Issues
- **Cause**: Metro bundler caching stale environment variables.
- **Fix**: Run `npx expo start -c` to clear the bundler cache.

### 3. Flutter Web Rendering
- **Cause**: Flutter web canvas renderer choice.
- **Fix**: Run `flutter run -d chrome --web-renderer canvaskit` or `auto`.

### 4. Firestore 403 Forbidden on Custom Queries
- **Cause**: Firestore security rules restrict unauthenticated writes or access to another user's favorites.
- **Fix**: Log in via `authService.login()` first, or deploy updated rules using `npx firebase deploy --only firestore:rules`.

---

## Contributing

We welcome contributions to DarLink! Please follow our established workflow:
1. Review [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming and commit conventions.
2. Fork the repository and create your feature branch: `git checkout -b feature/your-feature-name`.
3. Verify that both test suites pass (`npm test` and `flutter test`).
4. Submit a Pull Request targeting the `main` branch with detailed release notes.

---

## License

This project is open-source under the [MIT License](LICENSE).
