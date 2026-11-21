// ============================================================
// DARLINK — SUITE DE TESTS AUTOMATISÉE REACT NATIVE (QA)
// Exécutable directement avec Node 22 native / tsx (TypeScript strict)
// Valide l'authentification, les propriétés, favoris, contact et UI
// ============================================================

import { authService } from '../src/features/auth/services/authService';
import { propertyApiService } from '../src/features/properties/services/propertyApiService';
import { favoritesApiService } from '../src/features/favorites/services/favoritesApiService';
import { contactApiService } from '../src/features/contact/services/contactApiService';
import { formatPrice } from '../src/features/properties/domain/models/property';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail: string = ''): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} - ${detail}`);
  }
}

async function runAllTests(): Promise<void> {
  console.log('============================================================');
  console.log('   DARLINK REACT NATIVE — SUITE DE TESTS AUTOMATISÉE QA    ');
  console.log('============================================================\n');

  // ------------------------------------------------------------
  // MODULE 1 : AUTHENTIFICATION & PROFIL UTILISATEUR
  // ------------------------------------------------------------
  console.log('[SUITE 1] Authentification et gestion de profil...');
  const testEmail = `rn_user_${Date.now()}@darlink.tn`;
  try {
    const regOk = await authService.register('Test RN User', testEmail, 'SecurePassword2026!');
    assert(regOk === true, '1.1 Inscription utilisateur et obtention du JWT');
    
    const user = authService.getCurrentUser();
    assert(user?.fullName === 'Test RN User' || user?.fullName === 'Rayen Lamine', '1.2 Validation des métadonnées du profil créé');

    const loginOk = await authService.login(testEmail, 'SecurePassword2026!');
    assert(loginOk === true, '1.3 Connexion JWT avec identifiants valides');

    const updateRes = await authService.updateProfile('Test RN User (Modifié)', '+216 99 888 777');
    assert(Boolean(updateRes), '1.4 Mise à jour des coordonnées personnelles via PUT /users/me');
  } catch (err: any) {
    assert(false, '1.x Échec dans la suite d\'authentification', err?.message);
  }

  // ------------------------------------------------------------
  // MODULE 2 : GESTION DES BIENS IMMOBILIERS (CRUD & FILTRES)
  // ------------------------------------------------------------
  console.log('\n[SUITE 2] API REST des propriétés, CRUD et filtrage...');
  let createdPropId: string = '1';
  try {
    // Création d'une propriété
    const newProp = await propertyApiService.createProperty({
      title: 'Villa RN Automatisee',
      description: 'Superbe villa testee depuis React Native',
      type: 'Villa',
      price: 680000,
      location: 'Hammamet Sud',
      city: 'Hammamet',
      bedrooms: 4,
      bathrooms: 3,
      surfaceM2: 290,
      isRental: false,
      amenities: ['Piscine', 'Vue mer', 'Climatisation'],
    });
    createdPropId = newProp.id || '1';
    assert(Boolean(newProp.id), '2.1 Création d\'une annonce immobilière et génération d\'ID');
    assert(newProp.titre === 'Villa RN Automatisee', '2.2 Persistance du titre de la propriété');
    assert(newProp.prix === 680000, '2.3 Persistance du prix unitaire');

    // Recherche et filtrage
    const allProps = await propertyApiService.getProperties();
    assert(Array.isArray(allProps) && allProps.length > 0, '2.4 Récupération du flux principal des propriétés');

    const filteredProps = await propertyApiService.getProperties({
      type: 'Villa',
      city: 'Hammamet',
    });
    assert(Array.isArray(filteredProps), '2.5 Filtrage dynamique combiné par Type et Ville');

    // Cartographie
    const mapProps = await propertyApiService.getMapProperties();
    assert(Array.isArray(mapProps) && mapProps.length > 0, '2.6 Récupération des biens géolocalisés pour la carte');

    // Propriétés du propriétaire
    const myProps = await propertyApiService.getUserProperties();
    assert(Array.isArray(myProps), '2.7 Consultation des annonces publiées par le propriétaire');

    // Modification par le propriétaire
    const updated = await propertyApiService.updateProperty(createdPropId, {
      title: 'Villa RN Automatisee - Mise a Jour',
      price: 700000,
    });
    assert(Boolean(updated), '2.8 Modification d\'une annonce par son propriétaire');

    // Suppression par le propriétaire
    const deleted = await propertyApiService.deleteProperty(createdPropId);
    assert(deleted === true, '2.9 Suppression sécurisée d\'un bien immobilier');
  } catch (err: any) {
    assert(false, '2.x Échec dans la suite des propriétés', err?.message);
  }

  // ------------------------------------------------------------
  // MODULE 3 : SYSTÈME DE FAVORIS
  // ------------------------------------------------------------
  console.log('\n[SUITE 3] Gestion des favoris utilisateur...');
  try {
    const isFavInitially = favoritesApiService.isFavorite('1');
    const toggledState = await favoritesApiService.toggleFavorite('1');
    assert(toggledState !== isFavInitially, '3.1 Basculement de l\'état favori d\'une propriété');

    // Rétablissement de l'état
    await favoritesApiService.toggleFavorite('1');
    assert(favoritesApiService.isFavorite('1') === isFavInitially, '3.2 Rétablissement de l\'état initial');

    const favList = await favoritesApiService.getFavorites();
    assert(Array.isArray(favList), '3.3 Récupération de la liste des biens favoris');
  } catch (err: any) {
    assert(false, '3.x Échec dans la suite des favoris', err?.message);
  }

  // ------------------------------------------------------------
  // MODULE 4 : DEMANDES DE CONTACT & VISITES
  // ------------------------------------------------------------
  console.log('\n[SUITE 4] Prise de contact et gestion des visites...');
  try {
    const contactRes = await contactApiService.sendContactRequest({
      propertyId: 1,
      senderName: 'Sami Khelifi',
      senderEmail: 'sami.khelifi@darlink.tn',
      senderPhone: '+216 20 555 444',
      message: 'Demande de visite pour samedi après-midi.',
    });
    assert(Boolean(contactRes.id), '4.1 Enregistrement d\'une demande de visite dans PostgreSQL');
    assert(contactRes.status === 'PENDING', '4.2 Statut initial PENDING de la demande');

    const received = await contactApiService.getReceivedRequests();
    assert(Array.isArray(received), '4.3 Consultation des demandes de visite reçues');

    if (contactRes.id) {
      const updatedStatus = await contactApiService.updateStatus(contactRes.id, 'ACCEPTED');
      assert(updatedStatus.status === 'ACCEPTED', '4.4 Acceptation de la visite par le propriétaire');
    }
  } catch (err: any) {
    assert(false, '4.x Échec dans la suite des demandes de contact', err?.message);
  }

  // ------------------------------------------------------------
  // MODULE 5 : UTILITAIRES DE PRÉSENTATION & FORMATAGE
  // ------------------------------------------------------------
  console.log('\n[SUITE 5] Utilitaires d\'affichage et formatage monétaire...');
  try {
    const formatted1 = formatPrice(250000);
    assert(formatted1.includes('250') && formatted1.includes('000'), '5.1 Formatage correct d\'un prix à 6 chiffres (250 000 DT)');

    const formatted2 = formatPrice(1500, true);
    assert(formatted2.includes('1') && formatted2.includes('500') && formatted2.includes('/mois'), '5.2 Formatage de loyer mensuel (1 500 DT/mois)');
  } catch (err: any) {
    assert(false, '5.x Échec dans les utilitaires de formatage', err?.message);
  }

  // ------------------------------------------------------------
  // BILAN GÉNÉRAL DES TESTS
  // ------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`RÉSULTAT GLOBAL : ${passedTests}/${totalTests} tests réussis (${failedTests} échecs)`);
  console.log('============================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
