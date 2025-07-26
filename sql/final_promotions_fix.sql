-- FIX FINAL : Structure promotions + données test
-- Ce script corrige définitivement la structure et ajoute des données test

-- Étape 1 : Supprimer la table existante et la recréer correctement
DROP TABLE IF EXISTS promotions CASCADE;

-- Étape 2 : Créer la table avec structure compatible formulaire
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC NOT NULL DEFAULT 0,
    code TEXT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses NUMERIC DEFAULT NULL,
    usage_count NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 3 : Ajouter des promotions test
INSERT INTO promotions (title, description, discount_type, discount_value, code, start_date, end_date, is_active, is_featured, image_url, min_order_amount, max_uses) VALUES
('Promo Été 2025', 'Réduction spéciale été', 'percentage', 20, 'ETE20', NOW(), NOW() + INTERVAL '7 days', true, true, 'https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/ete.jpg', 0, 100),
('Promo Cocktails', 'Réduction sur cocktails maison', 'percentage', 15, 'COCKTAIL15', NOW(), NOW() + INTERVAL '14 days', true, false, 'https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/cocktails.jpg', 25, 50),
('Promo Apéro', 'Offre spéciale apéro', 'fixed', 1000, 'APERO10', NOW(), NOW() + INTERVAL '10 days', true, false, 'https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/apero.jpg', 50, 30),
('Promo Week-end', 'Réduction week-end', 'percentage', 25, 'WEEKEND25', NOW(), NOW() + INTERVAL '3 days', true, true, 'https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/weekend.jpg', 0, 200);

-- Étape 4 : Vérifier les données
SELECT 
    id,
    title,
    description,
    discount_type,
    discount_value,
    code,
    is_active,
    is_featured,
    image_url,
    min_order_amount,
    max_uses,
    created_at
FROM promotions 
ORDER BY created_at DESC;

-- Étape 5 : Vérifier la structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;
