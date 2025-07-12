-- Script de correction pour la table admin_profiles
-- Exécutez ce script AVANT de créer le premier admin

-- 1. Vérifier si la table admin_profiles existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Supprimer la table si elle existe avec une mauvaise structure
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- 3. Créer l'enum pour les rôles admin (si pas déjà créé)
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

-- 4. Créer la table admin_profiles avec la bonne structure
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

-- 5. Créer les index pour optimiser les performances
CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_active ON admin_profiles(is_active);

-- 6. Activer RLS (Row Level Security)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS
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

CREATE POLICY "Admins can update their own profile" ON admin_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- 8. Créer la fonction de vérification des rôles admin
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

-- 9. Créer la fonction pour obtenir le rôle d'un utilisateur
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

-- 10. Créer un trigger pour mettre à jour updated_at
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

-- 11. Vérification finale de la structure
SELECT 
  'Table admin_profiles créée avec succès' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
