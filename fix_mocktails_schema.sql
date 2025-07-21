-- Script SQL pour corriger le schéma de la table mocktails
-- Ajouter les colonnes manquantes pour la compatibilité avec l'admin

-- 1. Ajouter la colonne alcohol_percentage (pour les mocktails, elle sera toujours 0)
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS alcohol_percentage DECIMAL(5,2) DEFAULT 0.0;

-- 2. Ajouter la colonne category pour la cohérence avec les cocktails
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 3. Ajouter la colonne difficulty_level pour la cohérence
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1;

-- 4. Ajouter la colonne is_featured pour la cohérence
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 5. Ajouter les colonnes recipe, video_url et video_type (comme demandé dans le plan)
ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS recipe TEXT;

ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE mocktails 
ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) CHECK (video_type IN ('url', 'upload'));

-- 6. Mettre à jour les mocktails existants avec des valeurs par défaut
UPDATE mocktails 
SET 
  alcohol_percentage = 0.0,
  category = 'sans-alcool',
  difficulty_level = 1,
  is_featured = false
WHERE 
  alcohol_percentage IS NULL 
  OR category IS NULL 
  OR difficulty_level IS NULL 
  OR is_featured IS NULL;

-- 7. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN mocktails.alcohol_percentage IS 'Pourcentage d''alcool (toujours 0 pour les mocktails)';
COMMENT ON COLUMN mocktails.category IS 'Catégorie du mocktail (ex: sans-alcool, fruité, etc.)';
COMMENT ON COLUMN mocktails.difficulty_level IS 'Niveau de difficulté de préparation (1-5)';
COMMENT ON COLUMN mocktails.is_featured IS 'Indique si le mocktail est mis en avant';
COMMENT ON COLUMN mocktails.recipe IS 'Instructions détaillées de préparation';
COMMENT ON COLUMN mocktails.video_url IS 'URL de la vidéo de recette';
COMMENT ON COLUMN mocktails.video_type IS 'Type de vidéo (url ou upload)';

-- 8. Faire de même pour la table cocktails_maison si les colonnes manquent
ALTER TABLE cocktails_maison 
ADD COLUMN IF NOT EXISTS recipe TEXT;

ALTER TABLE cocktails_maison 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE cocktails_maison 
ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) CHECK (video_type IN ('url', 'upload'));

-- 9. Ajouter des commentaires pour les cocktails
COMMENT ON COLUMN cocktails_maison.recipe IS 'Instructions détaillées de préparation';
COMMENT ON COLUMN cocktails_maison.video_url IS 'URL de la vidéo de recette';
COMMENT ON COLUMN cocktails_maison.video_type IS 'Type de vidéo (url ou upload)';

-- 10. Vérifier que les politiques RLS permettent les mises à jour
-- (Les politiques existantes devraient déjà couvrir ces nouvelles colonnes)

SELECT 'Schema mocktails mis à jour avec succès!' as status;
