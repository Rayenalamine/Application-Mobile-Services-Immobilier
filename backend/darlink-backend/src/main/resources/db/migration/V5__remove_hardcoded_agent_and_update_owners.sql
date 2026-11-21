-- ============================================================
-- DARLINK — MIGRATION FLYWAY V5 : SUPPRESSION DÉFINITIVE DE "SONIA BEN SALEM"
-- ET ASSOCIATION AUX PROPRIÉTAIRES RÉELS
-- ============================================================

-- 1. Suppression de la valeur par défaut sur agent_name
ALTER TABLE properties ALTER COLUMN agent_name DROP DEFAULT;

-- 2. Mise à jour de tous les enregistrements existants avec le nom réel du propriétaire
UPDATE properties p
SET agent_name = u.full_name
FROM users u
WHERE p.owner_id = u.id;

-- 3. Sécurité supplémentaire pour les annonces sans propriétaire ou encore marquées
UPDATE properties
SET agent_name = 'Propriétaire'
WHERE agent_name = 'Sonia Ben Salem' OR agent_name IS NULL;
