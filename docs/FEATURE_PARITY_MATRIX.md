# DARLINK — FEATURE PARITY MATRIX (FLUTTER vs REACT NATIVE)

**Project:** DarLink Real Estate Tunisia  
**Cloud Firebase Project:** `darlink-74715`  
**Database:** Cloud Firestore `(default)`  
**Architecture:** Shared Cloud Firestore REST & Security Model with Strict User-Scoped Isolation  
**Date:** November 2026

---

## 1. Architectural & Cloud Data Parity

| Capability / Module | Flutter (Android & Web) | React Native (Expo Go, Android & iOS) | Parity Status | Implementation Details |
| :--- | :---: | :---: | :---: | :--- |
| **Cloud Firestore Database** | `darlink-74715` `(default)` | `darlink-74715` `(default)` | **100% IDENTICAL** | Both connect to the exact same cloud database via Identity REST & Firestore REST engines. |
| **Authentication Engine** | Firebase Identity Toolkit REST | Firebase Identity Toolkit REST | **100% IDENTICAL** | Email/Password JWT auth, refresh token rotation, `accounts:lookup`, `sendOobCode`. |
| **Strict Scoped Local Storage** | `darlink_fav_user_${uid}_ids` | `@darlink_fav_user_${uid}_ids` | **100% IDENTICAL** | Local storage keys are strictly isolated per authenticated UID. Zero cross-account data leaks. |
| **Reactive Real-time Synchronization** | 6-second periodic polling timer + Firestore REST sync | 6-second periodic polling timer + Firestore REST sync | **100% IDENTICAL** | Actions on Device A (e.g. adding a favorite) propagate to Device B automatically within seconds. |
| **Logout & Data Sanitation** | Complete memory wipe + storage key removal | Complete memory wipe + storage key removal | **100% IDENTICAL** | Disconnecting User A immediately wipes tokens, favorites in memory, and scoped cache. User B sees 0 residual data. |
| **Safe Dev Diagnostic Banner** | `darlink-74715` • Flutter • UID • `(default)` | `darlink-74715` • Expo Go • UID • `(default)` | **100% IDENTICAL** | Dev-only translucent frosted glass banner showing project ID, platform, masked UID, and database ID. |

---

## 2. Core Functional Modules Parity

| Feature | Flutter Implementation | React Native Implementation | Status |
| :--- | :--- | :--- | :---: |
| **Live Tunisian Property Catalogue** | `PropertyApiService.getProperties()` loading directly from `properties` collection. Displays verified institutional listings (SNIT, SPROLS, AFH). | `propertyApiService.getProperties()` loading directly from `properties` collection. Displays verified institutional listings (SNIT, SPROLS, AFH). | **FULL PARITY** |
| **Interactive Map Screen** | `map_screen.dart` with custom interactive canvas/OSM integration, marker selection, governorate clustering, fallback coordinates. | `MapScreen.tsx` with react-native-maps / web fallback, marker selection, governorate clustering, fallback coordinates. | **FULL PARITY** |
| **Multicriteria Search & Filters** | `search_screen.dart` filtering by keyword, type (Appartement, Villa, Maison, Terrain), city, price min/max, surface. | `SearchScreen.tsx` filtering by keyword, type (Appartement, Villa, Maison, Terrain), city, price min/max, surface. | **FULL PARITY** |
| **Favorites Management** | `FavoritesApiService`: persists remotely to `users/{uid}/favorites/{propId}` with bidirectional synchronization. | `favoritesApiService`: persists remotely to `users/{uid}/favorites/{propId}` with bidirectional synchronization. | **FULL PARITY** |
| **Property Submission (CRUD)** | `add_property_screen.dart`: enforces non-negative price, validates coordinates, assigns `ownerId == auth.uid`, sets `listingStatus = PUBLISHED`. | `AddPropertyScreen.tsx`: enforces non-negative price, validates coordinates, assigns `ownerId == auth.uid`, sets `listingStatus = PUBLISHED`. | **FULL PARITY** |
| **Property Details & Ownership** | `property_details_screen.dart`: hero photo, amenities pills, agent badge, native `tel:` dialer button, contact modal. | `PropertyDetailsScreen.tsx`: hero photo, amenities pills, agent badge, native `tel:` dialer button, contact modal. | **FULL PARITY** |
| **Contact & Visit Inquiries** | `contact_api_service.dart`: creates document in `contact_requests` with referential integrity check against target property. | `contactApiService.ts`: creates document in `contact_requests` with referential integrity check against target property. | **FULL PARITY** |
| **In-App Notification Center** | `notification_screen.dart` + `notification_service.dart`: live unread count badge, mark as read, mark all read, delete notification. | `NotificationScreen.tsx` + `notificationService.ts`: live unread count badge, mark as read, mark all read, delete notification. | **FULL PARITY** |
| **User Profile Management** | `profile_screen.dart`: edit profile (full name, phone, photo), change password with reauth, change email, secure delete account. | `ProfileScreen.tsx`: edit profile (full name, phone, photo), change password with reauth, change email, secure delete account. | **FULL PARITY** |

---

## 3. UI/UX & Design Language Parity

| UI/UX Characteristic | Flutter Implementation | React Native Implementation | Status |
| :--- | :--- | :--- | :---: |
| **Scroll-First Interface** | Header collapses on scroll down via `ScrollController` delta listener and `AnimatedCrossFade`; snaps back on scroll up. | Header collapses on scroll down via `onScroll` delta listener and state toggle; snaps back on scroll up. | **FULL PARITY** |
| **Apple-Inspired Translucent Glass** | Frosted glass cards, translucent borders (`0x28FFFFFF` / `0x18000000`), backdrop blur, subtle elevation. | Frosted glass cards (`rgba(22,23,32,0.78)` / `rgba(255,255,255,0.85)`), thin borders, soft shadows (`radius: 12-16`). | **FULL PARITY** |
| **Iconography & Graphics** | Pure Material Symbols / vector icons. Zero emojis, zero cartoon stickers. | Pure Lucide React Native vector icons. Zero emojis, zero cartoon stickers. | **FULL PARITY** |
| **Trilingual Localization** | French (FR), Arabic (AR with RTL support), English (EN). Dynamic instant language switcher. | French (FR), Arabic (AR with RTL support), English (EN). Dynamic instant language switcher. | **FULL PARITY** |
| **Adaptive Light / Dark Themes** | High-contrast WCAG AA palette (`#0F1015` dark / `#F8FAFC` light, `#2563EB` royal accent, `#10B981` emerald). | High-contrast WCAG AA palette (`#0F1015` dark / `#F8FAFC` light, `#2563EB` royal accent, `#10B981` emerald). | **FULL PARITY** |

