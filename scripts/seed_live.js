const fs = require('fs');

const API_KEY = 'AIzaSyDbKXIPYXNnE8ZICmVfMXhf6lRGTA--a0A';
const PROJECT_ID = 'darlink-74715';

async function seedLiveFirestore() {
  console.log('--- Connecting to Firebase Auth ---');
  const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.darlink@example.com', password: 'Password123!', returnSecureToken: true })
  });
  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error('Auth failed: ' + JSON.stringify(authData));
  }
  const token = authData.idToken;
  console.log('Authenticated UID:', authData.localId);

  const seedRaw = fs.readFileSync('Application-Mobile-Services-Immobilier/firebase_seed_data.json', 'utf8');
  const seedData = JSON.parse(seedRaw);
  const seedProps = seedData.properties || [];
  console.log(`Seeding ${seedProps.length} properties into Cloud Firestore project "${PROJECT_ID}"...`);

  let count = 0;
  for (const p of seedProps) {
    const docId = String(p.id);
    const firestoreFields = {
      id: { stringValue: docId },
      title: { stringValue: p.title || p.titre || '' },
      description: { stringValue: p.description || '' },
      location: { stringValue: p.location || p.localisation || '' },
      city: { stringValue: p.city || 'Tunis' },
      price: { doubleValue: Number(p.price || p.prix || 0) },
      type: { stringValue: p.type || 'Villa' },
      imageUrl: { stringValue: p.imageUrl || '' },
      galleryUrls: {
        arrayValue: {
          values: (p.galleryUrls || []).map(url => ({ stringValue: url }))
        }
      },
      bedrooms: { integerValue: String(p.bedrooms || 1) },
      bathrooms: { integerValue: String(p.bathrooms || 1) },
      surfaceM2: { doubleValue: Number(p.surfaceM2 || 100) },
      yearBuilt: { integerValue: String(p.yearBuilt || 2022) },
      standing: { stringValue: p.standing || 'Haut standing' },
      isRental: { booleanValue: Boolean(p.isRental) },
      latitude: { doubleValue: Number(p.latitude || 36.8) },
      longitude: { doubleValue: Number(p.longitude || 10.2) },
      amenities: {
        arrayValue: {
          values: (p.amenities || []).map(a => ({ stringValue: a }))
        }
      },
      agentName: { stringValue: p.agentName || 'DarLink Prestige' },
      agentPhone: { stringValue: p.agentPhone || '+216 71 000 000' },
      ownerId: { stringValue: authData.localId }
    };

    const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/properties/${docId}`;
    const patchRes = await fetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ fields: firestoreFields })
    });
    const patchJson = await patchRes.json();
    if (patchRes.ok) {
      console.log(`  [+] Property ID ${docId}: "${p.title}" successfully seeded`);
      count++;
    } else {
      console.error(`  [-] Error ID ${docId}:`, patchJson);
    }
  }
  console.log(`\n=== Total Seeded: ${count}/${seedProps.length} ===`);

  // Verify public read without auth
  const getUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/properties`;
  const getRes = await fetch(getUrl);
  const getData = await getRes.json();
  console.log('Public fetch status:', getRes.status);
  console.log('Public documents retrieved from Cloud Firestore:', getData.documents ? getData.documents.length : 0);
}

seedLiveFirestore().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
