// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPRIETE (Flutter)
// Modèle enrichi : gouvernorats, statuts d'annonce, traçabilité source,
// précision géographique et relations propriétaire / agence.
// ============================================================

enum ListingStatus {
  draft('DRAFT'),
  pendingReview('PENDING_REVIEW'),
  published('PUBLISHED'),
  rejected('REJECTED'),
  expired('EXPIRED'),
  sold('SOLD'),
  rented('RENTED'),
  archived('ARCHIVED');

  final String value;
  const ListingStatus(this.value);

  static ListingStatus fromString(String? raw) {
    final upper = raw?.toUpperCase().trim() ?? 'PUBLISHED';
    return ListingStatus.values.firstWhere(
      (s) => s.value == upper,
      orElse: () => ListingStatus.published,
    );
  }
}

class Propriete {
  final String id;
  final String titre;
  final String localisation;
  final String governorate;
  final String ville;
  final String neighborhood;
  final double prix;
  final bool priceOnRequest;
  final String type;
  final String imageUrl;
  final int nombreChambres;
  final int nombreSallesDeBain;
  final String description;
  final int surfaceM2;
  final int anneeConstruction;
  final String standing;
  final bool estLocation;
  final List<String> imagesGalerie;
  final bool isFavorite;
  final List<String> commodites;
  final String agentNom;
  final String agentTel;
  final String proprietaireId;
  final String? agencyId;
  final String? agentId;

  // Géolocalisation & confidentialité
  final double latitude;
  final double longitude;
  final String coordinatePrecision; // VERIFIED | APPROXIMATE | CITY_CENTER | UNVERIFIED
  final String addressVisibility; // AREA_ONLY | PUBLIC

  // Cycle de vie & traçabilité catalogue
  final ListingStatus listingStatus;
  final String? publishedAt;
  final String? lastVerifiedAt;
  final String? collectedAt;
  final String? sourceName;
  final String? sourceUrl;
  final bool republicationAuthorized;
  final String imagePermissionStatus;
  final String? imageAttribution;
  final String? createdAt;

  const Propriete({
    this.id = '1',
    this.proprietaireId = '1',
    this.ville = 'Tunis',
    this.governorate = 'Tunis',
    this.neighborhood = '',
    this.latitude = 36.8065,
    this.longitude = 10.1815,
    this.coordinatePrecision = 'CITY_CENTER',
    this.addressVisibility = 'AREA_ONLY',
    required this.titre,
    required this.localisation,
    required this.prix,
    this.priceOnRequest = false,
    required this.type,
    required this.imageUrl,
    required this.nombreChambres,
    required this.nombreSallesDeBain,
    required this.description,
    this.surfaceM2 = 140,
    this.anneeConstruction = 2022,
    this.standing = 'Haut Standing',
    this.estLocation = false,
    this.imagesGalerie = const [],
    this.isFavorite = false,
    this.commodites = const [
      'Climatisation centrale',
      'Parking privé sous-sol',
      'Cuisine équipée',
      'Sécurité 24/7',
      'Balcon terrasse',
    ],
    this.agentNom = 'Propriétaire',
    this.agentTel = '',
    this.agencyId,
    this.agentId,
    this.listingStatus = ListingStatus.published,
    this.publishedAt,
    this.lastVerifiedAt,
    this.collectedAt,
    this.sourceName,
    this.sourceUrl,
    this.republicationAuthorized = false,
    this.imagePermissionStatus = 'NONE_PLACEHOLDER_USED',
    this.imageAttribution,
    this.createdAt,
  });

  String get prixFormate => formaterPrix(prix);

  String get prixAffiche {
    if (priceOnRequest || prix <= 0) return 'Prix sur demande';
    return estLocation ? '$prixFormate DT/mois' : '$prixFormate DT';
  }

  int get prixParM2 => (surfaceM2 > 0 && prix > 0) ? (prix / surfaceM2).round() : 0;

  static String formaterPrix(double montant) {
    final entier = montant.round().toString();
    final buffer = StringBuffer();
    final longueur = entier.length;

    for (int i = 0; i < longueur; i++) {
      if (i > 0 && (longueur - i) % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(entier[i]);
    }

    return buffer.toString();
  }

  Propriete copyWith({
    String? id,
    String? titre,
    String? localisation,
    String? governorate,
    String? ville,
    String? neighborhood,
    double? prix,
    bool? priceOnRequest,
    String? type,
    String? imageUrl,
    int? nombreChambres,
    int? nombreSallesDeBain,
    String? description,
    int? surfaceM2,
    int? anneeConstruction,
    String? standing,
    bool? estLocation,
    List<String>? imagesGalerie,
    bool? isFavorite,
    List<String>? commodites,
    String? agentNom,
    String? agentTel,
    String? proprietaireId,
    String? agencyId,
    String? agentId,
    double? latitude,
    double? longitude,
    String? coordinatePrecision,
    String? addressVisibility,
    ListingStatus? listingStatus,
    String? sourceName,
    String? sourceUrl,
    String? lastVerifiedAt,
  }) {
    return Propriete(
      id: id ?? this.id,
      proprietaireId: proprietaireId ?? this.proprietaireId,
      ville: ville ?? this.ville,
      governorate: governorate ?? this.governorate,
      neighborhood: neighborhood ?? this.neighborhood,
      titre: titre ?? this.titre,
      localisation: localisation ?? this.localisation,
      prix: prix ?? this.prix,
      priceOnRequest: priceOnRequest ?? this.priceOnRequest,
      type: type ?? this.type,
      imageUrl: imageUrl ?? this.imageUrl,
      nombreChambres: nombreChambres ?? this.nombreChambres,
      nombreSallesDeBain: nombreSallesDeBain ?? this.nombreSallesDeBain,
      description: description ?? this.description,
      surfaceM2: surfaceM2 ?? this.surfaceM2,
      anneeConstruction: anneeConstruction ?? this.anneeConstruction,
      standing: standing ?? this.standing,
      estLocation: estLocation ?? this.estLocation,
      imagesGalerie: imagesGalerie ?? this.imagesGalerie,
      isFavorite: isFavorite ?? this.isFavorite,
      commodites: commodites ?? this.commodites,
      agentNom: agentNom ?? this.agentNom,
      agentTel: agentTel ?? this.agentTel,
      agencyId: agencyId ?? this.agencyId,
      agentId: agentId ?? this.agentId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      coordinatePrecision: coordinatePrecision ?? this.coordinatePrecision,
      addressVisibility: addressVisibility ?? this.addressVisibility,
      listingStatus: listingStatus ?? this.listingStatus,
      sourceName: sourceName ?? this.sourceName,
      sourceUrl: sourceUrl ?? this.sourceUrl,
      lastVerifiedAt: lastVerifiedAt ?? this.lastVerifiedAt,
      collectedAt: collectedAt,
      publishedAt: publishedAt,
      republicationAuthorized: republicationAuthorized,
      imagePermissionStatus: imagePermissionStatus,
      imageAttribution: imageAttribution,
      createdAt: createdAt,
    );
  }
}
