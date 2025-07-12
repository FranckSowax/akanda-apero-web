-- Script simplifié pour créer le premier administrateur Akanda Apéro
-- PRÉREQUIS: Avoir exécuté supabase_complete_setup.sql OU supabase_fix_admin_table.sql

-- 1. Vérifier que la table admin_profiles existe et a la bonne structure
SELECT 
  'Structure de la table admin_profiles:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier l'utilisateur admin@akanda-apero.com
SELECT 
  'Utilisateur admin trouvé:' as info,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@akanda-apero.com'
ORDER BY created_at DESC 
LIMIT 1;

-- 3. Créer le profil admin (avec gestion des conflits)
INSERT INTO admin_profiles (
  user_id, 
  role, 
  is_active,
  can_manage_products,
  can_manage_orders,
  can_manage_users,
  can_view_analytics,
  can_manage_deliveries,
  created_by,
  notes
) VALUES (
  '9216d774-4b9f-4cfc-a912-07570726700b',
  'super_admin',
  true,
  true,
  true,
  true,
  true,
  true,
  '9216d774-4b9f-4cfc-a912-07570726700b',
  'Premier super administrateur - Compte principal Akanda Apéro'
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  can_manage_products = EXCLUDED.can_manage_products,
  can_manage_orders = EXCLUDED.can_manage_orders,
  can_manage_users = EXCLUDED.can_manage_users,
  can_view_analytics = EXCLUDED.can_view_analytics,
  can_manage_deliveries = EXCLUDED.can_manage_deliveries,
  updated_at = NOW(),
  notes = EXCLUDED.notes;

-- 4. Vérification que le profil admin a été créé correctement
SELECT 
  'Profil admin créé avec succès:' as status,
  ap.role,
  ap.is_active,
  ap.created_at,
  u.email,
  ap.can_manage_products,
  ap.can_manage_orders,
  ap.can_manage_users,
  ap.can_view_analytics,
  ap.can_manage_deliveries
FROM admin_profiles ap
JOIN auth.users u ON ap.user_id = u.id
WHERE u.email = 'admin@akanda-apero.com';

-- 5. Test des fonctions de vérification des rôles
SELECT 
  'Test des fonctions admin:' as info,
  check_user_admin_role('9216d774-4b9f-4cfc-a912-07570726700b') as is_admin,
  get_user_admin_role('9216d774-4b9f-4cfc-a912-07570726700b') as admin_role;

-- 6. Instructions de connexion
SELECT 
  '🎉 CONFIGURATION TERMINÉE 🎉' as titre,
  'Email: admin@akanda-apero.com' as email,
  'Mot de passe: AkandaAdmin2024!' as password,
  'URL: http://localhost:3003/auth' as url,
  'Redirection automatique vers: /admin/dashboard' as redirection;
