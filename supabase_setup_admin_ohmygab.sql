-- Script de configuration admin pour ohmygab.marketplace@gmail.com
-- Exécutez ce script dans Supabase SQL Editor après avoir créé le compte utilisateur

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

-- 2. Créer le type enum pour les rôles admin (si pas déjà créé)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'delivery_supervisor');
    END IF;
END $$;

-- 3. Créer la table admin_profiles (si pas déjà créée)
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role admin_role NOT NULL DEFAULT 'staff',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_active ON admin_profiles(is_active);

-- 5. Activer RLS sur la table admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
DROP POLICY IF EXISTS "Admin profiles are viewable by authenticated users" ON admin_profiles;
CREATE POLICY "Admin profiles are viewable by authenticated users" ON admin_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin profiles are editable by super admins" ON admin_profiles;
CREATE POLICY "Admin profiles are editable by super admins" ON admin_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.user_id = auth.uid() 
            AND ap.role = 'super_admin' 
            AND ap.is_active = true
        )
    );

-- 7. Fonction pour vérifier le rôle admin d'un utilisateur
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

-- 8. Fonction pour obtenir le rôle admin de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_admin_role()
RETURNS admin_role AS $$
BEGIN
    RETURN check_user_admin_role(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insérer ou mettre à jour le profil admin pour ohmygab.marketplace@gmail.com
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'ohmygab.marketplace@gmail.com'
    AND email_confirmed_at IS NOT NULL;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insérer ou mettre à jour le profil admin
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
            
        RAISE NOTICE '✅ Profil admin créé/mis à jour pour ohmygab.marketplace@gmail.com';
    ELSE
        RAISE NOTICE '❌ Utilisateur ohmygab.marketplace@gmail.com non trouvé ou email non confirmé';
    END IF;
END $$;

-- 11. Vérification finale
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

-- 12. Test des fonctions
SELECT 
    '=== TEST FONCTIONS ===' as titre,
    check_user_admin_role(
        (SELECT id FROM auth.users WHERE email = 'ohmygab.marketplace@gmail.com')
    ) as role_function_test;

-- 13. Instructions de connexion
SELECT 
    '=== INSTRUCTIONS DE CONNEXION ===' as titre,
    'Email: ohmygab.marketplace@gmail.com' as email,
    'Mot de passe: AkandaAdmin2024!' as password,
    'URL: http://localhost:3003/auth' as url,
    'Redirection automatique vers: /admin/dashboard' as redirection;
