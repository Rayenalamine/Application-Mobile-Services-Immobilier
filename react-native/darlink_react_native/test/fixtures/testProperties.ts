// ============================================================
// DARLINK — ISOLATED TEST FIXTURES (TESTS ONLY, NEVER IMPORTED IN SRC)
// ============================================================

import { Property } from '../../src/features/properties/domain/models/property';

export const testFixtureProperties: readonly Property[] = [
  {
    id: 'test_1',
    titre: 'Appartement moderne à Tunis',
    localisation: 'Les Berges du Lac, Tunis',
    governorate: 'Tunis',
    city: 'Tunis',
    prix: 320000,
    type: 'Appartement',
    imageUrl: '',
    nombreChambres: 3,
    nombreSallesDeBain: 2,
    surfaceM2: 145,
    estLocation: false,
    latitude: 36.8328,
    longitude: 10.2345,
    listingStatus: 'PUBLISHED',
    description: 'Fixture de test isolée.',
  },
];

