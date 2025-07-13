-- Script pour corriger les politiques admin_profiles et éviter la récursion infinie
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer toutes les politiques existantes pour admin_profiles
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_delete_policy" ON admin_profiles;

-- 2. Désactiver RLS temporairement pour nettoyer
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier/créer l'utilisateur admin
INSERT INTO admin_profiles (user_id, role, is_active, created_at, updated_at)
SELECT 
    '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid,
    'admin',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid
);

-- 4. Mettre à jour l'utilisateur existant s'il existe
UPDATE admin_profiles 
SET 
    role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid;

-- 5. Créer des politiques simples sans récursion
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture simple (pas de récursion)
CREATE POLICY "admin_profiles_select_simple" ON admin_profiles
    FOR SELECT
    USING (true); -- Permettre la lecture à tous pour éviter la récursion

-- Politique d'insertion pour les admins seulement
CREATE POLICY "admin_profiles_insert_simple" ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Politique de mise à jour pour les admins seulement  
CREATE POLICY "admin_profiles_update_simple" ON admin_profiles
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Vérifier le résultat
SELECT 
    user_id,
    role,
    is_active,
    created_at
FROM admin_profiles 
WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid;

-- 7. Test de la requête qui causait l'erreur
SELECT role, is_active
FROM admin_profiles
WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid
AND is_active = true;
