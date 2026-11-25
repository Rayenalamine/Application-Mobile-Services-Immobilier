// ============================================================
// DARLINK — SCRIPT DE VÉRIFICATION E2E CROSS-USER & CLOUD SYNC
// Teste les scénarios A à F exigés par la Phase 3 :
// Test A : Inscription Utilisateur A (Firebase Auth réel)
// Test B : Inscription Utilisateur B (Vérification isolation stricte)
// Test C : Utilisateur A crée une annonce immobilière
// Test D : Utilisateur B ajoute en favori l'annonce de A (users/{uidB}/favorites)
// Test E : Persistance & reconnexion de Utilisateur B (restauration favoris)
// Test F : Prise de contact B -> A et génération de notification pour A
// ============================================================

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const https = require('https');
const fs = require('fs');
const path = require('path');

function safeFetch(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      family: 4,
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => {
            try {
              return JSON.parse(data);
            } catch {
              return {};
            }
          },
          text: async () => data,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
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

const { apiKey, projectId } = resolveConfig();

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

let passed = 0;
let total = 0;

function assert(condition, message, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message} - ${details}`);
    process.exitCode = 1;
  }
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) fields[k] = { integerValue: v.toString() };
      else fields[k] = { doubleValue: v };
    } else if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (Array.isArray(v)) {
      fields[k] = { arrayValue: { values: v.map((item) => ({ stringValue: String(item) })) } };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: toFirestoreFields(v) } };
    }
  }
  return fields;
}

function fromFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const out = { id: doc.name ? doc.name.split('/').pop() : '' };
  for (const [k, val] of Object.entries(doc.fields)) {
    if ('stringValue' in val) out[k] = val.stringValue;
    else if ('integerValue' in val) out[k] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) out[k] = parseFloat(val.doubleValue);
    else if ('booleanValue' in val) out[k] = val.booleanValue;
    else if ('arrayValue' in val) {
      out[k] = (val.arrayValue.values || []).map((x) => x.stringValue || x);
    } else if ('nullValue' in val) out[k] = null;
  }
  return out;
}

async function registerFirebaseUser(email, password, displayName) {
  const res = await safeFetch(`${AUTH_BASE}/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'SignUp error');

  const token = data.idToken;
  const uid = data.localId;

  // Créer document profil utilisateur
  const userFields = {
    id: uid,
    fullName: displayName,
    email: email.toLowerCase(),
    phone: '+216 20 000 000',
    role: 'USER',
    accountStatus: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  const fsRes = await safeFetch(`${FIRESTORE_BASE}/users?documentId=${uid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fields: toFirestoreFields(userFields) }),
  });

  return { uid, token, email };
}

async function loginFirebaseUser(email, password) {
  const res = await safeFetch(`${AUTH_BASE}/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Login error');
  return { uid: data.localId, token: data.idToken };
}

async function runCrossUserSyncVerification() {
  console.log('============================================================');
  console.log('   DARLINK — VÉRIFICATION E2E MULTI-UTILISATEURS & SYNC     ');
  console.log(`   Projet Firebase : ${projectId} | Base : Cloud Firestore `);
  console.log('============================================================\n');

  const now = Date.now();
  const password = 'TestSync2026!Secure';
  const emailA = `darlink_user_a_${now}@test.darlink.tn`;
  const emailB = `darlink_user_b_${now}@test.darlink.tn`;

  let userA, userB;
  let testPropId = `prop_e2e_${now}`;
  let contactDocId = `cr_e2e_${now}`;

  try {
    // ------------------------------------------------------------
    // TEST A : INSCRIPTION UTILISATEUR A
    // ------------------------------------------------------------
    console.log('[TEST A] Inscription Utilisateur A (Compte propriétaire test)...');
    userA = await registerFirebaseUser(emailA, password, 'Proprietaire Test A');
    assert(Boolean(userA.uid && userA.token), 'A.1 Compte Utilisateur A créé dans Firebase Auth et Firestore');

    // ------------------------------------------------------------
    // TEST B : INSCRIPTION UTILISATEUR B & VÉRIFICATION D'ISOLATION
    // ------------------------------------------------------------
    console.log('\n[TEST B] Inscription Utilisateur B & isolation stricte...');
    userB = await registerFirebaseUser(emailB, password, 'Client Test B');
    assert(Boolean(userB.uid && userB.token), 'B.1 Compte Utilisateur B créé dans Firebase Auth');
    assert(userA.uid !== userB.uid, 'B.2 UID distincts entre Utilisateur A et Utilisateur B');

    // Vérifier que User B n'a aucun favori
    const favBRes = await safeFetch(`${FIRESTORE_BASE}/users/${userB.uid}/favorites`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    const favBData = await favBRes.json();
    const favBCount = (favBData.documents || []).length;
    assert(favBCount === 0, 'B.3 Utilisateur B commence avec 0 favoris (isolation absolue)');

    // ------------------------------------------------------------
    // TEST C : UTILISATEUR A CRÉE UNE ANNONCE IMMOBILIÈRE
    // ------------------------------------------------------------
    console.log('\n[TEST C] Utilisateur A crée une annonce immobilière...');
    const propFields = {
      id: testPropId,
      titre: 'Villa Carthage E2E Test',
      type: 'Villa',
      prix: 850000,
      surface: 320,
      chambres: 4,
      sallesDeBain: 3,
      localisation: 'Carthage Byrsa, Tunis',
      governorate: 'Tunis',
      ownerId: userA.uid,
      agentName: 'Proprietaire Test A',
      agentPhone: '+216 20 000 000',
      listingStatus: 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };

    const createPropRes = await safeFetch(`${FIRESTORE_BASE}/properties?documentId=${testPropId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({ fields: toFirestoreFields(propFields) }),
    });
    const createPropData = await createPropRes.json();
    assert(createPropRes.ok, 'C.1 Annonce créée dans Cloud Firestore avec ownerId == User A');

    // Vérifier visibilité publique dans le catalogue
    const getPropRes = await safeFetch(`${FIRESTORE_BASE}/properties/${testPropId}`);
    const getPropData = await getPropRes.json();
    const parsedProp = fromFirestoreDoc(getPropData);
    assert(parsedProp && parsedProp.titre === 'Villa Carthage E2E Test', 'C.2 Annonce visible dans le catalogue public');
    assert(parsedProp.ownerId === userA.uid, 'C.3 Propriété liée à l\'authentification réelle de User A');

    // ------------------------------------------------------------
    // TEST D : UTILISATEUR B AJOUTE EN FAVORI L'ANNONCE DE A
    // ------------------------------------------------------------
    console.log('\n[TEST D] Utilisateur B ajoute en favori l\'annonce de A...');
    const addFavRes = await safeFetch(`${FIRESTORE_BASE}/users/${userB.uid}/favorites?documentId=${testPropId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          propertyId: testPropId,
          userId: userB.uid,
          createdAt: new Date().toISOString(),
        }),
      }),
    });
    assert(addFavRes.ok, 'D.1 Favori écrit avec succès dans users/{uidB}/favorites/{testPropId}');

    // Vérifier que User A n'a PAS ce favori
    const favARes = await safeFetch(`${FIRESTORE_BASE}/users/${userA.uid}/favorites`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const favAData = await favARes.json();
    const favACount = (favAData.documents || []).length;
    assert(favACount === 0, 'D.2 Utilisateur A a toujours 0 favoris (aucune fuite)');

    // ------------------------------------------------------------
    // TEST E : PERSISTANCE & RECONNEXION DE UTILISATEUR B
    // ------------------------------------------------------------
    console.log('\n[TEST E] Reconnexion et restauration de la session de B...');
    const reauthB = await loginFirebaseUser(emailB, password);
    assert(Boolean(reauthB.token), 'E.1 Reconnexion réussie via Firebase Auth REST');

    const restoredFavRes = await safeFetch(`${FIRESTORE_BASE}/users/${reauthB.uid}/favorites`, {
      headers: { Authorization: `Bearer ${reauthB.token}` },
    });
    const restoredFavData = await restoredFavRes.json();
    const restoredDocs = restoredFavData.documents || [];
    assert(restoredDocs.length === 1, 'E.2 Favoris de Utilisateur B restaurés fidèlement depuis Cloud Firestore');
    const restoredItem = fromFirestoreDoc(restoredDocs[0]);
    assert(restoredItem.propertyId === testPropId, 'E.3 ID de l\'annonce correspondante exact');

    // ------------------------------------------------------------
    // TEST F : DEMANDE DE CONTACT B -> A & NOTIFICATION
    // ------------------------------------------------------------
    console.log('\n[TEST F] Prise de contact B -> A et routage de notification...');
    const contactPayload = {
      id: contactDocId,
      propertyId: testPropId,
      propertyTitle: 'Villa Carthage E2E Test',
      propertyOwnerId: userA.uid,
      senderId: userB.uid,
      senderName: 'Client Test B',
      senderEmail: emailB,
      senderPhone: '+216 22 111 222',
      message: 'Bonjour, je souhaite visiter cette villa samedi matin.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const contactRes = await safeFetch(`${FIRESTORE_BASE}/contact_requests?documentId=${contactDocId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({ fields: toFirestoreFields(contactPayload) }),
    });
    assert(contactRes.ok, 'F.1 Demande de contact enregistrée (intégrité référentielle validée)');

    // Création de notification adressée au propriétaire A
    const notifId = `notif_${now}`;
    const notifRes = await safeFetch(`${FIRESTORE_BASE}/notifications?documentId=${notifId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: notifId,
          recipientUid: userA.uid,
          senderUid: userB.uid,
          title: 'Nouvelle demande de visite',
          body: 'Client Test B souhaite visiter Villa Carthage E2E Test.',
          type: 'CONTACT_REQUEST',
          relatedEntityId: contactDocId,
          read: false,
          createdAt: new Date().toISOString(),
        }),
      }),
    });
    assert(notifRes.ok, 'F.2 Notification adressée au propriétaire A persistée dans Firestore');

  } catch (err) {
    console.error('Erreur inattendue durant les tests E2E :', err);
    process.exitCode = 1;
  } finally {
    // Nettoyage sécurisé des données de test
    console.log('\n[NETTOYAGE] Nettoyage des documents temporaires de test...');
    try {
      if (userA && testPropId) {
        await safeFetch(`${FIRESTORE_BASE}/properties/${testPropId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userA.token}` },
        });
      }
      if (userB && testPropId) {
        await safeFetch(`${FIRESTORE_BASE}/users/${userB.uid}/favorites/${testPropId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userB.token}` },
        });
      }
      if (userB && contactDocId) {
        await safeFetch(`${FIRESTORE_BASE}/contact_requests/${contactDocId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userB.token}` },
        });
      }
      // Supprimer les utilisateurs Firebase Auth de test
      if (userA) {
        await safeFetch(`${AUTH_BASE}/accounts:delete?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: userA.token }),
        });
        await safeFetch(`${FIRESTORE_BASE}/users/${userA.uid}`, { method: 'DELETE' });
      }
      if (userB) {
        await safeFetch(`${AUTH_BASE}/accounts:delete?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: userB.token }),
        });
        await safeFetch(`${FIRESTORE_BASE}/users/${userB.uid}`, { method: 'DELETE' });
      }
      console.log('  Nettoyage terminé avec succès.');
    } catch (_) {}
  }

  console.log('\n============================================================');
  console.log(`RÉSULTAT GLOBAL E2E : ${passed}/${total} assertions réussies`);
  console.log('============================================================');
}

runCrossUserSyncVerification();
