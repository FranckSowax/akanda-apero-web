-- Migration pour ajouter les colonnes manquantes aux tables cocktails_maison et mocktails
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter les colonnes manquantes à la table cocktails_maison
ALTER TABLE cocktails_maison 
ADD COLUMN IF NOT EXISTS recipe TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'link';

-- Ajouter les colonnes manquantes à la table mocktails
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS recipe TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'link';

-- Optionnel : Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN cocktails_maison.recipe IS 'Recette et instructions de préparation du cocktail';
COMMENT ON COLUMN cocktails_maison.video_url IS 'URL de la vidéo de préparation (YouTube, Vimeo ou upload)';
COMMENT ON COLUMN cocktails_maison.video_type IS 'Type de vidéo: link (URL externe) ou upload (fichier uploadé)';

COMMENT ON COLUMN mocktails.recipe IS 'Recette et instructions de préparation du mocktail';
COMMENT ON COLUMN mocktails.video_url IS 'URL de la vidéo de préparation (YouTube, Vimeo ou upload)';
COMMENT ON COLUMN mocktails.video_type IS 'Type de vidéo: link (URL externe) ou upload (fichier uploadé)';

-- Vérifier que les colonnes ont été ajoutées
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('cocktails_maison', 'mocktails') 
AND column_name IN ('recipe', 'video_url', 'video_type')
ORDER BY table_name, column_name;
