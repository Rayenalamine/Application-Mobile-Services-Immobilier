# DARLINK — CRITICAL PRODUCTION REMEDIATION AUDIT

**Audit Date:** 2026-11-25  
**Repository:** `https://github.com/Rayenalamine/Application-Mobile-Services-Immobilier`  
**Branch / Commit Audited:** `main` (`ab38a69`)  
**Firebase Project:** `darlink-74715` (Cloud Firestore `(default)`)  
**Audit Method:** Direct inspection of source code, `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json`, `firebase_seed_data.json`, `scripts/`, Flutter `lib/`, React Native `src/`, live Cloud Firestore documents, and automated test suites.

---

## Executive Summary of Findings

Independent inspection of the `main` branch revealed **21 concrete defects** spanning fabricated seed data, Firestore security vulnerabilities, REST-polling mislabeled as real-time, unimplemented FCM push delivery, outdated/contradictory documentation, and client/model gaps.

| Severity | Count | Key Themes |
|---|---:|---|
| **Critical** | 5 | Fabricated seed dataset (`firebase_seed_data.json`), institutional references published as available individual listings, client-side direct `PUBLISHED` creation, unauthenticated `contact_requests` + spoofable `propertyOwnerId`, client-side cross-user `notifications` creation |
| **High** | 6 | Polling (6s) instead of true Firestore snapshot listeners (`onSnapshot`/`snapshots`), missing `diff().affectedKeys()` field-level update guards on `properties`, arbitrary `agentId` assignment allowed in rules, no trusted backend Cloud Functions for moderation/notifications/push, no Firebase Emulator Suite security test execution, missing `firebase_core`/`cloud_firestore`/`firebase` SDK integration |
| **Medium** | 6 | `README.md` severely outdated (claims real-time sync, documents weak legacy rules, references 13-property seed & Esri tiles), `docs/QA/FINAL_QA_REPORT.md` describes obsolete Spring Boot/PostgreSQL 18 backend, `scripts/verify_e2e_cloud_firestore.js` hardcodes `length === 13` and fails, `scripts/seed_live.js` still targets fabricated `firebase_seed_data.json`, missing `DEVELOPMENT_REFERENCE` / `PROJECT_REFERENCE` distinction in property models, missing `account deletion` / `email verification` parity checks |
| **Low** | 4 | Hardcoded fallback API keys in `firebase_config.dart` / `firebaseConfig.ts` (acceptable for public Web API key, but should clearly document restriction scope), legacy PowerShell QA scripts referencing Unsplash URLs, minor UI/map/parity documentation drift, trailing test fixture `injectTestFixtures` hygiene |

---

## Detailed Defect Register

### D-01 — Fabricated Seed Dataset Still Present in Repository
- **Severity:** Critical
- **Affected File(s):** `firebase_seed_data.json`, `scripts/seed_live.js`
- **Root Cause:** Legacy 13-property seed dataset containing stock Unsplash URLs, repeated placeholder agent (`Rayen Lamine`), placeholder phone (`+216 71 888 999`), and placeholder owner (`user_admin_1`) was never removed from the repository, contradicting earlier reports.
- **User-Visible Consequence:** Any developer running `scripts/seed_live.js` re-populates production Firestore with 13 fabricated luxury listings.
- **Required Correction:** Remove fabricated listings from `firebase_seed_data.json`, archive/deprecate `scripts/seed_live.js`, enforce strict provenance schema (`sourceType`, `sourceUrl`, `lastVerifiedAt`, `verificationStatus`, `republicationAuthorized`), and create a safe backup/migration script with dry-run + explicit approval before touching live Firestore.
- **Verification Method:** Inspection of `firebase_seed_data.json` & `scripts/`, dry-run migration script output, grep for `unsplash` / `user_admin_1` / `+216 71 888 999`.
- **Status:** Open

### D-02 — Institutional Housing Programmes Stored as Individual `PUBLISHED` Listings
- **Severity:** Critical
- **Affected File(s):** `scripts/tunisia_verified_catalogue.json`, `scripts/catalog_importer.js`, live Firestore `properties` collection (18 docs), `flutter/.../property.dart`, `react-native/.../property.ts`
- **Root Cause:** 18 SNIT, SPROLS, and AFH institutional housing programmes were imported into `properties` with `listingStatus: "PUBLISHED"` and `ownerId: "3TD4BAlbq3dztLRiltWwLKIx1vv2"` (test curator UID), presenting development programmes as individual available properties.
- **User-Visible Consequence:** Users see institutional programmes mixed with individual listings, and `ownerId` points to a test account rather than an institutional/reference record.
- **Required Correction:** Add `listingCategory` (`VERIFIED_LISTING` vs `DEVELOPMENT_REFERENCE` / `PROJECT_REFERENCE`) and strict provenance fields to property models and UI cards in Flutter and RN; prepare migration plan + backup of existing 18 live docs; await user approval before updating live Firestore.
- **Verification Method:** Model & UI inspection, live Firestore backup JSON, migration dry-run output.
- **Status:** Open

### D-03 — Normal Users Can Directly Create & Publish `PUBLISHED` Listings
- **Severity:** Critical
- **Affected File(s):** `firestore.rules` (`match /properties/{propertyId}`), `flutter/.../add_property_screen.dart`, `react-native/.../AddPropertyScreen.tsx`
- **Root Cause:** `firestore.rules` allows any authenticated user to set `listingStatus = 'PUBLISHED'` on `create` and `update` (only blocking `'REJECTED'`). Both `add_property_screen.dart` and `AddPropertyScreen.tsx` default `_statutSelectionne` / `listingStatus` to `'PUBLISHED'`.
- **User-Visible Consequence:** Any newly registered user can bypass moderation and immediately publish unverified listings to the public catalog.
- **Required Correction:** Restrict normal authenticated users in `firestore.rules` to creating `DRAFT` or `PENDING_REVIEW` listings only; allow `PUBLISHED` / `REJECTED` transitions only via `isAdmin()` or trusted server-side Cloud Functions; enforce `ownerId == request.auth.uid` (required on create, immutable on update), validate `diff().affectedKeys()`, field types, numeric ranges, text lengths, and forbid arbitrary `agentId` assignment by non-admins. Update Flutter & RN creation screens to submit `DRAFT` or `PENDING_REVIEW`.
- **Verification Method:** Firebase Emulator Suite negative & positive tests (`test_security_rules.js` against Emulator).
- **Status:** Open

### D-04 — Unauthenticated Contact Requests & Client-Spoofable `propertyOwnerId`
- **Severity:** Critical
- **Affected File(s):** `firestore.rules` (`match /contact_requests/{requestId}`), `flutter/.../contact_api_service.dart`, `react-native/.../contactApiService.ts`
- **Root Cause:** `firestore.rules` uses `(!isAuthenticated() || ...)`, allowing unauthenticated spam/contact creation, and trusts the client-supplied `propertyOwnerId` without verifying it against `get(/databases/$(database)/documents/properties/$(request.resource.data.propertyId)).data.ownerId`.
- **User-Visible Consequence:** Unauthenticated callers can spam `contact_requests`, and authenticated attackers can spoof `propertyOwnerId` to hijack or hide inquiries.
- **Required Correction:** Require `isAuthenticated()` and `request.resource.data.senderId == request.auth.uid`; verify property exists and is `PUBLISHED`; verify `propertyOwnerId == get(.../properties/$(propertyId)).data.ownerId`; restrict readable/updatable fields and status transitions (`PENDING` → `CONTACTED`/`ACCEPTED`/`REJECTED`/`ARCHIVED`); add anti-spam/rate-limit support via trusted backend logic.
- **Verification Method:** Firebase Emulator Suite security tests (anonymous denied, invalid propertyId denied, spoofed owner UID denied, valid request accepted).
- **Status:** Open

### D-05 — Arbitrary Cross-User Notification Creation Allowed from Clients
- **Severity:** Critical
- **Affected File(s):** `firestore.rules` (`match /notifications/{notificationId}`), `flutter/.../contact_api_service.dart`, `react-native/.../contactApiService.ts`
- **Root Cause:** `firestore.rules` allows `create` if `request.resource.data.senderUid == request.auth.uid`, enabling any authenticated user to inject arbitrary notifications into any other user's inbox. Both client apps directly write to `/notifications`.
- **User-Visible Consequence:** Any user can forge system/security/moderation notifications for any other user.
- **Required Correction:** Deny client `create` on `/notifications` for arbitrary recipients in `firestore.rules` (only `isAdmin()` or trusted Cloud Functions / backend trigger on `contact_requests` and `properties` status changes); restrict client updates on `/notifications/{id}` to `{ read }` only (`diff().affectedKeys().hasOnly(['read'])`). Implement Cloud Functions (`functions/index.js`) to create notifications securely on Firestore triggers.
- **Verification Method:** Firebase Emulator Suite test confirming client creating notification for another user is denied.
- **Status:** Open

### D-06 — Polling (6 Seconds) Used Instead of Real-Time Firestore Snapshot Listeners
- **Severity:** High
- **Affected File(s):** `flutter/.../favorites_api_service.dart`, `flutter/.../firestore_client.dart`, `react-native/.../favoritesApiService.ts`, `react-native/.../firestoreEngine.ts`
- **Root Cause:** Both apps use custom REST HTTP clients with `Timer.periodic(6s)` / `setInterval(6000)` on favorites only, and pull-on-demand for properties, contact requests, and notifications.
- **User-Visible Consequence:** Updates are delayed up to 6s for favorites and do not update live at all for properties, contact requests, or notifications without manual refresh.
- **Required Correction:** Integrate official Firebase SDKs:
  - Flutter: `firebase_core`, `firebase_auth`, `cloud_firestore` with `.snapshots()` listeners across properties, favorites, user-owned listings, contact requests, and notifications.
  - React Native: Official Firebase JS SDK (`firebase` — `firebase/app`, `firebase/auth`, `firebase/firestore`) with `onSnapshot()` listeners (works in both Expo Go and Development Builds without ejecting, with proper React Native AsyncStorage auth persistence).
  - Ensure proper subscription lifecycle, loading/empty/error/offline states, and complete unsubscribe/cleanup on logout and disposal.
- **Verification Method:** Unit/integration tests + two-app live synchronization verification.
- **Status:** Open

### D-07 — Missing Field-Level Update Guards & Arbitrary `agentId` Assignment in `properties` Rules
- **Severity:** High
- **Affected File(s):** `firestore.rules` (`match /properties/{propertyId}`)
- **Root Cause:** Property `update` rule checks `ownerId` immutability and `price >= 0` but lacks `diff().affectedKeys().hasOnly([...])`, lacks string length/type bounds, and permits a regular user to assign an arbitrary `agentId` to gain or grant unauthorized access.
- **User-Visible Consequence:** Property owners can modify moderation/verification fields (`republicationAuthorized`, `lastVerifiedAt`, `verificationStatus`, `agentId`, `sourceUrl`) directly.
- **Required Correction:** Enforce `request.resource.data.diff(resource.data).affectedKeys()` whitelist for owners, block moderation/verification/agentId mutations by non-admins, and validate required fields, types, numeric ranges (`price >= 0`, `surfaceM2 > 0`, `bedrooms >= 0`, `bathrooms >= 0`), and max text lengths.
- **Verification Method:** Firebase Emulator Suite tests.
- **Status:** Open

### D-08 — No Trusted Backend / Cloud Functions Deployed for Notifications, Moderation, or FCM Push
- **Severity:** High
- **Affected File(s):** Missing `functions/` directory (`package.json`, `index.js`), `docs/PUSH_NOTIFICATIONS_FCM.md`
- **Root Cause:** Cloud Functions were only documented in Markdown (`docs/PUSH_NOTIFICATIONS_FCM.md`) and never created in the repository.
- **User-Visible Consequence:** No server-triggered notifications, no FCM push delivery to devices, and no server-side anti-spam/moderation triggers.
- **Required Correction:** Implement `functions/package.json` and `functions/index.js` with Firestore triggers (`onContactRequestCreated`, `onPropertyStatusChanged`, `onNotificationCreated` for FCM push delivery + invalid token cleanup + duplicate prevention), and configure `firebase.json`.
- **Verification Method:** Code & unit/emulator verification of Cloud Functions; mark live device FCM delivery explicitly as unverified unless tested on physical devices.
- **Status:** Open

### D-09 — Missing Client Push Notification Integration (Flutter & React Native)
- **Severity:** High
- **Affected File(s):** `flutter/services_immobilier_flutter/pubspec.yaml`, `react-native/darlink_react_native/package.json`, notification services
- **Root Cause:** Neither `firebase_messaging` (Flutter) nor `expo-notifications` (React Native) is installed or wired to `/users/{uid}/fcmTokens/{tokenId}`.
- **User-Visible Consequence:** Users receive zero push notifications when the app is backgrounded or terminated.
- **Required Correction:** Implement FCM token registration, refresh, logout removal, permission-denied handling, and foreground/background/tap handlers in Flutter (`firebase_messaging`) and React Native (`expo-notifications` + `expo-device`, documenting Expo Development Build requirement for remote push on Android/iOS).
- **Verification Method:** Code/test verification + honest physical-device verification status.
- **Status:** Open

### D-10 — Security Rules Never Tested Against Firebase Emulator Suite
- **Severity:** High
- **Affected File(s):** `scripts/test_security_rules.js`, `firebase.json`
- **Root Cause:** `scripts/test_security_rules.js` was only run against live Cloud Firestore with 14 basic assertions, not against the local Firebase Emulator Suite with exhaustive negative/positive rule coverage (including `get()`/`exists()`/`diff().affectedKeys()` checks).
- **User-Visible Consequence:** Critical security regressions could go undetected or require polluting production Firestore during tests.
- **Required Correction:** Expand `scripts/test_security_rules.js` to cover all 12+ required positive and negative cases and run it via `npx firebase-tools emulators:exec --only firestore` against `firestore.rules`.
- **Verification Method:** Actual Firebase Emulator Suite execution and captured console output.
- **Status:** Open

### D-11 — Outdated and Contradictory `README.md`
- **Severity:** Medium
- **Affected File(s):** `README.md`
- **Root Cause:** `README.md` still describes: (a) real-time synchronized favorites over REST, (b) 13-property `firebase_seed_data.json` & `seed_live.js`, (c) an insecure legacy `firestore.rules` snippet (`allow read: if true` on users, `allow create: if true` on contact_requests), and (d) Esri ArcGIS map tiles.
- **User-Visible Consequence:** Collaborators and evaluators receive false architectural, security, and setup information.
- **Required Correction:** Rewrite `README.md` to match the verified architecture, packages, Firebase SDK setup, Expo Go vs Development Build requirements, security rules, notification architecture, maps, tests, and known limitations.
- **Verification Method:** Side-by-side comparison of `README.md` against actual codebase.
- **Status:** Open

### D-12 — Obsolete `docs/QA/FINAL_QA_REPORT.md` Describing Spring Boot + PostgreSQL 18
- **Severity:** Medium
- **Affected File(s):** `docs/QA/FINAL_QA_REPORT.md`
- **Root Cause:** Legacy V8 report referencing PostgreSQL 18, Spring Boot 3.3.5, and Flyway was never replaced when the project migrated to Firebase.
- **User-Visible Consequence:** Contradictory QA records in `docs/QA/`.
- **Required Correction:** Replace `docs/QA/FINAL_QA_REPORT.md` with an accurate, categorized QA report separating Unit, Integration, Emulator, Cloud, Physical-device, and Manual UI tests.
- **Verification Method:** Direct inspection of `docs/QA/FINAL_QA_REPORT.md` and executed test outputs.
- **Status:** Open

### D-13 — Broken `scripts/verify_e2e_cloud_firestore.js`
- **Severity:** Medium
- **Affected File(s):** `scripts/verify_e2e_cloud_firestore.js`
- **Root Cause:** Line 75 hardcodes `propsJson.documents.length === 13` and assumes old numeric IDs (`favorites/1`), causing the script to fail immediately against live Firestore.
- **User-Visible Consequence:** E2E verification script exits with code 1.
- **Required Correction:** Update `verify_e2e_cloud_firestore.js` to use Node `https` (IPv4) and dynamically query/validate genuine published or reference documents without assuming 13 fake properties.
- **Verification Method:** Execution output of `node scripts/verify_e2e_cloud_firestore.js`.
- **Status:** Open

### D-14 — Missing `DEVELOPMENT_REFERENCE` Category Distinction & Empty State Handling
- **Severity:** Medium
- **Affected File(s):** `flutter/.../property.dart`, `flutter/.../property_card.dart`, `flutter/.../home_screen.dart`, `react-native/.../property.ts`, `react-native/.../PropertyCard.tsx`, `react-native/.../HomeScreen.tsx`
- **Root Cause:** Institutional SNIT/SPROLS/AFH entries are stored and displayed as `PUBLISHED` properties rather than `DEVELOPMENT_REFERENCE` / `PROJECT_REFERENCE` institutional references, and empty states for verified listings need explicit separation.
- **User-Visible Consequence:** Users cannot clearly distinguish individual available listings from institutional development references.
- **Required Correction:** Support `listingCategory` (`VERIFIED_LISTING` vs `DEVELOPMENT_REFERENCE`), label institutional references clearly in UI, and show a professional empty state when 0 individual listings are available while keeping verified owner submission accessible.
- **Verification Method:** Widget/component tests and UI inspection.
- **Status:** Open

### D-15 — Agency & Public Profile Model Isolation
- **Severity:** Medium
- **Affected File(s):** `firestore.rules` (`match /users/{userId}`, `match /agencies/{agencyId}`), Flutter & RN profile/agency models
- **Root Cause:** Private user PII is protected in `/users/{uid}`, but if public agent/agency contact info is needed, there is no dedicated public profile rule/model separating approved public fields from private `/users/{uid}` data.
- **User-Visible Consequence:** Risk of either exposing private user data or failing to display verified agency info.
- **Required Correction:** Keep `/users/{uid}` strictly private (owner + admin only), add `public_profiles/{uid}` or use `/agencies/{agencyId}` with strict field validation (`verified` immutable to non-admins, `ownerUid` immutable).
- **Verification Method:** Firebase Emulator Suite tests.
- **Status:** Open

### D-16 — `storage.rules` Property Relationship & Uploader Verification
- **Severity:** Medium
- **Affected File(s):** `storage.rules`
- **Root Cause:** `storage.rules` validates `request.auth.uid == userId`, 5MB size, and image content-type, which is good, but `property_images` metadata in Firestore should match the storage path and property relationship.
- **User-Visible Consequence:** Orphaned or unattributed image metadata could be created.
- **Required Correction:** Tighten `property_images` in `firestore.rules` to validate `uploaderUid == request.auth.uid`, `propertyId` existence, `storagePath` prefix, `contentType`, and `sizeBytes <= 5242880`.
- **Verification Method:** Emulator security tests.
- **Status:** Open

### D-17 — Hardcoded Fallback API Keys & Legacy PowerShell Test Scripts
- **Severity:** Low
- **Affected File(s):** `flutter/.../firebase_config.dart`, `react-native/.../firebaseConfig.ts`, `scripts/e2e_live_test.ps1`, `scripts/e2e_journeys_1_to_10.ps1`
- **Root Cause:** Legacy PowerShell scripts still contain Unsplash URLs and old test assumptions; client configs contain Firebase Web API key literals (public identifiers).
- **User-Visible Consequence:** Confusion during security audits and outdated QA scripts.
- **Required Correction:** Clean up legacy Unsplash references in active scripts, document public Web API key scope clearly, and support `--dart-define` / `EXPO_PUBLIC_*` overrides cleanly.
- **Verification Method:** Grep and script review.
- **Status:** Open

### D-18 — Account Lifecycle Parity Verification Gaps
- **Severity:** Low
- **Affected File(s):** `flutter/.../auth_service.dart`, `react-native/.../authService.ts`, `profile_screen.dart`, `ProfileScreen.tsx`
- **Root Cause:** Account deletion, email verification refresh, password reset, and offline/expired session handling exist in services, but UI parity and automated tests for edge cases (duplicate email, invalid email, wrong password, account deletion cleanup) need verification across both apps.
- **User-Visible Consequence:** Potential edge-case UX inconsistencies between Flutter and React Native.
- **Required Correction:** Audit and align error messages, loading/disabled states, and account deletion cleanup in both apps; test all auth flows.
- **Verification Method:** Flutter & RN auth tests + manual/emulator checks.
- **Status:** Open

### D-19 — Map Rate-Limiting & User-Agent / Tile Provider Compliance
- **Severity:** Low
- **Affected File(s):** `flutter/.../map_screen.dart`, `react-native/.../MapScreen.tsx`
- **Root Cause:** Both apps use CARTO Voyager / Dark Matter OSM-compatible tiles, which is good, but `flutter_map` `TileLayer` should specify a proper `userAgentPackageName` and React Native `MapScreen.tsx` should include attribution + efficient tile bounds/error fallback.
- **User-Visible Consequence:** Potential tile throttling or missing OSM/CARTO attribution.
- **Required Correction:** Verify `userAgentPackageName` in Flutter `TileLayer`, verify visible OSM/CARTO attribution in both Flutter and RN maps, and ensure graceful offline/network failure state.
- **Verification Method:** Code inspection + widget/component tests + honest device-verification status.
- **Status:** Open

### D-20 — `docs/FEATURE_PARITY_MATRIX.md` Outdated Details
- **Severity:** Low
- **Affected File(s):** `docs/FEATURE_PARITY_MATRIX.md`
- **Root Cause:** Parity matrix needs updating to reflect true Firestore snapshot listeners, `DEVELOPMENT_REFERENCE` category, push notification status, and exact test counts.
- **User-Visible Consequence:** Documentation drift.
- **Required Correction:** Update `docs/FEATURE_PARITY_MATRIX.md` after implementation changes are complete.
- **Verification Method:** Direct comparison with code.
- **Status:** Open

### D-21 — Node 22 IPv6 `fetch` Timeout in Remaining Scripts
- **Severity:** Low
- **Affected File(s):** `scripts/catalog_importer.js`, `scripts/catalog_refresh.js`, `scripts/test_security_rules.js`, `scripts/verify_e2e_cloud_firestore.js`
- **Root Cause:** Node 22 global `fetch` (`undici`) defaults to IPv6 and times out on Windows against `googleapis.com` (`dns.setDefaultResultOrder('ipv4first')` does not fix `undici` `fetch`).
- **User-Visible Consequence:** Scripts fail with `ETIMEDOUT` on Windows unless using Node `https` with `family: 4`.
- **Required Correction:** Use a shared `https` (`family: 4`) helper in Node scripts (just like `verify_cross_user_sync_e2e.js`).
- **Verification Method:** Re-run scripts cleanly on Windows.
- **Status:** Open

