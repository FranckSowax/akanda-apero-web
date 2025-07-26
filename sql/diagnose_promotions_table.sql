-- Script de diagnostic pour comprendre le schéma actuel de la table promotions
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si la table promotions existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'promotions';

-- 2. Voir toutes les colonnes de la table promotions
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'promotions' 
ORDER BY ordinal_position;

-- 3. Voir les contraintes existantes
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'promotions';

-- 4. Voir les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'promotions';

-- 5. Voir les données existantes (structure)
SELECT * FROM promotions LIMIT 5;

-- 6. Compter les lignes
SELECT COUNT(*) as total_rows FROM promotions;

-- 7. Voir les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'promotions';

-- 8. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'promotions';
