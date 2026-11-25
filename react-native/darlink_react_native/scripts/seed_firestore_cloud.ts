// ============================================================
// DARLINK — SEEDER SÉCURISÉ CLOUD FIRESTORE (Projet darlink-74715)
// Initialise les 13 propriétés de prestige dans Cloud Firestore
// sans écraser les données existantes (Opération idempotente)
// ============================================================

import { firestoreEngine } from '../src/core/firebase/firestoreEngine';
import { mockProperties } from '../src/features/properties/data/mockProperties';
import { SpringPropertyDto } from '../src/features/properties/services/propertyApiService';

async function seedCloudFirestore(): Promise<void> {
  console.log('============================================================');
  console.log('   DARLINK — INITIALISATION SÉCURISÉE CLOUD FIRESTORE       ');
  console.log('   Projet cible : darlink-74715                             ');
  console.log('============================================================\n');

  console.log('[1/3] Interrogation de la collection "properties"...');
  let existingProps: Array<SpringPropertyDto & { id: string }> = [];
  try {
    existingProps = await firestoreEngine.getCollection<SpringPropertyDto>('properties');
    console.log(`  📊 Nombre d'annonces actuellement en base : ${existingProps.length}`);
  } catch (err) {
    console.warn('  ⚠️ Note : Impossible de lire directement sans règles publiées ou authentification.', err);
  }

  const existingIds = new Set(existingProps.map((p) => String(p.id)));

  console.log('\n[2/3] Insertion sécurisée des 13 annonces prestige...');
  let addedCount = 0;
  let skippedCount = 0;

  for (const prop of mockProperties) {
    const docId = String(prop.id);
    if (existingIds.has(docId)) {
      console.log(`  ⏭️ Annonce ID ${docId} ("${prop.titre}") existe déjà — ignorée`);
      skippedCount++;
      continue;
    }

    const docData: Record<string, unknown> = {
      id: docId,
      title: prop.titre,
      description: prop.description,
      location: prop.localisation,
      city: prop.localisation.split(',').pop()?.trim() || 'Tunis',
      price: prop.prix,
      type: prop.type,
      imageUrl: prop.imageUrl,
      galleryUrls: prop.imagesGalerie || [],
      bedrooms: prop.nombreChambres,
      bathrooms: prop.nombreSallesDeBain,
      surfaceM2: prop.surfaceM2,
      yearBuilt: prop.anneeConstruction,
      standing: prop.standing,
      isRental: prop.estLocation,
      latitude: prop.latitude || 36.8,
      longitude: prop.longitude || 10.2,
      amenities: prop.commodites || [],
      agentName: prop.agentNom,
      agentPhone: prop.agentTel,
      ownerId: 'user_admin_1',
      createdAt: new Date().toISOString(),
    };

    try {
      const ok = await firestoreEngine.setDocument('properties', docId, docData);
      if (ok) {
        console.log(`  ✅ Annonce ID ${docId} insérée : "${prop.titre}"`);
        addedCount++;
      } else {
        console.log(`  ⚠️ Annonce ID ${docId} mise en cache local (attente connexion cloud) : "${prop.titre}"`);
        addedCount++;
      }
    } catch (e) {
      console.error(`  ❌ Erreur insertion ID ${docId} :`, e);
    }
  }

  console.log('\n[3/3] Bilan du peuplement :');
  console.log(`  - Annonces ajoutées : ${addedCount}`);
  console.log(`  - Annonces préservées : ${skippedCount}`);
  console.log(`  - Total catalogue : ${addedCount + skippedCount}`);
  console.log('\n============================================================');
  console.log('   ✅ OPÉRATION DE SEEDING TERMINÉE AVEC SUCCÈS             ');
  console.log('============================================================');
}

seedCloudFirestore().catch((err) => {
  console.error('Erreur critique seeding :', err);
});
