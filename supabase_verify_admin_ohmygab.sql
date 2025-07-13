-- Script de vérification rapide pour ohmygab.marketplace@gmail.com
-- Exécutez ce script pour vérifier que tout est bien configuré

-- 1. Vérifier l'utilisateur
SELECT 
  '=== UTILISATEUR ===' as section,
  id as user_id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
    ELSE '❌ Email non confirmé'
  END as status
FROM auth.users 
WHERE email = 'ohmygab.marketplace@gmail.com';

-- 2. Vérifier le profil admin
SELECT 
  '=== PROFIL ADMIN ===' as section,
  ap.id as profile_id,
  ap.user_id,
  ap.role,
  ap.is_active,
  ap.created_at,
  u.email,
  CASE 
    WHEN ap.role IS NOT NULL AND ap.is_active = true THEN '✅ Profil admin actif'
    WHEN ap.role IS NOT NULL AND ap.is_active = false THEN '⚠️ Profil admin inactif'
    ELSE '❌ Pas de profil admin'
  END as status
FROM auth.users u
LEFT JOIN admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'ohmygab.marketplace@gmail.com';

-- 3. Test de la fonction de vérification de rôle
SELECT 
  '=== TEST FONCTION ===' as section,
  check_user_admin_role(
    (SELECT id FROM auth.users WHERE email = 'ohmygab.marketplace@gmail.com')
  ) as role_detected;

-- 4. Diagnostic complet
SELECT 
  '=== DIAGNOSTIC ===' as section,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ohmygab.marketplace@gmail.com')
    THEN '❌ Utilisateur inexistant'
    
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'ohmygab.marketplace@gmail.com' AND email_confirmed_at IS NULL)
    THEN '⚠️ Email non confirmé'
    
    WHEN NOT EXISTS (
      SELECT 1 FROM auth.users u 
      JOIN admin_profiles ap ON u.id = ap.user_id 
      WHERE u.email = 'ohmygab.marketplace@gmail.com'
    )
    THEN '❌ Profil admin manquant - Exécutez supabase_setup_admin_simple.sql'
    
    WHEN EXISTS (
      SELECT 1 FROM auth.users u 
      JOIN admin_profiles ap ON u.id = ap.user_id 
      WHERE u.email = 'ohmygab.marketplace@gmail.com' 
      AND ap.is_active = false
    )
    THEN '⚠️ Profil admin inactif'
    
    WHEN EXISTS (
      SELECT 1 FROM auth.users u 
      JOIN admin_profiles ap ON u.id = ap.user_id 
      WHERE u.email = 'ohmygab.marketplace@gmail.com' 
      AND ap.is_active = true 
      AND ap.role IN ('super_admin', 'admin')
    )
    THEN '✅ Configuration parfaite - Redirection admin devrait fonctionner'
    
    ELSE '❓ État inconnu'
  END as diagnostic;

-- 5. Si le profil admin manque, le créer automatiquement
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur confirmé
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'ohmygab.marketplace@gmail.com'
    AND email_confirmed_at IS NOT NULL;
    
    -- Si l'utilisateur existe mais n'a pas de profil admin, le créer
    IF admin_user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM admin_profiles WHERE user_id = admin_user_id
    ) THEN
        INSERT INTO admin_profiles (user_id, role, is_active)
        VALUES (admin_user_id, 'super_admin', true);
        
        RAISE NOTICE '✅ Profil admin créé automatiquement pour ohmygab.marketplace@gmail.com';
    END IF;
END $$;

-- 6. Vérification finale après création automatique
SELECT 
  '=== VÉRIFICATION FINALE ===' as section,
  u.email,
  ap.role,
  ap.is_active,
  CASE 
    WHEN ap.role IN ('super_admin', 'admin') AND ap.is_active = true 
    THEN '✅ Prêt pour la redirection admin'
    ELSE '❌ Problème de configuration'
  END as status_final
FROM auth.users u
JOIN admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'ohmygab.marketplace@gmail.com';
