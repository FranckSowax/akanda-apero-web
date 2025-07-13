-- Script SQL simplifié pour tester l'API Orders
-- Version sans user_id et avec politiques RLS publiques

-- 1. EXTENSIONS ET FONCTIONS
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES PRINCIPALES
-- =====================================================

-- Table des produits (référence pour order_items)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clients
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table principale des commandes avec géolocalisation
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Montants
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Statuts
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready', 
    'out_for_delivery', 'delivered', 'delayed', 'cancelled'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  payment_method TEXT,
  
  -- Coordonnées GPS (obligatoires)
  gps_latitude DECIMAL(10, 8) NOT NULL,
  gps_longitude DECIMAL(11, 8) NOT NULL,
  
  -- Informations de livraison
  delivery_address TEXT NOT NULL,
  delivery_district TEXT,
  delivery_notes TEXT,
  delivery_option TEXT DEFAULT 'standard',
  delivery_person_id UUID,
  
  -- Horodatage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(gps_latitude, gps_longitude);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- 4. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour générer les liens de navigation
CREATE OR REPLACE FUNCTION generate_navigation_links(lat DECIMAL, lng DECIMAL)
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'waze', 'https://waze.com/ul?ll=' || lat || ',' || lng || '&navigate=yes',
        'google_maps', 'https://www.google.com/maps/dir/?api=1&destination=' || lat || ',' || lng,
        'apple_maps', 'http://maps.apple.com/?daddr=' || lat || ',' || lng
    );
END;
$$ LANGUAGE plpgsql;

-- 5. VUES
-- =====================================================

-- Vue complète des commandes avec informations client et liens de navigation
CREATE OR REPLACE VIEW orders_complete AS
SELECT 
    o.*,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.email as customer_email,
    c.phone as customer_phone,
    -- Générer les liens de navigation directement
    CASE 
        WHEN o.gps_latitude IS NOT NULL AND o.gps_longitude IS NOT NULL 
        THEN 'https://waze.com/ul?ll=' || o.gps_latitude || ',' || o.gps_longitude || '&navigate=yes'
        ELSE NULL 
    END as waze_link,
    CASE 
        WHEN o.gps_latitude IS NOT NULL AND o.gps_longitude IS NOT NULL 
        THEN 'https://www.google.com/maps/dir/?api=1&destination=' || o.gps_latitude || ',' || o.gps_longitude
        ELSE NULL 
    END as google_maps_link,
    -- Compter les articles
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
    -- Calculer le temps depuis la création
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- Vue pour les statistiques des commandes
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery') THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN status = 'delivered' THEN total_amount END), 0) as average_order_value,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_orders,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_orders
FROM orders;

-- 6. TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. POLITIQUES RLS (TEMPORAIRES POUR TESTS)
-- =====================================================

-- Activer RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Politiques temporaires : accès public pour les tests
CREATE POLICY "Public access for orders" ON orders FOR ALL USING (true);
CREATE POLICY "Public access for order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Public access for customers" ON customers FOR ALL USING (true);

-- 8. PERMISSIONS
-- =====================================================

-- Accorder les permissions nécessaires
GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON customers TO anon, authenticated;
GRANT SELECT ON order_statistics TO anon, authenticated;
GRANT SELECT ON orders_complete TO anon, authenticated;

-- Permissions pour les séquences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 9. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques produits de test
INSERT INTO products (id, name, price, category_id) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Whisky Premium', 25000, null),
  ('550e8400-e29b-41d4-a716-446655440002', 'Champagne Rosé', 35000, null),
  ('550e8400-e29b-41d4-a716-446655440003', 'Vodka Premium', 20000, null)
ON CONFLICT (id) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Setup terminé ! Tables créées avec succès.';
    RAISE NOTICE 'Vous pouvez maintenant tester l''API Orders.';
END $$;
