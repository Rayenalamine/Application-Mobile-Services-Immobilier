// ============================================================
// DARLINK — SERVICE API DES BIENS CLOUD FIRESTORE (Flutter)
// Zéro donnée fictive en production. Requêtes structurées Firestore (:runQuery),
// pagination, filtres multicritères, statuts d'annonce et relations réelles.
// ============================================================

import 'dart:async';
import '../../../core/constants/tunisia_locations.dart';
import '../../../core/firebase/firebase_sdk.dart';
import '../../../core/firebase/firestore_client.dart';
import '../../auth/domain/models/auth_state.dart';
import '../domain/models/property.dart';

class PropertyApiService {
  static final PropertyApiService instance = PropertyApiService._internal();
  PropertyApiService._internal();

  final FirestoreClient _firestore = FirestoreClient.instance;

  List<Propriete> _cachedProperties = [];
  List<Propriete> get currentProperties => _cachedProperties;

  List<Propriete>? _testFixtures;

  /// Réservé exclusivement aux tests unitaires/widgets hors-ligne
  void injectTestFixtures(List<Propriete>? fixtures) {
    _testFixtures = fixtures;
    if (fixtures != null) {
      _cachedProperties = List.from(fixtures);
    }
  }

  /// Flux temps réel Cloud Firestore (.snapshots()) des annonces publiées
  Stream<List<Propriete>> watchPublishedProperties() {
    final fs = FirebaseSdk.instance.firestore;
    if (fs == null) {
      return Stream.fromFuture(getProperties());
    }
    return fs
        .collection('properties')
        .where('listingStatus', isEqualTo: 'PUBLISHED')
        .limit(50)
        .snapshots()
        .map((snap) {
      final list = snap.docs.map((d) {
        final data = Map<String, dynamic>.from(d.data());
        data['id'] ??= d.id;
        return mapJsonToPropriete(data);
      }).toList();
      _cachedProperties = list;
      return list;
    });
  }

  /// Recherche structurée côté Cloud Firestore (:runQuery) avec pagination et tri
  Future<List<Propriete>> getProperties({
    String? governorate,
    String? city,
    String? neighborhood,
    String? type,
    bool? isRental,
    double? minPrice,
    double? maxPrice,
    int? minArea,
    int? maxArea,
    int? minBedrooms,
    int? minBathrooms,
    String? search,
    String? sort, // 'newest' | 'price_asc' | 'price_desc'
    int limit = 30,
    int offset = 0,
    bool includeAllStatusesForOwner = false,
  }) async {
    if (_testFixtures != null) {
      _cachedProperties = List.from(_testFixtures!);
      return _applySecondaryFilters(
        _cachedProperties,
        governorate: governorate,
        city: city,
        neighborhood: neighborhood,
        type: type,
        isRental: isRental,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minArea: minArea,
        maxArea: maxArea,
        minBedrooms: minBedrooms,
        minBathrooms: minBathrooms,
        search: search,
        sort: sort,
      );
    }

    final whereFilters = <Map<String, dynamic>>[];
    if (!includeAllStatusesForOwner) {
      whereFilters.add({
        'field': {'fieldPath': 'listingStatus'},
        'op': 'EQUAL',
        'value': {'stringValue': 'PUBLISHED'},
      });
    }
    if (governorate != null && governorate.isNotEmpty && governorate != 'Tous') {
      whereFilters.add({
        'field': {'fieldPath': 'governorate'},
        'op': 'EQUAL',
        'value': {'stringValue': governorate},
      });
    }
    if (type != null && type.isNotEmpty && type != 'Tous') {
      whereFilters.add({
        'field': {'fieldPath': 'type'},
        'op': 'EQUAL',
        'value': {'stringValue': type},
      });
    }
    if (isRental != null) {
      whereFilters.add({
        'field': {'fieldPath': 'isRental'},
        'op': 'EQUAL',
        'value': {'booleanValue': isRental},
      });
    }

    final orderBy = <Map<String, dynamic>>[];
    if (sort == 'price_asc') {
      orderBy.add({
        'field': {'fieldPath': 'price'},
        'direction': 'ASCENDING',
      });
    } else if (sort == 'price_desc') {
      orderBy.add({
        'field': {'fieldPath': 'price'},
        'direction': 'DESCENDING',
      });
    } else {
      orderBy.add({
        'field': {'fieldPath': 'createdAt'},
        'direction': 'DESCENDING',
      });
    }

    List<Map<String, dynamic>> docs = await _firestore.runStructuredQuery(
      collectionId: 'properties',
      whereFilters: whereFilters,
      orderBy: orderBy,
      limit: limit,
      offset: offset,
    );

    // Repli si l'index composite Firestore n'est pas encore construit côté serveur
    if (docs.isEmpty && whereFilters.length > 1) {
      docs = await _firestore.runStructuredQuery(
        collectionId: 'properties',
        whereFilters: whereFilters.take(1).toList(),
        limit: limit,
        offset: offset,
      );
    }
    if (docs.isEmpty && offset == 0) {
      docs = await _firestore.getCollection('properties', pageSize: limit);
    }

    if (docs.isNotEmpty) {
      final mapped = docs.map((doc) => mapJsonToPropriete(doc)).toList();
      if (offset == 0) {
        _cachedProperties = mapped;
      } else {
        _cachedProperties = [..._cachedProperties, ...mapped];
      }
      return _applySecondaryFilters(
        mapped,
        governorate: governorate,
        city: city,
        neighborhood: neighborhood,
        type: type,
        isRental: isRental,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minArea: minArea,
        maxArea: maxArea,
        minBedrooms: minBedrooms,
        minBathrooms: minBathrooms,
        search: search,
        sort: sort,
      );
    }

    return [];
  }

  List<Propriete> _applySecondaryFilters(
    List<Propriete> input, {
    String? governorate,
    String? city,
    String? neighborhood,
    String? type,
    bool? isRental,
    double? minPrice,
    double? maxPrice,
    int? minArea,
    int? maxArea,
    int? minBedrooms,
    int? minBathrooms,
    String? search,
    String? sort,
  }) {
    final filtered = input.where((p) {
      if (p.listingStatus != ListingStatus.published) return false;
      if (governorate != null &&
          governorate.isNotEmpty &&
          governorate != 'Tous' &&
          p.governorate.toLowerCase() != governorate.toLowerCase()) {
        return false;
      }
      if (city != null &&
          city.isNotEmpty &&
          city != 'Toutes' &&
          !p.localisation.toLowerCase().contains(city.toLowerCase()) &&
          !p.ville.toLowerCase().contains(city.toLowerCase()) &&
          !p.governorate.toLowerCase().contains(city.toLowerCase())) {
        return false;
      }
      if (neighborhood != null &&
          neighborhood.isNotEmpty &&
          !p.neighborhood.toLowerCase().contains(neighborhood.toLowerCase()) &&
          !p.localisation.toLowerCase().contains(neighborhood.toLowerCase())) {
        return false;
      }
      if (type != null && type.isNotEmpty && type != 'Tous' && p.type.toLowerCase() != type.toLowerCase()) {
        return false;
      }
      if (isRental != null && p.estLocation != isRental) return false;
      if (minPrice != null && minPrice > 0 && (p.priceOnRequest || p.prix < minPrice)) return false;
      if (maxPrice != null && p.prix > maxPrice) return false;
      if (minArea != null && p.surfaceM2 < minArea) return false;
      if (maxArea != null && p.surfaceM2 > maxArea) return false;
      if (minBedrooms != null && p.nombreChambres < minBedrooms) return false;
      if (minBathrooms != null && p.nombreSallesDeBain < minBathrooms) return false;
      if (search != null && search.trim().isNotEmpty) {
        final q = search.trim().toLowerCase();
        return p.titre.toLowerCase().contains(q) ||
            p.localisation.toLowerCase().contains(q) ||
            p.governorate.toLowerCase().contains(q) ||
            p.description.toLowerCase().contains(q);
      }
      return true;
    }).toList();

    if (sort == 'price_asc') {
      filtered.sort((a, b) => a.prix.compareTo(b.prix));
    } else if (sort == 'price_desc') {
      filtered.sort((a, b) => b.prix.compareTo(a.prix));
    }
    return filtered;
  }

  /// Biens publiés pour la cartographie
  Future<List<Propriete>> getMapProperties({String? governorate}) async {
    return getProperties(governorate: governorate, limit: 60);
  }

  /// Biens appartenant à l'utilisateur connecté (y compris brouillons/archivés)
  Future<List<Propriete>> getUserProperties() async {
    final user = AuthState.instance.currentUser;
    if (user == null) return [];
    final uid = user.effectiveUid;

    if (_testFixtures != null) {
      return _testFixtures!.where((p) => p.proprietaireId == uid || p.proprietaireId == user.id.toString()).toList();
    }

    final docs = await _firestore.runStructuredQuery(
      collectionId: 'properties',
      whereFilters: [
        {
          'field': {'fieldPath': 'ownerId'},
          'op': 'EQUAL',
          'value': {'stringValue': uid},
        }
      ],
      limit: 50,
    );
    return docs.map((d) => mapJsonToPropriete(d)).toList();
  }

  Future<List<Propriete>> getMyProperties() => getUserProperties();

  /// Récupérer un bien immobilier spécifique par son ID
  Future<Propriete?> getPropertyById(String id) async {
    if (_testFixtures != null) {
      try {
        return _testFixtures!.firstWhere((p) => p.id == id);
      } catch (_) {}
    }
    for (final p in _cachedProperties) {
      if (p.id == id) return p;
    }
    final doc = await _firestore.getDocument('properties', id);
    if (doc != null) {
      return mapJsonToPropriete(doc);
    }
    return null;
  }

  /// Déposer une nouvelle annonce immobilière dans Cloud Firestore (nécessite authentification)
  Future<Propriete?> createProperty({
    String? id,
    required String title,
    required String description,
    required String location,
    required String city,
    String? governorate,
    String? neighborhood,
    required double price,
    required String type,
    required String imageUrl,
    List<String>? galleryUrls,
    required int bedrooms,
    required int bathrooms,
    required double surfaceM2,
    bool isRental = false,
    List<String>? amenities,
    double? latitude,
    double? longitude,
    String listingStatus = 'PENDING_REVIEW',
  }) async {
    final user = AuthState.instance.currentUser;
    if (user == null) return null;

    // Normal users can only submit DRAFT or PENDING_REVIEW; only trusted admin/backend can publish.
    final safeStatus = (listingStatus == 'DRAFT') ? 'DRAFT' : 'PENDING_REVIEW';

    final resolved = resolveFallbackCoordinates(governorate ?? city);
    final hasExplicitCoords = latitude != null && longitude != null;
    final lat = latitude ?? resolved.latitude;
    final lng = longitude ?? resolved.longitude;
    final gov = (governorate != null && governorate.isNotEmpty) ? governorate : resolved.governorate;

    final newId = (id != null && id.trim().isNotEmpty)
        ? id.trim()
        : 'prop_${DateTime.now().millisecondsSinceEpoch}';
    final nowIso = DateTime.now().toIso8601String();
    final hasPhoto = imageUrl.trim().isNotEmpty;

    final docData = <String, dynamic>{
      'id': newId,
      'title': title.trim(),
      'description': description.trim(),
      'location': location.trim(),
      'governorate': gov,
      'city': city.trim(),
      'neighborhood': neighborhood?.trim() ?? '',
      'price': price,
      'priceOnRequest': price <= 0,
      'type': type,
      'imageUrl': imageUrl.trim(),
      'galleryUrls': galleryUrls ?? <String>[],
      'imagePermissionStatus': hasPhoto ? 'OWNER_UPLOADED' : 'NONE_PLACEHOLDER_USED',
      'imageAttribution': hasPhoto ? 'Photo fournie par ${user.fullName}' : '',
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'surfaceM2': surfaceM2,
      'yearBuilt': DateTime.now().year,
      'standing': 'Standard',
      'isRental': isRental,
      'amenities': amenities ?? <String>[],
      'latitude': lat,
      'longitude': lng,
      'coordinatePrecision': hasExplicitCoords ? 'VERIFIED' : 'CITY_CENTER',
      'addressVisibility': 'AREA_ONLY',
      'ownerId': user.effectiveUid,
      'agencyId': user.agencyId ?? '',
      'agentName': user.fullName,
      'agentPhone': user.phone ?? '',
      'listingStatus': safeStatus,
      'listingCategory': 'VERIFIED_LISTING',
      'sourceType': 'OWNER_SUBMISSION',
      'verificationStatus': 'PENDING_VERIFICATION',
      'currency': 'TND',
      'republicationAuthorized': true,
      'sourceName': 'DarLink Direct',
      'lastVerifiedAt': nowIso,
      'createdAt': nowIso,
      'updatedAt': nowIso,
    };

    final ok = await _firestore.setDocument('properties', newId, docData);
    if (!ok && _testFixtures == null) return null;

    final created = mapJsonToPropriete(docData);
    _cachedProperties.insert(0, created);
    return created;
  }

  /// Mettre à jour une annonce existante (updateMask partiel sécurisé sans modifier ownerId)
  Future<Propriete?> updateProperty(String id, Map<String, dynamic> data) async {
    final safeData = Map<String, dynamic>.from(data)
      ..remove('ownerId')
      ..['updatedAt'] = DateTime.now().toIso8601String();

    final ok = await _firestore.patchFields('properties', id, safeData);
    if (!ok && _testFixtures == null) return null;

    final doc = await _firestore.getDocument('properties', id);
    if (doc != null) {
      final updated = mapJsonToPropriete(doc);
      final idx = _cachedProperties.indexWhere((p) => p.id == id);
      if (idx != -1) _cachedProperties[idx] = updated;
      return updated;
    }
    return null;
  }

  /// Supprimer une annonce immobilière (réservé propriétaire/admin)
  Future<bool> deleteProperty(String id) async {
    final ok = await _firestore.deleteDocument('properties', id);
    if (ok || _testFixtures != null) {
      _cachedProperties.removeWhere((p) => p.id == id);
      return true;
    }
    return false;
  }

  Propriete mapJsonToPropriete(Map<String, dynamic> json) {
    final amenities = (json['amenities'] as List<dynamic>? ?? json['commodites'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList();
    final gallery = (json['galleryUrls'] as List<dynamic>? ?? json['imagesGalerie'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList();

    final cityStr = json['city'] as String? ?? 'Tunis';
    final govStr = json['governorate'] as String? ?? resolveFallbackCoordinates(cityStr).governorate;
    final fallback = resolveFallbackCoordinates(govStr);
    final rawLat = (json['latitude'] as num?)?.toDouble();
    final rawLng = (json['longitude'] as num?)?.toDouble();
    final hasValidCoords = rawLat != null && rawLng != null && rawLat.abs() > 0.1 && rawLng.abs() > 0.1;

    return Propriete(
      id: json['id']?.toString() ?? '',
      proprietaireId: json['ownerId']?.toString() ?? '',
      ville: cityStr,
      governorate: govStr,
      neighborhood: json['neighborhood'] as String? ?? '',
      latitude: hasValidCoords ? rawLat : fallback.latitude,
      longitude: hasValidCoords ? rawLng : fallback.longitude,
      coordinatePrecision: hasValidCoords
          ? (json['coordinatePrecision'] as String? ?? 'APPROXIMATE')
          : 'CITY_CENTER',
      addressVisibility: json['addressVisibility'] as String? ?? 'AREA_ONLY',
      titre: json['title'] as String? ?? json['titre'] as String? ?? 'Bien immobilier',
      localisation: json['location'] as String? ?? json['localisation'] as String? ?? '$cityStr, $govStr',
      prix: (json['price'] as num?)?.toDouble() ?? (json['prix'] as num?)?.toDouble() ?? 0.0,
      priceOnRequest: json['priceOnRequest'] as bool? ?? false,
      type: json['type'] as String? ?? 'Appartement',
      imageUrl: json['imageUrl'] as String? ?? '',
      nombreChambres: json['bedrooms'] as int? ?? json['nombreChambres'] as int? ?? 1,
      nombreSallesDeBain: json['bathrooms'] as int? ?? json['nombreSallesDeBain'] as int? ?? 1,
      surfaceM2: (json['surfaceM2'] as num?)?.toInt() ?? 0,
      description: json['description'] as String? ?? '',
      standing: json['standing'] as String? ?? 'Standard',
      anneeConstruction: json['yearBuilt'] as int? ?? json['anneeConstruction'] as int? ?? 2024,
      estLocation: json['isRental'] as bool? ?? json['estLocation'] as bool? ?? false,
      imagesGalerie: gallery,
      commodites: amenities,
      agentNom: json['agentName'] as String? ?? json['agentNom'] as String? ?? 'Propriétaire',
      agentTel: json['agentPhone'] as String? ?? json['agentTel'] as String? ?? '',
      agencyId: json['agencyId'] as String?,
      agentId: json['agentId'] as String?,
      listingStatus: ListingStatus.fromString(json['listingStatus'] as String?),
      listingCategory: ListingCategory.fromString(json['listingCategory'] as String?),
      sourceType: json['sourceType'] as String? ?? 'OWNER_SUBMISSION',
      verificationStatus: json['verificationStatus'] as String? ?? 'UNVERIFIED',
      currency: json['currency'] as String? ?? 'TND',
      publishedAt: json['publishedAt'] as String?,
      lastVerifiedAt: json['lastVerifiedAt'] as String?,
      collectedAt: json['collectedAt'] as String?,
      sourceName: json['sourceName'] as String?,
      sourceUrl: json['sourceUrl'] as String?,
      republicationAuthorized: json['republicationAuthorized'] as bool? ?? false,
      imagePermissionStatus: json['imagePermissionStatus'] as String? ?? 'NONE_PLACEHOLDER_USED',
      imageAttribution: json['imageAttribution'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }
}
