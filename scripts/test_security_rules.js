// ============================================================
// DARLINK — SUITE COMPLÈTE DE TESTS DE SÉCURITÉ FIRESTORE
// Valide les scénarios de sécurité, relations et contrôle d'accès
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

  let userA, userB, adminUser;

  if (isEmulator) {
    userA = {
      localId: `uid_sec_A_${ts}`,
      idToken: createEmulatorToken(`uid_sec_A_${ts}`, { role: 'USER', email: userAEmail }),
    };
    userB = {
      localId: `uid_sec_B_${ts}`,
      idToken: createEmulatorToken(`uid_sec_B_${ts}`, { role: 'USER', email: userBEmail }),
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

  // Pre-create User A profile document so isolation check evaluates against existing record
  await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
    body: JSON.stringify({
      fields: {
        fullName: { stringValue: 'User A Profile' },
        email: { stringValue: userAEmail },
        role: { stringValue: 'USER' },
      },
    }),
  });

  // 1. Unauthenticated cannot read /users
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`);
    reportTest(1, 'Unauthenticated user cannot read private /users profile', res.status === 403, `HTTP ${res.status}`);
  } catch (err) {
    reportTest(1, 'Unauthenticated read /users', false, err.message);
  }

  // 1b. User B cannot read User A /users profile (strict PII isolation)
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
      headers: { 'Authorization': `Bearer ${userB.idToken}` },
    });
    reportTest('1b', 'User B cannot read User A private profile', res.status === 403, `HTTP ${res.status}`);
  } catch (err) {
    reportTest('1b', 'Cross-user /users read isolation', false, err.message);
  }

  // 2. User A cannot read User B's favorites
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userB.localId}/favorites`, {
      headers: { 'Authorization': `Bearer ${userA.idToken}` },
    });
    reportTest(2, "User A cannot read User B's favorites", res.status === 403, `HTTP ${res.status}`);
  } catch (err) {
    reportTest(2, 'Favorites isolation', false, err.message);
  }

  // 3. User A cannot modify User B's profile
  try {
    const res = await fetch(`${BASE_FIRESTORE}/users/${userB.localId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({ fields: { fullName: { stringValue: 'Attacked Profile' } } }),
    });
    reportTest(3, "User A cannot modify User B's profile", res.status === 403, `HTTP ${res.status}`);
  } catch (err) {
    reportTest(3, 'Cross-user profile write protection', false, err.message);
  }

  // 4. User A cannot grant themselves ADMIN privileges
  try {
    await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: { fullName: { stringValue: 'User A' }, role: { stringValue: 'USER' }, admin: { booleanValue: false } },
      }),
    });

    const escalateRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({ fields: { role: { stringValue: 'ADMIN' }, admin: { booleanValue: true } } }),
    });
    reportTest(4, 'User A cannot self-assign ADMIN role', escalateRes.status === 403, `HTTP ${escalateRes.status}`);
  } catch (err) {
    reportTest(4, 'Anti-privilege escalation', false, err.message);
  }

  // 5. Property ownership spoofing, unauthorized modify, ownerId immutability, DRAFT privacy
  const testPropId = `prop_sec_${ts}`;
  const draftPropId = `prop_draft_${ts}`;
  try {
    const spoofCreateRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({ fields: { title: { stringValue: 'Spoofed' }, ownerId: { stringValue: userB.localId } } }),
    });
    reportTest(5, 'Creation rejected if ownerId does not match creator UID', spoofCreateRes.status === 403, `HTTP ${spoofCreateRes.status}`);

    // Create PUBLISHED property owned by User A
    await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Villa Propriétaire A' },
          ownerId: { stringValue: userA.localId },
          listingStatus: { stringValue: 'PUBLISHED' },
          price: { doubleValue: 450000 },
        },
      }),
    });

    // Create DRAFT property owned by User A & check unauth read is blocked
    await fetch(`${BASE_FIRESTORE}/properties/${draftPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Draft Hidden' },
          ownerId: { stringValue: userA.localId },
          listingStatus: { stringValue: 'DRAFT' },
          price: { doubleValue: 300000 },
        },
      }),
    });
    const draftPublicRead = await fetch(`${BASE_FIRESTORE}/properties/${draftPropId}`);
    reportTest('5a', 'Non-published DRAFT listing cannot be read publicly', draftPublicRead.status === 403, `HTTP ${draftPublicRead.status}`);

    const modifyByBRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userB.idToken}` },
      body: JSON.stringify({ fields: { title: { stringValue: 'Modified by B' } } }),
    });
    reportTest('5b', "User B cannot modify User A's property", modifyByBRes.status === 403, `HTTP ${modifyByBRes.status}`);

    const transferRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({ fields: { title: { stringValue: 'Villa A' }, ownerId: { stringValue: userB.localId } } }),
    });
    reportTest('5c', 'Property ownership cannot be transferred on update', transferRes.status === 403, `HTTP ${transferRes.status}`);
  } catch (err) {
    reportTest(5, 'Property integrity rules', false, err.message);
  }

  // 6. Unauthorized delete blocked
  try {
    const deleteByBRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userB.idToken}` },
    });
    reportTest(6, "User B cannot delete User A's property", deleteByBRes.status === 403, `HTTP ${deleteByBRes.status}`);
  } catch (err) {
    reportTest(6, 'Property delete protection', false, err.message);
  }

  // 7. Invalid contact requests rejected (bad email, forged status, nonexistent propertyId)
  try {
    const badEmailRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_bad_email_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: testPropId },
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
          propertyId: { stringValue: testPropId },
          message: { stringValue: 'Message test' },
          senderEmail: { stringValue: 'valid@darlink.tn' },
          status: { stringValue: 'APPROVED' },
        },
      }),
    });

    const badPropRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_bad_prop_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: `nonexistent_prop_${ts}` },
          message: { stringValue: 'Message test' },
          senderEmail: { stringValue: 'valid@darlink.tn' },
          status: { stringValue: 'PENDING' },
        },
      }),
    });

    reportTest(
      7,
      'Invalid contact requests rejected (bad email, forged status, missing property ref)',
      badEmailRes.status === 403 && badStatusRes.status === 403 && badPropRes.status === 403,
      `badEmail=${badEmailRes.status}, badStatus=${badStatusRes.status}, missingProp=${badPropRes.status}`
    );
  } catch (err) {
    reportTest(7, 'Contact request validation', false, err.message);
  }

  // 8. Legitimate operations & Agency anti-self-verification
  try {
    const favRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}/favorites/${testPropId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: { propertyId: { stringValue: testPropId }, createdAt: { stringValue: new Date().toISOString() } },
      }),
    });

    const validContactRes = await fetch(`${BASE_FIRESTORE}/contact_requests/cr_valid_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: {
          propertyId: { stringValue: testPropId },
          message: { stringValue: 'Bonjour, je souhaite visiter ce bien.' },
          senderEmail: { stringValue: 'client@darlink.tn' },
          senderId: { stringValue: userA.localId },
          status: { stringValue: 'PENDING' },
        },
      }),
    });

    const fakeVerifiedAgencyRes = await fetch(`${BASE_FIRESTORE}/agencies/ag_fake_${ts}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.idToken}` },
      body: JSON.stringify({
        fields: {
          name: { stringValue: 'Fake Verified Agency' },
          ownerUid: { stringValue: userA.localId },
          verified: { booleanValue: true },
        },
      }),
    });

    reportTest(
      8,
      'Legitimate favorite & contact request pass; agency self-verification blocked',
      favRes.ok && validContactRes.ok && fakeVerifiedAgencyRes.status === 403,
      `fav=${favRes.status}, contact=${validContactRes.status}, agencySelfVerify=${fakeVerifiedAgencyRes.status}`
    );
  } catch (err) {
    reportTest(8, 'Legitimate ops & agency rules', false, err.message);
  }

  // 9. Public PUBLISHED query succeeds without auth
  try {
    const pubRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`);
    reportTest(9, 'Public PUBLISHED listing readable without auth', pubRes.status === 200, `HTTP ${pubRes.status}`);
  } catch (err) {
    reportTest(9, 'Public property read', false, err.message);
  }

  // 10. Cleanup & Admin custom claims
  try {
    const normalUserDeleteRes = await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userB.idToken}` },
    });

    const adminDeleteRes = isEmulator
      ? await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminUser.idToken}` },
        })
      : await fetch(`${BASE_FIRESTORE}/properties/${testPropId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userA.idToken}` },
        });

    await fetch(`${BASE_FIRESTORE}/properties/${draftPropId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userA.idToken}` },
    });

    if (!isEmulator) {
      await fetch(`${BASE_FIRESTORE}/users/${userA.localId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userA.idToken}` },
      });
      await fetch(`${BASE_AUTH}/accounts:delete?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userA.idToken }),
      });
      await fetch(`${BASE_AUTH}/accounts:delete?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userB.idToken }),
      });
    }

    reportTest(
      10,
      'Admin/Owner deletion enforced & test accounts cleaned up',
      normalUserDeleteRes.status === 403 && adminDeleteRes.ok,
      `unauthDelete=${normalUserDeleteRes.status}, authDelete=${adminDeleteRes.status}`
    );
  } catch (err) {
    reportTest(10, 'Custom claims & cleanup', false, err.message);
  }

  console.log('\n============================================================');
  console.log(`   BILAN DE SÉCURITÉ : ${passedTests}/${totalTests} tests réussis (${failedTests} échec)`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    throw new Error(`Security audit failed with ${failedTests} failures.`);
  }
}

runSecurityAudit().catch((err) => {
  console.error('\n❌ Échec critique audit de sécurité :', err);
  process.exit(1);
});
