-- FIX : Ajout colonne sort_order manquante
-- Ce script corrige l'erreur "column promotions.sort_order does not exist"

-- Étape 1 : Ajouter la colonne sort_order
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Étape 2 : Mettre à jour les promotions existantes avec un ordre par défaut
UPDATE promotions 
SET sort_order = CASE 
    WHEN is_featured = true THEN 1 
    ELSE 2 
END;

-- Étape 3 : Créer un index pour optimiser les requêtes triées
CREATE INDEX IF NOT EXISTS idx_promotions_sort_order ON promotions(sort_order);

-- Étape 4 : Vérifier la structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- Étape 5 : Vérifier les données triées
SELECT id, title, is_featured, sort_order, created_at
FROM promotions 
ORDER BY sort_order ASC, created_at DESC;
