-- =====================================================
-- AKANDA APÉRO - SCHÉMA SUPABASE COMPLET
-- E-commerce de livraison de boissons - Libreville, Gabon
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TYPES ENUM
-- =====================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'preparing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE delivery_status AS ENUM (
  'pending',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed'
);

CREATE TYPE product_type AS ENUM (
  'simple',
  'bundle',
  'cocktail_kit'
);

CREATE TYPE promotion_type AS ENUM (
  'percentage',
  'fixed_amount',
  'buy_x_get_y'
);

-- =====================================================
-- TABLE CATEGORIES
-- =====================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) NOT NULL, -- Emoji
  color VARCHAR(50) NOT NULL, -- Tailwind gradient classes
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE PRODUCTS (Produits principaux)
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  image_url TEXT,
  emoji VARCHAR(10), -- Emoji représentatif
  base_price INTEGER NOT NULL, -- Prix en XAF (centimes)
  sale_price INTEGER, -- Prix promotionnel
  product_type product_type DEFAULT 'simple',
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  weight_grams INTEGER, -- Pour calcul livraison
  alcohol_percentage DECIMAL(4,2), -- % alcool
  volume_ml INTEGER, -- Volume en ml
  origin_country VARCHAR(100),
  brand VARCHAR(100),
  tags TEXT[], -- Tags pour recherche
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_price CHECK (base_price > 0),
  CONSTRAINT positive_stock CHECK (stock_quantity >= 0),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- =====================================================
-- TABLE PRODUCT_OPTIONS (Options/Softs pour produits)
-- =====================================================

CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: "Coca-Cola", "Sprite", "Jus d'orange"
  description TEXT,
  price_modifier INTEGER DEFAULT 0, -- Modification prix en XAF
  stock_quantity INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE BUNDLES (Formules composées)
-- =====================================================

CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount INTEGER DEFAULT 0, -- Remise fixe en XAF
  min_items INTEGER DEFAULT 2,
  max_items INTEGER DEFAULT 10,
  is_customizable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE BUNDLE_ITEMS (Produits dans les bundles)
-- =====================================================

CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  UNIQUE(bundle_id, product_id)
);

-- =====================================================
-- TABLE COCKTAIL_KITS (Kits cocktails spéciaux)
-- =====================================================

CREATE TABLE cocktail_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  main_alcohol_id UUID REFERENCES products(id), -- Alcool principal
  recipe_instructions TEXT,
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  preparation_time_minutes INTEGER,
  serves_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5)
);

-- =====================================================
-- TABLE KIT_INGREDIENTS (Ingrédients des kits)
-- =====================================================

CREATE TABLE kit_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id UUID REFERENCES cocktail_kits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- ml, cl, pièce, etc.
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  UNIQUE(kit_id, product_id)
);

-- =====================================================
-- TABLE CUSTOMERS (Profils clients étendus)
-- =====================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  
  -- Adresse principale
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100) DEFAULT 'Libreville',
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Gabon',
  
  -- Préférences
  preferred_delivery_time VARCHAR(50),
  marketing_consent BOOLEAN DEFAULT false,
  sms_consent BOOLEAN DEFAULT false,
  
  -- Statistiques
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0, -- En XAF
  loyalty_points INTEGER DEFAULT 0,
  
  -- Métadonnées
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE DELIVERY_ZONES (Zones de livraison)
-- =====================================================

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  delivery_fee INTEGER NOT NULL, -- Frais en XAF
  free_delivery_threshold INTEGER, -- Seuil livraison gratuite
  estimated_delivery_minutes INTEGER DEFAULT 45,
  is_active BOOLEAN DEFAULT true,
  coordinates JSONB, -- Polygone de la zone
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE ORDERS (Commandes)
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Statut et timing
  status order_status DEFAULT 'pending',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Montants (en XAF)
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  
  -- Informations livraison
  delivery_zone_id UUID REFERENCES delivery_zones(id),
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20),
  delivery_notes TEXT,
  estimated_delivery_at TIMESTAMP WITH TIME ZONE,
  
  -- Paiement
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(100),
  
  -- Métadonnées
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_amounts CHECK (
    subtotal >= 0 AND 
    delivery_fee >= 0 AND 
    discount_amount >= 0 AND 
    total_amount >= 0
  )
);

-- =====================================================
-- TABLE ORDER_ITEMS (Détails des commandes)
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_option_id UUID REFERENCES product_options(id) ON DELETE SET NULL,
  
  -- Détails produit (snapshot au moment de la commande)
  product_name VARCHAR(200) NOT NULL,
  product_description TEXT,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  
  -- Personnalisations
  customizations JSONB,
  special_instructions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_values CHECK (
    unit_price >= 0 AND 
    quantity > 0 AND 
    total_price >= 0
  )
);

-- =====================================================
-- TABLE DELIVERIES (Livraisons)
-- =====================================================

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  delivery_person_name VARCHAR(100),
  delivery_person_phone VARCHAR(20),
  vehicle_info VARCHAR(100),
  
  -- Statut et timing
  status delivery_status DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  tracking_code VARCHAR(50) UNIQUE,
  current_location JSONB,
  delivery_proof_url TEXT, -- Photo de livraison
  
  -- Feedback
  delivery_rating INTEGER,
  delivery_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (delivery_rating >= 1 AND delivery_rating <= 5)
);

-- =====================================================
-- TABLE PROMOTIONS (Offres spéciales)
-- =====================================================

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  promotion_type promotion_type NOT NULL,
  
  -- Valeurs de remise
  discount_percentage DECIMAL(5,2),
  discount_amount INTEGER, -- En XAF
  buy_quantity INTEGER, -- Pour buy_x_get_y
  get_quantity INTEGER, -- Pour buy_x_get_y
  
  -- Conditions
  min_order_amount INTEGER,
  max_discount_amount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  -- Validité
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Ciblage
  applicable_categories UUID[],
  applicable_products UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (starts_at < ends_at),
  CONSTRAINT valid_discount CHECK (
    (promotion_type = 'percentage' AND discount_percentage > 0 AND discount_percentage <= 100) OR
    (promotion_type = 'fixed_amount' AND discount_amount > 0) OR
    (promotion_type = 'buy_x_get_y' AND buy_quantity > 0 AND get_quantity > 0)
  )
);

-- =====================================================
-- TABLE CART_SESSIONS (Paniers temporaires)
-- =====================================================

CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Pour utilisateurs non connectés
  
  -- Contenu
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER DEFAULT 0,
  
  -- Métadonnées
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE REVIEWS (Avis clients)
-- =====================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL,
  title VARCHAR(200),
  comment TEXT,
  
  -- Modération
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(product_id, customer_id, order_id)
);

-- =====================================================
-- INDEXES POUR PERFORMANCES
-- =====================================================

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- Orders
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Deliveries
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- Cart Sessions
CREATE INDEX idx_cart_sessions_customer ON cart_sessions(customer_id);
CREATE INDEX idx_cart_sessions_expires ON cart_sessions(expires_at);

-- =====================================================
-- TRIGGERS POUR TIMESTAMPS AUTOMATIQUES
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer aux tables avec updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_sessions_updated_at BEFORE UPDATE ON cart_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Générer numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AKD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

-- Calculer le total d'une commande
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  subtotal INTEGER;
  delivery_fee INTEGER;
  discount INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(total_price), 0),
    COALESCE(o.delivery_fee, 0),
    COALESCE(o.discount_amount, 0)
  INTO subtotal, delivery_fee, discount
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.order_id = order_uuid
  GROUP BY o.delivery_fee, o.discount_amount;
  
  RETURN subtotal + delivery_fee - discount;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour le stock après commande
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET stock_quantity = stock_quantity + OLD.quantity
    WHERE id = OLD.product_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock 
  AFTER INSERT OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politiques pour customers
CREATE POLICY "Users can view own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON customers FOR UPDATE USING (auth.uid() = id);

-- Politiques pour orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Politiques pour order_items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);

-- Politiques pour cart_sessions
CREATE POLICY "Users can manage own cart" ON cart_sessions FOR ALL USING (customer_id = auth.uid());

-- =====================================================
-- DONNÉES DE SEED (Catégories)
-- =====================================================

INSERT INTO categories (name, description, icon, color, slug, sort_order) VALUES
('Formules', 'Offres spéciales et packs avantageux', '🎁', 'from-red-100 to-red-200', 'formules', 1),
('Vins', 'Sélection de vins fins', '🍷', 'from-purple-100 to-purple-200', 'vins', 2),
('Liqueurs', 'Spiritueux et liqueurs premium', '🍸', 'from-pink-100 to-pink-200', 'liqueurs', 3),
('Bières', 'Bières locales et importées', '🍺', 'from-yellow-100 to-yellow-200', 'bieres', 4),
('Champagnes', 'Bulles festives et champagnes', '🥂', 'from-amber-100 to-amber-200', 'champagnes', 5),
('Apéritifs & sucreries', 'Accompagnements sucrés', '🍫', 'from-orange-100 to-orange-200', 'aperitifs-sucreries', 6),
('Sodas & jus', 'Boissons sans alcool', '🥤', 'from-blue-100 to-blue-200', 'sodas-jus', 7),
('Dépannage', 'Produits de première nécessité', '🛒', 'from-gray-100 to-gray-200', 'depannage', 8),
('Glaçons', 'Glaçons et accessoires', '🧊', 'from-cyan-100 to-cyan-200', 'glacons', 9);

-- Zone de livraison par défaut (Libreville)
INSERT INTO delivery_zones (name, description, delivery_fee, free_delivery_threshold, estimated_delivery_minutes) VALUES
('Libreville Centre', 'Centre-ville de Libreville', 1500, 5000, 30),
('Libreville Périphérie', 'Périphérie de Libreville', 2000, 7500, 45),
('Akanda', 'Zone d''Akanda', 2500, 10000, 60);

-- =====================================================
-- COMMENTAIRES FINAUX
-- =====================================================

-- Ce schéma inclut :
-- ✅ Gestion complète des produits avec options/softs
-- ✅ Système de bundles/formules composables  
-- ✅ Kits cocktails avec ingrédients
-- ✅ Gestion clients et authentification Supabase
-- ✅ Système de commandes et livraisons complet
-- ✅ Promotions et remises flexibles
-- ✅ Paniers temporaires et sessions
-- ✅ Avis clients et ratings
-- ✅ Zones de livraison géographiques
-- ✅ Sécurité RLS et triggers automatiques
-- ✅ Indexes pour performances optimales
-- ✅ Fonctions utilitaires pour calculs

-- Pour déployer : Copier ce script dans l'éditeur SQL de Supabase
-- et l'exécuter section par section pour éviter les timeouts.
