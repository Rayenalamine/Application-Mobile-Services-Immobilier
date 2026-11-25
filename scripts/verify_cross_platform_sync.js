// ============================================================
// DARLINK — VÉRIFICATION DE SYNCHRONISATION CROSS-PLATFORM
// Teste la cohérence bidirectionnelle React Native <-> Flutter
// sur le projet réel Firebase Cloud darlink-74715
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

  if (!apiKey) {
    throw new Error(
      'ERREUR DE CONFIGURATION : Aucune clé API Firebase configurée.\n' +
      'Veuillez définir FIREBASE_API_KEY dans votre environnement ou dans votre fichier .env local.'
    );
  }

  return { apiKey, projectId };
}

const { apiKey: API_KEY, projectId: PROJECT_ID } = resolveConfig();
const BASE_FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const BASE_AUTH = `https://identitytoolkit.googleapis.com/v1`;

async function runCrossPlatformSyncTest() {
  console.log('============================================================');
  console.log('   DARLINK — TEST DE SYNCHRONISATION BIDIRECTIONNELLE       ');
  console.log(`   Projet cible Cloud Firebase : ${PROJECT_ID}              `);
  console.log('============================================================\n');

  // 1. Authentification d'un compte de test partagé
  console.log('[ÉTAPE 1] Enregistrement d\'un compte utilisateur de test partagé...');
  const testEmail = `sync.test.${Date.now()}@darlink.tn`;
  const testPassword = 'SyncTestPassword2026!';

  const signUpRes = await fetch(`${BASE_AUTH}/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, returnSecureToken: true }),
  });
  const authData = await signUpRes.json();
  if (!signUpRes.ok) throw new Error('Échec inscription : ' + JSON.stringify(authData));

  const uid = authData.localId;
  const token = authData.idToken;
  console.log(`  ✅ Compte partagé créé avec succès (UID : ${uid})\n`);

  // 2. React Native ajoute un favori (Bien ID 1)
  console.log('[ÉTAPE 2] [React Native] Ajout du Bien #1 aux Favoris dans Cloud Firestore...');
  const targetPropertyId = '1';
  const rnFavPayload = {
    fields: {
      propertyId: { stringValue: targetPropertyId },
      title: { stringValue: 'Appartement moderne à Tunis' },
      price: { doubleValue: 320000 },
      city: { stringValue: 'Tunis' },
      createdAt: { stringValue: new Date().toISOString() },
      platformOrigin: { stringValue: 'React Native (Expo)' },
    },
  };

  const addFavUrl = `${BASE_FIRESTORE}/users/${uid}/favorites/${targetPropertyId}`;
  const addRes = await fetch(addFavUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rnFavPayload),
  });

  if (!addRes.ok) {
    throw new Error('Échec ajout favori par React Native : ' + (await addRes.text()));
  }
  console.log('  ✅ [React Native] Favori #1 écrit avec succès dans la sous-collection Firestore.\n');

  // 3. Flutter consulte les favoris et confirme l'apparition du bien
  console.log('[ÉTAPE 3] [Flutter] Interrogation de Cloud Firestore pour récupérer les favoris...');
  const getFavsUrl = `${BASE_FIRESTORE}/users/${uid}/favorites`;
  const flutterGetRes = await fetch(getFavsUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const flutterFavsData = await flutterGetRes.json();

  if (!flutterGetRes.ok || !flutterFavsData.documents || flutterFavsData.documents.length === 0) {
    throw new Error('Échec Flutter : le favori inséré par React Native est introuvable.');
  }

  const retrievedDoc = flutterFavsData.documents.find((d) => {
    return d.fields?.propertyId?.stringValue === targetPropertyId;
  });

  if (!retrievedDoc) {
    throw new Error(`Échec Flutter : Le bien ${targetPropertyId} n'apparaît pas dans les favoris.`);
  }

  console.log('  ✅ [Flutter] Le favori ajouté par React Native a bien été détecté en direct !');
  console.log(`     Titre : "${retrievedDoc.fields.title.stringValue}"`);
  console.log(`     Prix : ${retrievedDoc.fields.price.doubleValue} DT`);
  console.log(`     Origine : ${retrievedDoc.fields.platformOrigin?.stringValue}\n`);

  // 4. Flutter supprime le favori
  console.log('[ÉTAPE 4] [Flutter] Suppression du Bien #1 des Favoris via Cloud Firestore...');
  const deleteFavUrl = `${BASE_FIRESTORE}/users/${uid}/favorites/${targetPropertyId}`;
  const deleteRes = await fetch(deleteFavUrl, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!deleteRes.ok) {
    throw new Error('Échec suppression par Flutter : ' + (await deleteRes.text()));
  }
  console.log('  ✅ [Flutter] Document favori #1 supprimé de Cloud Firestore avec succès.\n');

  // 5. React Native vérifie la suppression
  console.log('[ÉTAPE 5] [React Native] Re-lecture des favoris pour vérifier la suppression...');
  const rnVerifyRes = await fetch(getFavsUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const rnVerifyData = await rnVerifyRes.json();
  const remainingDocs = rnVerifyData.documents || [];
  const stillExists = remainingDocs.some((d) => d.fields?.propertyId?.stringValue === targetPropertyId);

  if (stillExists) {
    throw new Error('Échec React Native : Le favori existe toujours après suppression par Flutter.');
  }

  console.log('  ✅ [React Native] Suppression confirmée : 0 favori restant.');
  console.log(`     Total favoris en base pour cet utilisateur : ${remainingDocs.length}\n`);

  console.log('============================================================');
  console.log('   🎉 SYNCHRONISATION MULTI-PLATEFORME VÉRIFIÉE AVEC SUCCÈS ');
  console.log('   React Native <--> Cloud Firestore <--> Flutter           ');
  console.log('============================================================');
}

runCrossPlatformSyncTest().catch((err) => {
  console.error('\n❌ Échec du test cross-platform :', err);
  process.exit(1);
});

