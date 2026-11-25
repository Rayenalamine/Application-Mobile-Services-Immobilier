// ============================================================
// DARLINK — SERVICE DES FAVORIS CLOUD FIRESTORE (Flutter)
// Persistance Cloud Firestore sur users/{userId}/favorites/{propertyId}
// Synchronisation temps réel, isolation stricte et persistance redémarrage
// ============================================================

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  Set<String> get favoriteIds => _favoriteIds;

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

  void setUserId(String? userId) {
    _currentUserId = userId;
  }

  Future<void> _loadFromLocalPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList('darlink_favorite_ids');
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
      await prefs.setStringList('darlink_favorite_ids', _favoriteIds.toList());
    } catch (_) {}
  }

  void clear() {
    _favoriteIds.clear();
    _cachedProperties.clear();
    _currentUserId = null;
    _saveToLocalPrefs();
    notifyListeners();
  }

  /// Récupérer les favoris depuis Cloud Firestore (users/{userId}/favorites)
  Future<List<Propriete>> getFavorites() async {
    final uid = _currentUserId;
    if (uid != null && uid.isNotEmpty) {
      try {
        final docs = await _firestore.getCollection('users/$uid/favorites');
        if (docs.isNotEmpty) {
          _favoriteIds.clear();
          for (final doc in docs) {
            final pid = doc['propertyId']?.toString() ?? doc['id']?.toString() ?? '';
            if (pid.isNotEmpty) {
              _favoriteIds.add(pid);
            }
          }
          await _saveToLocalPrefs();
          notifyListeners();
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
    _saveToLocalPrefs();
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
}
