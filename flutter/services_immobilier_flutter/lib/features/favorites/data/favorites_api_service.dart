// ============================================================
// DARLINK — SERVICE DES FAVORIS & PERSISTANCE (Flutter V6)
// Synchronisation réactive locale et distante avec l'API Spring Boot
// ============================================================

import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../../properties/domain/models/property.dart';
import '../../properties/data/property_api_service.dart';

class FavoritesApiService extends ChangeNotifier {
  static final FavoritesApiService instance = FavoritesApiService._internal();
  FavoritesApiService._internal();

  final ApiClient _api = ApiClient.instance;
  final Set<String> _favoriteIds = <String>{};
  final Map<String, Propriete> _cachedProperties = {};

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

  void clear() {
    _favoriteIds.clear();
    _cachedProperties.clear();
    notifyListeners();
  }

  Future<List<Propriete>> getFavorites() async {
    try {
      final res = await _api.get('/favorites');
      if (res is List<dynamic>) {
        final list = res
            .map((item) => PropertyApiService.instance.mapJsonToPropriete(item as Map<String, dynamic>))
            .toList();
        _favoriteIds.clear();
        _cachedProperties.clear();
        for (var p in list) {
          _favoriteIds.add(p.id);
          _cachedProperties[p.id] = p;
        }
        notifyListeners();
        return list;
      }
    } catch (_) {}
    return favoriteProperties;
  }

  Future<void> syncFavorites() async {
    try {
      final res = await _api.get('/favorites/ids');
      if (res is List<dynamic>) {
        _favoriteIds.clear();
        for (var item in res) {
          _favoriteIds.add(item.toString());
        }
        notifyListeners();
      }
    } catch (_) {}
  }

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
    notifyListeners();

    try {
      if (willBeFavorite) {
        await _api.post('/favorites/$propertyId', {});
      } else {
        await _api.delete('/favorites/$propertyId');
      }
    } catch (_) {
      // Conservation de l'état optimiste local
    }
  }
}

