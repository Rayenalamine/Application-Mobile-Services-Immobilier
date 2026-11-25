// ============================================================
// DARLINK — AUDIT DE VÉRIFICATION CLOUD FIRESTORE & AUTH E2E
// Teste en direct sur le projet Firebase darlink-74715
// ============================================================

const API_KEY = 'AIzaSyDbKXIPYXNnE8ZICmVfMXhf6lRGTA--a0A';
const PROJECT_ID = 'darlink-74715';
const BASE_FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const BASE_AUTH = `https://identitytoolkit.googleapis.com/v1`;

async function runAudit() {
  console.log('============================================================');
  console.log('   DARLINK — AUDIT LIVE CLOUD FIREBASE : darlink-74715       ');
  console.log('============================================================\n');

  // TEST 1 : Récupération publique des annonces
  console.log('[TEST 1] Récupération publique des annonces (sans authentification)...');
  const propsRes = await fetch(`${BASE_FIRESTORE}/properties`);
  const propsJson = await propsRes.json();
  if (propsRes.status === 200 && propsJson.documents && propsJson.documents.length === 13) {
    console.log(`  ✅ SUCCÈS : 13/13 annonces récupérées en direct depuis Cloud Firestore`);
    console.log(`     Exemple doc 1 : "${propsJson.documents[0].fields.title.stringValue}" (${propsJson.documents[0].fields.city.stringValue})`);
  } else {
    throw new Error(`Échec Test 1 : statut ${propsRes.status}, docs: ${propsJson.documents?.length}`);
  }

  // TEST 2 : Authentification Utilisateur 1 (React Native Client)
  console.log('\n[TEST 2] Création & Connexion Utilisateur A (Profil Client Expo)...');
  const emailA = `client.expo.${Date.now()}@darlink.tn`;
  const signUpResA = await fetch(`${BASE_AUTH}/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password: 'ClientPassword2026!', returnSecureToken: true })
  });
  const userA = await signUpResA.json();
  if (!signUpResA.ok) throw new Error('Échec inscription Utilisateur A: ' + JSON.stringify(userA));
  console.log(`  ✅ SUCCÈS : Utilisateur A créé avec UID: ${userA.localId}`);

  // TEST 3 : Ajout d'un favori par Utilisateur A
  console.log('\n[TEST 3] Ajout du Bien #1 aux Favoris par Utilisateur A...');
  const favDocUrl = `${BASE_FIRESTORE}/users/${userA.localId}/favorites/1`;
  const addFavRes = await fetch(favDocUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userA.idToken}`
    },
    body: JSON.stringify({
      fields: {
        propertyId: { stringValue: '1' },
        title: { stringValue: 'Appartement moderne à Tunis' },
        price: { doubleValue: 320000 },
        city: { stringValue: 'Tunis' },
        createdAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  if (addFavRes.ok) {
    console.log(`  ✅ SUCCÈS : Favori #1 enregistré dans "users/${userA.localId}/favorites/1"`);
  } else {
    throw new Error('Échec ajout favori: ' + await addFavRes.text());
  }

  // TEST 4 : Lecture des favoris par Utilisateur A (Cross-app: Flutter lit le favori)
  console.log('\n[TEST 4] Lecture des favoris de Utilisateur A (Simulation Flutter & React Native)...');
  const getFavsRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}/favorites`, {
    headers: { 'Authorization': `Bearer ${userA.idToken}` }
  });
  const favsData = await getFavsRes.json();
  if (getFavsRes.ok && favsData.documents && favsData.documents.length === 1) {
    console.log(`  ✅ SUCCÈS : 1 favori récupéré par Utilisateur A (ID: ${favsData.documents[0].fields.propertyId.stringValue})`);
  } else {
    throw new Error('Échec lecture favoris: ' + JSON.stringify(favsData));
  }

  // TEST 5 : Sécurité & Isolation : Utilisateur B tente d'accéder aux favoris de Utilisateur A
  console.log('\n[TEST 5] Contrôle des règles de sécurité Firestore (Isolation des données privées)...');
  const emailB = `client.flutter.${Date.now()}@darlink.tn`;
  const signUpResB = await fetch(`${BASE_AUTH}/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password: 'ClientPassword2026!', returnSecureToken: true })
  });
  const userB = await signUpResB.json();
  console.log(`  Utilisateur B créé avec UID: ${userB.localId}`);

  // Utilisateur B tente de lire les favoris de A
  const breachRes = await fetch(`${BASE_FIRESTORE}/users/${userA.localId}/favorites`, {
    headers: { 'Authorization': `Bearer ${userB.idToken}` }
  });
  if (breachRes.status === 403) {
    console.log(`  🛡️ SUCCÈS SÉCURITÉ : Requête rejetée avec 403 Forbidden ! Les favoris de l'Utilisateur A sont strictement inaccessibles à l'Utilisateur B.`);
  } else {
    throw new Error(`Faille détectée : Utilisateur B a accédé aux favoris avec le statut ${breachRes.status}`);
  }

  // TEST 6 : Envoi d'une demande de contact
  console.log('\n[TEST 6] Envoi d\'une demande de contact dans "contact_requests"...');
  const contactRes = await fetch(`${BASE_FIRESTORE}/contact_requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userA.idToken}`
    },
    body: JSON.stringify({
      fields: {
        propertyId: { stringValue: '1' },
        senderId: { stringValue: userA.localId },
        senderEmail: { stringValue: userA.email },
        message: { stringValue: 'Bonjour, je souhaite visiter ce bien samedi.' },
        createdAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  if (contactRes.ok) {
    console.log(`  ✅ SUCCÈS : Demande de contact enregistrée dans Cloud Firestore`);
  } else {
    throw new Error('Échec demande de contact: ' + await contactRes.text());
  }

  console.log('\n============================================================');
  console.log('   🎉 TOUS LES TESTS CLOUD FIRESTORE & AUTH ONT RÉUSSI (6/6) ');
  console.log('============================================================');
}

runAudit().catch(err => {
  console.error('\n❌ Erreur Audit :', err);
  process.exit(1);
});
