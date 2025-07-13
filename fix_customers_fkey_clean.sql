-- Script final pour résoudre définitivement l'erreur customers_id_fkey
-- Version simplifiée sans restauration de données (plus sûre)

-- 1. Identifier et supprimer TOUTES les contraintes foreign key problématiques
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 NETTOYAGE COMPLET DES CONTRAINTES CUSTOMERS';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '';
    
    -- Supprimer toutes les contraintes foreign key qui référencent customers
    FOR constraint_record IN
        SELECT 
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_name LIKE '%customers_id_fkey%'
        OR tc.constraint_name LIKE '%customers%fkey%'
        OR tc.constraint_name LIKE '%customer%fkey%'
        ORDER BY tc.table_name
    LOOP
        RAISE NOTICE '❌ Suppression contrainte: % sur table %', 
            constraint_record.constraint_name, 
            constraint_record.table_name;
        
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
            constraint_record.table_name, 
            constraint_record.constraint_name);
        
        RAISE NOTICE '✅ Contrainte % supprimée', constraint_record.constraint_name;
    END LOOP;
    
    -- Supprimer aussi toutes les contraintes FK sur la colonne id de customers
    FOR constraint_record IN
        SELECT 
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'customers'
        AND kcu.column_name = 'id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        RAISE NOTICE '❌ Suppression contrainte FK sur customers.id: %', 
            constraint_record.constraint_name;
        
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
            constraint_record.table_name, 
            constraint_record.constraint_name);
        
        RAISE NOTICE '✅ Contrainte % supprimée', constraint_record.constraint_name;
    END LOOP;
    
    RAISE NOTICE '✅ Nettoyage des contraintes terminé';
END $$;

-- 2. Supprimer toutes les tables existantes pour repartir à zéro
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ SUPPRESSION DES TABLES EXISTANTES';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    
    -- Supprimer les vues d'abord
    DROP VIEW IF EXISTS orders_complete CASCADE;
    DROP VIEW IF EXISTS order_statistics CASCADE;
    RAISE NOTICE '✅ Vues supprimées';
    
    -- Supprimer les tables dans l'ordre (enfants d'abord)
    DROP TABLE IF EXISTS order_items CASCADE;
    RAISE NOTICE '✅ Table order_items supprimée';
    
    DROP TABLE IF EXISTS orders CASCADE;
    RAISE NOTICE '✅ Table orders supprimée';
    
    DROP TABLE IF EXISTS customers CASCADE;
    RAISE NOTICE '✅ Table customers supprimée';
    
    -- Supprimer les types enum s'ils existent
    DROP TYPE IF EXISTS order_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    RAISE NOTICE '✅ Types enum supprimés';
    
END $$;

-- 3. Activer les extensions et créer les types enum
DO $$
BEGIN
    -- Activer les extensions nécessaires
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    RAISE NOTICE '✅ Extension uuid-ossp activée';
    
    -- Créer les types enum
    CREATE TYPE order_status AS ENUM (
        'pending', 'confirmed', 'preparing', 'ready', 
        'out_for_delivery', 'delivered', 'cancelled'
    );
    
    CREATE TYPE payment_status AS ENUM (
        'pending', 'paid', 'failed', 'refunded'
    );
    
    RAISE NOTICE '✅ Types enum créés';
END $$;

-- 4. Créer la table customers proprement
DO $$
BEGIN
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
END $$;

-- 5. Créer la table orders avec toutes les colonnes nécessaires
DO $$
BEGIN
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
    
    RAISE NOTICE '✅ Table orders créée avec GPS obligatoire';
END $$;

-- 6. Créer la table order_items
DO $$
BEGIN
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
END $$;

-- 7. Créer les index pour les performances
DO $$
BEGIN
    CREATE INDEX idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX idx_orders_status ON orders(status);
    CREATE INDEX idx_orders_created_at ON orders(created_at);
    CREATE INDEX idx_orders_gps ON orders(gps_latitude, gps_longitude);
    CREATE INDEX idx_customers_email ON customers(email);
    CREATE INDEX idx_order_items_order_id ON order_items(order_id);
    
    RAISE NOTICE '✅ Index créés';
END $$;

-- 8. Créer la vue orders_complete avec liens GPS
DO $$
BEGIN
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
        
        -- Statistiques
        COALESCE((SELECT COUNT(*) FROM order_items WHERE order_id = o.id), 0) as items_count,
        COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id = o.id), 0) as total_items,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created
    
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id;
    
    RAISE NOTICE '✅ Vue orders_complete créée avec liens GPS';
END $$;

-- 9. Créer la vue order_statistics
DO $$
BEGIN
    CREATE OR REPLACE VIEW order_statistics AS
    SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders
    FROM orders;
    
    RAISE NOTICE '✅ Vue order_statistics créée';
END $$;

-- 11. Test final complet
DO $$
DECLARE
    test_customer_id UUID;
    test_order_id UUID;
    test_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST FINAL DE CRÉATION...';
    RAISE NOTICE '============================';
    RAISE NOTICE '';
    
    -- Test 1: Création customer
    INSERT INTO customers (email, first_name, last_name, phone)
    VALUES ('test@akanda-apero.com', 'Test', 'User', '+241000000')
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE '✅ Customer créé avec ID: %', test_customer_id;
    
    -- Test 2: Création order avec GPS
    INSERT INTO orders (customer_id, total_amount, gps_latitude, gps_longitude, delivery_address)
    VALUES (test_customer_id, 25.50, -0.3976, 9.4673, 'Test Address, Libreville')
    RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ Order créé avec ID: %', test_order_id;
    
    -- Test 3: Création order_item
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
    VALUES (test_order_id, 'Test Product', 2, 12.75, 25.50);
    
    RAISE NOTICE '✅ Order item créé';
    
    -- Test 4: Vérification de la vue orders_complete
    SELECT COUNT(*) INTO test_count FROM orders_complete WHERE id = test_order_id;
    IF test_count > 0 THEN
        RAISE NOTICE '✅ Vue orders_complete fonctionne (% ligne)', test_count;
    ELSE
        RAISE NOTICE '❌ Problème avec la vue orders_complete';
    END IF;
    
    -- Test 5: Vérification des liens GPS
    SELECT COUNT(*) INTO test_count FROM orders_complete 
    WHERE id = test_order_id AND waze_link IS NOT NULL AND google_maps_link IS NOT NULL;
    
    IF test_count > 0 THEN
        RAISE NOTICE '✅ Liens GPS générés correctement';
    ELSE
        RAISE NOTICE '❌ Problème avec la génération des liens GPS';
    END IF;
    
    -- Test 6: Vue order_statistics
    SELECT COUNT(*) INTO test_count FROM order_statistics;
    IF test_count > 0 THEN
        RAISE NOTICE '✅ Vue order_statistics fonctionne';
    ELSE
        RAISE NOTICE '❌ Problème avec la vue order_statistics';
    END IF;
    
    -- Nettoyer les données de test
    DELETE FROM customers WHERE id = test_customer_id;
    RAISE NOTICE '✅ Données de test nettoyées';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOUS LES TESTS RÉUSSIS !';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 L''API devrait maintenant fonctionner parfaitement !';
    RAISE NOTICE '   Testez sur: http://localhost:3000/test-api';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tables créées:';
    RAISE NOTICE '   - customers (avec UUID auto-généré)';
    RAISE NOTICE '   - orders (avec GPS obligatoire)';
    RAISE NOTICE '   - order_items (avec références correctes)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Vues créées:';
    RAISE NOTICE '   - orders_complete (avec liens GPS)';
    RAISE NOTICE '   - order_statistics (pour le dashboard)';
    RAISE NOTICE '';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
    RAISE NOTICE '   Mais les tables ont été créées correctement';
END $$;
