// ============================================================
// DARLINK — FIRESTORE SECURITY RULES EMULATOR TEST SUITE
// Tests all 12+ required positive and negative scenarios against
// Firebase Emulator Suite (FIRESTORE_EMULATOR_HOST).
// ============================================================

const http = require('http');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'darlink-74715';
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8088';
const BASE_URL = `http://${EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

let passed = 0;
let failed = 0;

function makeEmulatorJwt(uid, claims = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: uid,
      user_id: uid,
      aud: PROJECT_ID,
      iss: `https://securetoken.google.com/${PROJECT_ID}`,
      email: `${uid}@darlink.tn`,
      ...claims,
    })
  ).toString('base64url');
  return `${header}.${payload}.`;
}

function fsRequest(method, docPath, bodyObj = null, token = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${BASE_URL}${docPath}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = bodyObj ? JSON.stringify(bodyObj) : null;
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function toFsFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === 'string') fields[k] = { stringValue: v };
  }
  return { fields };
}

function assertTest(name, ok, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} — ${detail}`);
  }
}

async function run() {
  console.log('============================================================');
  console.log(' DARLINK — FIRESTORE EMULATOR SECURITY TESTS');
  console.log(` Target: ${EMULATOR_HOST} | Project: ${PROJECT_ID}`);
  console.log('============================================================\n');

  const uidA = 'user_alice_123';
  const uidB = 'user_bob_456';
  const uidAdmin = 'admin_root_001';
  const tokenA = makeEmulatorJwt(uidA);
  const tokenB = makeEmulatorJwt(uidB);
  const tokenAdmin = makeEmulatorJwt(uidAdmin, { role: 'ADMIN', admin: true });

  // 1. Anonymous property creation denied
  const r1 = await fsRequest('PATCH', '/properties/prop_anon_1', toFsFields({
    title: 'Anon Villa', ownerId: uidA, listingStatus: 'DRAFT', price: 100000, surfaceM2: 120, bedrooms: 3, bathrooms: 2,
  }));
  assertTest('1. Anonymous property creation denied', r1.status === 403, `status=${r1.status}`);

  // 2. Authenticated user creating another owner's property denied
  const r2 = await fsRequest('PATCH', '/properties/prop_spoof_1', toFsFields({
    title: 'Spoofed Villa', ownerId: uidB, listingStatus: 'DRAFT', price: 100000, surfaceM2: 120, bedrooms: 3, bathrooms: 2,
  }), tokenA);
  assertTest('2. Creating property with another ownerId denied', r2.status === 403, `status=${r2.status}`);

  // 3. User publishing their own listing directly denied
  const r3 = await fsRequest('PATCH', '/properties/prop_direct_pub', toFsFields({
    title: 'Direct Publish Attempt', ownerId: uidA, listingStatus: 'PUBLISHED', price: 100000, surfaceM2: 120, bedrooms: 3, bathrooms: 2,
  }), tokenA);
  assertTest('3. User publishing own listing directly denied', r3.status === 403, `status=${r3.status}`);

  // 4. Valid user draft creation accepted
  const r4 = await fsRequest('PATCH', '/properties/prop_valid_draft', toFsFields({
    title: 'Valid Draft Tunis', ownerId: uidA, listingStatus: 'PENDING_REVIEW', price: 240000, surfaceM2: 110, bedrooms: 2, bathrooms: 1,
  }), tokenA);
  assertTest('4. Valid user PENDING_REVIEW property creation accepted', r4.status === 200, `status=${r4.status} ${r4.body}`);

  // 5. Owner attempting to change verificationStatus or publish via update denied
  const r5 = await fsRequest('PATCH', '/properties/prop_valid_draft?updateMask.fieldPaths=listingStatus', toFsFields({
    listingStatus: 'PUBLISHED',
  }), tokenA);
  assertTest('5. Owner self-publishing via update denied', r5.status === 403, `status=${r5.status}`);

  // 6. Admin approving/publishing listing accepted
  const r6 = await fsRequest('PATCH', '/properties/prop_valid_draft?updateMask.fieldPaths=listingStatus', toFsFields({
    listingStatus: 'PUBLISHED',
  }), tokenAdmin);
  assertTest('6. Admin publishing listing accepted', r6.status === 200, `status=${r6.status} ${r6.body}`);

  // 7. User assigning themselves ADMIN denied
  const r7 = await fsRequest('PATCH', `/users/${uidA}`, toFsFields({
    fullName: 'Alice', role: 'ADMIN', admin: true,
  }), tokenA);
  assertTest('7. User self-assigning ADMIN denied', r7.status === 403, `status=${r7.status}`);

  // Valid user profile creation
  const r7b = await fsRequest('PATCH', `/users/${uidA}`, toFsFields({
    fullName: 'Alice', role: 'USER',
  }), tokenA);
  assertTest('7b. Valid user profile creation accepted', r7b.status === 200, `status=${r7b.status}`);

  // 8. User reading another user's private profile denied
  const r8 = await fsRequest('GET', `/users/${uidA}`, null, tokenB);
  assertTest('8. Reading another user private profile denied', r8.status === 403, `status=${r8.status}`);

  // 9. User accessing another user's favorites denied (and valid favorite accepted)
  const r9a = await fsRequest('PATCH', `/users/${uidB}/favorites/prop_valid_draft`, toFsFields({
    propertyId: 'prop_valid_draft',
  }), tokenB);
  assertTest('9a. Valid user favorite creation accepted', r9a.status === 200, `status=${r9a.status}`);
  const r9b = await fsRequest('GET', `/users/${uidB}/favorites/prop_valid_draft`, null, tokenA);
  assertTest('9b. Reading another user favorites denied', r9b.status === 403, `status=${r9b.status}`);

  // 10. Contact request: anonymous denied, invalid property denied, spoofed owner denied, valid accepted
  const r10a = await fsRequest('PATCH', '/contact_requests/cr_anon', toFsFields({
    propertyId: 'prop_valid_draft', propertyOwnerId: uidA, senderId: uidB, senderName: 'Anon', senderEmail: 'a@b.tn', message: 'Hello', status: 'PENDING', createdAt: '2026-11-25T10:00:00Z',
  }));
  assertTest('10a. Anonymous contact request denied', r10a.status === 403, `status=${r10a.status}`);

  const r10b = await fsRequest('PATCH', '/contact_requests/cr_bad_prop', toFsFields({
    propertyId: 'nonexistent_prop', propertyOwnerId: uidA, senderId: uidB, senderName: 'Bob', senderEmail: 'bob@darlink.tn', message: 'Hello there', status: 'PENDING', createdAt: '2026-11-25T10:00:00Z',
  }), tokenB);
  assertTest('10b. Contact request with invalid propertyId denied', r10b.status === 403, `status=${r10b.status}`);

  const r10c = await fsRequest('PATCH', '/contact_requests/cr_spoof_owner', toFsFields({
    propertyId: 'prop_valid_draft', propertyOwnerId: uidB, senderId: uidB, senderName: 'Bob', senderEmail: 'bob@darlink.tn', message: 'Hello there', status: 'PENDING', createdAt: '2026-11-25T10:00:00Z',
  }), tokenB);
  assertTest('10c. Contact request with spoofed propertyOwnerId denied', r10c.status === 403, `status=${r10c.status}`);

  const r10d = await fsRequest('PATCH', '/contact_requests/cr_valid', toFsFields({
    propertyId: 'prop_valid_draft', propertyOwnerId: uidA, senderId: uidB, senderName: 'Bob', senderEmail: 'bob@darlink.tn', message: 'Je souhaite visiter ce bien', status: 'PENDING', createdAt: '2026-11-25T10:00:00Z',
  }), tokenB);
  assertTest('10d. Valid authenticated contact request accepted', r10d.status === 200, `status=${r10d.status} ${r10d.body}`);

  // 11. User creating a notification for another user denied
  const r11a = await fsRequest('PATCH', '/notifications/notif_spoof', toFsFields({
    recipientUid: uidA, senderUid: uidB, title: 'Fake', body: 'Spoofed', type: 'SYSTEM', read: false, createdAt: '2026-11-25T10:00:00Z',
  }), tokenB);
  assertTest('11a. Client creating notification for another user denied', r11a.status === 403, `status=${r11a.status}`);

  const r11b = await fsRequest('PATCH', '/notifications/notif_admin', toFsFields({
    recipientUid: uidA, title: 'Visit', body: 'New request', type: 'CONTACT_REQUEST', read: false, createdAt: '2026-11-25T10:00:00Z',
  }), tokenAdmin);
  assertTest('11b. Admin/server creating notification accepted', r11b.status === 200, `status=${r11b.status}`);

  // 12. Agency: modifying another user's agency or setting verified=true denied
  const r12a = await fsRequest('PATCH', '/agencies/ag_alice', toFsFields({
    name: 'Alice Immo', ownerUid: uidA, verified: true,
  }), tokenA);
  assertTest('12a. Agency creation with verified=true denied', r12a.status === 403, `status=${r12a.status}`);

  const r12b = await fsRequest('PATCH', '/agencies/ag_alice', toFsFields({
    name: 'Alice Immo', ownerUid: uidA, verified: false,
  }), tokenA);
  assertTest('12b. Valid agency creation (verified=false) accepted', r12b.status === 200, `status=${r12b.status}`);

  const r12c = await fsRequest('PATCH', '/agencies/ag_alice?updateMask.fieldPaths=name', toFsFields({
    name: 'Hacked Agency',
  }), tokenB);
  assertTest('12c. Modifying another user agency denied', r12c.status === 403, `status=${r12c.status}`);

  // 13. P0 Property Creation + Image Metadata Order
  const p0PropId = 'prop_p0_order_test';
  const r13a = await fsRequest('PATCH', `/property_images/img_before_${Date.now()}`, toFsFields({
    uploaderUid: uidA, propertyId: p0PropId, sizeBytes: 102400,
  }), tokenA);
  assertTest('13a. property_images before property exists denied', r13a.status === 403, `status=${r13a.status}`);

  const r13b = await fsRequest('PATCH', `/properties/${p0PropId}`, toFsFields({
    title: 'Villa P0 Test', ownerId: uidA, listingStatus: 'DRAFT', price: 320000, surfaceM2: 200, bedrooms: 4, bathrooms: 2,
  }), tokenA);
  assertTest('13b. Initial DRAFT property creation accepted', r13b.status === 200, `status=${r13b.status}`);

  const r13c = await fsRequest('PATCH', `/property_images/img_after_${Date.now()}`, toFsFields({
    uploaderUid: uidA, propertyId: p0PropId, sizeBytes: 102400,
  }), tokenA);
  assertTest('13c. property_images after DRAFT exists accepted', r13c.status === 200, `status=${r13c.status} ${r13c.body}`);

  const r13d = await fsRequest('PATCH', `/properties/${p0PropId}?updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=imagePermissionStatus&updateMask.fieldPaths=listingStatus`, toFsFields({
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/darlink-74715.appspot.com/o/test.jpg?alt=media',
    imagePermissionStatus: 'OWNER_UPLOADED',
    listingStatus: 'PENDING_REVIEW',
  }), tokenA);
  assertTest('13d. Updating DRAFT with imageUrl + PENDING_REVIEW accepted', r13d.status === 200, `status=${r13d.status} ${r13d.body}`);

  console.log(`\n============================================================`);
  console.log(`EMULATOR SECURITY RESULT: ${passed}/${passed + failed} passed (${failed} failed)`);
  console.log(`============================================================`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
