# DarLink — Multilingual, Functionality, Media & Performance Repair Report

**Date:** 2026-11-26  
**Repository:** `Application-Mobile-Services-Immobilier` (`main`)  
**Platforms:** Flutter (`flutter/services_immobilier_flutter`) & React Native / Expo (`react-native/darlink_react_native`)

---

## 1. Translation Architecture & Arabic RTL Support

### Flutter (`flutter/services_immobilier_flutter`)
- Added `flutter_localizations` (SDK) and `intl` to `pubspec.yaml`, and configured `MaterialApp` in `lib/main.dart` with `locale`, `supportedLocales` (`fr`, `ar`, `en`), `GlobalMaterialLocalizations.delegate`, `GlobalWidgetsLocalizations.delegate`, `GlobalCupertinoLocalizations.delegate`, and `Directionality(textDirection: AppLocale.instance.textDirection, ...)`.
- Upgraded `lib/core/localization/app_locale.dart`:
  - First-launch device locale detection via `PlatformDispatcher.instance.locale.languageCode` when no saved preference exists in `SharedPreferences`.
  - Complete FR / AR / EN dictionaries covering navigation, home, search, filters, property types (`Appartement`, `Villa`, `Maison`, `Studio`, `Terrain`, `Commercial`), listing statuses (`DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `SOLD`, `RENTED`, `ARCHIVED`), add/edit property, photo picker & upload progress, notifications, map, profile/auth, and contact/error dialogs.
  - Added `trParams`, `translatePropertyType`, and `translateListingStatus` helpers.
- Replaced hardcoded French strings across `main_navigation_screen.dart`, `home_screen.dart`, `property_card.dart`, `property_details_screen.dart`, `add_property_screen.dart`, `search_screen.dart`, `notification_screen.dart`, `map_screen.dart`, and `profile_screen.dart`.
- Converted directional positioning to RTL-aware APIs (`PositionedDirectional`) in `liquid_glass.dart` and `property_details_screen.dart`.

### React Native (`react-native/darlink_react_native`)
- Installed `expo-localization` and updated `src/core/localization/LocalizationContext.tsx`:
  - Persists selected language in `AsyncStorage` (`darlink_app_lang`).
  - Auto-detects device language on first launch via `Localization.getLocales()`.
  - Exposes `translatePropertyType`, `translateListingStatus`, and full `translateAmenity`.
- Expanded `src/core/localization/translations.ts` with complete FR / AR / EN dictionaries matching Flutter.
- Applied `direction: isRTL ? 'rtl' : 'ltr'` on the root `SafeAreaView` in `MainNavigationScreen.tsx` for immediate live RTL/LTR switching without restarting the app.
- Replaced hardcoded French strings across `PropertyCard.tsx`, `HomeScreen.tsx`, `PropertyDetailsScreen.tsx`, `AddPropertyScreen.tsx`, `MapScreen.tsx`, and `ProfileScreen.tsx`.

---

## 2. Property Media Pipeline & Image Selection

- **Flutter:** Added `image_picker` and `cached_network_image`. Replaced the manual HTTPS URL text input in `add_property_screen.dart` with a real multi-photo gallery picker (`pickMultiImage`) and camera capture (`pickImage`), live thumbnail previews, cover photo selection, photo removal, upload progress (`uploading_photos`), and Firebase Storage uploads via `StorageService.instance.uploadImage(...)` with refreshed auth tokens (`AuthService.instance.refreshSessionIfNeeded()`).
- **React Native:** Added `expo-image-picker` and `expo-image`. Replaced the manual URL input in `AddPropertyScreen.tsx` with `ImagePicker.launchImageLibraryAsync` (multi-selection) and `launchCameraAsync`, local previews with `expo-image`, cover selection, removal, upload progress, and Firebase Storage uploads via `uploadImageToFirebaseStorage(...)`.
- **Cached Image Display:** Replaced raw `Image.network` with `LuxuryNetworkImage` (`CachedNetworkImage` with `memCacheWidth` bounds and static architectural placeholder) in Flutter, and replaced React Native `<Image>` with `expo-image` (`cachePolicy="memory-disk"`, `contentFit="cover"`, smooth `transition={200}`) in `PropertyCard.tsx`, `HomeScreen.tsx`, `PropertyDetailsScreen.tsx`, and `AddPropertyScreen.tsx`.
- **Storage Rules Verification:** Inspected root `storage.rules` — authenticated owner writes to `properties/{userId}/{propertyId}/{fileName}` (max 5 MB, JPEG/PNG/WebP) and `avatars/{userId}/{fileName}` (max 2 MB) are already permitted; no production rule changes were deployed.

---

## 3. Property Publishing Workflow

- Preserved the Firestore security model (`DRAFT` and `PENDING_REVIEW` only for non-admin users; never forces `PUBLISHED`).
- Added `galleryUrls` persistence to `PropertyApiService.createProperty` (Flutter) and `propertyApiService.updateProperty` (React Native).
- Added duplicate-submission locks (`_isSubmitting` / `submitting`), full form + photo validation, and explicit error alerts/snackbars when upload or Firestore persistence fails.
- Added direct edit navigation from user listings in Flutter `profile_screen.dart` to `EcranDepotAnnonce(proprieteAEditer: p)`.

---

## 4. Navigation & Button Interaction States

- **Flutter:**
  - Configured `NoSplash.splashFactory`, `Colors.transparent` splash/highlight/hover colors, and rounded `IconButtonThemeData` / `TextButtonThemeData` in `app_theme.dart` (light and dark themes) to eliminate dark rectangular ink overlays.
  - Replaced Material 3 `NavigationBar` in `main_navigation_screen.dart` with a custom Liquid Glass floating dock (`_NavDockItem`) featuring smooth `AnimatedScale` + `AnimatedContainer` pill indicators and translated labels.
- **React Native:**
  - Kept `useBlur` enabled on the floating dock in `MainNavigationScreen.tsx` while using lightweight translucent surfaces for scrolling cards.
  - Verified `expo-font` peer dependency for `@expo/vector-icons` (`npx expo install expo-font`).

---

## 5. Performance Optimizations

- **Flutter:** Added `useBlur` flag (default `false`) to `LiquidGlassSurface` and removed `BackdropFilter` inside scrolling `CartePropriete` and `_HorizontalCollectionTile` cards, eliminating per-frame offscreen Skia blur passes during scrolling. Bounded decoded image memory with `memCacheWidth` in `LuxuryNetworkImage`.
- **React Native:** Added `useBlur` flag (default `false`) to `LiquidGlassView` so `BlurView` only runs on floating dock surfaces rather than every scrolling card, and switched image rendering to `expo-image` with `memory-disk` caching.

---

## 6. Verification Executed

| Check | Command | Result |
|---|---|---|
| Flutter Static Analysis | `flutter analyze` | **0 issues found** |
| Flutter Automated Suite | `flutter test` | **34/34 passed** |
| React Native TypeScript | `npx tsc --noEmit` | **0 errors** |
| React Native Automated Suite | `npm test` (`npx tsx test/run_all_tests.ts`) | **30/30 passed** |
| Expo Project Health | `npx expo-doctor` | **20/20 checks passed** |

---

## 7. Remaining Limitations

- Physical-device Expo Go & Android/iOS camera/gallery runtime tests and visual screenshots in FR/AR/EN were not executed in this terminal-only session.
