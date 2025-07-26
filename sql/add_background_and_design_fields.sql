-- AJOUT : Champs pour choix background et harmonisation design
-- Ce script ajoute les champs background_color et design_style pour personnaliser l'apparence

-- Étape 1 : Ajouter les colonnes de personnalisation
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT 'from-red-400 to-orange-400',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'text-white',
ADD COLUMN IF NOT EXISTS design_style TEXT DEFAULT 'gradient',
ADD COLUMN IF NOT EXISTS card_height TEXT DEFAULT 'h-96',
ADD COLUMN IF NOT EXISTS layout_style TEXT DEFAULT 'compact';

-- Étape 2 : Mettre à jour les promotions existantes avec des styles par défaut harmonisés
UPDATE promotions 
SET background_color = 'from-red-400 to-orange-400',
    text_color = 'text-white',
    design_style = 'gradient',
    card_height = 'h-96',
    layout_style = 'compact'
WHERE background_color IS NULL;

-- Étape 3 : Ajouter des styles alternatifs
UPDATE promotions 
SET background_color = 'from-purple-400 to-pink-400',
    text_color = 'text-white'
WHERE title LIKE '%cocktail%' OR title LIKE '%cocktails%';

UPDATE promotions 
SET background_color = 'from-green-400 to-blue-400',
    text_color = 'text-white'
WHERE title LIKE '%apéro%' OR title LIKE '%apéro%';

-- Étape 4 : Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- Étape 5 : Vérifier les données avec styles
SELECT id, title, background_color, text_color, design_style, card_height, layout_style
FROM promotions 
ORDER BY created_at DESC;
