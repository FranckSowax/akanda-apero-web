-- Script pour corriger complètement le schéma de la table categories
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes manquantes à la table categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📦';

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- 2. Corriger la contrainte NOT NULL sur la colonne icon (si elle existe)
-- Supprimer la contrainte NOT NULL ou ajouter une valeur par défaut
DO $$
BEGIN
    -- Vérifier si la colonne icon existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
        -- Mettre à jour les valeurs NULL avec une valeur par défaut
        UPDATE categories SET icon = '📦' WHERE icon IS NULL;
        
        -- Ajouter une valeur par défaut à la colonne
        ALTER TABLE categories ALTER COLUMN icon SET DEFAULT '📦';
    END IF;
END $$;

-- 3. Mettre à jour les catégories existantes avec des emojis appropriés
UPDATE categories SET emoji = '🎁' WHERE name ILIKE '%formule%' OR name ILIKE '%pack%';
UPDATE categories SET emoji = '🍷' WHERE name ILIKE '%vin%' OR name ILIKE '%wine%';
UPDATE categories SET emoji = '🍺' WHERE name ILIKE '%bière%' OR name ILIKE '%beer%';
UPDATE categories SET emoji = '🥃' WHERE name ILIKE '%spiritueux%' OR name ILIKE '%whisky%' OR name ILIKE '%vodka%' OR name ILIKE '%rhum%';
UPDATE categories SET emoji = '🍸' WHERE name ILIKE '%cocktail%' OR name ILIKE '%mixologie%';
UPDATE categories SET emoji = '🥤' WHERE name ILIKE '%soft%' OR name ILIKE '%boisson%';
UPDATE categories SET emoji = '🍾' WHERE name ILIKE '%champagne%' OR name ILIKE '%mousseux%';
UPDATE categories SET emoji = '🧊' WHERE name ILIKE '%accessoire%' OR name ILIKE '%équipement%';
UPDATE categories SET emoji = '⭐' WHERE name ILIKE '%premium%' OR name ILIKE '%luxe%';

-- 4. Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name IN ('emoji', 'image_url')
ORDER BY column_name;

-- 5. Afficher les catégories avec leurs emojis
SELECT id, name, emoji, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') 
            THEN icon 
            ELSE NULL 
       END as icon,
       slug, is_active 
FROM categories 
ORDER BY sort_order, name;

-- Note: Après avoir exécuté ce script, vous pourrez créer et modifier des catégories 
-- avec des emojis et images dans l'interface admin sans erreur.
