// ============================================================
// DARLINK — FIXTURES DE TEST ISOLÉES (UNIQUEMENT POUR TESTS AUTOMATISÉS)
// Ne jamais importer ce fichier dans le code de production lib/.
// ============================================================

import 'package:services_immobilier_flutter/features/properties/domain/models/property.dart';

final List<Propriete> testFixtureProperties = [
  const Propriete(
    id: 'test_1',
    proprietaireId: '1',
    titre: 'Appartement moderne à Tunis',
    localisation: 'Les Berges du Lac, Tunis',
    governorate: 'Tunis',
    ville: 'Tunis',
    neighborhood: 'Les Berges du Lac',
    prix: 320000,
    type: 'Appartement',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    nombreChambres: 3,
    nombreSallesDeBain: 2,
    surfaceM2: 145,
    anneeConstruction: 2022,
    standing: 'Haut Standing',
    estLocation: false,
    latitude: 36.8328,
    longitude: 10.2345,
    coordinatePrecision: 'APPROXIMATE',
    listingStatus: ListingStatus.published,
    agentNom: 'Test Fixture Agent',
    agentTel: '+216 00 000 000',
    description: 'Fixture de test isolée pour validation UI.',
  ),
  const Propriete(
    id: 'test_2',
    proprietaireId: '1',
    titre: 'Villa avec piscine à Sousse',
    localisation: 'Sahloul, Sousse',
    governorate: 'Sousse',
    ville: 'Sousse',
    neighborhood: 'Sahloul',
    prix: 850000,
    type: 'Villa',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    nombreChambres: 5,
    nombreSallesDeBain: 3,
    surfaceM2: 380,
    anneeConstruction: 2022,
    standing: 'Luxe Prestige',
    estLocation: false,
    latitude: 35.8361,
    longitude: 10.5982,
    coordinatePrecision: 'APPROXIMATE',
    listingStatus: ListingStatus.published,
    agentNom: 'Test Fixture Agent',
    agentTel: '+216 00 000 000',
    description: 'Fixture de test isolée pour validation UI.',
  ),
];

