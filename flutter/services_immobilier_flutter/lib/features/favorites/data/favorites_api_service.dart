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

  Set<String> get favoriteIds => _favoriteIds;

  bool isFavorite(String propertyId) => _favoriteIds.contains(propertyId);

  List<Propriete> get favoriteProperties {
    final all = PropertyApiService.instance.currentProperties;
    return all.where((p) => _favoriteIds.contains(p.id)).toList();
  }

  Future<List<Propriete>> getFavorites() async {
    try {
      final res = await _api.get('/favorites');
      if (res is List<dynamic>) {
        final list = res
            .map((item) => PropertyApiService.instance.mapJsonToPropriete(item as Map<String, dynamic>))
            .toList();
        _favoriteIds.clear();
        for (var p in list) {
          _favoriteIds.add(p.id);
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
    } else {
      _favoriteIds.remove(propertyId);
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

