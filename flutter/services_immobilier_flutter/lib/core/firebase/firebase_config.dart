// ============================================================
// DARLINK — CONFIGURATION FIREBASE CLOUD (Flutter)
// ============================================================

class FirebaseConfig {
  static const String apiKey = 'AIzaSyDarLinkTunisieDefaultKey2026';
  static const String projectId = 'darlink-tunisie-immo';
  static const String authDomain = 'darlink-tunisie-immo.firebaseapp.com';
  static const String storageBucket = 'darlink-tunisie-immo.appspot.com';
  static const String messagingSenderId = '1029384756';
  static const String appId = '1:1029384756:web:darlinkimmoapp2026';

  static String get firestoreBaseUrl =>
      'https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents';

  static String get authBaseUrl => 'https://identitytoolkit.googleapis.com/v1';
}
