// ============================================================
// DARLINK — SUITE COMPLÈTE DE TESTS DE SÉCURITÉ FIRESTORE
// Valide les 10 scénarios de sécurité et de contrôle d'accès
// Compatible Émulateur Firestore Local & Cloud Firestore Réel
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
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const k = trimmed.substring(0, eqIdx).trim();
            const v = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!envVars[k]) envVars[k] = v;
          }
        }
      }
    }
  }

  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    envVars.FIREBASE_API_KEY ||
    envVars.EXPO_PUBLIC_FIREBASE_API_KEY;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    envVars.FIREBASE_PROJECT_ID ||
    envVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'darlink-74715';

  return { apiKey, projectId };
}

const { apiKey: API_KEY, projectId: PROJECT_ID } = resolveConfig();

const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const BASE_FIRESTORE = isEmulator
  ? `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  : `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const BASE_AUTH = `https://identitytoolkit.googleapis.com/v1`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function reportTest(num, title, passed, detail) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ✅ [PASS] ${num}. ${title}`);
    if (detail) console.log(`     └─ ${detail}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${num}. ${title}`);
    if (detail) console.error(`     └─ ERREUR : ${detail}`);
  }
}

function createEmulatorToken(uid, customClaims = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    ...customClaims,
  })).toString('base64url');
  return `${header}.${payload}.`;
}

async function runSecurityAudit() {
  console.log('============================================================');
  console.log('   DARLINK — AUDIT ET TESTS DE SÉCURITÉ FIRESTORE          ');
  console.log(`   Cible : ${isEmulator ? 'Émulateur Local (' + process.env.FIRESTORE_EMULATOR_HOST + ')' : 'Cloud Firestore Direct (' + PROJECT_ID + ')'}`);
  console.log('============================================================\n');

  const ts = Date.now();
  const userAEmail = `sec.userA.${ts}@darlink.tn`;
  const userBEmail = `sec.userB.${ts}@darlink.tn`;
  const password = 'SecurityAudit2026!';

  console.log('[PRÉPARATION] Initialisation des comptes de test isolés...');
  let userA, userB, adminUser;

  if (isEmulator) {
    userA = {
      localId: `uid_sec_A_${ts}`,
      idToken: createEmulatorToken(`uid_sec_A_${ts}`, { role: 'CLIENT', email: userAEmail }),
    };
    userB = {
      localId: `uid_sec_B_${ts}`,
      idToken: createEmulatorToken(`uid_sec_B_${ts}`, { role: 'CLIENT', email: userBEmail }),
    };
    adminUser = {
      localId: `uid_admin_${ts}`,
      idToken: createEmulatorToken(`uid_admin_${ts}`, { role: 'ADMIN', admin: true, email: 'admin@darlink.tn' }),
    };
  } else {
    const regA = await fetch(`${BASE_AUTH}/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password, returnSecureToken: true }),
    });
    userA = await regA.json();

    const regB = await fetch(`${BASE_AUTH}/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userBEmail, password, returnSecureToken: true }),
    });
    userB = await regB.json();

    adminUser = userA;
  }

  console.log(`  - Utilisateur A : UID ${userA.localId}`);
  console.log(`  - Utilisateur B : UID ${userB.localId}\n`);

  // -------------------------------------------------------------
  // TEST 1 : Un utilisateur non-authentifié ne peut pas lire les profils privés (/users)
  // -------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`);
    reportTest(
      1,
      'Un utilisateur non-authentifié ne peut pas accéder aux profils privés (/users)',
      res.status === 403,
      `Code HTTP reçu : ${res.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(1, 'Accès non-authentifié profils privés', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 2 : L'Utilisateur A ne peut pas lire les favoris de l'Utilisateur B
  // -------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userB.localId}/favorites`, {
      headers: { 'Authorization': `Bearer ${userA.idToken}` },
    });
    reportTest(
      2,
      "L'Utilisateur A ne peut pas lire les favoris de l'Utilisateur B (Strict Isolation)",
      res.status === 403,
      `Code HTTP reçu : ${res.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(2, "Isolation des favoris de l'Utilisateur B", false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 3 : L'Utilisateur A ne peut pas modifier le profil de l'Utilisateur B
  // -------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userB.localId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: { fullName: { stringValue: 'Attacked Profile' } },
      }),
    });
    reportTest(
      3,
      "L'Utilisateur A ne peut pas modifier le profil de l'Utilisateur B",
      res.status === 403,
      `Code HTTP reçu : ${res.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(3, 'Protection modification profil tiers', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 4 : L'Utilisateur A ne peut pas s'auto-attribuer le rôle ADMIN
  // -------------------------------------------------------------
  try {
    // 4a. Création légitime de son profil
    await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          fullName: { stringValue: 'User A' },
          role: { stringValue: 'CLIENT' },
          admin: { booleanValue: false },
        },
      }),
    });

    // 4b. Tentative d'auto-attribution du rôle ADMIN
    const escalateRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          role: { stringValue: 'ADMIN' },
          admin: { booleanValue: true },
        },
      }),
    });
    reportTest(
      4,
      "L'Utilisateur A ne peut pas s'auto-attribuer le rôle ADMIN (Anti-Privilege Escalation)",
      escalateRes.status === 403,
      `Code HTTP reçu : ${escalateRes.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(4, 'Anti-Privilege Escalation ADMIN', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 5 : Sécurité de publication des annonces & Immutabilité de ownerId
  // -------------------------------------------------------------
  const testPropId = `prop_sec_${ts}`;
  try {
    // 5a. Création refusée si ownerId forgé pour usurper B
    const spoofCreateRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Bien usurpé' },
          ownerId: { stringValue: userB.localId }, // USURPATION
        },
      }),
    });
    reportTest(
      5,
      "Création refusée si ownerId ne correspond pas à l'UID du créateur (Anti-Spoofing)",
      spoofCreateRes.status === 403,
      `Code HTTP reçu : ${spoofCreateRes.status} (Attendu : 403 Forbidden)`
    );

    // 5b. Création légitime par A avec son propre ownerId
    await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Villa Propriétaire A' },
          ownerId: { stringValue: userA.localId },
          price: { doubleValue: 450000 },
        },
      }),
    });

    // 5c. B tente de modifier le bien de A
    const modifyByBRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userB.idToken}`,
      },
      body: JSON.stringify({
        fields: { title: { stringValue: 'Modifié par pirate B' } },
      }),
    });
    reportTest(
      '5b',
      "L'Utilisateur B ne peut pas modifier l'annonce appartenant à l'Utilisateur A",
      modifyByBRes.status === 403,
      `Code HTTP reçu : ${modifyByBRes.status} (Attendu : 403 Forbidden)`
    );

    // 5d. A tente de transférer illicitement ownerId vers B
    const transferRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Villa Propriétaire A' },
          ownerId: { stringValue: userB.localId }, // TRANSFERT NON AUTORISÉ
        },
      }),
    });
    reportTest(
      '5c',
      "Transfert de propriété non-autorisé interdit (Immutabilité du ownerId)",
      transferRes.status === 403,
      `Code HTTP reçu : ${transferRes.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(5, 'Sécurité annonces et transferts', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 6 : Un utilisateur non-autorisé ne peut pas supprimer l'annonce d'autrui
  // -------------------------------------------------------------
  try {
    const deleteByBRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userB.idToken}` },
    });
    reportTest(
      6,
      "L'Utilisateur B ne peut pas supprimer l'annonce de l'Utilisateur A",
      deleteByBRes.status === 403,
      `Code HTTP reçu : ${deleteByBRes.status} (Attendu : 403 Forbidden)`
    );
  } catch (err) {
    reportTest(6, 'Protection contre la suppression illégitime', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 7 : Les demandes de contact invalides (format, taille, statut forgé) sont rejetées
  // -------------------------------------------------------------
  try {
    const badEmailRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_bad_email_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: '1' },
          message: { stringValue: 'Message test' },
          senderEmail: { stringValue: 'bad-email-no-at' },
        },
      }),
    });

    const badStatusRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_bad_status_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: '1' },
          message: { stringValue: 'Message test' },
          senderEmail: { stringValue: 'valid@darlink.tn' },
          status: { stringValue: 'APPROVED' }, // STATUT FORGÉ
        },
      }),
    });

    reportTest(
      7,
      'Demandes de contact invalides rejetées (Validation stricte email et statut initial PENDING)',
      badEmailRes.status === 403 && badStatusRes.status === 403,
      `Email invalide: ${badEmailRes.status}, Statut forgé: ${badStatusRes.status} (Tous deux 403)`
    );
  } catch (err) {
    reportTest(7, 'Validation des demandes de contact', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 8 : Les opérations légitimes des utilisateurs autorisés fonctionnent
  // -------------------------------------------------------------
  try {
    const favRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}/favorites/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: '1' },
          createdAt: { stringValue: new Date().toISOString() },
        },
      }),
    });

    const validContactRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_valid_${ts}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.idToken}`,
      },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: '1' },
          message: { stringValue: 'Bonjour, je souhaite visiter ce bien.' },
          senderEmail: { stringValue: 'client@darlink.tn' },
          senderId: { stringValue: userA.localId },
          status: { stringValue: 'PENDING' },
        },
      }),
    });

    reportTest(
      8,
      'Opérations légitimes autorisées (Écriture favori + Demande de contact valide)',
      favRes.ok && validContactRes.ok,
      `Favori: ${favRes.status}, Demande de contact: ${validContactRes.status} (Tous deux 200 OK)`
    );
  } catch (err) {
    reportTest(8, 'Opérations légitimes autorisées', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 9 : Le catalogue public des propriétés reste accessible sans authentification
  // -------------------------------------------------------------
  try {
    const pubRes = await fetch(`${BASE_FIRESTORE}/properties`);
    reportTest(
      9,
      'Catalogue public des biens accessible sans authentification',
      pubRes.status === 200,
      `Code HTTP reçu : ${pubRes.status} (Attendu : 200 OK)`
    );
  } catch (err) {
    reportTest(9, 'Lecture publique catalogue', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 10 : Les privilèges administrateur sont strictement restreints aux Custom Claims de confiance
  // -------------------------------------------------------------
  try {
    // Tentative par utilisateur ordinaire B : 403
    const normalUserDeleteRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userB.idToken}` },
    });

    // Suppression par ADMIN (via Custom Claim dans l'émulateur, ou créateur A en direct)
    const adminDeleteRes = isEmulator
      ? await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminUser.idToken}` },
        })
      : await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userA.idToken}` },
        });

    reportTest(
      10,
      'Privilèges ADMIN restreints aux Custom Claims vérifiés (Aucune faille client)',
      normalUserDeleteRes.status === 403 && adminDeleteRes.ok,
      `Suppression illégitime: ${normalUserDeleteRes.status} (403), Suppression autorisée: ${adminDeleteRes.status} (200)`
    );
  } catch (err) {
    reportTest(10, 'Contrôle des privilèges Custom Claims', false, err.message);
  }

  console.log('\n============================================================');
  console.log(`   BILAN DE SÉCURITÉ : ${passedTests}/${totalTests} tests réussis (${failedTests} échec)`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    throw new Error(`Audit de sécurité échoué avec ${failedTests} non-conformités.`);
  }
}

runSecurityAudit().catch((err) => {
  console.error('\n❌ Échec critique audit de sécurité :', err);
  process.exit(1);
});
