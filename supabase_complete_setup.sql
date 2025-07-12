-- Script complet pour configurer le système admin Akanda Apéro
-- Exécutez ce script en une seule fois dans Supabase SQL Editor

-- ============================================================================
-- PARTIE 1: CRÉATION DES TYPES ET ENUMS
-- ============================================================================

-- Créer l'enum pour les rôles admin
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM (
            'super_admin',
            'admin', 
            'manager',
            'staff',
            'delivery_supervisor'
        );
    END IF;
END $$;

-- ============================================================================
-- PARTIE 2: CRÉATION DE LA TABLE ADMIN_PROFILES
-- ============================================================================

-- Supprimer la table si elle existe avec une mauvaise structure
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Créer la table admin_profiles avec la bonne structure
CREATE TABLE admin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Permissions spécifiques
    can_manage_products BOOLEAN NOT NULL DEFAULT false,
    can_manage_orders BOOLEAN NOT NULL DEFAULT false,
    can_manage_users BOOLEAN NOT NULL DEFAULT false,
    can_view_analytics BOOLEAN NOT NULL DEFAULT false,
    can_manage_deliveries BOOLEAN NOT NULL DEFAULT false,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    
    -- Contraintes
    UNIQUE(user_id)
);

-- Créer les index
CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_active ON admin_profiles(is_active);

-- ============================================================================
-- PARTIE 3: SÉCURITÉ RLS
-- ============================================================================

-- Activer RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Admins can view all admin profiles" ON admin_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.user_id = auth.uid() 
            AND ap.is_active = true
        )
    );

CREATE POLICY "Super admins can manage all admin profiles" ON admin_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.user_id = auth.uid() 
            AND ap.role = 'super_admin' 
            AND ap.is_active = true
        )
    );

-- ============================================================================
-- PARTIE 4: FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction de vérification des rôles admin
CREATE OR REPLACE FUNCTION check_user_admin_role(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_profiles 
        WHERE user_id = user_uuid 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_admin_role(user_uuid UUID)
RETURNS admin_role AS $$
DECLARE
    user_role admin_role;
BEGIN
    SELECT role INTO user_role
    FROM admin_profiles 
    WHERE user_id = user_uuid 
    AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PARTIE 5: VÉRIFICATION DE LA STRUCTURE
-- ============================================================================

SELECT 
  'Table admin_profiles créée avec succès' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- PARTIE 6: CRÉATION DU PREMIER ADMIN
-- ============================================================================

-- Vérifier l'utilisateur admin@akanda-apero.com
SELECT 
  'Utilisateur trouvé:' as info,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@akanda-apero.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Créer le profil admin pour l'utilisateur 9216d774-4b9f-4cfc-a912-07570726700b
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

-- ============================================================================
-- PARTIE 7: VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que le profil admin a été créé
SELECT 
  'Profil admin créé:' as status,
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

-- Test de la fonction de vérification
SELECT 
  'Test fonction admin:' as info,
  check_user_admin_role('9216d774-4b9f-4cfc-a912-07570726700b') as is_admin,
  get_user_admin_role('9216d774-4b9f-4cfc-a912-07570726700b') as admin_role;

-- Résumé final
SELECT 
  'CONFIGURATION TERMINÉE' as status,
  'Email: admin@akanda-apero.com' as login_email,
  'Mot de passe: AkandaAdmin2024!' as login_password,
  'Rôle: super_admin' as role,
  'Redirection: /admin/dashboard' as redirect_after_login;
