-- AJOUT : Champs horaires pour le compte à rebours
-- Ce script ajoute les champs start_time et end_time à la table promotions

-- Étape 1 : Ajouter les colonnes start_time et end_time
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '00:00:00',
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '23:59:59';

-- Étape 2 : Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- Étape 3 : Mettre à jour les promotions existantes avec des horaires par défaut
UPDATE promotions 
SET start_time = '00:00:00', 
    end_time = '23:59:59'
WHERE start_time IS NULL OR end_time IS NULL;
