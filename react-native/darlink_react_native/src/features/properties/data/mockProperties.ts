// ============================================================
// DARLINK — DONNÉES FICTIVES DE TEST REACT NATIVE (Luxe Parité Flutter)
// 4 annonces fictives enrichies avec galeries intérieures et caractéristiques
// ============================================================

import { Property } from '../domain/models/property';

export const mockProperties: readonly Property[] = [
  {
    id: '1',
    titre: 'Appartement moderne à Tunis',
    localisation: 'Les Berges du Lac, Tunis',
    prix: 320000,
    type: 'Appartement',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    nombreChambres: 3,
    nombreSallesDeBain: 2,
    surfaceM2: 145,
    anneeConstruction: 2021,
    standing: 'Haut standing',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    ],
    commodites: [
      'Terrasse panoramique',
      'Cuisine équipée',
      'Place de parking sous-sol',
      'Climatisation centrale',
      'Double vitrage phonique',
    ],
    agentNom: 'Propriétaire',
    agentTel: '+216 71 888 999',
    prixParM2: 2206,
    isFavorite: false,
    description:
      "Bel appartement lumineux situé dans le quartier résidentiel des Berges du Lac. " +
      "Il dispose d'une grande terrasse avec vue sur le lac, d'une cuisine équipée " +
      "et d'un parking privé en sous-sol. Idéal pour une famille.",
  },
  {
    id: '2',
    titre: 'Villa avec piscine à Sousse',
    localisation: 'Sahloul, Sousse',
    prix: 850000,
    type: 'Villa',
    imageUrl:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    nombreChambres: 5,
    nombreSallesDeBain: 3,
    surfaceM2: 380,
    anneeConstruction: 2022,
    standing: 'Luxe Prestige',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
    ],
    commodites: [
      'Piscine à débordement',
      'Jardin paysagé 400m²',
      'Garage double sécurisé',
      'Suite parentale avec dressing',
      'Système domotique intégré',
    ],
    agentNom: 'Propriétaire',
    agentTel: '+216 71 888 999',
    prixParM2: 2236,
    isFavorite: true,
    description:
      'Magnifique villa avec piscine privée dans un quartier calme et sécurisé de Sahloul. ' +
      'Le jardin paysagé offre un cadre de vie agréable. La villa comprend un grand salon, ' +
      'une salle à manger, une cuisine américaine et un garage pour deux voitures.',
  },
  {
    id: '3',
    titre: 'Maison traditionnelle à Djerba',
    localisation: 'Houmt Souk, Djerba',
    prix: 450000,
    type: 'Maison',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    nombreChambres: 4,
    nombreSallesDeBain: 2,
    surfaceM2: 240,
    anneeConstruction: 2018,
    standing: 'Houch Authentique',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c457b?w=600&q=80',
    ],
    commodites: [
      'Patio central djerbien',
      'Carrelage artisanal faïence',
      'Toit terrasse vue mer',
      'Puits traditionnel & citerne',
      'Cuisine voûtée authentique',
    ],
    agentNom: 'Propriétaire',
    agentTel: '+216 71 888 999',
    prixParM2: 1875,
    isFavorite: false,
    description:
      'Charmante maison traditionnelle au cœur de Houmt Souk, à quelques minutes ' +
      'des plages de Djerba. Architecture typique avec patio central, carrelage ' +
      'artisanal et terrasse sur le toit offrant une vue panoramique sur la ville.',
  },
  {
    id: '4',
    titre: 'Appartement vue mer à Hammamet',
    localisation: 'Centre-ville, Hammamet',
    prix: 275000,
    type: 'Appartement',
    imageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    nombreChambres: 2,
    nombreSallesDeBain: 1,
    surfaceM2: 95,
    anneeConstruction: 2020,
    standing: 'Vue Panoramique',
    estLocation: false,
    imagesGalerie: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80',
    ],
    commodites: [
      'Vue imprenable sur le golfe',
      'Accès plage à 150m',
      'Ascenseur sécurisé avec badge',
      'Balcon filant orienté sud',
      'Chauffage individuel au gaz',
    ],
    agentNom: 'Propriétaire',
    agentTel: '+216 71 888 999',
    prixParM2: 2894,
    isFavorite: false,
    description:
      'Superbe appartement avec vue imprenable sur la mer Méditerranée. ' +
      'Situé dans un immeuble récent et sécurisé, à deux pas des commerces ' +
      'et de la plage de Hammamet. Finitions soignées et balcon agréable.',
  },
] as const;
