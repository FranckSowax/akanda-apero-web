-- Script pour ajouter la colonne WhatsApp à la table profiles
-- Exécutez ce script dans Supabase SQL Editor

-- Vérifier si la colonne whatsapp existe déjà
DO $$
BEGIN
    -- Ajouter la colonne whatsapp si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'whatsapp'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN whatsapp TEXT;
        
        RAISE NOTICE '✅ Colonne whatsapp ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'ℹ️ La colonne whatsapp existe déjà dans la table profiles';
    END IF;
END $$;

-- Vérifier la structure de la table profiles
SELECT 
    '=== STRUCTURE TABLE PROFILES ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Exemple de mise à jour pour copier le numéro de téléphone vers WhatsApp si vide
-- (Optionnel - décommentez si vous voulez copier automatiquement)
/*
UPDATE public.profiles 
SET whatsapp = phone 
WHERE whatsapp IS NULL 
AND phone IS NOT NULL 
AND phone != '';
*/

-- Vérification finale
SELECT 
    '=== VÉRIFICATION ===' as section,
    COUNT(*) as total_profiles,
    COUNT(whatsapp) as profiles_with_whatsapp,
    COUNT(phone) as profiles_with_phone
FROM public.profiles;
