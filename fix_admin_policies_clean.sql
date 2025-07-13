-- Script pour corriger les politiques admin_profiles (version nettoyée)
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer TOUTES les politiques existantes (même celles avec des noms différents)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Récupérer toutes les politiques pour admin_profiles
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'admin_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_profiles', policy_record.policyname);
        RAISE NOTICE 'Politique supprimée: %', policy_record.policyname;
    END LOOP;
END $$;

-- 2. Désactiver RLS temporairement
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Nettoyer et recréer l'utilisateur admin
DELETE FROM admin_profiles WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid;

INSERT INTO admin_profiles (user_id, role, is_active, created_at, updated_at)
VALUES (
    '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid,
    'admin',
    true,
    NOW(),
    NOW()
);

-- 4. Réactiver RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques simples et sûres
CREATE POLICY "admin_read_all" ON admin_profiles
    FOR SELECT
    USING (true);

CREATE POLICY "admin_insert_auth" ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_update_auth" ON admin_profiles
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Vérifier le résultat
SELECT 
    'Utilisateur admin créé:' as status,
    user_id,
    role,
    is_active,
    created_at
FROM admin_profiles 
WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid;

-- 7. Test de la requête problématique
SELECT 
    'Test requête:' as status,
    role, 
    is_active
FROM admin_profiles
WHERE user_id = '038d0723-7dd1-417c-a4af-e3bd27b78fd0'::uuid
AND is_active = true;

-- 8. Lister toutes les politiques actuelles
SELECT 
    'Politiques actuelles:' as status,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_profiles';
