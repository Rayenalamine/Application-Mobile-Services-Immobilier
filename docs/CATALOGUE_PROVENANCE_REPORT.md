# DARLINK — CATALOGUE PROVENANCE REPORT

**Report Date:** 2026-11-25  
**Firebase Project:** `darlink-74715` (`properties` collection)  
**Policy:** Zero fabricated properties, zero stock Unsplash photos, strict separation between individual verified listings (`VERIFIED_LISTING`) and institutional housing programme references (`DEVELOPMENT_REFERENCE`).

---

## 1. Summary of Provenance Audit

- **Legacy fabricated dataset (`firebase_seed_data.json`):** Removed (13 placeholder listings with Unsplash URLs, `Rayen Lamine`, `+216 71 888 999`, `user_admin_1`).
- **Live Firestore `properties` collection:** 18 records audited, backed up to `scripts/backups/firestore_properties_backup_2026-11-25.json`.
- **Placeholders found in live Firestore:** 0 (`numeric IDs 1..13`, Unsplash URLs, and `+216 71 888 999` are no longer in live Firestore).
- **Institutional references needing category migration (`DEVELOPMENT_REFERENCE`):** 18/18 live records currently carry `listingStatus: "PUBLISHED"` without `listingCategory: "DEVELOPMENT_REFERENCE"`, `sourceType`, or `verificationStatus`. Migration script `scripts/migrate_catalogue_provenance.js` is ready (`--dry-run` verified; awaiting explicit user approval before `--apply --confirm`).

---

## 2. Record-by-Record Provenance Registry (18 Institutional References)

| # | Document ID | Title | Source / Organism | Source Type | Source URL | Last Verified | Current Status | Target Category | Image Permission Status | Republication Authorized |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | `ref_snit_tunis_ibnkhaldoun_s2` | Résidence Ibn Khaldoun 1 — Appartement S+2 (SNIT) | SNIT | `INSTITUTIONAL_PORTAL` | `https://www.snit-vente.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 2 | `ref_snit_tunis_ibnkhaldoun_s3` | Résidence Ibn Khaldoun 1 — Appartement S+3 (SNIT) | SNIT | `INSTITUTIONAL_PORTAL` | `https://www.snit-vente.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 3 | `ref_snit_ariana_tanit` | Résidence Tanit — Jardins El Menzah 1 (SNIT) | SNIT Mère | `INSTITUTIONAL_PORTAL` | `https://www.snit-vente.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 4 | `ref_sprols_ariana_borjtouil_s2` | Résidences El Khaleej — Appartement S+2 (SPROLS) | SPROLS | `INSTITUTIONAL_PORTAL` | `https://www.sprols.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 5 | `ref_sprols_ariana_borjtouil_s3` | Résidences El Khaleej — Appartement S+3 (SPROLS) | SPROLS | `INSTITUTIONAL_PORTAL` | `https://www.sprols.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 6 | `ref_sprols_benarous_mourouj` | Résidences El Mourouj 3 & 6 — S+2 / S+3 (SPROLS) | SPROLS | `INSTITUTIONAL_PORTAL` | `https://www.sprols.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 7 | `ref_sprols_manouba_douarhicher` | Programme Résidentiel Douar Hicher (SPROLS) | SPROLS | `INSTITUTIONAL_PORTAL` | `https://www.sprols.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 8 | `ref_afh_nabeul_mrezga` | Lotissement AFH Mrezga — Terrain résidentiel (AFH) | AFH | `INSTITUTIONAL_PORTAL` | `https://www.afh.nat.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 9 | `ref_snitnord_bizerte_ezzahra` | Résidence Ezzahra — Appartement S+2 (SNIT Nord) | SNIT Nord | `INSTITUTIONAL_PORTAL` | `https://www.snitnord.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 10 | `ref_snitnord_beja_vaga` | Résidence VAGA — Appartement S+2 (SNIT Nord) | SNIT Nord | `INSTITUTIONAL_PORTAL` | `https://www.snitnord.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 11 | `ref_snitnord_jendouba_montazah` | Cité Montazah — Logement individuel S+2 (SNIT Nord) | SNIT Nord | `INSTITUTIONAL_PORTAL` | `https://www.snitnord.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 12 | `ref_snitnord_siliana_narjes` | Résidence Narjes — Appartement S+2 (SNIT Nord) | SNIT Nord | `INSTITUTIONAL_PORTAL` | `https://www.snitnord.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 13 | `ref_afh_sousse_errayhan` | Lotissement Cité Riadh / Errayhan (AFH) | AFH / SNIT Centre | `INSTITUTIONAL_PORTAL` | `https://www.afh.nat.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 14 | `ref_afh_kairouan_mansoura` | Lotissement El Mansoura — Terrain viabilisé (AFH) | AFH | `INSTITUTIONAL_PORTAL` | `https://www.afh.nat.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 15 | `ref_snitsud_sfax_azur_s2` | Résidence Azur — Appartement S+2 (SNIT Sud) | SNIT Sud | `INSTITUTIONAL_PORTAL` | `https://www.snitsud.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 16 | `ref_snitsud_sfax_azur_s3` | Résidence Azur — Appartement S+3 (SNIT Sud) | SNIT Sud | `INSTITUTIONAL_PORTAL` | `https://www.snitsud.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 17 | `ref_snitsud_sidibouzid_collines` | Résidence Les Collines — S+2 / S+3 (SNIT Sud) | SNIT Sud | `INSTITUTIONAL_PORTAL` | `https://www.snitsud.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |
| 18 | `ref_snitsud_medenine_djerba_cactus` | Villas Cactus — Djerba (SNIT Sud) | SNIT Sud | `INSTITUTIONAL_PORTAL` | `https://www.snitsud.tn` | 2026-11-25 | `PUBLISHED` | `DEVELOPMENT_REFERENCE` | `NONE_PLACEHOLDER_USED` | `false` |

---

## 3. Approval Gate for Production Migration

No production Firestore documents were modified during this audit.  
Once approved by the project owner, execute:
```bash
node scripts/migrate_catalogue_provenance.js --backup --apply --confirm
```

