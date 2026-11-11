// ============================================================
// Services Immobilier – Version 1
// Application de consultation d'annonces immobilières en Tunisie
// ============================================================

import 'package:flutter/material.dart';

// Point d'entrée de l'application Flutter
void main() {
  runApp(const ServicesImmobilierApp());
}

// ============================================================
// MODÈLE DE DONNÉES : classe Propriete
// Représente un bien immobilier avec toutes ses informations
// ============================================================

class Propriete {
  final String titre;
  final String localisation;
  final double prix; // prix en dinars tunisiens (TND)
  final String type; // Appartement, Maison ou Villa
  final String imageUrl;
  final int nombreChambres;
  final int nombreSallesDeBain;
  final String description;

  // Constructeur : pour créer un objet Propriete, on doit fournir toutes ces informations
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
}

// ============================================================
// DONNÉES STATIQUES : liste des 4 propriétés fictives
// Ces données sont codées directement dans l'application (pas de base de données)
// ============================================================

final List<Propriete> listeProprietes = [
  const Propriete(
    titre: 'Appartement moderne à Tunis',
    localisation: 'Les Berges du Lac, Tunis',
    prix: 320000,
    type: 'Appartement',
    imageUrl:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    nombreChambres: 3,
    nombreSallesDeBain: 2,
    description:
        'Bel appartement lumineux situé dans le quartier résidentiel des Berges du Lac. '
        'Il dispose d\'une grande terrasse avec vue sur le lac, d\'une cuisine équipée '
        'et d\'un parking privé en sous-sol. Idéal pour une famille.',
  ),
  const Propriete(
    titre: 'Villa avec piscine à Sousse',
    localisation: 'Sahloul, Sousse',
    prix: 850000,
    type: 'Villa',
    imageUrl:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    nombreChambres: 5,
    nombreSallesDeBain: 3,
    description:
        'Magnifique villa avec piscine privée dans un quartier calme et sécurisé de Sahloul. '
        'Le jardin paysagé offre un cadre de vie agréable. La villa comprend un grand salon, '
        'une salle à manger, une cuisine américaine et un garage pour deux voitures.',
  ),
  const Propriete(
    titre: 'Maison traditionnelle à Djerba',
    localisation: 'Houmt Souk, Djerba',
    prix: 450000,
    type: 'Maison',
    imageUrl:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    nombreChambres: 4,
    nombreSallesDeBain: 2,
    description:
        'Charmante maison traditionnelle au cœur de Houmt Souk, à quelques minutes '
        'des plages de Djerba. Architecture typique avec patio central, carrelage '
        'artisanal et terrasse sur le toit offrant une vue panoramique sur la ville.',
  ),
  const Propriete(
    titre: 'Appartement vue mer à Hammamet',
    localisation: 'Centre-ville, Hammamet',
    prix: 275000,
    type: 'Appartement',
    imageUrl:
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    nombreChambres: 2,
    nombreSallesDeBain: 1,
    description:
        'Appartement cosy avec vue imprenable sur la mer Méditerranée. '
        'Situé à deux pas de la médina d\'Hammamet et des restaurants. '
        'Parfait comme résidence principale ou comme pied-à-terre pour les vacances.',
  ),
];

// ============================================================
// APPLICATION PRINCIPALE : configuration de MaterialApp
// ============================================================

class ServicesImmobilierApp extends StatelessWidget {
  const ServicesImmobilierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Services Immobilier',
      debugShowCheckedModeBanner: false, // cache le bandeau "Debug"

      // Configuration du thème général de l'application
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1565C0), // bleu principal
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),

      // L'écran de démarrage est l'écran d'accueil
      home: const EcranAccueil(),
    );
  }
}

// ============================================================
// ÉCRAN D'ACCUEIL : affiche la liste des propriétés
// ============================================================

class EcranAccueil extends StatelessWidget {
  const EcranAccueil({super.key});

  @override
  Widget build(BuildContext context) {
    // La couleur principale du thème
    final Color couleurPrincipale = Theme.of(context).colorScheme.primary;

    return Scaffold(
      // Barre du haut de l'application
      appBar: AppBar(
        backgroundColor: couleurPrincipale,
        foregroundColor: Colors.white,
        title: const Text(
          'Services Immobilier',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 2,
      ),

      // Corps de la page
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Message de bienvenue en haut
          _SectionBienvenue(),

          // Titre de la section liste
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Nos biens immobiliers',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: couleurPrincipale,
              ),
            ),
          ),

          // Liste verticale des propriétés
          // Expanded permet à la ListView de remplir l'espace restant
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: listeProprietes.length,
              itemBuilder: (context, index) {
                // Pour chaque propriété dans la liste, on crée une CartePropriet
                return CartePropriete(propriete: listeProprietes[index]);
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// WIDGET : Section de bienvenue (message d'accueil)
// ============================================================

class _SectionBienvenue extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity, // occupe toute la largeur
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withAlpha(200),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Bienvenue sur Services Immobilier',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Trouvez le bien immobilier de vos rêves en Tunisie.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// WIDGET : Carte d'une propriété (affichée dans la liste)
// ============================================================

class CartePropriete extends StatelessWidget {
  final Propriete propriete;

  const CartePropriete({super.key, required this.propriete});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // coins arrondis
      ),
      elevation: 3, // ombre légère sous la carte
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image de la propriété
          _ImagePropriete(
            imageUrl: propriete.imageUrl,
            hauteur: 200,
          ),

          // Informations de la propriété
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badge : type de propriété
                _BadgeType(type: propriete.type),
                const SizedBox(height: 8),

                // Titre
                Text(
                  propriete.titre,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF212121),
                  ),
                ),
                const SizedBox(height: 6),

                // Localisation avec icône
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        propriete.localisation,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Ligne séparatrice
                const Divider(height: 1),
                const SizedBox(height: 10),

                // Prix et bouton sur la même ligne
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Prix
                    Text(
                      '${_formaterPrix(propriete.prix)} TND',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),

                    // Bouton "Voir détails"
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                      ),
                      onPressed: () {
                        // Navigation vers l'écran de détails
                        // On passe la propriété sélectionnée en paramètre
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                EcranDetails(propriete: propriete),
                          ),
                        );
                      },
                      child: const Text('Voir détails'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// WIDGET : Affichage de l'image avec fallback en cas d'erreur
// ============================================================

class _ImagePropriete extends StatelessWidget {
  final String imageUrl;
  final double hauteur;

  const _ImagePropriete({required this.imageUrl, required this.hauteur});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: hauteur,
      width: double.infinity,
      child: Image.network(
        imageUrl,
        fit: BoxFit.cover,
        // Affichage pendant le chargement de l'image
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: Colors.grey[200],
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        },
        // Affichage si l'image ne peut pas être chargée (erreur réseau, URL invalide...)
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: Colors.grey[300],
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.home, size: 60, color: Colors.grey),
                SizedBox(height: 8),
                Text(
                  'Image non disponible',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ============================================================
// WIDGET : Badge coloré pour afficher le type de propriété
// ============================================================

class _BadgeType extends StatelessWidget {
  final String type;

  const _BadgeType({required this.type});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        type,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      ),
    );
  }
}

// ============================================================
// FONCTION UTILITAIRE : formater un prix avec des espaces
// Exemple : 320000 → "320 000"
// ============================================================

String _formaterPrix(double prix) {
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

// ============================================================
// ÉCRAN DE DÉTAILS : affiche toutes les informations d'une propriété
// ============================================================

class EcranDetails extends StatelessWidget {
  final Propriete propriete;

  const EcranDetails({super.key, required this.propriete});

  @override
  Widget build(BuildContext context) {
    final Color couleurPrincipale = Theme.of(context).colorScheme.primary;

    return Scaffold(
      // Barre du haut avec le bouton retour automatique
      appBar: AppBar(
        backgroundColor: couleurPrincipale,
        foregroundColor: Colors.white,
        title: const Text(
          'Détails du bien',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        // Le bouton retour appelle Navigator.pop() automatiquement
      ),

      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Grande image de la propriété
            _ImagePropriete(imageUrl: propriete.imageUrl, hauteur: 260),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge type + Titre
                  _BadgeType(type: propriete.type),
                  const SizedBox(height: 12),

                  Text(
                    propriete.titre,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212121),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Localisation
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          color: couleurPrincipale, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        propriete.localisation,
                        style: const TextStyle(
                          fontSize: 15,
                          color: Color(0xFF555555),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Prix
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: couleurPrincipale.withAlpha(25),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                          color: couleurPrincipale.withAlpha(80)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.monetization_on,
                            color: couleurPrincipale),
                        const SizedBox(width: 8),
                        Text(
                          'Prix : ${_formaterPrix(propriete.prix)} TND',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: couleurPrincipale,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Caractéristiques : chambres et salles de bain
                  const Text(
                    'Caractéristiques',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212121),
                    ),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      // Carte chambres
                      Expanded(
                        child: _CarteCaracteristique(
                          icone: Icons.bed,
                          valeur: '${propriete.nombreChambres}',
                          libelle: 'Chambres',
                          couleur: couleurPrincipale,
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Carte salles de bain
                      Expanded(
                        child: _CarteCaracteristique(
                          icone: Icons.bathtub,
                          valeur: '${propriete.nombreSallesDeBain}',
                          libelle: 'Salles de bain',
                          couleur: couleurPrincipale,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Description
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212121),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Text(
                    propriete.description,
                    style: const TextStyle(
                      fontSize: 15,
                      color: Color(0xFF555555),
                      height: 1.6, // interligne pour faciliter la lecture
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Bouton retour explicite (en plus de la flèche dans l'AppBar)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: couleurPrincipale,
                        side: BorderSide(color: couleurPrincipale),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {
                        // Retour à l'écran précédent (liste des propriétés)
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: const Text(
                        'Retour à la liste',
                        style: TextStyle(fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// WIDGET : Carte pour afficher une caractéristique (chambres, bain)
// ============================================================

class _CarteCaracteristique extends StatelessWidget {
  final IconData icone;
  final String valeur;
  final String libelle;
  final Color couleur;

  const _CarteCaracteristique({
    required this.icone,
    required this.valeur,
    required this.libelle,
    required this.couleur,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        children: [
          Icon(icone, color: couleur, size: 28),
          const SizedBox(height: 6),
          Text(
            valeur,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF212121),
            ),
          ),
          Text(
            libelle,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
