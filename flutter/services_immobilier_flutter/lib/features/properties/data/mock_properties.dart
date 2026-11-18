// ============================================================
// DARLINK — DONNÉES FICTIVES DE TEST (V2 LUXURY)
// 4 annonces tunisiennes avec galeries intérieures et spécifications
// ============================================================

import '../domain/models/property.dart';

/// Liste des 4 biens immobiliers fictifs situés en Tunisie.
/// Enrichis avec des photos intérieures (salon, chambre, cuisine) pour la galerie.
final List<Propriete> listeProprietes = [
  const Propriete(
    id: '1',
    titre: 'Appartement moderne à Tunis',
    localisation: 'Les Berges du Lac, Tunis',
    prix: 320000,
    type: 'Appartement',
    imageUrl:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85',
    nombreChambres: 3,
    nombreSallesDeBain: 2,
    surfaceM2: 145,
    anneeConstruction: 2022,
    standing: 'Très Haut Standing',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    ],
    description:
        'Bel appartement lumineux situé dans le quartier résidentiel prisé des Berges du Lac. '
        'Il dispose d\'une grande terrasse avec vue dégagée sur le lac de Tunis, d\'une cuisine '
        'américaine entièrement équipée et d\'un parking privé sous-sol avec box sécurisé. '
        'Finitions en marbre blanc de Thala et domotique intégrée.',
  ),
  const Propriete(
    id: '2',
    titre: 'Villa avec piscine à Sousse',
    localisation: 'Sahloul, Sousse',
    prix: 850000,
    type: 'Villa',
    imageUrl:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85',
    nombreChambres: 5,
    nombreSallesDeBain: 3,
    surfaceM2: 380,
    anneeConstruction: 2021,
    standing: 'Villa d\'architecte',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&q=80',
    ],
    description:
        'Magnifique villa d\'architecte avec piscine privée à débordement dans un quartier calme et sécurisé de Sahloul. '
        'Le jardin paysager avec palmiers offre un cadre de vie d\'exception. La villa comprend un double séjour cathédrale, '
        'une suite parentale avec dressing, une cuisine îlot central et un garage pour deux voitures.',
  ),
  const Propriete(
    id: '3',
    titre: 'Maison traditionnelle à Djerba',
    localisation: 'Houmt Souk, Djerba',
    prix: 450000,
    type: 'Maison',
    imageUrl:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=85',
    nombreChambres: 4,
    nombreSallesDeBain: 2,
    surfaceM2: 210,
    anneeConstruction: 2019,
    standing: 'Menzel de Charme',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80',
    ],
    description:
        'Charmant menzel traditionnel au cœur de Houmt Souk, à seulement 8 minutes des plages turquoise de Djerba. '
        'Architecture typique avec voûtes djerbiennes, patio central avec fontaine en mosaïque artisanale '
        'et toit-terrasse aménagé avec salon d\'été offrant une vue panoramique au coucher du soleil.',
  ),
  const Propriete(
    id: '4',
    titre: 'Appartement vue mer à Hammamet',
    localisation: 'Centre-ville, Hammamet',
    prix: 275000,
    type: 'Appartement',
    imageUrl:
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85',
    nombreChambres: 2,
    nombreSallesDeBain: 1,
    surfaceM2: 95,
    anneeConstruction: 2023,
    standing: 'Résidence Pieds dans l\'eau',
    estLocation: true,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
    ],
    description:
        'Appartement d\'exception avec balcon panoramique offrant une vue imprenable sur le golfe d\'Hammamet. '
        'Situé à deux pas de la médina historique, des cafés et de la marina. Finitions contemporaines, '
        'climatisation centrale réversible et accès privé direct à la plage.',
  ),
];

final List<Propriete> mockProperties = listeProprietes;
