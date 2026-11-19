-- ============================================================
-- DARLINK — MIGRATION FLYWAY V3 : PROPRIÉTAIRE, IMAGES & DEMANDES DE CONTACT
-- ============================================================

-- 1. Ajout de la colonne owner_id sur la table properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Mise à jour des biens existants pour les rattacher à l'utilisateur administrateur/agent initial (id = 1)
UPDATE properties SET owner_id = 1 WHERE owner_id IS NULL;

-- Index pour optimiser la recherche des biens d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

-- 2. Table pour le stockage d'images multiples par bien immobilier
CREATE TABLE IF NOT EXISTS property_images (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);

-- 3. Table des demandes de contact entre acheteurs/locataires et propriétaires
CREATE TABLE IF NOT EXISTS contact_requests (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(120) NOT NULL,
    sender_email VARCHAR(150) NOT NULL,
    sender_phone VARCHAR(30),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_property ON contact_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_sender ON contact_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
