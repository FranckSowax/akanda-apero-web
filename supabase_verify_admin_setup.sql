-- Script de vérification de la configuration admin
-- Exécutez ce script pour vérifier que tout est correctement configuré

-- 1. Vérifier que les tables admin existent
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admin_profiles');

-- 2. Vérifier que l'enum admin_role existe
SELECT 
  enumlabel as available_roles
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'admin_role'
);

-- 3. Vérifier les fonctions admin
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%admin%';

-- 4. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'admin_profiles';

-- 5. Compter les admins existants
SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_admins
FROM admin_profiles;

-- 6. Lister tous les admins avec leurs détails
SELECT 
  ap.role,
  ap.is_active,
  ap.created_at,
  u.email,
  u.email_confirmed_at,
  ap.can_manage_products,
  ap.can_manage_orders,
  ap.can_manage_users,
  ap.can_view_analytics,
  ap.can_manage_deliveries
FROM admin_profiles ap
JOIN auth.users u ON ap.user_id = u.id
ORDER BY ap.created_at DESC;

-- 7. Test de la fonction de vérification (remplacez USER_ID par un ID réel)
-- SELECT check_user_admin_role('USER_ID_REEL') as is_admin_check;
