// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPRIETE (V2 LUXURY)
// Modèle immuable enrichi pour l'interface moderne & galeries
// ============================================================

/// Représente un bien immobilier dans l'application DarLink.
/// Cette classe est immuable et supporte les détails avancés (surface, année, galerie).
class Propriete {
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

  /// Constructeur constant pour créer un objet Propriete immuable.
  const Propriete({
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
  });

  /// Retourne le prix formaté avec séparateur de milliers (ex: 320000 -> "320 000").
  String get prixFormate => formaterPrix(prix);

  /// Retourne le libellé complet du prix avec devise et période
  String get prixAffiche => estLocation ? '$prixFormate DT/mois' : '$prixFormate DT';

  /// Fonction utilitaire statique pour formater un prix en dinars tunisiens.
  static String formaterPrix(double prix) {
    final String prixEntier = prix.toInt().toString();
    final StringBuffer resultat = StringBuffer();
    int compteur = 0;

    for (int i = prixEntier.length - 1; i >= 0; i--) {
      if (compteur > 0 && compteur % 3 == 0) {
        resultat.write(' ');
      }
      resultat.write(prixEntier[i]);
      compteur++;
    }

    return resultat.toString().split('').reversed.join('');
  }

  /// Retourne une copie avec certains champs modifiés
  Propriete copyWith({
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
  }) {
    return Propriete(
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
    );
  }
}
