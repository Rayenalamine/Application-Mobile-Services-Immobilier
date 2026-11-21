// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPRIETE (V2 LUXURY PRO)
// Modèle immuable enrichi pour l'interface moderne & galeries
// ============================================================

/// Représente un bien immobilier dans l'application DarLink.
/// Cette classe est immuable et supporte les détails avancés (surface, commodités, agent).
class Propriete {
  /// Identifiant unique du bien
  final String id;

  /// Titre de l'annonce immobilière
  final String titre;

  /// Localisation (quartier, ville en Tunisie)
  final String localisation;

  /// Prix en Dinars Tunisiens (TND)
  final double prix;

  /// Type de bien : "Appartement", "Maison" ou "Villa"
  final String type;

  /// URL de l'image principale distante (Unsplash haute définition)
  final String imageUrl;

  /// Nombre de chambres à coucher
  final int nombreChambres;

  /// Nombre de salles de bain
  final int nombreSallesDeBain;

  /// Description complète du bien
  final String description;

  /// Surface en mètres carrés (m²)
  final int surfaceM2;

  /// Année de construction ou de rénovation
  final int anneeConstruction;

  /// Niveau de standing : "Haut Standing", "Standing Supérieur", etc.
  final String standing;

  /// Indique s'il s'agit d'une location (`true`) ou d'une vente (`false`)
  final bool estLocation;

  /// Galerie de photos supplémentaires (salon, chambre, cuisine)
  final List<String> imagesGalerie;

  /// Statut favori
  final bool isFavorite;

  /// Liste des commodités et atouts du bien
  final List<String> commodites;

  /// Nom de l'agent immobilier dédié
  final String agentNom;

  /// Téléphone de l'agent
  final String agentTel;

  /// Identifiant du propriétaire du bien
  final String proprietaireId;

  /// Ville (ex: Tunis, Sousse, Djerba)
  final String ville;

  /// Coordonnées GPS (V8 Cartographie OpenStreetMap)
  final double latitude;
  final double longitude;

  /// Constructeur constant pour créer un objet Propriete immuable.
  const Propriete({
    this.id = '1',
    this.proprietaireId = '1',
    this.ville = 'Tunis',
    this.latitude = 36.8065,
    this.longitude = 10.1815,
    required this.titre,
    required this.localisation,
    required this.prix,
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
    this.agentNom = 'Sonia Ben Salem',
    this.agentTel = '+216 71 888 999',
  });

  /// Retourne le prix formaté avec séparateur de milliers (ex: 320000 -> "320 000").
  String get prixFormate => formaterPrix(prix);

  /// Retourne le libellé complet du prix avec devise et période
  String get prixAffiche => estLocation ? '$prixFormate DT/mois' : '$prixFormate DT';

  /// Calcule le prix au mètre carré
  int get prixParM2 => surfaceM2 > 0 ? (prix / surfaceM2).round() : 0;

  /// Fonction utilitaire statique pour formater un prix en dinars tunisiens.
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

  /// Méthode de commodité copyWith
  Propriete copyWith({
    String? id,
    String? titre,
    String? localisation,
    double? prix,
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
  }) {
    return Propriete(
      id: id ?? this.id,
      proprietaireId: proprietaireId ?? this.proprietaireId,
      titre: titre ?? this.titre,
      localisation: localisation ?? this.localisation,
      prix: prix ?? this.prix,
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
    );
  }
}
