// ============================================================
// DARLINK — CONFIGURATION FIREBASE CLOUD (Flutter)
// ============================================================

class FirebaseConfig {
  static const String apiKey = 'AIzaSyDarLinkTunisieDefaultKey2026';
  static const String projectId = 'darlink-74715';
  static const String authDomain = 'darlink-74715.firebaseapp.com';
  static const String storageBucket = 'darlink-74715.firebasestorage.app';
  static const String messagingSenderId = '1029384756';
  static const String appId = '1:1029384756:web:darlinkimmoapp2026';

  static String get firestoreBaseUrl =>
      'https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents';

  static String get authBaseUrl => 'https://identitytoolkit.googleapis.com/v1';
}

