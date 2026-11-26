# DarLink — Actual Failure Investigation & Prioritized Repair Plan

**Date:** 2026-11-26  
**Scope:** Full source & runtime audit of `flutter/services_immobilier_flutter`, `react-native/darlink_react_native`, `firestore.rules`, `storage.rules`, and live Cloud Firestore data (`darlink-74715`).  
**Status:** Investigation complete (Phase 1–4). No broad rewrite performed in this phase.

---

## 1. Executive Summary of Confirmed Root Causes

1. **Publishing with photos fails at Firestore Rules (`P0` — Confirmed):** Both `add_property_screen.dart` and `AddPropertyScreen.tsx` upload images **before** `createProperty()` writes the `properties/{propertyId}` document. Inside `StorageService.uploadImage()` / `uploadImageToFirebaseStorage()`, the code immediately writes a `property_images` metadata document. However, `firestore.rules` line 209 requires `exists(/databases/$(database)/documents/properties/$(request.resource.data.propertyId))`, causing `PERMISSION_DENIED` and aborting property creation before the listing is ever saved.
2. **React Native binary upload & stale token hazard (`P0/P1` — Confirmed):** `AddPropertyScreen.tsx` reads local `file://` images via `fetch(photo.uri).arrayBuffer()` and passes `Uint8Array` directly to `fetch(uploadUrl, { body })`, which is unreliable on React Native Hermes (Android/iOS). Additionally, `authService.getToken()` is called without refreshing an expired JWT.
3. **Property announcement images are missing on Home & Search (`P1` — Confirmed):** Live query of `https://firestore.googleapis.com/v1/projects/darlink-74715/databases/(default)/documents/properties?pageSize=10` shows every `PUBLISHED` listing (`ref_afh_*`, `ref_snit_*`, `ref_snitnord_*`) has `imageUrl: ""`, `imagePermissionStatus: "NONE_PLACEHOLDER_USED"`, and `galleryCount: 0`. Combined with the failed upload flow, 100% of cards fall back to the blueprint placeholder.
4. **Trilingual (FR / AR / EN) translations remain incomplete (`P2` — Confirmed):** Dozens of hardcoded French strings remain in `search_screen.dart`, `profile_screen.dart`, `map_screen.dart`, `property_details_screen.dart`, `SearchScreen.tsx`, `ProfileScreen.tsx`, `MapScreen.tsx`, and `App.tsx`.
5. **Arabic RTL is incomplete (`P2` — Confirmed):** React Native only sets `direction: isRTL ? 'rtl' : 'ltr'` on `SafeAreaView` without updating `I18nManager` or flipping `marginLeft`/`marginRight`, `left`/`right` overlays, `textAlign`, and directional icons (`ArrowLeft`, `ChevronRight`) across screens. Flutter still uses non-directional `EdgeInsets.only` / `Positioned(left/right)` / `chevron_right_rounded` in several screens.
6. **Navigation & button interaction defects (`P3` — Confirmed):** Flutter `app_theme.dart` sets `NoSplash.splashFactory` on `ThemeData`, `IconButton`, and `TextButton`, but not on `ElevatedButtonThemeData` / `OutlinedButtonThemeData`. In React Native, `ProfileScreen.tsx` lacks an Edit action for user listings (`myProperties`), and `MainNavigationScreen.tsx` unmounts/remounts tab screens on every tab switch.
7. **Performance bottlenecks (`P4` — Confirmed):** Flutter `home_screen.dart` uses `ListView` + `.map()` (eager build) and `IndexedStack` (mounts all 4 tabs at boot). React Native `HomeScreen.tsx` and `SearchScreen.tsx` use `ScrollView` + `.map()` instead of virtualized `FlatList`, and `MainNavigationScreen.tsx` remounts screens on every tab switch, re-triggering Firestore queries.

---

## 2. Failure Matrix (Confirmed vs. Suspected)

| Feature | Actual behavior | Root cause | Relevant files | Reproduction steps |
|---|---|---|---|---|
| **Property publishing with photos (P0)** | Submitting a new listing with selected photos fails before creating the property document. | **Confirmed:** `add_property_screen.dart` & `AddPropertyScreen.tsx` call `StorageService` before `createProperty()`. `StorageService` writes to `property_images/{ts}` immediately, but `firestore.rules:209` rejects `property_images` creation unless `properties/{propertyId}` already exists. | `firestore.rules` (L204–212), `storage_service.dart` (L93–103), `storageService.ts` (L95–105), `add_property_screen.dart` (L250–310), `AddPropertyScreen.tsx` (L235–305) | 1. Log in as authenticated user.<br>2. Open Add Property.<br>3. Pick 1+ gallery photo, fill fields, tap Publish.<br>4. Observe `PERMISSION_DENIED` on `property_images` aborting `createProperty()`. |
| **React Native photo binary upload (P1)** | Local gallery photo upload can fail or send invalid body on Android/iOS Expo Go, or fail with 401 if token expired. | **Confirmed:** `AddPropertyScreen.tsx` uses `fetch(photo.uri).arrayBuffer()` + `Uint8Array` body in `fetch()`, and calls `authService.getToken()` without `refreshSessionIfNeeded()`. | `AddPropertyScreen.tsx` (L248–275), `storageService.ts` (L76–83), `authService.ts` (L202) | 1. Select a local `file://` photo on Android/iOS Expo Go.<br>2. Submit form.<br>3. Observe fetch/upload failure or 401 on expired token. |
| **Missing property images on Home (P1)** | All feed cards show the blueprint fallback box instead of property photos. | **Confirmed:** Live Firestore query on `properties` shows all seeded `PUBLISHED` documents have `imageUrl: ""` and `imagePermissionStatus: "NONE_PLACEHOLDER_USED"`, while new user uploads fail per P0 above. | Live Firestore `properties` collection, `PropertyCard.tsx` (L67, L108–135), `property_card.dart` (L135–143) | 1. Open Home screen in Flutter or RN.<br>2. Observe all `PUBLISHED` listings render `_ArchitecturalBlueprintFallback` / `blueprintFallback`. |
| **Incomplete FR / AR / EN translations (P2)** | Switching to Arabic or English leaves French text on Search, Profile, Map, Details, and Splash. | **Confirmed:** Hardcoded French strings remain in `search_screen.dart` (`EXPLORATION`, `Recherche de biens`, `Gouvernorats de Tunisie (24)`, `Budget (DT)`, `Plus récentes`, `Charger plus`), `profile_screen.dart` (`Mot de passe oublié`, `Tableau de bord`, `Mon Profil`, `Créer un compte`, `Propriétaire`, `PRÉFÉRENCES`), `map_screen.dart` (GPS prompts), `SearchScreen.tsx`, `ProfileScreen.tsx` (auth form & alerts), `MapScreen.tsx` (GPS banners), and `App.tsx` (`Immobilier d’exception • Tunisie`). | `search_screen.dart`, `profile_screen.dart`, `map_screen.dart`, `SearchScreen.tsx`, `ProfileScreen.tsx`, `MapScreen.tsx`, `App.tsx` | 1. Switch language to Arabic or English in Profile.<br>2. Navigate to Search, Map, Profile auth modal.<br>3. Observe mixed French/Arabic or French/English labels. |
| **Incomplete Arabic RTL layout (P2)** | Arabic text translates in parts, but directional icons, margins, and overlays do not mirror cleanly. | **Confirmed:** RN `MainNavigationScreen.tsx` relies only on `direction: 'rtl'` on `SafeAreaView` without updating `I18nManager` or flipping `ArrowLeft`/`ChevronRight`, `textAlign`, and `left`/`right` overlays. Flutter still uses `Icons.chevron_right_rounded` and `EdgeInsets.only(left/right)` in several screens. **Suspected:** Native Android `TextInput` cursor alignment may also stay LTR without `I18nManager.forceRTL` / explicit `textAlign: 'right'`. | `MainNavigationScreen.tsx` (L84), `PropertyDetailsScreen.tsx` (L245, L323), `HomeScreen.tsx`, `SearchScreen.tsx`, `property_details_screen.dart` (L594), `map_screen.dart` | 1. Switch language to Arabic.<br>2. Open Details, Search, and Map.<br>3. Observe unflipped arrows and misaligned overlays/inputs. |
| **Navigation & button states / missing actions (P3)** | Some Flutter buttons still show Material tap overlays; RN `myProperties` has no Edit button; RN tabs reset on switch. | **Confirmed:** `app_theme.dart` omits `elevatedButtonTheme`/`outlinedButtonTheme` `overlayColor` & `splashFactory`. `ProfileScreen.tsx` (L592–615) only renders Delete on user listings (no Edit callback to `AddPropertyScreen` with `propertyToEdit`). `MainNavigationScreen.tsx` (L62–75) switches via `renderActiveScreen()`, unmounting inactive tabs. | `app_theme.dart` (L112–230), `ProfileScreen.tsx` (L592–615), `MainNavigationScreen.tsx` (L62–75) | 1. In RN, open Profile > My Listings: only trash icon exists (no edit).<br>2. Scroll Home, switch to Search, switch back: Home reloads and loses scroll position. |
| **Slow / heavy scrolling & startup (P4)** | Scrolling feeds and switching tabs feels heavy and re-fetches data. | **Confirmed:** `HomeScreen.tsx` renders all cards inside `<ScrollView>` via `.map()` and calls `setState` in `onScroll`. `home_screen.dart` uses `ListView` + `.map()` instead of `ListView.builder`. `main_navigation_screen.dart` uses `IndexedStack`, mounting all 4 tabs on boot. | `HomeScreen.tsx` (L521–529), `home_screen.dart` (L446), `main_navigation_screen.dart` (L91–94) | 1. Load 20–40 listings.<br>2. Scroll rapidly or switch tabs repeatedly.<br>3. Observe eager card mounting and redundant Firestore fetches. |
| **Visual polish gaps (P5)** | Some screens look less cohesive than the Home showcase. | **Confirmed:** `AddPropertyScreen.tsx` and `ProfileScreen.tsx` auth forms use flat bordered inputs/cards rather than unified Liquid Glass surfaces; `PropertyDetailsScreen.tsx` `ArrowLeft`/`ChevronRight` and `SearchScreen.tsx` filter sections have inconsistent spacing/typography compared to `HomeScreen.tsx`. | `AddPropertyScreen.tsx`, `ProfileScreen.tsx`, `SearchScreen.tsx` | Compare Home feed vs. Add Property and Profile auth screens visually. |

---

## 3. Verification & Runtime Evidence Collected

- **Live Firestore (`darlink-74715`):** Queried `properties?pageSize=10` via REST; confirmed all 10 returned `PUBLISHED` documents have `imageUrl: ""`, `imgPerm: "NONE_PLACEHOLDER_USED"`, `galleryCount: 0`.
- **Security Rules (`firestore.rules` & `storage.rules`):** Confirmed `storage.rules` allows authenticated owner writes to `properties/{userId}/{propertyId}/{fileName}` (`<= 5 MB`, `jpeg|jpg|png|webp`), whereas `firestore.rules:209` blocks `property_images` creation if `properties/{propertyId}` does not yet exist.
- **Static & Automated Checks (verified on current `main`):**
  - Flutter: `flutter analyze` (0 issues), `flutter test` (34/34 passed)
  - React Native: `npx tsc --noEmit` (0 errors), `npm test` (30/30 passed), `npx expo-doctor` (20/20 checks passed)
  - Expo Metro LAN server: running on `http://localhost:8081` (`packager-status:running`, LAN `exp://192.168.138.113:8081`).

---

## 4. Prioritized Repair Plan (Next Phase)

### P0 — Broken Core Functionality & Publishing
- **Fix upload/publish order in both apps:**
  1. Generate `propertyId = prop_<timestamp>` first.
  2. Upload selected photos to Firebase Storage (`properties/{uid}/{propertyId}/...`) **without** writing `property_images` first (or write `property_images` **after** `createProperty()` succeeds in Firestore!).
  3. Refresh auth token (`refreshSessionIfNeeded()`) before upload in both Flutter and RN.
  4. Persist `properties/{propertyId}` via `createProperty()`, then record `property_images` metadata.
- **Files:** `storage_service.dart`, `add_property_screen.dart`, `storageService.ts`, `AddPropertyScreen.tsx`, `authService.ts`
- **Test:** Authenticate a test account, select gallery photos, submit as `PENDING_REVIEW` or `DRAFT`, verify `properties/{id}` and `property_images/{id}` both succeed in Firestore and display in My Listings with real uploaded images.

### P1 — Image Selection & Firebase Storage (React Native Binary Upload)
- **Fix RN local file upload:** Replace `fetch(photo.uri).arrayBuffer()` + `Uint8Array` body with `expo-file-system` `FileSystem.uploadAsync` (binary `uploadType: BINARY_CONTENT`) or a verified `Blob`/`XMLHttpRequest` binary upload to Firebase Storage REST API, with real progress callbacks.
- **Files:** `storageService.ts`, `AddPropertyScreen.tsx`, `package.json` (`expo-file-system` if needed)
- **Test:** Upload JPEG/PNG/WebP from Expo Go on Android/iOS, verify non-zero bytes in Firebase Storage and valid `https://firebasestorage.googleapis.com/...` image rendering in `PropertyCard` and `PropertyDetailsScreen`.

### P2 — Complete Translations & Arabic RTL
- **Translate remaining hardcoded strings** in:
  - Flutter: `search_screen.dart`, `profile_screen.dart`, `map_screen.dart`, `property_details_screen.dart`, `notification_screen.dart`, `auth_service.dart`
  - React Native: `SearchScreen.tsx`, `ProfileScreen.tsx`, `MapScreen.tsx`, `PropertyDetailsScreen.tsx`, `NotificationScreen.tsx`, `App.tsx` (move `LocalizationProvider` to `App.tsx`)
- **Complete RTL mirroring:** Mirror directional icons (`ArrowLeft`/`ArrowRight`, `ChevronLeft`/`ChevronRight`), `EdgeInsetsDirectional` / `PositionedDirectional` / `start`/`end`, and `textAlign: isRTL ? 'right' : 'left'` across all screens, while keeping maps and numeric phone/price tokens properly formatted.
- **Test:** Switch FR → AR → EN live at runtime across all 8 screens in both apps and verify zero mixed-language strings and proper RTL alignment.

### P3 — Broken/Missing Buttons & Navigation Polish
- Wire Edit listing button on `ProfileScreen.tsx` `myProperties` cards to open `AddPropertyScreen` with `propertyToEdit`.
- Add `NoSplash.splashFactory` and transparent `overlayColor` to `elevatedButtonTheme` and `outlinedButtonTheme` in `app_theme.dart`.
- Preserve tab state/scroll in React Native `MainNavigationScreen.tsx` (keep mounted or cache state instead of destroying tabs on switch).
- **Files:** `app_theme.dart`, `ProfileScreen.tsx`, `MainNavigationScreen.tsx`
- **Test:** Tap every visible button, tab, and modal action in both apps; confirm zero dead buttons and zero dark rectangular pressed overlays.

### P4 — Performance & Stability
- Convert `HomeScreen.tsx` and `SearchScreen.tsx` vertical feeds from `ScrollView` + `.map()` to virtualized `FlatList` (`initialNumToRender`, `windowSize`, `removeClippedSubviews`), and move scroll header tracking to `Animated.event` (no `setState` per scroll tick).
- Convert Flutter `home_screen.dart` vertical feed from `ListView` + `.map()` to `ListView.builder` / `SliverList.builder`, and lazy-initialize non-active tabs in `main_navigation_screen.dart`.
- **Files:** `HomeScreen.tsx`, `SearchScreen.tsx`, `home_screen.dart`, `main_navigation_screen.dart`
- **Test:** Scroll 40+ items smoothly and verify no redundant Firestore reads on tab switch.

### P5 — Visual Consistency
- Align `AddPropertyScreen.tsx` and `ProfileScreen.tsx` auth/form surfaces with the Liquid Glass design tokens used on `HomeScreen.tsx` and Flutter `add_property_screen.dart`.
- **Files:** `AddPropertyScreen.tsx`, `ProfileScreen.tsx`

