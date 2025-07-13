-- Script de vérification pour ohmygab.marketplace@gmail.com
-- Exécutez ce script pour diagnostiquer l'état du compte admin

-- 1. Vérifier si l'utilisateur existe
SELECT 
  'Vérification utilisateur:' as info,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
    ELSE '❌ Email non confirmé - Vérifiez votre boîte mail'
  END as status_email
FROM auth.users 
WHERE email = 'ohmygab.marketplace@gmail.com'
ORDER BY created_at DESC;

-- 2. Vérifier si un profil admin existe
SELECT 
  'Profil admin existant:' as info,
  ap.*,
  u.email,
  u.email_confirmed_at
FROM admin_profiles ap
JOIN auth.users u ON ap.user_id = u.id
WHERE u.email = 'ohmygab.marketplace@gmail.com';

-- 3. Instructions selon le résultat
SELECT 
  'PROCHAINE ÉTAPE:' as titre,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users u
      JOIN admin_profiles ap ON u.id = ap.user_id
      WHERE u.email = 'ohmygab.marketplace@gmail.com' 
      AND u.email_confirmed_at IS NOT NULL
      AND ap.role = 'super_admin'
      AND ap.is_active = true
    ) 
    THEN '✅ Tout est configuré - Vous pouvez vous connecter'
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE email = 'ohmygab.marketplace@gmail.com' 
      AND email_confirmed_at IS NOT NULL
    ) 
    THEN '⚠️ Utilisateur confirmé mais pas de profil admin - Exécutez supabase_setup_admin_ohmygab.sql'
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE email = 'ohmygab.marketplace@gmail.com' 
      AND email_confirmed_at IS NULL
    )
    THEN '⚠️ Utilisateur existe mais email non confirmé - Vérifiez votre boîte mail'
    ELSE '❌ Compte inexistant - Créez le compte via http://localhost:3003/auth'
  END as action_requise;
