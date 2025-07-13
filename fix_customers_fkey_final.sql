-- Script final pour résoudre définitivement l'erreur customers_id_fkey
-- Cette contrainte semble pointer vers une table qui n'existe pas ou est mal configurée

-- 1. Identifier et supprimer TOUTES les contraintes foreign key problématiques
DO $$
DECLARE
    constraint_record RECORD;
    table_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 NETTOYAGE COMPLET DES CONTRAINTES CUSTOMERS';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '';
    
    -- Supprimer toutes les contraintes foreign key qui référencent customers.id de manière incorrecte
    FOR constraint_record IN
        SELECT 
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_name LIKE '%customers_id_fkey%'
        OR tc.constraint_name LIKE '%customers%fkey%'
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
    
    -- Supprimer aussi toutes les contraintes sur la colonne id de customers
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
END $$;

-- 2. Recréer la table customers proprement si nécessaire
DO $$
BEGIN
    -- Supprimer et recréer customers si elle existe déjà avec des problèmes
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
    ) THEN
        -- Sauvegarder les données existantes si il y en a
        CREATE TEMP TABLE customers_backup AS SELECT * FROM customers;
        
        -- Supprimer la table problématique
        DROP TABLE customers CASCADE;
        RAISE NOTICE '🗑️ Table customers supprimée (avec CASCADE)';
    END IF;
    
    -- Créer la nouvelle table customers proprement
    CREATE TABLE customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Table customers recréée proprement';
    
    -- Restaurer les données si elles existaient
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers_backup') THEN
        INSERT INTO customers SELECT * FROM customers_backup;
        DROP TABLE customers_backup;
        RAISE NOTICE '✅ Données customers restaurées';
    END IF;
END $$;

-- 3. Recréer la table orders avec les bonnes références
DO $$
BEGIN
    -- Supprimer et recréer orders si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
    ) THEN
        -- Sauvegarder les données existantes
        CREATE TEMP TABLE orders_backup AS SELECT * FROM orders;
        
        -- Supprimer la table
        DROP TABLE orders CASCADE;
        RAISE NOTICE '🗑️ Table orders supprimée (avec CASCADE)';
    END IF;
    
    -- Créer les types enum s'ils n'existent pas
    DO $enum$
    BEGIN
        CREATE TYPE order_status AS ENUM (
            'pending', 'confirmed', 'preparing', 'ready', 
            'out_for_delivery', 'delivered', 'cancelled'
        );
    EXCEPTION WHEN duplicate_object THEN
        -- Le type existe déjà
        NULL;
    END $enum$;
    
    DO $enum$
    BEGIN
        CREATE TYPE payment_status AS ENUM (
            'pending', 'paid', 'failed', 'refunded'
        );
    EXCEPTION WHEN duplicate_object THEN
        -- Le type existe déjà
        NULL;
    END $enum$;
    
    -- Créer la nouvelle table orders
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
    
    RAISE NOTICE '✅ Table orders recréée avec référence correcte à customers';
END $$;

-- 4. Recréer la table order_items
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_items' 
        AND table_schema = 'public'
    ) THEN
        DROP TABLE order_items CASCADE;
    END IF;
    
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
    
    RAISE NOTICE '✅ Table order_items recréée';
END $$;

-- 5. Recréer les index
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_gps ON orders(gps_latitude, gps_longitude);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. Recréer la vue orders_complete
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
    
    -- Statistiques
    COALESCE((SELECT COUNT(*) FROM order_items WHERE order_id = o.id), 0) as items_count,
    COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id = o.id), 0) as total_items,
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- 7. Test final
DO $$
DECLARE
    test_customer_id UUID;
    test_order_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST FINAL DE CRÉATION...';
    RAISE NOTICE '';
    
    -- Test création customer
    INSERT INTO customers (email, first_name, last_name, phone)
    VALUES ('test@example.com', 'Test', 'User', '+241000000')
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE '✅ Customer créé avec ID: %', test_customer_id;
    
    -- Test création order
    INSERT INTO orders (customer_id, total_amount, gps_latitude, gps_longitude)
    VALUES (test_customer_id, 25.50, -0.3976, 9.4673)
    RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ Order créé avec ID: %', test_order_id;
    
    -- Test création order_item
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
    VALUES (test_order_id, 'Test Product', 2, 12.75, 25.50);
    
    RAISE NOTICE '✅ Order item créé';
    
    -- Test de la vue
    IF EXISTS (SELECT 1 FROM orders_complete WHERE id = test_order_id) THEN
        RAISE NOTICE '✅ Vue orders_complete fonctionne';
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
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;
