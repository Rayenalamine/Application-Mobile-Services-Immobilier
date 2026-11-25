# DarLink — Real Estate Services Mobile Platform (Tunisia)

[![Firebase Project: darlink-74715](https://img.shields.io/badge/Firebase-darlink--74715-orange.svg?logo=firebase)](https://console.firebase.google.com/project/darlink-74715)
[![Flutter](https://img.shields.io/badge/Flutter-3.13+-blue.svg?logo=flutter)](https://flutter.dev)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2058-black.svg?logo=react)](https://expo.dev)

**DarLink** is a cross-platform real estate marketplace for Tunisia with two parallel client applications connected to the same **Google Firebase** backend (`darlink-74715`):

1. **Flutter Application** (`flutter/services_immobilier_flutter`) — Android & Web (Dart / Material 3)
2. **React Native Application** (`react-native/darlink_react_native`) — Android & iOS (TypeScript / Expo SDK 58)

Both applications share the same Firebase Authentication directory, Cloud Firestore `(default)` database, Firestore security rules, and Cloud Storage rules.

---

## Architecture Overview

- **Authentication:** Firebase Authentication (Email/Password via Identity Toolkit & Firebase Auth SDK). No SMS or custom OTP.
- **Real-Time Database & Sync:**
  - **Flutter:** `firebase_core`, `firebase_auth`, `cloud_firestore` (`.snapshots()` real-time streams on favorites, published properties, and notifications) + REST fallback for offline/unit-test environments.
  - **React Native:** Official Firebase JS SDK (`firebase` — `onSnapshot()` listeners on favorites, published properties, and notifications) + `AsyncStorage` UID-scoped local cache.
- **Trusted Backend Logic:** `functions/index.js` (Firebase Cloud Functions v2) handles:
  - Creating recipient notifications on `contact_requests` creation (`onContactRequestCreated`)
  - Creating owner notifications on `properties` moderation/status transitions (`onPropertyStatusUpdated`)
  - Delivering FCM push notifications via `admin.messaging().sendEachForMulticast()` and cleaning up invalid tokens (`onNotificationCreated`)
- **Maps:** OpenStreetMap / CARTO Voyager & Dark Matter tiles (no paid Google Maps API key required):
  - **Flutter:** `flutter_map` + `latlong2` + `geolocator`
  - **React Native:** Custom slippy-tile canvas renderer + `react-native-svg` + `expo-location` (compatible with Expo Go)

---

## Expo Go vs. Development Build Limitations

- **Works in Expo Go:** Authentication, Firestore `onSnapshot()` real-time synchronization, property browsing/filtering, favorites, contact requests, and CARTO/OSM interactive maps.
- **Requires Expo Development Build (EAS Build):** Remote FCM push notifications when the app is backgrounded or terminated (`expo-notifications` remote push is not supported in Expo Go on newer Expo SDKs).

---

## Database Schema & Provenance Model

- **`properties/{propertyId}`**
  - Strict separation between individual owner/agency listings (`listingCategory: "VERIFIED_LISTING"`) and institutional housing programme references (`listingCategory: "DEVELOPMENT_REFERENCE"`, e.g. SNIT, SPROLS, AFH).
  - Normal users can only create `DRAFT` or `PENDING_REVIEW` listings bound to `ownerId == request.auth.uid`. Only admins/trusted backend can transition listings to `PUBLISHED` or `REJECTED`.
  - Fabricated seed listings and stock Unsplash fixtures have been removed (`firebase_seed_data.json` is empty and `scripts/seed_live.js` is disabled).
- **`users/{uid}`** (private profile, readable/writable only by owner or `ADMIN`)
  - **`users/{uid}/favorites/{propertyId}`** (isolated per-user favorites referencing existing properties)
  - **`users/{uid}/fcmTokens/{tokenId}`** (per-device FCM push tokens)
- **`public_profiles/{uid}`** (publicly approved display fields only, no PII)
- **`agencies/{agencyId}`** (`verified` flag protected against client tampering)
- **`contact_requests/{requestId}`** (requires authentication, `senderId == request.auth.uid`, valid `PUBLISHED` property, and `propertyOwnerId` matching the property document)
- **`notifications/{notificationId}`** (created only by trusted Cloud Functions / Admin SDK; recipients can read, delete, and mark `read`)
- **`property_images/{imageId}`** & **`reports/{reportId}`**

---

## Security Rules (`firestore.rules` & `storage.rules`)

- `firestore.rules` enforces:
  - No self-assigned `ADMIN` role (`request.auth.token.role == 'ADMIN'` custom claim only)
  - Strict owner/field-level update guards via `diff().affectedKeys()`
  - Authenticated-only contact requests with cross-document `get()` owner verification
  - Server-only notification creation
- `storage.rules` enforces authenticated per-user paths, 5 MB limit on property images (`2 MB` on avatars), and strict `image/(jpeg|jpg|png|webp)` MIME validation.

---

## Environment Setup

1. Copy `.env.example` to `.env` (gitignored) and set your Firebase Web Client config:
   - `EXPO_PUBLIC_FIREBASE_API_KEY` / `FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID=darlink-74715`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=darlink-74715.firebaseapp.com`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=darlink-74715.firebasestorage.app`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
2. Never commit `.env`, service-account JSON files, or Android signing keys.

---

## Running & Testing

### Flutter
```bash
cd flutter/services_immobilier_flutter
flutter pub get
flutter analyze --no-pub
flutter test
```

### React Native (Expo)
```bash
cd react-native/darlink_react_native
npm install
npx tsc --noEmit
npx tsx test/run_all_tests.ts
npx expo start --lan
```

### Firebase Emulator Security Tests
```bash
npx firebase-tools emulators:exec --only firestore --project darlink-74715 "node scripts/test_security_rules.js"
```

### Catalogue Provenance Audit (Dry-Run & Backup)
```bash
node scripts/migrate_catalogue_provenance.js --backup --dry-run
```

---

## Known Limitations

- **Physical Device Verification:** Remote FCM push notification delivery and real-phone GPS/tile rendering require physical Android/iOS device testing (not verifiable via CLI alone).
- **Production Rules & Data Migration:** Hardened `firestore.rules` and `DEVELOPMENT_REFERENCE` metadata migration are verified in the emulator and `--dry-run`, pending explicit owner approval before `firebase deploy` and live migration execution.
