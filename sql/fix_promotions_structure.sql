-- FIX : Structure complète de la table promotions
-- Ce script corrige la structure pour correspondre au formulaire admin

-- Étape 1 : Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- Étape 2 : Rendre les champs optionnels ou ajouter les valeurs par défaut
-- Rendre 'name' optionnel (ou supprimer si inutile)
ALTER TABLE promotions ALTER COLUMN name DROP NOT NULL;

-- Rendre 'code' optionnel
ALTER TABLE promotions ALTER COLUMN code DROP NOT NULL;

-- Étape 3 : Ajouter les champs manquants si nécessaires
-- Vérifier et ajouter les colonnes nécessaires
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'title') THEN
        ALTER TABLE promotions ADD COLUMN title TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'description') THEN
        ALTER TABLE promotions ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'discount_type') THEN
        ALTER TABLE promotions ADD COLUMN discount_type TEXT NOT NULL DEFAULT 'percentage';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'discount_value') THEN
        ALTER TABLE promotions ADD COLUMN discount_value NUMERIC NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'start_date') THEN
        ALTER TABLE promotions ADD COLUMN start_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'end_date') THEN
        ALTER TABLE promotions ADD COLUMN end_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'is_active') THEN
        ALTER TABLE promotions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'is_featured') THEN
        ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'image_url') THEN
        ALTER TABLE promotions ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'min_order_amount') THEN
        ALTER TABLE promotions ADD COLUMN min_order_amount NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'max_uses') THEN
        ALTER TABLE promotions ADD COLUMN max_uses NUMERIC DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'usage_count') THEN
        ALTER TABLE promotions ADD COLUMN usage_count NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Étape 4 : Corriger les contraintes et valeurs par défaut
-- Mettre à jour les valeurs existantes
UPDATE promotions 
SET name = COALESCE(title, 'Sans nom'), 
    code = COALESCE(code, 'CODE' || LEFT(gen_random_uuid()::text, 8))
WHERE name IS NULL OR code IS NULL;

-- Étape 5 : Structure finale compatible
-- Créer une structure complète si la table n'existe pas
CREATE TABLE IF NOT EXISTS promotions (
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

-- Étape 6 : Index pour les performances
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_featured ON promotions(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- Étape 7 : Vérification finale
SELECT 
    COUNT(*) as total_promotions,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_promotions,
    COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as promotions_with_image
FROM promotions;
