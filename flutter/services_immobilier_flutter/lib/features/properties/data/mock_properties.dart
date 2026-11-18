// ============================================================
// DARLINK — DONNÉES FICTIVES DE TEST (V2-T01)
// 4 annonces fictives utilisées comme données de démonstration
// ============================================================

import '../domain/models/property.dart';

/// Liste des 4 biens immobiliers fictifs situés en Tunisie.
/// Utilisés comme données de test pour valider l'affichage de l'application.
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

