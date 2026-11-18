// ============================================================
// DARLINK — MODÈLE DE DONNÉES : PROPRIETE (V2-T01)
// Représente une annonce immobilière avec ses caractéristiques
// ============================================================

/// Représente un bien immobilier dans l'application DarLink.
/// Cette classe est immuable et utilise un constructeur constant.
class Propriete {
  /// Titre de l'annonce immobilière
  final String titre;

  /// Localisation (quartier, ville en Tunisie)
  final String localisation;

  /// Prix en Dinars Tunisiens (TND)
  final double prix;

  /// Type de bien : "Appartement", "Maison" ou "Villa"
  final String type;

  /// URL de l'image principale distante (Unsplash)
  final String imageUrl;

  /// Nombre de chambres à coucher
  final int nombreChambres;

  /// Nombre de salles de bain
  final int nombreSallesDeBain;

  /// Description complète du bien
  final String description;

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
  });

  /// Retourne le prix formaté avec séparateur de milliers (ex: 320000 -> "320 000").
  String get prixFormate => formaterPrix(prix);

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
}

