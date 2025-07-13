-- Script de configuration admin simplifié pour ohmygab.marketplace@gmail.com
-- S'adapte à la structure existante de la table admin_profiles

-- 1. Vérifier si l'utilisateur existe
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
WHERE email = 'ohmygab.marketplace@gmail.com'
ORDER BY created_at DESC;

-- 2. Vérifier la structure existante de la table admin_profiles
SELECT 
  'Structure table admin_profiles:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Supprimer les fonctions existantes pour éviter les conflits
DROP FUNCTION IF EXISTS check_user_admin_role(UUID);
DROP FUNCTION IF EXISTS get_user_admin_role();

-- 4. Créer le type enum pour les rôles admin (si pas déjà créé)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'delivery_supervisor');
    END IF;
END $$;

-- 5. Créer la fonction pour vérifier le rôle admin d'un utilisateur
CREATE OR REPLACE FUNCTION check_user_admin_role(user_uuid UUID)
RETURNS admin_role AS $$
DECLARE
    user_role admin_role;
BEGIN
    SELECT role INTO user_role
    FROM admin_profiles
    WHERE user_id = user_uuid AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer la fonction pour obtenir le rôle admin de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_admin_role()
RETURNS admin_role AS $$
BEGIN
    RETURN check_user_admin_role(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Insérer ou mettre à jour le profil admin (version simplifiée)
DO $$
DECLARE
    admin_user_id UUID;
    table_has_first_name BOOLEAN;
    table_has_permissions BOOLEAN;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'ohmygab.marketplace@gmail.com'
    AND email_confirmed_at IS NOT NULL;
    
    -- Vérifier si les colonnes existent
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_profiles' 
        AND column_name = 'first_name'
    ) INTO table_has_first_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_profiles' 
        AND column_name = 'permissions'
    ) INTO table_has_permissions;
    
    IF admin_user_id IS NOT NULL THEN
        -- Version avec colonnes complètes
        IF table_has_first_name AND table_has_permissions THEN
            INSERT INTO admin_profiles (
                user_id,
                role,
                first_name,
                last_name,
                is_active,
                permissions
            ) VALUES (
                admin_user_id,
                'super_admin',
                'Admin',
                'Akanda Apéro',
                true,
                '{"all": true, "manage_users": true, "manage_products": true, "manage_orders": true}'
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                role = 'super_admin',
                is_active = true,
                permissions = '{"all": true, "manage_users": true, "manage_products": true, "manage_orders": true}',
                updated_at = NOW();
        
        -- Version avec permissions seulement
        ELSIF table_has_permissions THEN
            INSERT INTO admin_profiles (
                user_id,
                role,
                is_active,
                permissions
            ) VALUES (
                admin_user_id,
                'super_admin',
                true,
                '{"all": true, "manage_users": true, "manage_products": true, "manage_orders": true}'
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                role = 'super_admin',
                is_active = true,
                permissions = '{"all": true, "manage_users": true, "manage_products": true, "manage_orders": true}',
                updated_at = NOW();
        
        -- Version minimale (colonnes de base seulement)
        ELSE
            INSERT INTO admin_profiles (
                user_id,
                role,
                is_active
            ) VALUES (
                admin_user_id,
                'super_admin',
                true
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                role = 'super_admin',
                is_active = true,
                updated_at = NOW();
        END IF;
            
        RAISE NOTICE '✅ Profil admin créé/mis à jour pour ohmygab.marketplace@gmail.com';
    ELSE
        RAISE NOTICE '❌ Utilisateur ohmygab.marketplace@gmail.com non trouvé ou email non confirmé';
        RAISE NOTICE 'Créez d''abord le compte via http://localhost:3003/auth et confirmez l''email';
    END IF;
END $$;

-- 8. Vérification finale
SELECT 
    '=== VÉRIFICATION FINALE ===' as titre,
    u.email,
    u.email_confirmed_at,
    ap.role,
    ap.is_active,
    ap.created_at,
    CASE 
        WHEN ap.role = 'super_admin' AND ap.is_active = true 
        THEN '✅ Admin configuré avec succès'
        ELSE '❌ Configuration incomplète'
    END as status
FROM auth.users u
LEFT JOIN admin_profiles ap ON u.id = ap.user_id
WHERE u.email = 'ohmygab.marketplace@gmail.com';

-- 9. Test des fonctions
SELECT 
    '=== TEST FONCTIONS ===' as titre,
    check_user_admin_role(
        (SELECT id FROM auth.users WHERE email = 'ohmygab.marketplace@gmail.com')
    ) as role_function_test;

-- 10. Instructions de connexion
SELECT 
    '=== INSTRUCTIONS DE CONNEXION ===' as titre,
    'Email: ohmygab.marketplace@gmail.com' as email,
    'Mot de passe: AkandaAdmin2024!' as password,
    'URL: http://localhost:3003/auth' as url,
    'Redirection automatique vers: /admin/dashboard' as redirection;
