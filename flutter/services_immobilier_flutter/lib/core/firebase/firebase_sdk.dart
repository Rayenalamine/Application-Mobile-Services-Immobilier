// ============================================================
// DARLINK — INITIALISATION OFFICIELLE FIREBASE FLUTTER SDK
// Initialise firebase_core, firebase_auth et cloud_firestore
// pour les listeners temps-réel (.snapshots()) sur Android/iOS/Web.
// ============================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'firebase_config.dart';

class FirebaseSdk {
  static final FirebaseSdk instance = FirebaseSdk._internal();
  FirebaseSdk._internal();

  bool _initialized = false;
  bool get isInitialized => _initialized;

  Future<bool> ensureInitialized() async {
    if (_initialized) return true;
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: FirebaseConfig.apiKey,
            appId: FirebaseConfig.appId,
            messagingSenderId: FirebaseConfig.messagingSenderId,
            projectId: FirebaseConfig.projectId,
            authDomain: FirebaseConfig.authDomain,
            storageBucket: FirebaseConfig.storageBucket,
          ),
        );
      }
      _initialized = true;
      return true;
    } catch (e) {
      // Dans les tests unitaires/widgets sans binding natif, on bascule gracieusement
      debugPrint('[FirebaseSdk] Native SDK unavailable in this environment: $e');
      _initialized = false;
      return false;
    }
  }

  FirebaseFirestore? get firestore =>
      _initialized ? FirebaseFirestore.instance : null;

  FirebaseAuth? get auth =>
      _initialized ? FirebaseAuth.instance : null;
}

