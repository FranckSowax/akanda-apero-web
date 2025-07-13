-- Script pour vérifier l'existence du compte admin
-- Exécutez ce script dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier si l'utilisateur admin@akanda-apero.com existe
SELECT 
  'Vérification utilisateur admin:' as info,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
    ELSE '❌ Email non confirmé - Vérifiez votre boîte mail'
  END as status_email
FROM auth.users 
WHERE email = 'admin@akanda-apero.com'
ORDER BY created_at DESC;

-- 2. Si aucun résultat ci-dessus, l'utilisateur n'existe pas
-- Dans ce cas, vous devez d'abord créer le compte via l'interface d'inscription

-- 3. Vérifier si la table admin_profiles existe
SELECT 
  'Structure table admin_profiles:' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier si un profil admin existe déjà
SELECT 
  'Profils admin existants:' as info,
  ap.*,
  u.email,
  u.email_confirmed_at
FROM admin_profiles ap
JOIN auth.users u ON ap.user_id = u.id
WHERE u.email = 'admin@akanda-apero.com';

-- 5. Instructions selon le résultat
SELECT 
  'INSTRUCTIONS:' as titre,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@akanda-apero.com' AND email_confirmed_at IS NOT NULL) 
    THEN '✅ Utilisateur existe et confirmé - Exécutez supabase_complete_setup.sql'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@akanda-apero.com' AND email_confirmed_at IS NULL)
    THEN '⚠️ Utilisateur existe mais email non confirmé - Vérifiez votre boîte mail'
    ELSE '❌ Utilisateur inexistant - Créez le compte via /auth puis revenez ici'
  END as action_requise;
