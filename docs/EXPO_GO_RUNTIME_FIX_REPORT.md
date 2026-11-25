# DARLINK — EXPO GO RUNTIME CRASH INVESTIGATION & FIX REPORT

**Date:** 2026-11-25  
**Workspace:** `react-native/darlink_react_native`  
**Firebase Project:** `darlink-74715` (`firebase@13.4.0`)  
**Expo SDK:** `~58.0.26` (`react-native@0.88.1`, `react@19.3.0`)

---

## 1. Original Crash & Root Cause

### What was observed in Metro's Android Dev Bundle
Inspecting the exact Android dev bundle served by Metro (`http://127.0.0.1:8082/index.bundle?platform=android&dev=true&minify=false`) BEFORE the fix revealed the **CJS + ESM Dual-Package Hazard** in `@firebase/*`:

```
node_modules/@firebase/app/dist/index.cjs.js
node_modules/@firebase/auth/dist/rn/index.js
node_modules/@firebase/component/dist/esm/index.esm.js    <-- ESM copy
node_modules/@firebase/component/dist/index.cjs.js        <-- CJS copy (DUPLICATE!)
node_modules/@firebase/logger/dist/esm/index.esm.js       <-- ESM copy
node_modules/@firebase/logger/dist/index.cjs.js           <-- CJS copy (DUPLICATE!)
```

### Root Causes
1. **Dual-Package Hazard (`@firebase/component` & `@firebase/logger`):** No `metro.config.js` existed in `react-native/darlink_react_native`. With Expo SDK 58's default `unstable_enablePackageExports: true`, `@firebase/app` (`dist/index.cjs.js`) resolved `@firebase/component` via `"require"` (`dist/index.cjs.js`), while `firebase/auth` and `firebase/firestore` (`dist/esm/index.esm.js`) resolved `@firebase/component` via `"default"` (`dist/esm/index.esm.js`). Having two separate `@firebase/component` registries in memory breaks Firebase component registration and triggers the runtime RedBox crash: `Error: Component auth has not been registered yet` / `Component firestore has not been registered yet`.
2. **Missing React Native Auth Persistence (`firebaseSdk.ts`):** `getFirebaseAuth()` previously called `getAuth(app)` without `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`.
3. **Auth SDK Session Sync (`authService.ts`):** `login()` and `logout()` updated REST tokens but did not call `signInWithEmailAndPassword` / `signOut` on `getFirebaseAuth()`.

*(Note: Setting `unstable_enablePackageExports = false` globally is NOT viable on React Native 0.88+ because it breaks `react-native/react-private-interface` resolution. A targeted singleton resolver in `metro.config.js` was used instead.)*

---

## 2. Files Modified & Actual Fix

1. **`react-native/darlink_react_native/metro.config.js`** *(created)*
   - Keeps `unstable_enablePackageExports` enabled for React Native 0.88+.
   - Adds `.cjs` to `sourceExts`.
   - Routes `@firebase/component` and `@firebase/logger` to a single CommonJS entry (`dist/index.cjs.js`) via `config.resolver.resolveRequest`.
2. **`react-native/darlink_react_native/src/core/firebase/firebaseSdk.ts`**
   - Uses `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` when running in React Native (`navigator.product === 'ReactNative'`), falling back cleanly to `getAuth(app)` in Node/Web/tests without importing Flow-typed `react-native` modules into Node test runners.
3. **`react-native/darlink_react_native/src/features/auth/services/authService.ts`**
   - Syncs `login()` (`signInWithEmailAndPassword`) and `logout()` (`signOut`) with `getFirebaseAuth()`.

---

## 3. Verification Commands & Results

| Check | Command | Result |
|---|---|---|
| Firebase version | `npm ls firebase` | `firebase@13.4.0` |
| Expo dependency alignment | `npx expo install --check` | `Dependencies are up to date` |
| Expo Doctor | `npx expo-doctor` | 18/20 checks passed; 2 network/API checks failed (`Check Expo config schema` & `Check packages match Expo SDK` — `TypeError: fetch failed` reaching Expo API from this environment) |
| TypeScript | `npx tsc --noEmit` | **0 errors** |
| Integration Tests | `npx tsx test/run_all_tests.ts` | **30/30 PASS** |
| Metro Android Dev Bundle | `http://127.0.0.1:8082/index.bundle?platform=android&dev=true&minify=false` | **HTTP 200** (12.4 MB); **14** Firebase modules; single `@firebase/component/dist/index.cjs.js` and single `@firebase/logger/dist/index.cjs.js`; `getReactNativePersistence`, `initializeAuth`, and `registerAuth` verified present |

---

## 4. Screen Testing Status (Honest Disclosure)

- **Tested in this CLI session:** Metro dev bundle compilation, TypeScript compilation, and Node integration suite (30/30 PASS).
- **NOT tested in real Expo Go on a physical device:** None of the 16 interactive UI screens (Home, Details, Login, Register, Session Restore, Favorites, Search, Map, Profile, Contact Request, Notifications, Logout, Account Switch) were opened on a physical Android/iOS Expo Go client from this CLI environment.
- **Required next step:** Scan the Expo Go QR code on a physical device to confirm zero RedBox at startup and walk through the 16 screen checks.

