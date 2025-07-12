-- Script pour créer le premier administrateur Akanda Apéro
-- IMPORTANT: Exécutez d'abord supabase_fix_admin_table.sql
-- Puis créez un compte utilisateur via l'interface d'inscription

-- 1. Vérifier que la table admin_profiles existe
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier l'ID de l'utilisateur créé
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@akanda-apero.com'
ORDER BY created_at DESC 
LIMIT 1;

-- 3. Créer le profil admin (l'ID utilisateur est déjà correct)
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
);

-- 3. Vérification que le profil admin a été créé correctement
SELECT 
  ap.*,
  u.email,
  u.created_at as user_created_at
FROM admin_profiles ap
JOIN auth.users u ON ap.user_id = u.id
WHERE u.email = 'admin@akanda-apero.com';

-- 4. Test de la fonction de vérification des rôles
SELECT check_user_admin_role('9216d774-4b9f-4cfc-a912-07570726700b') as is_admin;

-- 5. Vérification finale complète
SELECT 
  'Configuration admin terminée' as status,
  u.email,
  u.id as user_id,
  ap.role,
  ap.is_active,
  ap.can_manage_products,
  ap.can_manage_orders,
  ap.can_manage_users,
  ap.can_view_analytics,
  ap.can_manage_deliveries
FROM auth.users u
JOIN admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'admin@akanda-apero.com';

-- 6. Instructions de connexion
SELECT 
  'CONNEXION ADMIN' as titre,
  'Email: admin@akanda-apero.com' as email,
  'Mot de passe: AkandaAdmin2024!' as password,
  'URL: http://localhost:3003/auth' as url,
  'Redirection automatique vers: /admin/dashboard' as redirection;
  '9216d774-4b9f-4cfc-a912-07570726700b',
  'Admin',
  'Akanda Apéro',
  '+33123456789',
  '123 Rue de l''Administration',
  'Paris',
  '75001',
  jsonb_build_object(
    'notifications', true,
    'newsletter', true,
    'admin_account', true
  )
) ON CONFLICT (user_id) DO NOTHING;

-- 6. Vérification finale complète
SELECT 
  'Utilisateur créé' as status,
  u.email,
  u.id as user_id,
  ap.role,
  ap.is_active,
  c.first_name,
  c.last_name
FROM auth.users u
LEFT JOIN admin_profiles ap ON u.id = ap.user_id
LEFT JOIN customers c ON u.id = c.user_id
WHERE u.email = 'admin@akanda-apero.com';
