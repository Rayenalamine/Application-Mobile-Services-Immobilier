// ============================================================
// DARLINK — SEED IDEMPOTENT DES 6 ANNONCES EXEMPLES AVEC IMAGES LOCALES
// Insère 6 annonces complètes avec images dans assets/annonces/
// Utilise des IDs déterministes pour garantir une idempotence totale (0 doublons).
// ============================================================

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const fs = require('fs');
const path = require('path');
const https = require('https');

function safeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        family: 4,
        timeout: 20000,
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: async () => JSON.parse(body),
            text: async () => body,
          })
        );
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

function resolveConfig() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../react-native/darlink_react_native/.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  const envVars = {};
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const t = line.trim();
        if (t && !t.startsWith('#')) {
          const idx = t.indexOf('=');
          if (idx > 0) {
            envVars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  const apiKey =
    process.env.FIREBASE_API_KEY ||
    envVars.FIREBASE_API_KEY ||
    envVars.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    envVars.FIREBASE_PROJECT_ID ||
    envVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'darlink-74715';
  return { apiKey, projectId };
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

const EXAMPLE_ANNONCES = [
  {
    id: 'annonce_demo_villa_sidi_bou_said',
    title: 'Villa Panoramique Sidi Bou Saïd',
    description:
      'Splendide villa contemporaine avec vue imprenable sur le golfe de Tunis, piscine à débordement, jardin arboré et finitions de marbre blanc de Carrare.',
    price: 1250000,
    priceOnRequest: false,
    type: 'Villa',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'Sidi Bou Saïd, Tunis',
    governorate: 'Tunis',
    city: 'Sidi Bou Saïd',
    neighborhood: 'Haut de colline',
    bedrooms: 4,
    bathrooms: 3,
    surfaceM2: 380,
    yearBuilt: 2022,
    standing: 'Très haut standing',
    isRental: false,
    latitude: 36.8715,
    longitude: 10.342,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/villa_sidi_bou_said.png',
    galleryUrls: ['assets/annonces/villa_sidi_bou_said.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Piscine', 'Vue mer', 'Jardin', 'Garage double', 'Chauffage central', 'Climatisation'],
    agentName: 'DarLink Prestige Carthage',
    agentPhone: '+216 71 740 000',
    agentEmail: 'contact@darlink.tn',
    createdAt: '2026-11-26T10:00:00.000Z',
    updatedAt: '2026-11-26T10:00:00.000Z',
  },
  {
    id: 'annonce_demo_appartement_la_marsa',
    title: 'Appartement S+3 Vue Mer La Marsa Corniche',
    description:
      'Appartement d\'exception situé à 50 mètres de la corniche de La Marsa. Grand salon traversant, cuisine équipée haut de gamme et suite parentale avec dressing.',
    price: 680000,
    priceOnRequest: false,
    type: 'Appartement',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'La Marsa Corniche, Tunis',
    governorate: 'Tunis',
    city: 'La Marsa',
    neighborhood: 'Corniche',
    bedrooms: 3,
    bathrooms: 2,
    surfaceM2: 165,
    yearBuilt: 2023,
    standing: 'Haut standing',
    isRental: false,
    latitude: 36.8845,
    longitude: 10.329,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/appartement_la_marsa.png',
    galleryUrls: ['assets/annonces/appartement_la_marsa.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Ascenseur', 'Vue mer', 'Balcon terrasse', 'Place parking sous-sol', 'Sécurité 24/7'],
    agentName: 'DarLink Agence La Marsa',
    agentPhone: '+216 71 770 111',
    agentEmail: 'lamarsa@darlink.tn',
    createdAt: '2026-11-25T14:30:00.000Z',
    updatedAt: '2026-11-25T14:30:00.000Z',
  },
  {
    id: 'annonce_demo_penthouse_lac2',
    title: 'Penthouse Luxueux Les Berges du Lac 2',
    description:
      'Penthouse contemporain au dernier étage d\'une résidence sécurisée. Terrasse panoramique à 360° sur le lac de Tunis, domotique complète et suite de maître.',
    price: 920000,
    priceOnRequest: false,
    type: 'Penthouse',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'Les Berges du Lac 2, Tunis',
    governorate: 'Tunis',
    city: 'Tunis',
    neighborhood: 'Les Berges du Lac 2',
    bedrooms: 3,
    bathrooms: 3,
    surfaceM2: 240,
    yearBuilt: 2024,
    standing: 'Ultra luxe',
    isRental: false,
    latitude: 36.842,
    longitude: 10.276,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/penthouse_lac2.png',
    galleryUrls: ['assets/annonces/penthouse_lac2.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Terrasse 360°', 'Domotique', 'Jacuzzi', '2 parkings sous-sol', 'Cellier privatif'],
    agentName: 'DarLink Corporate Lac',
    agentPhone: '+216 71 860 222',
    agentEmail: 'lac2@darlink.tn',
    createdAt: '2026-11-24T09:15:00.000Z',
    updatedAt: '2026-11-24T09:15:00.000Z',
  },
  {
    id: 'annonce_demo_villa_hammamet',
    title: 'Villa Mauresque avec Piscine Hammamet Nord',
    description:
      'Superbe propriété de style arabo-mauresque avec arcades sculptées, cour patio andalouse, piscine entourée de palmiers et oliviers centenaires.',
    price: 850000,
    priceOnRequest: false,
    type: 'Villa',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'Hammamet Nord, Nabeul',
    governorate: 'Nabeul',
    city: 'Hammamet',
    neighborhood: 'Hammamet Nord',
    bedrooms: 5,
    bathrooms: 4,
    surfaceM2: 310,
    yearBuilt: 2021,
    standing: 'Charme & Luxe',
    isRental: false,
    latitude: 36.4175,
    longitude: 10.622,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/villa_hammamet.png',
    galleryUrls: ['assets/annonces/villa_hammamet.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Piscine privée', 'Jardin paysager', 'Patio mauresque', 'Loge gardien', 'Forage'],
    agentName: 'DarLink Cap Bon',
    agentPhone: '+216 72 280 333',
    agentEmail: 'hammamet@darlink.tn',
    createdAt: '2026-11-23T11:00:00.000Z',
    updatedAt: '2026-11-23T11:00:00.000Z',
  },
  {
    id: 'annonce_demo_appartement_sousse',
    title: 'Appartement S+2 Neuf Sousse Kantaoui',
    description:
      'Bel appartement moderne dans une résidence récente avec piscine commune, à 3 minutes à pied de la marina de Port El Kantaoui et de la plage.',
    price: 340000,
    priceOnRequest: false,
    type: 'Appartement',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'Port El Kantaoui, Sousse',
    governorate: 'Sousse',
    city: 'Sousse',
    neighborhood: 'Port El Kantaoui',
    bedrooms: 2,
    bathrooms: 1,
    surfaceM2: 110,
    yearBuilt: 2024,
    standing: 'Haut standing',
    isRental: false,
    latitude: 35.8945,
    longitude: 10.598,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/appartement_sousse.png',
    galleryUrls: ['assets/annonces/appartement_sousse.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Piscine résidence', 'Proche Marina', 'Climatisation split', 'Volets électriques', 'Interphone'],
    agentName: 'DarLink Sahel',
    agentPhone: '+216 73 340 444',
    agentEmail: 'sousse@darlink.tn',
    createdAt: '2026-11-22T16:20:00.000Z',
    updatedAt: '2026-11-22T16:20:00.000Z',
  },
  {
    id: 'annonce_demo_maison_djerba',
    title: 'Maison Traditionnelle Rénovée Midoun Djerba',
    description:
      'Houch djerbien traditionnel réhabilité avec grand respect architectural. Murs épais en pierre, voûtes djerbiennes, citerne d\'eau de pluie et cour intérieure ensoleillée.',
    price: 490000,
    priceOnRequest: false,
    type: 'Maison',
    category: 'VERIFIED_LISTING',
    listingCategory: 'DEVELOPMENT_REFERENCE',
    listingStatus: 'PUBLISHED',
    location: 'Midoun, Djerba, Médenine',
    governorate: 'Médenine',
    city: 'Djerba',
    neighborhood: 'Midoun campagne',
    bedrooms: 3,
    bathrooms: 2,
    surfaceM2: 220,
    yearBuilt: 2020,
    standing: 'Charme & Authenticité',
    isRental: false,
    latitude: 33.8075,
    longitude: 10.992,
    coordinatePrecision: 'VERIFIED',
    addressVisibility: 'PUBLIC',
    imageUrl: 'assets/annonces/maison_djerba.png',
    galleryUrls: ['assets/annonces/maison_djerba.png'],
    imagePermissionStatus: 'LICENSED',
    imageAttribution: 'DarLink Immobilier — Asset certifié local',
    amenities: ['Houch traditionnel', 'Cour patio', 'Citerne majel', 'Climatisation', 'Terrain arboré'],
    agentName: 'DarLink Djerba la Douce',
    agentPhone: '+216 75 650 555',
    agentEmail: 'djerba@darlink.tn',
    createdAt: '2026-11-21T08:45:00.000Z',
    updatedAt: '2026-11-21T08:45:00.000Z',
  },
];

async function seedExampleAnnonces() {
  const { apiKey, projectId } = resolveConfig();
  console.log(`🚀 Démarrage du seed idempotent vers Firestore [${projectId}]...`);

  // 1. Authentification Firebase pour obtenir le JWT token et le UID
  let authData;
  const signInRes = await safeFetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.darlink@example.com',
        password: 'Password123!',
        returnSecureToken: true,
      }),
    }
  );

  if (signInRes.ok) {
    authData = await signInRes.json();
  } else {
    const authEmail = `curator_${Date.now()}@darlink.tn`;
    const regRes = await safeFetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: 'Password123!',
          returnSecureToken: true,
        }),
      }
    );
    authData = await regRes.json();
    if (!regRes.ok) throw new Error('Firebase Auth failed: ' + JSON.stringify(authData));
  }

  const token = authData.idToken;
  const uid = authData.localId;
  console.log(`🔑 Authentifié avec UID: ${uid}`);

  // 2. Mise à jour de tunisia_verified_catalogue.json pour la cohérence locale/offline
  const cataloguePath = path.resolve(__dirname, 'tunisia_verified_catalogue.json');
  if (fs.existsSync(cataloguePath)) {
    try {
      const cat = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
      cat.properties = cat.properties || [];
      for (const ex of EXAMPLE_ANNONCES) {
        const existingIdx = cat.properties.findIndex((p) => p.id === ex.id);
        if (existingIdx >= 0) {
          cat.properties[existingIdx] = ex;
        } else {
          cat.properties.unshift(ex);
        }
      }
      fs.writeFileSync(cataloguePath, JSON.stringify(cat, null, 2), 'utf8');
      console.log(`✅ Mis à jour dans ${cataloguePath}`);
    } catch (e) {
      console.warn('Note sur mise à jour catalogue:', e.message);
    }
  }

  // 3. Écriture idempotente dans Cloud Firestore via PATCH
  let successCount = 0;
  for (const item of EXAMPLE_ANNONCES) {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/properties/${item.id}?key=${apiKey}`;
    const payload = {
      ...item,
      ownerId: uid,
    };
    const fields = {};
    for (const [k, v] of Object.entries(payload)) {
      fields[k] = toFirestoreValue(v);
    }

    const res = await safeFetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fields }),
    });

    if (res.ok) {
      console.log(`  ✅ [IDEMPOTENT PATCH] ${item.id} — "${item.title}" (${item.price} DT)`);
      successCount++;
    } else {
      const err = await res.text();
      console.error(`  ❌ [ÉCHEC] ${item.id} (Status ${res.status}): ${err.slice(0, 150)}`);
    }
  }

  // 4. Vérification immédiate par lecture
  console.log(`\n🔍 Vérification de la présence des annonces dans Firestore...`);
  const verifyUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/properties/${EXAMPLE_ANNONCES[0].id}?key=${apiKey}`;
  const verifyRes = await safeFetch(verifyUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (verifyRes.ok) {
    const verifiedData = await verifyRes.json();
    console.log(`✅ Vérification confirmée pour "${EXAMPLE_ANNONCES[0].id}":`);
    console.log(`   - Titre: ${verifiedData.fields.title?.stringValue}`);
    console.log(`   - Image: ${verifiedData.fields.imageUrl?.stringValue}`);
    console.log(
      `   - Prix: ${
        verifiedData.fields.price?.integerValue || verifiedData.fields.price?.doubleValue
      } DT`
    );
    console.log(`   - Statut: ${verifiedData.fields.listingStatus?.stringValue}`);
  } else {
    console.error(`⚠️ Erreur de lecture sur ${EXAMPLE_ANNONCES[0].id}`);
  }

  console.log(
    `\n🎉 Seed terminé : ${successCount}/${EXAMPLE_ANNONCES.length} annonces insérées/mises à jour de manière idempotente.`
  );
}

if (require.main === module) {
  seedExampleAnnonces().catch((err) => {
    console.error('Fatal error during seed:', err);
    process.exit(1);
  });
}

module.exports = { seedExampleAnnonces, EXAMPLE_ANNONCES };
