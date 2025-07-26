-- Script de correction pour l'admin des promotions
-- Ce script ajoute les colonnes exactes attendues par l'admin

-- Ajouter les colonnes manquantes pour l'admin des promotions
DO $$ 
BEGIN
    -- Ajouter discount_type si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='discount_type') THEN
        ALTER TABLE promotions ADD COLUMN discount_type TEXT DEFAULT 'percentage';
        RAISE NOTICE 'Colonne discount_type ajoutée';
    ELSE
        RAISE NOTICE 'Colonne discount_type existe déjà';
    END IF;
    
    -- Ajouter discount_value si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='discount_value') THEN
        ALTER TABLE promotions ADD COLUMN discount_value NUMERIC DEFAULT 0;
        RAISE NOTICE 'Colonne discount_value ajoutée';
    ELSE
        RAISE NOTICE 'Colonne discount_value existe déjà';
    END IF;
    
    -- Ajouter title si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='title') THEN
        ALTER TABLE promotions ADD COLUMN title TEXT;
        RAISE NOTICE 'Colonne title ajoutée';
    ELSE
        RAISE NOTICE 'Colonne title existe déjà';
    END IF;
    
    -- Ajouter description si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='description') THEN
        ALTER TABLE promotions ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée';
    ELSE
        RAISE NOTICE 'Colonne description existe déjà';
    END IF;
    
    -- Ajouter code si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='code') THEN
        ALTER TABLE promotions ADD COLUMN code TEXT;
        RAISE NOTICE 'Colonne code ajoutée';
    ELSE
        RAISE NOTICE 'Colonne code existe déjà';
    END IF;
    
    -- Ajouter start_date si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='start_date') THEN
        ALTER TABLE promotions ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne start_date ajoutée';
    ELSE
        RAISE NOTICE 'Colonne start_date existe déjà';
    END IF;
    
    -- Ajouter end_date si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='end_date') THEN
        ALTER TABLE promotions ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne end_date ajoutée';
    ELSE
        RAISE NOTICE 'Colonne end_date existe déjà';
    END IF;
    
    -- Ajouter is_active si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_active') THEN
        ALTER TABLE promotions ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne is_active ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_active existe déjà';
    END IF;
    
    -- Ajouter is_featured si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_featured') THEN
        ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne is_featured ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_featured existe déjà';
    END IF;
    
    -- Ajouter image_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='image_url') THEN
        ALTER TABLE promotions ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà';
    END IF;
    
    -- Ajouter min_order_amount si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='min_order_amount') THEN
        ALTER TABLE promotions ADD COLUMN min_order_amount NUMERIC DEFAULT 0;
        RAISE NOTICE 'Colonne min_order_amount ajoutée';
    ELSE
        RAISE NOTICE 'Colonne min_order_amount existe déjà';
    END IF;
    
    -- Ajouter max_uses si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='max_uses') THEN
        ALTER TABLE promotions ADD COLUMN max_uses INTEGER;
        RAISE NOTICE 'Colonne max_uses ajoutée';
    ELSE
        RAISE NOTICE 'Colonne max_uses existe déjà';
    END IF;
    
    -- Ajouter usage_count si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='usage_count') THEN
        ALTER TABLE promotions ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Colonne usage_count ajoutée';
    ELSE
        RAISE NOTICE 'Colonne usage_count existe déjà';
    END IF;
    
    -- Ajouter created_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='created_at') THEN
        ALTER TABLE promotions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne created_at existe déjà';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='updated_at') THEN
        ALTER TABLE promotions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà';
    END IF;
END $$;

-- Mapper les données existantes si nécessaire
UPDATE promotions SET
    title = COALESCE(title, name, 'Promotion sans nom'),
    description = COALESCE(description, 'Description de la promotion'),
    discount_type = COALESCE(discount_type, 'percentage'),
    discount_value = COALESCE(discount_value, 10),
    is_active = COALESCE(is_active, true),
    is_featured = COALESCE(is_featured, false),
    usage_count = COALESCE(usage_count, 0),
    start_date = COALESCE(start_date, NOW()),
    end_date = COALESCE(end_date, NOW() + INTERVAL '30 days')
WHERE title IS NULL OR discount_type IS NULL OR discount_value IS NULL;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_is_featured ON promotions(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);

-- Afficher le résumé
SELECT 
    'Migration terminée' as status,
    COUNT(*) as total_promotions,
    COUNT(CASE WHEN is_active = true THEN 1 END) as promotions_actives,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as promotions_mises_en_avant
FROM promotions;

-- Afficher les colonnes de la table pour vérification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;
