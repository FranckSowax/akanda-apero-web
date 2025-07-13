-- Script pour corriger les erreurs de l'API Orders
-- Résout les problèmes : vue orders_complete manquante et contrainte customers.id

-- 1. Vérifier et corriger la table customers
DO $$
BEGIN
    -- Vérifier si la table customers existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Table customers existe';
        
        -- Vérifier si la colonne id est bien configurée comme UUID avec default
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' 
            AND column_name = 'id'
            AND column_default LIKE '%uuid_generate_v4%'
            AND table_schema = 'public'
        ) THEN
            -- Corriger la colonne id pour qu'elle soit auto-générée
            ALTER TABLE customers ALTER COLUMN id SET DEFAULT uuid_generate_v4();
            RAISE NOTICE '✅ Colonne customers.id configurée avec UUID auto-généré';
        ELSE
            RAISE NOTICE '✅ Colonne customers.id déjà configurée correctement';
        END IF;
    ELSE
        -- Créer la table customers si elle n'existe pas
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
    END IF;
END $$;

-- 2. Vérifier et créer la table order_items si nécessaire
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
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_order_items_order_id ON order_items(order_id);
        RAISE NOTICE '✅ Table order_items créée avec index';
    ELSE
        RAISE NOTICE '✅ Table order_items existe déjà';
    END IF;
END $$;

-- 3. Créer la vue orders_complete (DROP et CREATE pour éviter les conflits)
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
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created,
    
    -- Formatage des montants
    COALESCE(o.total_amount, 0) as formatted_total,
    COALESCE(o.delivery_fee, 0) as formatted_delivery_fee,
    COALESCE(o.discount_amount, 0) as formatted_discount

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- 4. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 5. Vérifications finales et messages
DO $$
DECLARE
    orders_count INTEGER;
    customers_count INTEGER;
    order_items_count INTEGER;
BEGIN
    -- Compter les enregistrements
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO customers_count FROM customers;
    SELECT COUNT(*) INTO order_items_count FROM order_items;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORRECTION TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE '';
    RAISE NOTICE '📊 État de la base de données :';
    RAISE NOTICE '   - Orders: % commandes', orders_count;
    RAISE NOTICE '   - Customers: % clients', customers_count;
    RAISE NOTICE '   - Order Items: % articles', order_items_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Corrections appliquées :';
    RAISE NOTICE '   - Table customers: ID auto-généré (UUID)';
    RAISE NOTICE '   - Table order_items: Créée si nécessaire';
    RAISE NOTICE '   - Vue orders_complete: Créée avec tous les champs';
    RAISE NOTICE '   - Index: Optimisations de performance ajoutées';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 PRÊT POUR LES TESTS !';
    RAISE NOTICE '   Testez maintenant : http://localhost:3000/test-api';
    RAISE NOTICE '';
    
    -- Test de la vue
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'orders_complete'
    ) THEN
        RAISE NOTICE '✅ Vue orders_complete créée et accessible';
    ELSE
        RAISE NOTICE '❌ Problème avec la vue orders_complete';
    END IF;
END $$;
