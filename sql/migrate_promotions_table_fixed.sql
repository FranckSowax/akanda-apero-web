-- Script de migration CORRIGÉ pour la table promotions existante
-- À exécuter dans Supabase SQL Editor

-- 1. D'abord, vérifions le schéma actuel de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes une par une (avec IF NOT EXISTS pour éviter les erreurs)

-- Ajouter is_active si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE promotions ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ajouter is_featured si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Ajouter image_url si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE promotions ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Ajouter background_color si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'background_color'
    ) THEN
        ALTER TABLE promotions ADD COLUMN background_color VARCHAR(7) DEFAULT '#ef4444';
    END IF;
END $$;

-- Ajouter text_color si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'text_color'
    ) THEN
        ALTER TABLE promotions ADD COLUMN text_color VARCHAR(7) DEFAULT '#ffffff';
    END IF;
END $$;

-- Ajouter start_date si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE promotions ADD COLUMN start_date TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ajouter end_date si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE promotions ADD COLUMN end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');
    END IF;
END $$;

-- Ajouter category_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE promotions ADD COLUMN category_id UUID;
        -- Note: On évite la contrainte de clé étrangère pour l'instant
    END IF;
END $$;

-- Ajouter product_ids si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'product_ids'
    ) THEN
        ALTER TABLE promotions ADD COLUMN product_ids UUID[] DEFAULT '{}';
    END IF;
END $$;

-- Ajouter promo_code si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'promo_code'
    ) THEN
        ALTER TABLE promotions ADD COLUMN promo_code VARCHAR(50);
        -- Note: On évite UNIQUE pour l'instant à cause des données existantes
    END IF;
END $$;

-- Ajouter max_uses si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'max_uses'
    ) THEN
        ALTER TABLE promotions ADD COLUMN max_uses INTEGER;
    END IF;
END $$;

-- Ajouter current_uses si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'current_uses'
    ) THEN
        ALTER TABLE promotions ADD COLUMN current_uses INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter min_order_amount si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'min_order_amount'
    ) THEN
        ALTER TABLE promotions ADD COLUMN min_order_amount DECIMAL(10,2);
    END IF;
END $$;

-- Ajouter sort_order si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE promotions ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter discount_percentage si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_percentage'
    ) THEN
        ALTER TABLE promotions ADD COLUMN discount_percentage INTEGER;
    END IF;
END $$;

-- Ajouter discount_amount si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE promotions ADD COLUMN discount_amount DECIMAL(10,2);
    END IF;
END $$;

-- Ajouter created_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE promotions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ajouter updated_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE promotions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. CORRIGER LES DONNÉES EXISTANTES AVANT D'AJOUTER LES CONTRAINTES

-- Mettre à jour les lignes qui n'ont ni discount_percentage ni discount_amount
UPDATE promotions 
SET discount_percentage = 10 
WHERE discount_percentage IS NULL AND discount_amount IS NULL;

-- Mettre à jour les lignes qui ont les deux (garder seulement discount_percentage)
UPDATE promotions 
SET discount_amount = NULL 
WHERE discount_percentage IS NOT NULL AND discount_amount IS NOT NULL;

-- 4. Créer les index manquants (avec IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_featured ON promotions(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category_id);
CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions(sort_order);

-- 5. Créer les contraintes APRÈS avoir corrigé les données
DO $$ 
BEGIN
    -- Contrainte pour les dates (seulement si les deux colonnes existent)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'start_date'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'end_date'
    ) THEN
        -- Supprimer l'ancienne contrainte si elle existe
        ALTER TABLE promotions DROP CONSTRAINT IF EXISTS valid_dates;
        -- Ajouter la nouvelle contrainte
        ALTER TABLE promotions ADD CONSTRAINT valid_dates CHECK (end_date > start_date);
    END IF;
    
    -- Contrainte pour les réductions (maintenant que les données sont corrigées)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_percentage'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'discount_amount'
    ) THEN
        -- Supprimer l'ancienne contrainte si elle existe
        ALTER TABLE promotions DROP CONSTRAINT IF EXISTS valid_discount;
        -- Ajouter la nouvelle contrainte
        ALTER TABLE promotions ADD CONSTRAINT valid_discount CHECK (
            (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR 
            (discount_percentage IS NULL AND discount_amount IS NOT NULL)
        );
    END IF;
END $$;

-- 6. Créer le trigger pour updated_at
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

-- 7. Activer RLS si ce n'est pas déjà fait
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- 8. Créer les politiques RLS (avec gestion des erreurs)
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Promotions publiques en lecture" ON promotions;
    DROP POLICY IF EXISTS "Promotions admin en écriture" ON promotions;
    
    -- Créer les nouvelles politiques
    CREATE POLICY "Promotions publiques en lecture" ON promotions
        FOR SELECT USING (
            COALESCE(is_active, true) = true 
            AND COALESCE(start_date, NOW()) <= NOW() 
            AND COALESCE(end_date, NOW() + INTERVAL '1 year') >= NOW()
        );
    
    CREATE POLICY "Promotions admin en écriture" ON promotions
        FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création des politiques RLS: %', SQLERRM;
END $$;

-- 9. Insérer une promotion d'exemple si aucune promotion active n'existe
INSERT INTO promotions (
  title,
  description,
  discount_percentage,
  image_url,
  background_color,
  text_color,
  start_date,
  end_date,
  is_active,
  is_featured,
  promo_code,
  max_uses,
  current_uses,
  sort_order
) 
SELECT 
  'Cocktails Premium',
  'Réduction exceptionnelle sur tous les cocktails premium',
  30,
  'https://i.imgur.com/ITqFZGC.jpg',
  '#ef4444',
  '#ffffff',
  NOW(),
  NOW() + INTERVAL '7 days',
  true,
  true,
  'COCKTAIL30',
  100,
  0,
  0
WHERE NOT EXISTS (
    SELECT 1 FROM promotions 
    WHERE COALESCE(is_active, false) = true 
    LIMIT 1
);

-- 10. Vérifier le schéma final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- 11. Afficher les données
SELECT 
  id,
  title,
  COALESCE(discount_percentage, 0) as discount_percentage,
  COALESCE(discount_amount, 0) as discount_amount,
  COALESCE(start_date, NOW()) as start_date,
  COALESCE(end_date, NOW() + INTERVAL '7 days') as end_date,
  COALESCE(is_active, true) as is_active,
  COALESCE(is_featured, false) as is_featured,
  promo_code
FROM promotions 
ORDER BY COALESCE(sort_order, 0), COALESCE(created_at, NOW()) DESC;

-- 12. Message de succès
SELECT 'Migration terminée avec succès!' as status;
