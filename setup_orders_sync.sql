-- =====================================================
-- CONFIGURATION COMPLÈTE DU SYSTÈME DE COMMANDES
-- Synchronisation site web ↔ dashboard ↔ Supabase
-- =====================================================

-- 1. CRÉATION DES TABLES DE BASE (si elles n'existent pas)
-- =====================================================

-- Table des produits
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'delayed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
  payment_method TEXT,
  
  -- Informations de livraison
  delivery_address TEXT,
  delivery_district TEXT,
  delivery_additional_info TEXT,
  delivery_option TEXT DEFAULT 'standard',
  
  -- COORDONNÉES GPS POUR NAVIGATION
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  delivery_location_address TEXT,
  delivery_location_accuracy INTEGER,
  
  -- Dates
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Nom du produit au moment de la commande
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  product_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INDEX ET OPTIMISATIONS
-- =====================================================

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);


-- Index spatial pour les coordonnées GPS
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(gps_latitude, gps_longitude);

-- Index pour les numéros de commande
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- 3. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer la distance entre deux points GPS (en km)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL,
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- Rayon de la Terre en km
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlng/2) * sin(dlng/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer les liens de navigation (Waze, Google Maps, Apple Maps)
CREATE OR REPLACE FUNCTION get_navigation_links(
    order_id UUID
) RETURNS JSON AS $$
DECLARE
    order_record RECORD;
    result JSON;
BEGIN
    -- Récupérer les informations de la commande
    SELECT 
        gps_latitude,
        gps_longitude,
        delivery_location_address,
        delivery_address,
        order_number
    INTO order_record
    FROM orders 
    WHERE id = order_id;
    
    -- Vérifier si la commande existe
    IF NOT FOUND THEN
        RETURN json_build_object(
            'error', 'Commande non trouvée'
        );
    END IF;
    
    -- Vérifier si les coordonnées existent
    IF order_record.gps_latitude IS NULL OR order_record.gps_longitude IS NULL THEN
        RETURN json_build_object(
            'error', 'Coordonnées GPS non disponibles pour cette commande',
            'order_number', order_record.order_number
        );
    END IF;
    
    -- Construire les liens de navigation
    result := json_build_object(
        'waze', 'https://waze.com/ul?ll=' || order_record.gps_latitude || ',' || order_record.gps_longitude || '&navigate=yes',
        'google_maps', 'https://www.google.com/maps/dir/?api=1&destination=' || order_record.gps_latitude || ',' || order_record.gps_longitude,
        'apple_maps', 'http://maps.apple.com/?daddr=' || order_record.gps_latitude || ',' || order_record.gps_longitude,
        'coordinates', json_build_object(
            'latitude', order_record.gps_latitude,
            'longitude', order_record.gps_longitude,
            'address', COALESCE(order_record.delivery_location_address, order_record.delivery_address)
        ),
        'order_number', order_record.order_number
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 3, '0');
        
        -- Vérifier si ce numéro existe déjà
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        -- Sécurité : éviter une boucle infinie
        IF counter > 999 THEN
            new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000)::TEXT, 3, '0');
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. VUES POUR LES STATISTIQUES
-- =====================================================

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

-- Vue pour les commandes avec informations complètes
CREATE OR REPLACE VIEW orders_complete AS
SELECT 
    o.*,
    c.first_name,
    c.last_name,
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

-- 5. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. POLITIQUES DE SÉCURITÉ RLS
-- =====================================================

-- Activer RLS sur les tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Politique temporaire : accès public pour les tests
-- TODO: Ajuster les politiques selon les besoins de sécurité
CREATE POLICY "Public access for orders" ON orders
    FOR ALL USING (true);

-- Politique pour order_items
CREATE POLICY "Public access for order_items" ON order_items
    FOR ALL USING (true);



-- 7. PERMISSIONS
-- =====================================================

-- Accorder les permissions nécessaires
GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON customers TO anon, authenticated;
GRANT SELECT ON order_statistics TO anon, authenticated;
GRANT SELECT ON orders_complete TO anon, authenticated;

-- Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_navigation_links(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) TO anon, authenticated;

-- 8. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques produits de test si la table est vide
INSERT INTO products (name, description, price, image_url, is_active)
SELECT * FROM (VALUES
    ('Pack The Party Mix', 'Assortiment de boissons pour faire la fête', 15000.00, '/images/party-mix.jpg', true),
    ('Cocktail DIY Kit', 'Kit pour préparer des cocktails à la maison', 28000.00, '/images/cocktail-kit.jpg', true),
    ('Vin Rouge Premium', 'Vin rouge de qualité supérieure', 45000.00, '/images/wine-red.jpg', true),
    ('Champagne Célébration', 'Champagne pour les grandes occasions', 65000.00, '/images/champagne.jpg', true),
    ('Bière Artisanale Pack', 'Sélection de bières artisanales locales', 12000.00, '/images/beer-pack.jpg', true)
) AS v(name, description, price, image_url, is_active)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Configuration du système de commandes terminée !';
    RAISE NOTICE '📊 Tables créées : orders, order_items, customers, products';
    RAISE NOTICE '🗺️ Fonctions GPS : get_navigation_links(), calculate_distance()';
    RAISE NOTICE '📈 Vues statistiques : order_statistics, orders_complete';
    RAISE NOTICE '🔒 Politiques de sécurité RLS activées';
    RAISE NOTICE '🚀 Prêt pour la synchronisation site ↔ dashboard !';
END $$;
