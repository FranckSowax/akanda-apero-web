-- Script de finalisation pour l'admin des promotions
-- Ce script enrichit la table promotions existante avec les colonnes nécessaires
-- et effectue le mapping des données existantes

-- Étape 1: Ajouter les nouvelles colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Ajouter title si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='title') THEN
        ALTER TABLE promotions ADD COLUMN title TEXT;
    END IF;
    
    -- Ajouter image_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='image_url') THEN
        ALTER TABLE promotions ADD COLUMN image_url TEXT;
    END IF;
    
    -- Ajouter is_active si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_active') THEN
        ALTER TABLE promotions ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ajouter is_featured si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_featured') THEN
        ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajouter product_ids si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='product_ids') THEN
        ALTER TABLE promotions ADD COLUMN product_ids UUID[];
    END IF;
    
    -- Ajouter type si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='type') THEN
        ALTER TABLE promotions ADD COLUMN type TEXT DEFAULT 'percentage';
    END IF;
    
    -- Ajouter value si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='value') THEN
        ALTER TABLE promotions ADD COLUMN value NUMERIC DEFAULT 0;
    END IF;
    
    -- Ajouter status si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='status') THEN
        ALTER TABLE promotions ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Ajouter usage_limit si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='usage_limit') THEN
        ALTER TABLE promotions ADD COLUMN usage_limit INTEGER;
    END IF;
    
    -- Ajouter usage_count si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='usage_count') THEN
        ALTER TABLE promotions ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Ajouter min_purchase si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='min_purchase') THEN
        ALTER TABLE promotions ADD COLUMN min_purchase NUMERIC;
    END IF;
    
    -- Ajouter max_discount si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='max_discount') THEN
        ALTER TABLE promotions ADD COLUMN max_discount NUMERIC;
    END IF;
    
    -- Ajouter is_stackable si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_stackable') THEN
        ALTER TABLE promotions ADD COLUMN is_stackable BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajouter is_first_order_only si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='is_first_order_only') THEN
        ALTER TABLE promotions ADD COLUMN is_first_order_only BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Étape 2: Mapper les données existantes vers les nouvelles colonnes
UPDATE promotions SET
    -- Mapper name vers title si title est vide
    title = COALESCE(title, name),
    
    -- Mapper discount_percentage vers value si value est 0 ou null
    value = CASE 
        WHEN value IS NULL OR value = 0 THEN COALESCE(discount_percentage, discount_amount, 0)
        ELSE value 
    END,
    
    -- Mapper type basé sur les colonnes existantes
    type = CASE 
        WHEN discount_percentage IS NOT NULL AND discount_percentage > 0 THEN 'percentage'
        WHEN discount_amount IS NOT NULL AND discount_amount > 0 THEN 'fixed_amount'
        ELSE COALESCE(type, 'percentage')
    END,
    
    -- Mapper status basé sur is_active ou autres colonnes
    status = CASE 
        WHEN status IS NOT NULL THEN status
        WHEN is_active = false THEN 'inactive'
        WHEN NOW() > end_date THEN 'expired'
        WHEN NOW() < start_date THEN 'scheduled'
        ELSE 'active'
    END,
    
    -- Mapper usage_limit depuis max_uses si disponible
    usage_limit = COALESCE(usage_limit, max_uses),
    
    -- Initialiser usage_count à 0 si null
    usage_count = COALESCE(usage_count, 0),
    
    -- Mapper min_purchase depuis min_order_amount si disponible
    min_purchase = COALESCE(min_purchase, min_order_amount),
    
    -- Mapper product_ids depuis applicable_products si disponible
    product_ids = CASE 
        WHEN product_ids IS NULL AND applicable_products IS NOT NULL THEN
            -- Convertir text[] vers uuid[] avec validation
            ARRAY(
                SELECT uuid_val::uuid 
                FROM unnest(applicable_products) AS uuid_val 
                WHERE uuid_val ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            )
        ELSE product_ids
    END,
    
    -- S'assurer que is_active est défini
    is_active = COALESCE(is_active, (status = 'active'))
WHERE 
    -- Seulement mettre à jour les lignes qui ont besoin de mapping
    title IS NULL OR 
    value IS NULL OR value = 0 OR 
    type IS NULL OR 
    status IS NULL OR 
    usage_count IS NULL;

-- Étape 3: Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;

-- Étape 4: Afficher un résumé des promotions après migration
SELECT 
    'Migration terminée' as message,
    COUNT(*) as total_promotions,
    COUNT(*) FILTER (WHERE status = 'active') as active_promotions,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_promotions,
    COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') as promotions_with_image
FROM promotions;

-- Afficher quelques exemples de promotions migrées
SELECT 
    id,
    COALESCE(title, name) as nom,
    COALESCE(code, promo_code) as code_promo,
    type,
    value,
    status,
    is_active,
    start_date,
    end_date,
    CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 'Oui' ELSE 'Non' END as has_image
FROM promotions 
ORDER BY created_at DESC 
LIMIT 10;
