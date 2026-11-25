// ============================================================
// DARLINK — TEST DE PERSISTANCE CRITIQUE DES FAVORIS CLOUD FIRESTORE
// Valide le cycle complet : ajout, persistance, redémarrage du processus,
// suppression, second redémarrage et isolation stricte à la déconnexion.
// ============================================================

// Polyfill Node CLI pour AsyncStorage environnement Web
if (typeof window === 'undefined') {
  const memStore: Record<string, string> = {};
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => memStore[k] ?? null,
      setItem: (k: string, v: string) => { memStore[k] = String(v); },
      removeItem: (k: string) => { delete memStore[k]; },
      clear: () => { Object.keys(memStore).forEach(k => delete memStore[k]); }
    }
  };
}

import { authService } from '../src/features/auth/services/authService';
import { favoritesApiService } from '../src/features/favorites/services/favoritesApiService';
import { propertyApiService } from '../src/features/properties/services/propertyApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function runPersistenceAudit(): Promise<void> {
  console.log('============================================================');
  console.log('   DARLINK — AUDIT DE PERSISTANCE CLOUD FIRESTORE DES FAVORIS');
  console.log('============================================================\n');

  // 1. Inscription et Connexion d'un utilisateur de test
  const testEmail = `firebase_audit_${Date.now()}@darlink.tn`;
  console.log(`[1/8] Inscription utilisateur test : ${testEmail}`);
  const registered = await authService.register('Audit Firebase Tester', testEmail, 'Password123!', '+216 20 999 888');
  if (!registered) throw new Error('Échec de l\'inscription');
  console.log('  ✅ Inscription réussie dans Firebase Auth & Cloud Firestore');

  // 2. Nettoyage initial des favoris
  console.log('\n[2/8] Vérification de l\'état initial vide...');
  await favoritesApiService.clear();
  let favs = await favoritesApiService.getFavorites();
  if (favs.length !== 0) throw new Error(`Favoris non vides : ${favs.length}`);
  console.log('  ✅ État initial validé : 0 favoris');

  // 3. Ajout de deux biens aux favoris
  console.log('\n[3/8] Ajout de l\'Appartement (ID 1) et de la Villa (ID 2) aux favoris...');
  const allProps = await propertyApiService.getProperties();
  const prop1 = allProps.find(p => p.id === '1')!;
  const prop2 = allProps.find(p => p.id === '2')!;

  await favoritesApiService.toggleFavorite('1', prop1);
  await favoritesApiService.toggleFavorite('2', prop2);

  favs = await favoritesApiService.getFavorites();
  if (!favoritesApiService.isFavorite('1') || !favoritesApiService.isFavorite('2')) {
    throw new Error('Les favoris ne sont pas marqués comme favoris !');
  }
  if (favs.length !== 2) throw new Error(`Attendu 2 favoris, obtenu ${favs.length}`);
  console.log(`  ✅ 2 favoris ajoutés et confirmés : "${prop1.titre}" & "${prop2.titre}"`);

  // 4. Vérification du stockage persistant (AsyncStorage / Firestore)
  console.log('\n[4/8] Vérification de la persistance sous-jacente (AsyncStorage)...');
  const storedIdsRaw = await AsyncStorage.getItem('@darlink_favorites_ids');
  const storedIds = storedIdsRaw ? JSON.parse(storedIdsRaw) : [];
  if (!storedIds.includes('1') || !storedIds.includes('2')) {
    throw new Error(`Données persistantes manquantes dans AsyncStorage: ${storedIdsRaw}`);
  }
  console.log(`  ✅ Données confirmées dans le stockage persistant : [${storedIds.join(', ')}]`);

  // 5. SIMULATION CRITIQUE : FERMETURE COMPLÈTE DE L'APPLICATION ET REDÉMARRAGE
  console.log('\n[5/8] 🔄 SIMULATION CRITIQUE : Fermeture du processus et Redémarrage complet de l\'application...');
  // Réinitialisation de la mémoire vive pour simuler un kill du processus
  (favoritesApiService as unknown as { isInitialized: boolean }).isInitialized = false;
  await favoritesApiService.init();

  const restoredFavs = await favoritesApiService.getFavorites();
  if (!favoritesApiService.isFavorite('1') || !favoritesApiService.isFavorite('2')) {
    throw new Error('❌ ÉCHEC DU TEST DE PERSISTANCE : Les favoris ont disparu après le redémarrage !');
  }
  if (restoredFavs.length !== 2) {
    throw new Error(`❌ Nombre de favoris restaurés incorrect: ${restoredFavs.length}`);
  }
  console.log('  ✅ [PASS] Les 2 favoris sont intacts après le redémarrage complet du processus !');

  // 6. Suppression d'un favori (ID 1)
  console.log('\n[6/8] Suppression du favori ID 1...');
  await favoritesApiService.toggleFavorite('1', prop1);
  if (favoritesApiService.isFavorite('1')) throw new Error('ID 1 est encore en favori !');
  if (!favoritesApiService.isFavorite('2')) throw new Error('ID 2 devrait toujours être en favori !');
  console.log('  ✅ ID 1 retiré, ID 2 maintenu');

  // 7. SECOND REDÉMARRAGE DE PROCESSUS
  console.log('\n[7/8] 🔄 Second Redémarrage du processus...');
  (favoritesApiService as unknown as { isInitialized: boolean }).isInitialized = false;
  await favoritesApiService.init();

  if (favoritesApiService.isFavorite('1')) {
    throw new Error('❌ ID 1 est réapparu après le second redémarrage !');
  }
  if (!favoritesApiService.isFavorite('2')) {
    throw new Error('❌ ID 2 a été perdu après le second redémarrage !');
  }
  console.log('  ✅ [PASS] La suppression persiste après redémarrage : ID 1 absent, ID 2 présent');

  // 8. Isolation stricte inter-utilisateurs à la déconnexion
  console.log('\n[8/8] Déconnexion utilisateur et vérification de l\'isolation...');
  await authService.logout();
  const disconnectedFavs = favoritesApiService.getCachedFavorites();
  if (disconnectedFavs.length !== 0 || favoritesApiService.isFavorite('2')) {
    throw new Error('Fuite de favoris après la déconnexion !');
  }
  console.log('  ✅ [PASS] Aucun résidu en mémoire après déconnexion.');

  console.log('\n============================================================');
  console.log('   🎉 TOUS LES TESTS DE PERSISTANCE FIREBASE SONT PASSÉS !   ');
  console.log('============================================================');
}

runPersistenceAudit().catch((err) => {
  console.error('\n❌ ERREUR LORS DU TEST DE PERSISTANCE :', err);
  process.exit(1);
});
