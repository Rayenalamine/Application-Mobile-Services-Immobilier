// ============================================================
// DARLINK — DEPRECATED SEEDER GUARD
// Legacy fabricated seeding (firebase_seed_data.json) is disabled.
// Use scripts/migrate_catalogue_provenance.js (--dry-run / --backup)
// or scripts/catalog_importer.js for verified institutional references.
// ============================================================

console.error(
  '❌ REFUSED: scripts/seed_live.js is deprecated because fabricated sample listings are prohibited in DarLink.\n' +
  '   - To audit or migrate live Firestore provenance, run:\n' +
  '     node scripts/migrate_catalogue_provenance.js --dry-run\n' +
  '   - To inspect verified institutional references, see:\n' +
  '     scripts/tunisia_verified_catalogue.json'
);
process.exit(1);
