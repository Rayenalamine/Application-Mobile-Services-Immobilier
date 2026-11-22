-- Migration V6 : Mettre à jour les numéros de téléphone des propriétaires réels
UPDATE properties p
SET agent_phone = u.phone
FROM users u
WHERE p.owner_id = u.id AND u.phone IS NOT NULL AND TRIM(u.phone) != '';
