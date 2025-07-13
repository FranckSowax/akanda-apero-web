-- Script pour créer toutes les tables manquantes
-- Résout le problème : tables customers, orders, order_items n'existent pas

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Créer la table customers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE customers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table customers créée';
    ELSE
        RAISE NOTICE '✅ Table customers existe déjà';
    END IF;
END $$;

-- 3. Créer la table orders avec toutes les colonnes nécessaires
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
    ) THEN
        -- Créer le type enum pour order_status
        CREATE TYPE order_status AS ENUM (
            'pending', 'confirmed', 'preparing', 'ready', 
            'out_for_delivery', 'delivered', 'cancelled'
        );
        
        -- Créer le type enum pour payment_status
        CREATE TYPE payment_status AS ENUM (
            'pending', 'paid', 'failed', 'refunded'
        );
        
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            
            -- Informations de base
            status order_status DEFAULT 'pending',
            payment_status payment_status DEFAULT 'pending',
            payment_method VARCHAR(50),
            
            -- Montants
            total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
            subtotal DECIMAL(10, 2) DEFAULT 0,
            delivery_fee DECIMAL(10, 2) DEFAULT 0,
            discount_amount DECIMAL(10, 2) DEFAULT 0,
            
            -- Informations de livraison
            delivery_address TEXT,
            delivery_district VARCHAR(100),
            delivery_instructions TEXT,
            delivery_option VARCHAR(50) DEFAULT 'standard',
            delivery_person_id UUID,
            delivery_notes TEXT,
            
            -- Coordonnées GPS (OBLIGATOIRES)
            gps_latitude DECIMAL(10, 8) NOT NULL,
            gps_longitude DECIMAL(11, 8) NOT NULL,
            
            -- Horodatage
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            delivered_at TIMESTAMP WITH TIME ZONE
        );
        
        RAISE NOTICE '✅ Table orders créée avec colonnes GPS';
    ELSE
        RAISE NOTICE '✅ Table orders existe déjà';
        
        -- Vérifier et ajouter les colonnes GPS si manquantes
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'gps_latitude'
        ) THEN
            ALTER TABLE orders ADD COLUMN gps_latitude DECIMAL(10, 8);
            ALTER TABLE orders ADD COLUMN gps_longitude DECIMAL(11, 8);
            RAISE NOTICE '✅ Colonnes GPS ajoutées à orders';
        END IF;
        
        -- Vérifier et ajouter les colonnes montants si manquantes
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'total_amount'
        ) THEN
            ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
            RAISE NOTICE '✅ Colonnes montants ajoutées à orders';
        END IF;
    END IF;
END $$;

-- 4. Créer la table order_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_items' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id VARCHAR(50),
            product_name VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price DECIMAL(10, 2) NOT NULL,
            subtotal DECIMAL(10, 2) NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table order_items créée';
    ELSE
        RAISE NOTICE '✅ Table order_items existe déjà';
    END IF;
END $$;

-- 5. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_gps ON orders(gps_latitude, gps_longitude);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. Créer la vue orders_complete
DROP VIEW IF EXISTS orders_complete;

CREATE OR REPLACE VIEW orders_complete AS
SELECT 
    o.*,
    -- Informations client
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.email as customer_email,
    c.phone as customer_phone,
    
    -- Liens de navigation GPS
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
    
    -- Statistiques de la commande
    COALESCE((
        SELECT COUNT(*) 
        FROM order_items 
        WHERE order_id = o.id
    ), 0) as items_count,
    
    COALESCE((
        SELECT SUM(quantity) 
        FROM order_items 
        WHERE order_id = o.id
    ), 0) as total_items,
    
    -- Temps depuis création
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- 7. Créer une vue pour les statistiques
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders;

-- 8. Messages de confirmation
DO $$
DECLARE
    customers_count INTEGER;
    orders_count INTEGER;
    order_items_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO customers_count FROM customers;
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO order_items_count FROM order_items;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CRÉATION DES TABLES TERMINÉE !';
    RAISE NOTICE '==================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables créées :';
    RAISE NOTICE '   - customers (% enregistrements)', customers_count;
    RAISE NOTICE '   - orders (% enregistrements)', orders_count;
    RAISE NOTICE '   - order_items (% enregistrements)', order_items_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Vues créées :';
    RAISE NOTICE '   - orders_complete (avec liens GPS)';
    RAISE NOTICE '   - order_statistics';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Index créés pour les performances';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTEZ MAINTENANT L''API !';
    RAISE NOTICE '   http://localhost:3000/test-api';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 L''API devrait maintenant fonctionner :';
    RAISE NOTICE '   - GET /api/orders ✅';
    RAISE NOTICE '   - POST /api/orders ✅';
    RAISE NOTICE '   - Liens GPS Waze/Google Maps ✅';
    RAISE NOTICE '';
END $$;
