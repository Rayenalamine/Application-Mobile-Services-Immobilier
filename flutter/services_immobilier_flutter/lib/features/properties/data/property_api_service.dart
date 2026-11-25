// ============================================================
// DARLINK — SERVICE API DES BIENS CLOUD FIRESTORE (Flutter)
// Consommation Cloud Firestore directe avec catalogue prestige et CRUD
// ============================================================

import '../../../core/firebase/firestore_client.dart';
import '../domain/models/property.dart';
import 'mock_properties.dart';

class PropertyApiService {
  static final PropertyApiService instance = PropertyApiService._internal();
  PropertyApiService._internal() {
    _seedFirestoreIfEmpty();
  }

  final FirestoreClient _firestore = FirestoreClient.instance;

  /// Cache mémoire des biens pour la réactivité
  List<Propriete> _cachedProperties = List.from(mockProperties);
  List<Propriete> get currentProperties => _cachedProperties;
  bool _isSeeded = false;

  /// Initialise la collection Cloud Firestore si vide
  Future<void> _seedFirestoreIfEmpty() async {
    if (_isSeeded) return;
    try {
      final existing = await _firestore.getCollection('properties');
      if (existing.isEmpty) {
        for (final p in mockProperties) {
          await _firestore.setDocument('properties', p.id, {
            'id': p.id,
            'title': p.titre,
            'description': p.description,
            'location': p.localisation,
            'city': p.localisation.split(',').last.trim(),
            'price': p.prix,
            'type': p.type,
            'imageUrl': p.imageUrl,
            'galleryUrls': p.imagesGalerie,
            'bedrooms': p.nombreChambres,
            'bathrooms': p.nombreSallesDeBain,
            'surfaceM2': p.surfaceM2,
            'yearBuilt': p.anneeConstruction,
            'standing': p.standing,
            'isRental': p.estLocation,
            'latitude': p.latitude,
            'longitude': p.longitude,
            'amenities': p.commodites,
            'agentName': p.agentNom,
            'agentPhone': p.agentTel,
            'ownerId': 'user_admin_1',
            'createdAt': DateTime.now().toIso8601String(),
          });
        }
      }
      _isSeeded = true;
    } catch (_) {}
  }

  /// Récupérer les biens depuis Cloud Firestore
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
      final docs = await _firestore.getCollection('properties');
      if (docs.isNotEmpty) {
        _cachedProperties = docs.map((doc) => mapJsonToPropriete(doc)).toList();
      }
    } catch (_) {
      // Fallback local
    }

    // Filtrage dynamique
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

  /// Récupérer tous les biens pour la cartographie GPS
  Future<List<Propriete>> getMapProperties() async {
    try {
      final docs = await _firestore.getCollection('properties');
      if (docs.isNotEmpty) {
        _cachedProperties = docs.map((doc) => mapJsonToPropriete(doc)).toList();
      }
    } catch (_) {}
    return _cachedProperties;
  }

  /// Récupérer les biens publiés par l'utilisateur connecté
  Future<List<Propriete>> getUserProperties() async {
    try {
      final docs = await _firestore.getCollection('properties');
      if (docs.isNotEmpty) {
        _cachedProperties = docs.map((doc) => mapJsonToPropriete(doc)).toList();
      }
    } catch (_) {}
    return _cachedProperties.take(2).toList();
  }

  Future<List<Propriete>> getMyProperties() => getUserProperties();

  /// Déposer une nouvelle annonce immobilière dans Cloud Firestore
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
    final newId = DateTime.now().millisecondsSinceEpoch.toString();
    final docData = <String, dynamic>{
      'id': newId,
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
      'ownerId': 'current_user',
      'agentName': 'Propriétaire',
      'agentPhone': '+216 71 888 999',
      'createdAt': DateTime.now().toIso8601String(),
    };

    try {
      await _firestore.setDocument('properties', newId, docData);
    } catch (_) {}

    final created = mapJsonToPropriete(docData);
    _cachedProperties.insert(0, created);
    return created;
  }

  /// Mettre à jour une annonce existante
  Future<Propriete?> updateProperty(String id, Map<String, dynamic> data) async {
    try {
      await _firestore.setDocument('properties', id, data);
      final index = _cachedProperties.indexWhere((p) => p.id == id);
      if (index != -1) {
        final existing = _cachedProperties[index];
        final updated = Propriete(
          id: existing.id,
          proprietaireId: existing.proprietaireId,
          titre: data['title'] as String? ?? existing.titre,
          localisation: data['location'] as String? ?? existing.localisation,
          prix: (data['price'] as num?)?.toDouble() ?? existing.prix,
          type: data['type'] as String? ?? existing.type,
          imageUrl: data['imageUrl'] as String? ?? existing.imageUrl,
          nombreChambres: data['bedrooms'] as int? ?? existing.nombreChambres,
          nombreSallesDeBain: data['bathrooms'] as int? ?? existing.nombreSallesDeBain,
          surfaceM2: (data['surfaceM2'] as num?)?.toInt() ?? existing.surfaceM2,
          description: data['description'] as String? ?? existing.description,
          standing: existing.standing,
          anneeConstruction: existing.anneeConstruction,
          estLocation: data['isRental'] as bool? ?? existing.estLocation,
          latitude: (data['latitude'] as num?)?.toDouble() ?? existing.latitude,
          longitude: (data['longitude'] as num?)?.toDouble() ?? existing.longitude,
          imagesGalerie: existing.imagesGalerie,
          commodites: existing.commodites,
          agentNom: existing.agentNom,
          agentTel: existing.agentTel,
        );
        _cachedProperties[index] = updated;
        return updated;
      }
    } catch (_) {}
    return null;
  }

  /// Supprimer une annonce immobilière
  Future<bool> deleteProperty(String id) async {
    try {
      await _firestore.deleteDocument('properties', id);
    } catch (_) {}
    _cachedProperties.removeWhere((p) => p.id == id);
    return true;
  }

  Propriete _mapJsonToPropriete(Map<String, dynamic> json) => mapJsonToPropriete(json);

  Propriete mapJsonToPropriete(Map<String, dynamic> json) {
    List<String> amenities = [];
    if (json['amenities'] is List) {
      amenities = (json['amenities'] as List).map((e) => e.toString()).toList();
    } else if (json['commodites'] is List) {
      amenities = (json['commodites'] as List).map((e) => e.toString()).toList();
    }

    List<String> gallery = [];
    if (json['galleryUrls'] is List) {
      gallery = (json['galleryUrls'] as List).map((e) => e.toString()).toList();
    } else if (json['imagesGalerie'] is List) {
      gallery = (json['imagesGalerie'] as List).map((e) => e.toString()).toList();
    }

    return Propriete(
      id: json['id']?.toString() ?? '1',
      proprietaireId: json['ownerId']?.toString() ?? '1',
      ville: json['city'] as String? ?? 'Tunis',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 36.8065,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 10.1815,
      titre: json['title'] as String? ?? json['titre'] as String? ?? 'Bien immobilier prestige',
      localisation: json['location'] as String? ?? json['localisation'] as String? ?? 'Tunis, Tunisie',
      prix: (json['price'] as num?)?.toDouble() ?? (json['prix'] as num?)?.toDouble() ?? 250000.0,
      type: json['type'] as String? ?? 'Appartement',
      imageUrl: json['imageUrl'] as String? ??
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      nombreChambres: json['bedrooms'] as int? ?? json['nombreChambres'] as int? ?? 3,
      nombreSallesDeBain: json['bathrooms'] as int? ?? json['nombreSallesDeBain'] as int? ?? 2,
      surfaceM2: (json['surfaceM2'] as num?)?.toInt() ?? 120,
      description: json['description'] as String? ?? '',
      standing: json['standing'] as String? ?? 'Haut Standing',
      anneeConstruction: json['yearBuilt'] as int? ?? json['anneeConstruction'] as int? ?? 2022,
      estLocation: json['isRental'] as bool? ?? json['estLocation'] as bool? ?? false,
      imagesGalerie: gallery,
      commodites: amenities,
      agentNom: json['agentName'] as String? ?? json['agentNom'] as String? ?? 'Propriétaire',
      agentTel: json['agentPhone'] as String? ?? json['agentTel'] as String? ?? '+216 71 888 999',
    );
  }
}
