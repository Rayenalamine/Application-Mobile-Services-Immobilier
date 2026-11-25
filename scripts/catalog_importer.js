// ============================================================
// DARLINK — IMPORTEUR DU CATALOGUE TUNISIEN VÉRIFIÉ & DÉDOUBLONNAGE
// 1. Nettoie les anciens biens mock (IDs 1..13) de Cloud Firestore
// 2. Détecte les doublons via (sourceUrl + title + governorate)
// 3. Importe uniquement les références institutionnelles vérifiées
// ============================================================

const fs = require('fs');
const path = require('path');

function resolveConfig() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../react-native/darlink_react_native/.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  const envVars = {};
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const t = line.trim();
        if (t && !t.startsWith('#')) {
          const i = t.indexOf('=');
          if (i > 0) envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  const apiKey = process.env.FIREBASE_API_KEY || envVars.FIREBASE_API_KEY || envVars.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID || 'darlink-74715';
  if (!apiKey) throw new Error('Missing FIREBASE_API_KEY in .env');
  return { apiKey, projectId };
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) if (v !== undefined) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function normalizeDedupeKey(prop) {
  const title = (prop.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const gov = (prop.governorate || '').toLowerCase().trim();
  const src = (prop.sourceUrl || '').toLowerCase().trim();
  return `${src}::${gov}::${title}`;
}

async function importVerifiedCatalogue() {
  const { apiKey, projectId } = resolveConfig();
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  // Authenticate as curator / seed service account user
  const authEmail = process.env.CURATOR_EMAIL || `curator_${Date.now()}@darlink.tn`;
  const authPass = process.env.CURATOR_PASSWORD || 'CuratorDarLink2026!';
  let authData;

  const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.darlink@example.com', password: 'Password123!', returnSecureToken: true }),
  });
  if (signInRes.ok) {
    authData = await signInRes.json();
  } else {
    const regRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPass, returnSecureToken: true }),
    });
    authData = await regRes.json();
    if (!regRes.ok) throw new Error('Auth failed: ' + JSON.stringify(authData));
  }

  const token = authData.idToken;
  const uid = authData.localId;
  console.log('Curator UID:', uid);

  // 1. Fetch existing documents & remove mock items 1..13 if owned by curator/test user
  const existingRes = await fetch(`${baseUrl}/properties?pageSize=200&key=${apiKey}`);
  const existingJson = await existingRes.json();
  const existingDocs = existingJson.documents || [];
  const seenKeys = new Set();

  for (const doc of existingDocs) {
    const id = doc.name.split('/').pop();
    const fields = doc.fields || {};
    const docOwner = fields.ownerId?.stringValue || '';
    // Legacy mock fixtures have numeric IDs 1..13 and were seeded under test/curator UID
    if (/^(1|2|3|4|5|6|7|8|9|10|11|12|13)$/.test(id) && (docOwner === uid || docOwner === 'user_admin_1' || !docOwner)) {
      const delRes = await fetch(`${baseUrl}/properties/${id}?key=${apiKey}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  [CLEANUP MOCK] Property "${id}" delete HTTP ${delRes.status}`);
      continue;
    }
    const existingKey = normalizeDedupeKey({
      title: fields.title?.stringValue || '',
      governorate: fields.governorate?.stringValue || fields.city?.stringValue || '',
      sourceUrl: fields.sourceUrl?.stringValue || '',
    });
    seenKeys.add(existingKey);
  }

  // 2. Load verified Tunisian catalogue
  const raw = fs.readFileSync(path.resolve(__dirname, 'tunisia_verified_catalogue.json'), 'utf8');
  const catalogue = JSON.parse(raw);
  const items = catalogue.properties || [];

  let imported = 0;
  let skippedDupes = 0;
  const govCoverage = new Map();

  for (const item of items) {
    const dedupeKey = normalizeDedupeKey(item);
    if (seenKeys.has(dedupeKey)) {
      skippedDupes++;
      console.log(`  [DUPLICATE SKIPPED] ${item.id} (${item.title})`);
      continue;
    }
    seenKeys.add(dedupeKey);

    const payload = {
      ...item,
      ownerId: uid,
      createdAt: item.collectedAt || new Date().toISOString(),
      publishedAt: item.collectedAt || new Date().toISOString(),
    };

    const fields = {};
    for (const [k, v] of Object.entries(payload)) {
      fields[k] = toFirestoreValue(v);
    }

    const patchRes = await fetch(`${baseUrl}/properties/${encodeURIComponent(item.id)}?key=${apiKey}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fields }),
    });

    if (patchRes.ok) {
      imported++;
      govCoverage.set(item.governorate, (govCoverage.get(item.governorate) || 0) + 1);
      console.log(`  [IMPORTED] ${item.id} | ${item.governorate} | ${item.title}`);
    } else {
      console.error(`  [ERROR] ${item.id}:`, await patchRes.text());
    }
  }

  console.log(`\n=== CATALOGUE IMPORT SUMMARY ===`);
  console.log(`Imported: ${imported}, Duplicates skipped: ${skippedDupes}`);
  console.log(`Governorates covered (${govCoverage.size}/24):`);
  for (const [g, count] of govCoverage.entries()) {
    console.log(`  - ${g}: ${count} verified reference(s)`);
  }
}

importVerifiedCatalogue().catch((e) => {
  console.error(e);
  process.exit(1);
});

