// ============================================================
// DARLINK — SERVICE DES FAVORIS CLOUD FIRESTORE TEMPS RÉEL (Flutter)
// Persistance Cloud Firestore sur users/{userId}/favorites/{propertyId}
// Isolation stricte par UID, zéro fuite cross-user,
// vrai listener Firestore .snapshots() avec nettoyage complet à la déconnexion.
// ============================================================

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/firebase/firebase_sdk.dart';
import '../../../core/firebase/firestore_client.dart';
import '../../properties/domain/models/property.dart';
import '../../properties/data/property_api_service.dart';

class FavoritesApiService extends ChangeNotifier {
  static final FavoritesApiService instance = FavoritesApiService._internal();
  FavoritesApiService._internal() {
    _loadFromLocalPrefs();
  }

  final FirestoreClient _firestore = FirestoreClient.instance;
  final Set<String> _favoriteIds = <String>{};
  final Map<String, Propriete> _cachedProperties = {};
  String? _currentUserId;
  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>? _snapshotSub;

  Set<String> get favoriteIds => _favoriteIds;
  String? get currentUserId => _currentUserId;

  bool isFavorite(String propertyId) => _favoriteIds.contains(propertyId);

  List<Propriete> get favoriteProperties {
    final map = <String, Propriete>{};
    for (var p in _cachedProperties.values) {
      if (_favoriteIds.contains(p.id)) {
        map[p.id] = p;
      }
    }
    final all = PropertyApiService.instance.currentProperties;
    for (var p in all) {
      if (_favoriteIds.contains(p.id)) {
        map[p.id] = p;
      }
    }
    return map.values.toList();
  }

  String _getStorageKey(String suffix) {
    final scope = (_currentUserId != null && _currentUserId!.isNotEmpty)
        ? 'user_$_currentUserId'
        : 'guest';
    return 'darlink_fav_${scope}_$suffix';
  }

  void setUserId(String? userId) {
    if (_currentUserId != userId) {
      _snapshotSub?.cancel();
      _snapshotSub = null;
      _favoriteIds.clear();
      _cachedProperties.clear();
      _currentUserId = userId;
      notifyListeners();

      if (userId != null && userId.isNotEmpty) {
        _loadFromLocalPrefs().then((_) => syncFavorites());
        _startRealtimeSync();
      }
    }
  }

  void _startRealtimeSync() {
    _snapshotSub?.cancel();
    _snapshotSub = null;
    final uid = _currentUserId;
    if (uid == null || uid.isEmpty) return;

    final fs = FirebaseSdk.instance.firestore;
    if (fs == null) return;

    _snapshotSub = fs.collection('users/$uid/favorites').snapshots().listen(
      (snapshot) {
        if (_currentUserId != uid) return;
        final remoteIds = snapshot.docs.map((doc) {
          final data = doc.data();
          return (data['propertyId'] ?? doc.id).toString();
        }).toSet();
        if (!setEquals(remoteIds, _favoriteIds)) {
          _favoriteIds
            ..clear()
            ..addAll(remoteIds);
          _saveToLocalPrefs();
          notifyListeners();
        }
      },
      onError: (Object err) {
        debugPrint('[FavoritesApiService] Snapshot listener error: $err');
      },
    );
  }

  Future<void> _loadFromLocalPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_getStorageKey('ids'));
      if (list != null) {
        _favoriteIds.clear();
        _favoriteIds.addAll(list);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _saveToLocalPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_getStorageKey('ids'), _favoriteIds.toList());
    } catch (_) {}
  }

  Future<void> clear() async {
    final oldKey = _getStorageKey('ids');
    final sub = _snapshotSub;
    _snapshotSub = null;
    _favoriteIds.clear();
    _cachedProperties.clear();
    _currentUserId = null;
    notifyListeners();
    await sub?.cancel();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(oldKey);
      await prefs.remove('darlink_favorite_ids');
    } catch (_) {}
  }

  /// Récupérer les favoris depuis Cloud Firestore (users/{userId}/favorites)
  Future<List<Propriete>> getFavorites() async {
    final uid = _currentUserId;
    if (uid != null && uid.isNotEmpty) {
      try {
        final docs = await _firestore.getCollection('users/$uid/favorites');
        if (docs.isEmpty) {
          if (_favoriteIds.isNotEmpty) {
            _favoriteIds.clear();
            _cachedProperties.clear();
            await _saveToLocalPrefs();
            notifyListeners();
          }
        } else {
          final remoteIds = <String>{};
          for (final doc in docs) {
            final pid = doc['propertyId']?.toString() ?? doc['id']?.toString() ?? '';
            if (pid.isNotEmpty) {
              remoteIds.add(pid);
            }
          }
          final isDifferent = remoteIds.length != _favoriteIds.length ||
              remoteIds.any((id) => !_favoriteIds.contains(id));
          if (isDifferent) {
            _favoriteIds.clear();
            _favoriteIds.addAll(remoteIds);
            for (final p in PropertyApiService.instance.currentProperties) {
              if (_favoriteIds.contains(p.id)) {
                _cachedProperties[p.id] = p;
              }
            }
            await _saveToLocalPrefs();
            notifyListeners();
          }
        }
      } catch (_) {}
    }
    return favoriteProperties;
  }

  Future<void> syncFavorites() async {
    await getFavorites();
  }

  /// Basculer l'état favori et persister dans Cloud Firestore
  Future<void> toggleFavorite(String propertyId) async {
    final willBeFavorite = !_favoriteIds.contains(propertyId);

    if (willBeFavorite) {
      _favoriteIds.add(propertyId);
      try {
        final prop = PropertyApiService.instance.currentProperties.firstWhere((p) => p.id == propertyId);
        _cachedProperties[propertyId] = prop;
      } catch (_) {}
    } else {
      _favoriteIds.remove(propertyId);
      _cachedProperties.remove(propertyId);
    }
    await _saveToLocalPrefs();
    notifyListeners();

    // Persistance distante Cloud Firestore
    final uid = _currentUserId;
    if (uid != null && uid.isNotEmpty) {
      final path = 'users/$uid/favorites';
      try {
        if (willBeFavorite) {
          await _firestore.setDocument(path, propertyId, {
            'propertyId': propertyId,
            'userId': uid,
            'createdAt': DateTime.now().toIso8601String(),
          });
        } else {
          await _firestore.deleteDocument(path, propertyId);
        }
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _snapshotSub?.cancel();
    _snapshotSub = null;
    super.dispose();
  }
}
