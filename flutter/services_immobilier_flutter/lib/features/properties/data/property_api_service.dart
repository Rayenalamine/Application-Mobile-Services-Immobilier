// ============================================================
// DARLINK — SERVICE API DES BIENS IMMOBILIERS (Flutter V5, V7, V8)
// Consommation REST avec fallback mock transparent
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
    double? minPrice,
    double? maxPrice,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        if (city != null && city.isNotEmpty) 'city': city,
        if (type != null && type.isNotEmpty && type != 'Tous') 'type': type,
        if (minPrice != null) 'minPrice': minPrice,
        if (maxPrice != null) 'maxPrice': maxPrice,
        if (search != null && search.isNotEmpty) 'search': search,
      };

      final res = await _api.get('/properties', queryParams: queryParams);

      if (res is Map<String, dynamic> && res.containsKey('content')) {
        final list = (res['content'] as List<dynamic>)
            .map((item) => _mapJsonToPropriete(item as Map<String, dynamic>))
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
      if (city != null && city.isNotEmpty && !p.localisation.toLowerCase().contains(city.toLowerCase())) {
        return false;
      }
      if (type != null && type.isNotEmpty && type != 'Tous' && p.type.toLowerCase() != type.toLowerCase()) {
        return false;
      }
      if (minPrice != null && p.prix < minPrice) return false;
      if (maxPrice != null && p.prix > maxPrice) return false;
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

    // Ajout local réactif si mode hors-ligne
    final fallback = Propriete(
      id: (_cachedProperties.length + 1).toString(),
      titre: title,
      localisation: location,
      prix: price,
      type: type,
      imageUrl: imageUrl,
      nombreChambres: bedrooms,
      nombreSallesDeBain: bathrooms,
      surfaceM2: surfaceM2,
      commodites: amenities ?? ['Climatisation', 'Standing'],
      description: description,
    );
    _cachedProperties.insert(0, fallback);
    return fallback;
  }

  Propriete _mapJsonToPropriete(Map<String, dynamic> json) {
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
      titre: json['title'] as String? ?? 'Bien immobilier prestige',
      localisation: json['location'] as String? ?? 'Tunis, Tunisie',
      prix: (json['price'] as num?)?.toDouble() ?? 250000.0,
      type: json['type'] as String? ?? 'Appartement',
      imageUrl: json['imageUrl'] as String? ??
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      nombreChambres: json['bedrooms'] as int? ?? 3,
      nombreSallesDeBain: json['bathrooms'] as int? ?? 2,
      surfaceM2: (json['surfaceM2'] as num?)?.toDouble() ?? 120.0,
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

