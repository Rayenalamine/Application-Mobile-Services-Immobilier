// ============================================================
// DARLINK — ENRICHISSEMENT COMPLET DES ANNONCES AVEC IMAGES WEB (Unsplash CDN)
// Associe à chaque annonce une photo immobilière haute résolution réelle
// et met à jour Cloud Firestore + tunisia_verified_catalogue.json
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
        timeout: 25000,
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

// Catalogue complet d'images réelles haute définition depuis le web (Unsplash CDN direct)
const PROPERTY_IMAGES_MAP = {
  // 1. Les 6 annonces phares
  annonce_demo_villa_sidi_bou_said: {
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  annonce_demo_appartement_la_marsa: {
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  annonce_demo_penthouse_lac2: {
    imageUrl: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  annonce_demo_villa_hammamet: {
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  annonce_demo_appartement_sousse: {
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  annonce_demo_maison_djerba: {
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    ],
  },

  // 2. Références SNIT & SPROLS & AFH du catalogue national
  ref_snit_tunis_ibnkhaldoun_s2: {
    imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snit_tunis_ibnkhaldoun_s3: {
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snit_ariana_tanit: {
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_sprols_ariana_borjtouil_s2: {
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_sprols_ariana_borjtouil_s3: {
    imageUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_sprols_benarous_mourouj: {
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_sprols_manouba_douarhicher: {
    imageUrl: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitnord_bizerte_ezzahra: {
    imageUrl: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitnord_beja_vaga: {
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitnord_jendouba_montazah: {
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitnord_siliana_narjes: {
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitsud_sfax_azur_s2: {
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitsud_sfax_azur_s3: {
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitsud_sidibouzid_collines: {
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_snitsud_medenine_djerba_cactus: {
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_afh_kairouan_mansoura: {
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_afh_nabeul_mrezga: {
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'],
  },
  ref_afh_sousse_errayhan: {
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'],
  },
  prop_1795653373070: {
    imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80'],
  },
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

async function enrichAllPropertiesWithImages() {
  const { apiKey, projectId } = resolveConfig();
  console.log(`🌐 Connexion à Cloud Firestore [${projectId}] pour enrichir TOUS les posts avec photos web...`);

  // 1. Authentification Firebase
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
  console.log(`🔑 Authentifié avec succès (UID: ${uid})`);

  // 2. Récupération de tous les documents de la collection properties
  const listUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/properties?pageSize=100&key=${apiKey}`;
  const listRes = await safeFetch(listUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) {
    throw new Error(`Échec listage Firestore: ${await listRes.text()}`);
  }

  const listJson = await listRes.json();
  const docs = listJson.documents || [];
  console.log(`📋 Total de ${docs.length} annonces détectées dans Firestore.`);

  let updatedCount = 0;

  for (const doc of docs) {
    const id = doc.name.split('/').pop();
    const existingFields = doc.fields || {};
    const title = existingFields.title?.stringValue || id;

    // Déterminer l'image Unsplash appropriée
    const imgConfig = PROPERTY_IMAGES_MAP[id] || {
      imageUrl: DEFAULT_FALLBACK_IMAGE,
      galleryUrls: [DEFAULT_FALLBACK_IMAGE],
    };

    // Préparer le patch Firestore pour imageUrl et galleryUrls
    const patchFields = {
      imageUrl: toFirestoreValue(imgConfig.imageUrl),
      galleryUrls: toFirestoreValue(imgConfig.galleryUrls),
      imagePermissionStatus: toFirestoreValue('LICENSED'),
      imageAttribution: toFirestoreValue('Photographie immobilière Unsplash haute définition'),
    };

    const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/properties/${id}?updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=galleryUrls&updateMask.fieldPaths=imagePermissionStatus&updateMask.fieldPaths=imageAttribution&key=${apiKey}`;

    const patchRes = await safeFetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fields: patchFields }),
    });

    if (patchRes.ok) {
      updatedCount++;
      console.log(`  📸 [IMAGE WEB AJOUTÉE] ${id} — "${title}"`);
    } else {
      console.error(`  ❌ [ERREUR] ${id} : ${await patchRes.text()}`);
    }
  }

  // 3. Mise à jour synchrone du fichier local tunisia_verified_catalogue.json
  const cataloguePath = path.resolve(__dirname, 'tunisia_verified_catalogue.json');
  if (fs.existsSync(cataloguePath)) {
    try {
      const cat = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
      cat.properties = (cat.properties || []).map((p) => {
        const imgConfig = PROPERTY_IMAGES_MAP[p.id];
        if (imgConfig) {
          return {
            ...p,
            imageUrl: imgConfig.imageUrl,
            galleryUrls: imgConfig.galleryUrls,
            imagePermissionStatus: 'LICENSED',
            imageAttribution: 'Photographie immobilière Unsplash haute définition',
          };
        }
        return p;
      });
      fs.writeFileSync(cataloguePath, JSON.stringify(cat, null, 2), 'utf8');
      console.log(`\n💾 Catalogue local mis à jour : ${cataloguePath}`);
    } catch (e) {
      console.warn('Note sur mise à jour catalogue local:', e.message);
    }
  }

  console.log(`\n🎉 TERMINÉ AVEC SUCCÈS : ${updatedCount}/${docs.length} annonces ont reçu une photo réelle depuis internet.`);
}

if (require.main === module) {
  enrichAllPropertiesWithImages().catch((err) => {
    console.error('Erreur fatale:', err);
    process.exit(1);
  });
}

module.exports = { enrichAllPropertiesWithImages, PROPERTY_IMAGES_MAP };
