-- ============================================================
-- DARLINK — MIGRATION FLYWAY V1 : SCHÉMA INITIAL
-- Tables : users, properties, favorites
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) DEFAULT 'CLIENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    gallery_urls TEXT, -- URLs séparées par virgule ou JSON
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    surface_m2 NUMERIC(10, 2) NOT NULL,
    year_built INT DEFAULT 2022,
    standing VARCHAR(80) DEFAULT 'Haut Standing',
    is_rental BOOLEAN DEFAULT FALSE,
    amenities TEXT, -- Liste d'équipements séparés par virgule
    agent_name VARCHAR(120) DEFAULT 'Sonia Ben Salem',
    agent_phone VARCHAR(40) DEFAULT '+216 71 888 999',
    latitude NUMERIC(10, 6) DEFAULT 36.806500,
    longitude NUMERIC(10, 6) DEFAULT 10.181500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_property_favorite UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

