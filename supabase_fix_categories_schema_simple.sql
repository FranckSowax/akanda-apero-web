-- Script simple pour corriger rapidement le schéma categories
-- Alternative plus directe si le script principal ne fonctionne pas

-- 1. Ajouter les colonnes manquantes
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📦';

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- 2. Supprimer la contrainte NOT NULL sur icon (si elle existe)
-- Cette approche est plus directe
ALTER TABLE categories 
ALTER COLUMN icon DROP NOT NULL;

-- 3. Ajouter une valeur par défaut à icon
ALTER TABLE categories 
ALTER COLUMN icon SET DEFAULT '📦';

-- 4. Mettre à jour les valeurs NULL existantes
UPDATE categories SET icon = '📦' WHERE icon IS NULL;

-- 5. Synchroniser emoji et icon (utiliser emoji comme source de vérité)
UPDATE categories SET icon = emoji WHERE emoji IS NOT NULL;

-- 6. Vérification finale
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name IN ('emoji', 'image_url', 'icon')
ORDER BY column_name;

-- 7. Afficher les données
SELECT id, name, emoji, icon, slug, is_active 
FROM categories 
ORDER BY sort_order, name;
