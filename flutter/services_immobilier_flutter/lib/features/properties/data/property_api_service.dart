// ============================================================
// DARLINK — SERVICE API DES BIENS IMMOBILIERS (Flutter V5, V7, V8)
// Consommation REST avec fallback mock transparent & CRUD complet
// ============================================================

import '../../../core/network/api_client.dart';
import '../domain/models/property.dart';
import 'mock_properties.dart';

class PropertyApiService {
  static final PropertyApiService instance = PropertyApiService._internal();
  PropertyApiService._internal();

  final ApiClient _api = ApiClient.instance;

  /// Cache mémoire des biens pour la réactivité
  List<Propriete> _cachedProperties = List.from(mockProperties);
  List<Propriete> get currentProperties => _cachedProperties;

  /// Récupérer les biens depuis le backend Spring Boot (V5)
  Future<List<Propriete>> getProperties({
    String? city,
    String? type,
    bool? isRental,
    double? minPrice,
    double? maxPrice,
    int? minBedrooms,
    String? search,
    String? sort,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        if (city != null && city.isNotEmpty && city != 'Toutes') 'city': city,
        if (type != null && type.isNotEmpty && type != 'Tous') 'type': type,
        if (isRental != null) 'isRental': isRental.toString(),
        if (minPrice != null) 'minPrice': minPrice.toString(),
        if (maxPrice != null) 'maxPrice': maxPrice.toString(),
        if (minBedrooms != null && minBedrooms > 0) 'minBedrooms': minBedrooms.toString(),
        if (search != null && search.isNotEmpty) 'search': search,
        if (sort != null && sort.isNotEmpty) 'sort': sort,
      };

      final res = await _api.get('/properties', queryParams: queryParams);

      if (res is Map<String, dynamic> && res.containsKey('content')) {
        final list = (res['content'] as List<dynamic>)
            .map((item) => mapJsonToPropriete(item as Map<String, dynamic>))
            .toList();

        if (list.isNotEmpty) {
          _cachedProperties = list;
          return list;
        }
      }
    } catch (_) {
      // En cas de non-disponibilité réseau, filtrage sur le mock local
    }

    // Filtrage fallback local
    return _cachedProperties.where((p) {
      if (city != null && city.isNotEmpty && city != 'Toutes' && !p.localisation.toLowerCase().contains(city.toLowerCase())) {
        return false;
      }
      if (type != null && type.isNotEmpty && type != 'Tous' && p.type.toLowerCase() != type.toLowerCase()) {
        return false;
      }
      if (isRental != null && p.estLocation != isRental) return false;
      if (minPrice != null && p.prix < minPrice) return false;
      if (maxPrice != null && p.prix > maxPrice) return false;
      if (minBedrooms != null && p.nombreChambres < minBedrooms) return false;
      if (search != null && search.isNotEmpty) {
        final query = search.toLowerCase();
        return p.titre.toLowerCase().contains(query) || p.localisation.toLowerCase().contains(query);
      }
      return true;
    }).toList();
  }

  /// Récupérer tous les biens pour la cartographie GPS (V8)
  Future<List<Propriete>> getMapProperties() async {
    try {
      final res = await _api.get('/properties/map');
      if (res is List<dynamic>) {
        final list = res
            .map((item) => _mapJsonToPropriete(item as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {}
    return _cachedProperties;
  }

  /// Récupérer les biens publiés par l'utilisateur connecté
  Future<List<Propriete>> getUserProperties() async {
    try {
      final res = await _api.get('/users/me/properties');
      if (res is List<dynamic>) {
        return res
            .map((item) => _mapJsonToPropriete(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return _cachedProperties.take(2).toList();
  }

  /// Déposer une nouvelle annonce immobilière (V7)
  Future<Propriete?> createProperty({
    required String title,
    required String description,
    required String location,
    required String city,
    required double price,
    required String type,
    required String imageUrl,
    required int bedrooms,
    required int bathrooms,
    required double surfaceM2,
    bool isRental = false,
    List<String>? amenities,
    double? latitude,
    double? longitude,
  }) async {
    final payload = {
      'title': title,
      'description': description,
      'location': location,
      'city': city,
      'price': price,
      'type': type,
      'imageUrl': imageUrl,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'surfaceM2': surfaceM2,
      'isRental': isRental,
      'amenities': amenities ?? ['Climatisation', 'Standing'],
      'latitude': latitude ?? 36.8065,
      'longitude': longitude ?? 10.1815,
    };

    try {
      final res = await _api.post('/properties', payload);
      if (res is Map<String, dynamic> && res.containsKey('id')) {
        final created = _mapJsonToPropriete(res);
        _cachedProperties.insert(0, created);
        return created;
      }
    } catch (_) {}

    final fallback = Propriete(
      id: (_cachedProperties.length + 1).toString(),
      proprietaireId: '1',
      titre: title,
      localisation: location,
      prix: price,
      type: type,
      imageUrl: imageUrl,
      nombreChambres: bedrooms,
      nombreSallesDeBain: bathrooms,
      surfaceM2: surfaceM2.round(),
      estLocation: isRental,
      commodites: amenities ?? ['Climatisation', 'Standing'],
      description: description,
    );
    _cachedProperties.insert(0, fallback);
    return fallback;
  }

  /// Mettre à jour une annonce existante (réservé au propriétaire)
  Future<Propriete?> updateProperty(String id, Map<String, dynamic> data) async {
    try {
      final res = await _api.put('/properties/$id', data);
      if (res is Map<String, dynamic> && res.containsKey('id')) {
        final updated = _mapJsonToPropriete(res);
        final index = _cachedProperties.indexWhere((p) => p.id == id);
        if (index != -1) {
          _cachedProperties[index] = updated;
        }
        return updated;
      }
    } catch (_) {}
    return null;
  }

  /// Supprimer une annonce immobilière (réservé au propriétaire)
  Future<bool> deleteProperty(String id) async {
    try {
      await _api.delete('/properties/$id');
      _cachedProperties.removeWhere((p) => p.id == id);
      return true;
    } catch (_) {
      _cachedProperties.removeWhere((p) => p.id == id);
      return true;
    }
  }

  Propriete _mapJsonToPropriete(Map<String, dynamic> json) => mapJsonToPropriete(json);

  Propriete mapJsonToPropriete(Map<String, dynamic> json) {
    List<String> amenities = [];
    if (json['amenities'] is List) {
      amenities = (json['amenities'] as List).map((e) => e.toString()).toList();
    }

    List<String> gallery = [];
    if (json['galleryUrls'] is List) {
      gallery = (json['galleryUrls'] as List).map((e) => e.toString()).toList();
    }

    return Propriete(
      id: json['id']?.toString() ?? '1',
      proprietaireId: json['ownerId']?.toString() ?? '1',
      titre: json['title'] as String? ?? 'Bien immobilier prestige',
      localisation: json['location'] as String? ?? 'Tunis, Tunisie',
      prix: (json['price'] as num?)?.toDouble() ?? 250000.0,
      type: json['type'] as String? ?? 'Appartement',
      imageUrl: json['imageUrl'] as String? ??
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      nombreChambres: json['bedrooms'] as int? ?? 3,
      nombreSallesDeBain: json['bathrooms'] as int? ?? 2,
      surfaceM2: (json['surfaceM2'] as num?)?.toInt() ?? 120,
      description: json['description'] as String? ?? '',
      standing: json['standing'] as String? ?? 'Haut Standing',
      anneeConstruction: json['yearBuilt'] as int? ?? 2022,
      estLocation: json['isRental'] as bool? ?? false,
      imagesGalerie: gallery,
      commodites: amenities,
      agentNom: json['agentName'] as String? ?? 'Sonia Ben Salem',
      agentTel: json['agentPhone'] as String? ?? '+216 71 888 999',
    );
  }
}
