-- Script de migration PERSONNALISÉ pour votre table promotions existante
-- Préserve vos données : "Bienvenue Akanda", "Happy Hour", etc.
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes manquantes pour le système dynamique

-- Ajouter title (utilise 'name' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'title'
    ) THEN
        ALTER TABLE promotions ADD COLUMN title VARCHAR(255);
        -- Copier les données de 'name' vers 'title'
        UPDATE promotions SET title = name;
        -- Rendre title NOT NULL
        ALTER TABLE promotions ALTER COLUMN title SET NOT NULL;
    END IF;
END $$;

-- Ajouter is_active (utilise 'status' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE promotions ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Copier les données de 'status' vers 'is_active'
        UPDATE promotions SET is_active = (status = 'active');
    END IF;
END $$;

-- Ajouter is_featured (nouvelles promotions mises en avant)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN DEFAULT false;
        -- Marquer "Bienvenue Akanda" et "Happy Hour" comme mises en avant
        UPDATE promotions SET is_featured = true 
        WHERE name IN ('Bienvenue Akanda', 'Happy Hour');
    END IF;
END $$;

-- Ajouter image_url pour les images des promotions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE promotions ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Ajouter background_color pour personnaliser l'affichage
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'background_color'
    ) THEN
        ALTER TABLE promotions ADD COLUMN background_color VARCHAR(7) DEFAULT '#ef4444';
        -- Personnaliser les couleurs selon le type de promotion
        UPDATE promotions SET background_color = '#22c55e' WHERE name = 'Livraison Gratuite';
        UPDATE promotions SET background_color = '#8b5cf6' WHERE name = 'Weekend Special';
        UPDATE promotions SET background_color = '#ec4899' WHERE name = 'Fête des Mères';
    END IF;
END $$;

-- Ajouter text_color
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'text_color'
    ) THEN
        ALTER TABLE promotions ADD COLUMN text_color VARCHAR(7) DEFAULT '#ffffff';
    END IF;
END $$;

-- Ajouter discount_percentage (mapping intelligent de value + type)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_percentage'
    ) THEN
        ALTER TABLE promotions ADD COLUMN discount_percentage INTEGER;
        -- Copier les données de 'value' vers 'discount_percentage' si type = 'percentage'
        UPDATE promotions 
        SET discount_percentage = value::INTEGER 
        WHERE type = 'percentage' AND value <= 100;
    END IF;
END $$;

-- Ajouter discount_amount (mapping intelligent de value + type)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE promotions ADD COLUMN discount_amount DECIMAL(10,2);
        -- Copier les données de 'value' vers 'discount_amount' si type = 'fixed_amount'
        UPDATE promotions 
        SET discount_amount = value 
        WHERE type = 'fixed_amount';
    END IF;
END $$;

-- Ajouter promo_code (utilise 'code' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'promo_code'
    ) THEN
        ALTER TABLE promotions ADD COLUMN promo_code VARCHAR(50);
        -- Copier les données de 'code' vers 'promo_code'
        UPDATE promotions SET promo_code = code;
    END IF;
END $$;

-- Ajouter max_uses (utilise 'usage_limit' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'max_uses'
    ) THEN
        ALTER TABLE promotions ADD COLUMN max_uses INTEGER;
        -- Copier les données de 'usage_limit' vers 'max_uses'
        UPDATE promotions SET max_uses = usage_limit;
    END IF;
END $$;

-- Ajouter current_uses (utilise 'usage_count' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'current_uses'
    ) THEN
        ALTER TABLE promotions ADD COLUMN current_uses INTEGER DEFAULT 0;
        -- Copier les données de 'usage_count' vers 'current_uses'
        UPDATE promotions SET current_uses = COALESCE(usage_count, 0);
    END IF;
END $$;

-- Ajouter min_order_amount (utilise 'min_purchase' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'min_order_amount'
    ) THEN
        ALTER TABLE promotions ADD COLUMN min_order_amount DECIMAL(10,2);
        -- Copier les données de 'min_purchase' vers 'min_order_amount'
        UPDATE promotions SET min_order_amount = min_purchase;
    END IF;
END $$;

-- Ajouter sort_order pour l'ordre d'affichage
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE promotions ADD COLUMN sort_order INTEGER DEFAULT 0;
        -- Définir un ordre logique pour vos promotions existantes
        UPDATE promotions SET sort_order = 1 WHERE name = 'Bienvenue Akanda';
        UPDATE promotions SET sort_order = 2 WHERE name = 'Happy Hour';
        UPDATE promotions SET sort_order = 3 WHERE name = 'Livraison Gratuite';
        UPDATE promotions SET sort_order = 4 WHERE name = 'Weekend Special';
        UPDATE promotions SET sort_order = 5 WHERE name = 'Fête des Mères';
    END IF;
END $$;

-- Ajouter category_id pour lier aux catégories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE promotions ADD COLUMN category_id UUID;
    END IF;
END $$;

-- Ajouter product_ids (utilise 'applicable_products' existant comme source)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'product_ids'
    ) THEN
        ALTER TABLE promotions ADD COLUMN product_ids UUID[] DEFAULT '{}';
        -- Copier les données de 'applicable_products' vers 'product_ids' avec cast
        -- Seulement si applicable_products contient des UUIDs valides
        UPDATE promotions 
        SET product_ids = (
            SELECT ARRAY(
                SELECT uuid_val::UUID 
                FROM unnest(COALESCE(applicable_products, '{}')) AS uuid_val
                WHERE uuid_val ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            )
        )
        WHERE applicable_products IS NOT NULL AND array_length(applicable_products, 1) > 0;
    END IF;
END $$;

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_is_featured ON promotions(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category_id);
CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions(sort_order);
CREATE INDEX IF NOT EXISTS idx_promotions_promo_code ON promotions(promo_code);

-- 3. Créer le trigger pour updated_at (s'il n'existe pas déjà)
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_promotions_updated_at ON promotions;
CREATE TRIGGER trigger_update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- 4. Mettre à jour les politiques RLS pour le nouveau système
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Promotions publiques en lecture" ON promotions;
    DROP POLICY IF EXISTS "Promotions admin en écriture" ON promotions;
    
    -- Créer les nouvelles politiques adaptées à votre schéma
    CREATE POLICY "Promotions publiques en lecture" ON promotions
        FOR SELECT USING (
            COALESCE(is_active, status = 'active') = true 
            AND start_date <= NOW() 
            AND end_date >= NOW()
        );
    
    CREATE POLICY "Promotions admin en écriture" ON promotions
        FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création des politiques RLS: %', SQLERRM;
END $$;

-- 5. Vérifier le résultat final
SELECT 
  id,
  name,
  title,
  code,
  promo_code,
  type,
  value,
  discount_percentage,
  discount_amount,
  status,
  is_active,
  is_featured,
  start_date,
  end_date,
  background_color,
  sort_order
FROM promotions 
ORDER BY sort_order, created_at;

-- 6. Message de succès
SELECT 'Migration personnalisée terminée avec succès! Vos ' || COUNT(*) || ' promotions existantes ont été préservées et enrichies.' as status
FROM promotions;
