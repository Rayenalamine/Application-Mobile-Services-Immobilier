// ============================================================
// DARLINK — RÉFÉRENTIEL DES 24 GOUVERNORATS DE TUNISIE
// Coordonnées vérifiées des chefs-lieux pour centrage cartographique,
// recherche géographique et repli sécurisé en absence d'adresse exacte.
// ============================================================

export interface GovernorateInfo {
  readonly code: string;
  readonly nameFr: string;
  readonly nameAr: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly majorCities: readonly string[];
}

export const TUNISIA_GOVERNORATES: readonly GovernorateInfo[] = [
  { code: 'TN-11', nameFr: 'Tunis', nameAr: 'تونس', latitude: 36.8065, longitude: 10.1815, majorCities: ['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Saïd', 'Les Berges du Lac', 'El Menzah', 'Le Bardo', 'Sidi Hassine'] },
  { code: 'TN-12', nameFr: 'Ariana', nameAr: 'أريانة', latitude: 36.8625, longitude: 10.1956, majorCities: ['Ariana', 'Ennasr', 'La Soukra', 'Raoued', 'Borj Touil', 'Jardins El Menzah'] },
  { code: 'TN-13', nameFr: 'Ben Arous', nameAr: 'بن عروس', latitude: 36.7531, longitude: 10.2189, majorCities: ['Ben Arous', 'El Mourouj', 'Hammam Lif', 'Radès', 'Mégrine', 'Ezzahra'] },
  { code: 'TN-14', nameFr: 'Manouba', nameAr: 'منوبة', latitude: 36.8080, longitude: 10.0972, majorCities: ['Manouba', 'Douar Hicher', 'Oued Ellil', 'Mornaguia', 'Tebourba'] },
  { code: 'TN-21', nameFr: 'Nabeul', nameAr: 'نابل', latitude: 36.4561, longitude: 10.7376, majorCities: ['Nabeul', 'Hammamet', 'Yasmine Hammamet', 'Mrezga', 'Kélibia', 'Korba'] },
  { code: 'TN-22', nameFr: 'Zaghouan', nameAr: 'زغوان', latitude: 36.4029, longitude: 10.1429, majorCities: ['Zaghouan', 'El Fahs', 'Zriba'] },
  { code: 'TN-23', nameFr: 'Bizerte', nameAr: 'بنزرت', latitude: 37.2744, longitude: 9.8739, majorCities: ['Bizerte', 'Menzel Bourguiba', 'Mateur', 'Ras Jebel'] },
  { code: 'TN-31', nameFr: 'Béja', nameAr: 'باجة', latitude: 36.7256, longitude: 9.1817, majorCities: ['Béja', 'Medjez el-Bab', 'Testour'] },
  { code: 'TN-32', nameFr: 'Jendouba', nameAr: 'جندوبة', latitude: 36.5011, longitude: 8.7802, majorCities: ['Jendouba', 'Tabarka', 'Aïn Draham', 'Bou Salem'] },
  { code: 'TN-33', nameFr: 'Le Kef', nameAr: 'الكاف', latitude: 36.1742, longitude: 8.7049, majorCities: ['Le Kef', 'Dahmani', 'Tajerouine'] },
  { code: 'TN-34', nameFr: 'Siliana', nameAr: 'سليانة', latitude: 36.0849, longitude: 9.3708, majorCities: ['Siliana', 'Makthar', 'Bou Arada'] },
  { code: 'TN-51', nameFr: 'Sousse', nameAr: 'سوسة', latitude: 35.8256, longitude: 10.6369, majorCities: ['Sousse', 'Sahloul', 'Port El Kantaoui', 'Chott Mariem', 'Hammam Sousse', 'Msaken'] },
  { code: 'TN-52', nameFr: 'Monastir', nameAr: 'المنستير', latitude: 35.7643, longitude: 10.8113, majorCities: ['Monastir', 'Skanes', 'Moknine', 'Ksar Hellal', 'Jemmal'] },
  { code: 'TN-53', nameFr: 'Mahdia', nameAr: 'المهدية', latitude: 35.5047, longitude: 11.0622, majorCities: ['Mahdia', 'El Jem', 'Chebba'] },
  { code: 'TN-61', nameFr: 'Sfax', nameAr: 'صفاقس', latitude: 34.7406, longitude: 10.7603, majorCities: ['Sfax', 'Route de Bouzaien', 'Route de Tunis', 'Sakiet Ezzit', 'Kerkennah'] },
  { code: 'TN-41', nameFr: 'Kairouan', nameAr: 'القيروان', latitude: 35.6781, longitude: 10.0963, majorCities: ['Kairouan', 'El Mansoura', 'Haffouz'] },
  { code: 'TN-42', nameFr: 'Kasserine', nameAr: 'القصرين', latitude: 35.1676, longitude: 8.8365, majorCities: ['Kasserine', 'Sbeitla', 'Feriana'] },
  { code: 'TN-43', nameFr: 'Sidi Bouzid', nameAr: 'سيدي بوزيد', latitude: 35.0382, longitude: 9.4849, majorCities: ['Sidi Bouzid', 'Regueb', 'Jelma'] },
  { code: 'TN-81', nameFr: 'Gabès', nameAr: 'قابس', latitude: 33.8815, longitude: 10.0982, majorCities: ['Gabès', 'Ghannouch', 'Mareth', 'Matmata'] },
  { code: 'TN-82', nameFr: 'Médenine', nameAr: 'مدنين', latitude: 33.3549, longitude: 10.5055, majorCities: ['Médenine', 'Djerba', 'Houmt Souk', 'Midoun', 'Zarzis'] },
  { code: 'TN-83', nameFr: 'Tataouine', nameAr: 'تطاوين', latitude: 32.9297, longitude: 10.4518, majorCities: ['Tataouine', 'Ghomrassen', 'Remada'] },
  { code: 'TN-71', nameFr: 'Gafsa', nameAr: 'قفصة', latitude: 34.4250, longitude: 8.7842, majorCities: ['Gafsa', 'Métlaoui', 'Redeyef'] },
  { code: 'TN-72', nameFr: 'Tozeur', nameAr: 'توزر', latitude: 33.9197, longitude: 8.1335, majorCities: ['Tozeur', 'Nefta', 'Degache'] },
  { code: 'TN-73', nameFr: 'Kébili', nameAr: 'قبلي', latitude: 33.7044, longitude: 8.9690, majorCities: ['Kébili', 'Douz', 'Souk Lahad'] },
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function findGovernorate(query?: string): GovernorateInfo | undefined {
  if (!query) return undefined;
  const q = normalizeText(query);
  return TUNISIA_GOVERNORATES.find((g) => {
    if (normalizeText(g.nameFr) === q || g.nameAr === query.trim()) return true;
    return g.majorCities.some((c) => q.includes(normalizeText(c)) || normalizeText(c).includes(q));
  });
}

export function resolveFallbackCoordinates(governorateOrCity?: string): {
  latitude: number;
  longitude: number;
  governorate: string;
} {
  const match = findGovernorate(governorateOrCity);
  if (match) {
    return {
      latitude: match.latitude,
      longitude: match.longitude,
      governorate: match.nameFr,
    };
  }
  return {
    latitude: 35.8256,
    longitude: 10.2,
    governorate: 'Tunis',
  };
}

