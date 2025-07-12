-- =====================================================
-- SYSTÈME D'ADMINISTRATION AKANDA APÉRO
-- Configuration des profils admin et gestion des rôles
-- =====================================================

-- Créer un type ENUM pour les rôles admin
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'admin', 
  'manager',
  'staff',
  'delivery_supervisor'
);

-- =====================================================
-- TABLE ADMIN_PROFILES (Profils administrateurs)
-- =====================================================

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role admin_role NOT NULL DEFAULT 'staff',
  
  -- Informations professionnelles
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  phone VARCHAR(20),
  
  -- Permissions et accès
  is_active BOOLEAN DEFAULT true,
  can_manage_products BOOLEAN DEFAULT false,
  can_manage_orders BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_deliveries BOOLEAN DEFAULT false,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_profiles(id)
);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le rôle d'un admin
CREATE OR REPLACE FUNCTION get_admin_role(user_id UUID)
RETURNS admin_role AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role 
  FROM admin_profiles 
  WHERE id = user_id AND is_active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN := false;
BEGIN
  CASE permission_type
    WHEN 'manage_products' THEN
      SELECT can_manage_products INTO has_perm FROM admin_profiles WHERE id = user_id;
    WHEN 'manage_orders' THEN
      SELECT can_manage_orders INTO has_perm FROM admin_profiles WHERE id = user_id;
    WHEN 'manage_users' THEN
      SELECT can_manage_users INTO has_perm FROM admin_profiles WHERE id = user_id;
    WHEN 'view_analytics' THEN
      SELECT can_view_analytics INTO has_perm FROM admin_profiles WHERE id = user_id;
    WHEN 'manage_deliveries' THEN
      SELECT can_manage_deliveries INTO has_perm FROM admin_profiles WHERE id = user_id;
    ELSE
      has_perm := false;
  END CASE;
  
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur la table admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent voir tous les profils admin
CREATE POLICY "Admins can view all admin profiles" ON admin_profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Les admins peuvent mettre à jour leur propre profil
CREATE POLICY "Admins can update own profile" ON admin_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Seuls les super_admin et admin peuvent créer de nouveaux profils admin
CREATE POLICY "Super admins can create admin profiles" ON admin_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- Seuls les super_admin peuvent supprimer des profils admin
CREATE POLICY "Super admins can delete admin profiles" ON admin_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- =====================================================
-- POLITIQUES RLS POUR LES AUTRES TABLES
-- =====================================================

-- Les admins peuvent voir tous les produits
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin(auth.uid()));

-- Les admins peuvent voir toutes les commandes
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (is_admin(auth.uid()));

-- Les admins peuvent voir tous les clients
CREATE POLICY "Admins can view customers" ON customers
  FOR SELECT USING (is_admin(auth.uid()));

-- =====================================================
-- DONNÉES INITIALES - SUPER ADMIN
-- =====================================================

-- Insérer le super admin initial (à adapter avec votre email)
-- Note: L'utilisateur doit d'abord s'inscrire via Supabase Auth
-- puis son UUID sera utilisé ici

-- INSERT INTO admin_profiles (
--   id,
--   email,
--   first_name,
--   last_name,
--   role,
--   employee_id,
--   department,
--   position,
--   can_manage_products,
--   can_manage_orders,
--   can_manage_users,
--   can_view_analytics,
--   can_manage_deliveries
-- ) VALUES (
--   'UUID_DU_SUPER_ADMIN', -- À remplacer par l'UUID réel
--   'admin@akandaapero.com',
--   'Super',
--   'Administrateur',
--   'super_admin',
--   'SA001',
--   'Direction',
--   'Directeur Général',
--   true,
--   true,
--   true,
--   true,
--   true
-- );

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- Trigger pour enregistrer la dernière connexion
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_profiles 
  SET last_login = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_active ON admin_profiles(is_active);
CREATE INDEX idx_admin_profiles_employee_id ON admin_profiles(employee_id);

-- =====================================================
-- VUES UTILITAIRES
-- =====================================================

-- Vue pour les statistiques admin
CREATE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'delivered' AND DATE(created_at) = CURRENT_DATE) as today_deliveries,
  (SELECT COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE) as new_customers_today,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered' AND DATE(created_at) = CURRENT_DATE) as today_revenue;

-- Vue pour la liste des admins actifs
CREATE VIEW active_admins AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  department,
  position,
  last_login,
  created_at
FROM admin_profiles 
WHERE is_active = true
ORDER BY role, last_name, first_name;
