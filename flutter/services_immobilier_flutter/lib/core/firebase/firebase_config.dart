// ============================================================
// DARLINK — CONFIGURATION FIREBASE CLOUD (Flutter)
// ============================================================

class FirebaseConfig {
  static const String apiKey = 'AIzaSyDbKXIPYXNnE8ZICmVfMXhf6lRGTA--a0A';
  static const String projectId = 'darlink-74715';
  static const String authDomain = 'darlink-74715.firebaseapp.com';
  static const String storageBucket = 'darlink-74715.firebasestorage.app';
  static const String messagingSenderId = '844919536034';
  static const String appId = '1:844919536034:web:beaea4072bf457a62e5afb';

  static String get firestoreBaseUrl =>
      'https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents';

  static String get authBaseUrl => 'https://identitytoolkit.googleapis.com/v1';
}

