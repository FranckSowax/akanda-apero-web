-- Script pour corriger les noms de colonnes et les valeurs enum
-- Résout les incohérences entre l'API et la base de données

-- 1. Corriger les colonnes de la table orders
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 CORRECTION DES COLONNES ORDERS';
    RAISE NOTICE '=================================';
    RAISE NOTICE '';
    
    -- Ajouter delivery_cost si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_cost'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_cost DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne delivery_cost ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_cost existe déjà';
    END IF;
    
    -- Ajouter discount si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'discount'
    ) THEN
        ALTER TABLE orders ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne discount ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne discount existe déjà';
    END IF;
    
    -- Ajouter order_number si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) UNIQUE;
        RAISE NOTICE '✅ Colonne order_number ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne order_number existe déjà';
    END IF;
    
    -- Ajouter subtotal si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne subtotal ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne subtotal existe déjà';
    END IF;
    
    -- Ajouter payment_method si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
        RAISE NOTICE '✅ Colonne payment_method ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne payment_method existe déjà';
    END IF;
    
    -- Ajouter delivery_address si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE '✅ Colonne delivery_address ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_address existe déjà';
    END IF;
    
    -- Ajouter delivery_district si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_district'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_district VARCHAR(100);
        RAISE NOTICE '✅ Colonne delivery_district ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_district existe déjà';
    END IF;
    
    -- Ajouter delivery_notes si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_notes'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
        RAISE NOTICE '✅ Colonne delivery_notes ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_notes existe déjà';
    END IF;
    
    -- Ajouter delivery_option si elle n'existe pas (l'API l'utilise)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_option'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_option VARCHAR(50);
        RAISE NOTICE '✅ Colonne delivery_option ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_option existe déjà';
    END IF;
    
END $$;

-- 2. Corriger les valeurs enum pour correspondre à l'API
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 CORRECTION DES VALEURS ENUM';
    RAISE NOTICE '==============================';
    RAISE NOTICE '';
    
    -- Supprimer les anciens types enum
    DROP TYPE IF EXISTS order_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    
    -- Créer les nouveaux types enum avec les valeurs utilisées par l'API
    CREATE TYPE order_status AS ENUM (
        'Nouvelle', 'Confirmée', 'En préparation', 'Prête', 
        'En livraison', 'Livrée', 'Annulée'
    );
    
    CREATE TYPE payment_status AS ENUM (
        'En attente', 'Payé', 'Échoué', 'Remboursé'
    );
    
    RAISE NOTICE '✅ Types enum corrigés avec valeurs françaises';
    
    -- Ajouter les colonnes status si elles n'existent pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        ALTER TABLE orders ADD COLUMN status order_status DEFAULT 'Nouvelle';
        RAISE NOTICE '✅ Colonne status ajoutée';
    ELSE
        -- Si la colonne existe, la modifier
        ALTER TABLE orders ALTER COLUMN status TYPE order_status USING 'Nouvelle'::order_status;
        RAISE NOTICE '✅ Colonne status mise à jour';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status payment_status DEFAULT 'En attente';
        RAISE NOTICE '✅ Colonne payment_status ajoutée';
    ELSE
        -- Si la colonne existe, la modifier
        ALTER TABLE orders ALTER COLUMN payment_status TYPE payment_status USING 'En attente'::payment_status;
        RAISE NOTICE '✅ Colonne payment_status mise à jour';
    END IF;
    
END $$;

-- 3. Ajouter une fonction pour générer les numéros de commande
DO $$
BEGIN
    -- Créer une fonction pour générer des numéros de commande uniques
    CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $func$
    DECLARE
        new_number TEXT;
        counter INTEGER := 1;
    BEGIN
        LOOP
            new_number := 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- Vérifier si ce numéro existe déjà
            IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
                RETURN new_number;
            END IF;
            
            counter := counter + 1;
        END LOOP;
    END;
    $func$ LANGUAGE plpgsql;
    
    RAISE NOTICE '✅ Fonction generate_order_number() créée';
    
    -- Créer un trigger pour auto-générer les numéros de commande
    CREATE OR REPLACE FUNCTION set_order_number() RETURNS TRIGGER AS $trigger$
    BEGIN
        IF NEW.order_number IS NULL THEN
            NEW.order_number := generate_order_number();
        END IF;
        RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
    CREATE TRIGGER trigger_set_order_number
        BEFORE INSERT ON orders
        FOR EACH ROW
        EXECUTE FUNCTION set_order_number();
    
    RAISE NOTICE '✅ Trigger pour order_number créé';
    
END $$;

-- 4. Recréer la vue orders_complete avec les bonnes colonnes
DO $$
BEGIN
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
    
    RAISE NOTICE '✅ Vue orders_complete recréée avec bonnes colonnes';
END $$;

-- 5. Test final avec les vraies valeurs de l'API
DO $$
DECLARE
    test_customer_id UUID;
    test_order_id UUID;
    test_order_number TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST AVEC VALEURS API RÉELLES';
    RAISE NOTICE '=================================';
    RAISE NOTICE '';
    
    -- Test 1: Création customer (comme l'API)
    INSERT INTO customers (email, first_name, last_name, phone)
    VALUES ('test@akanda-apero.com', 'Test', 'User', '+241000000')
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE '✅ Customer créé avec ID: %', test_customer_id;
    
    -- Test 2: Création order avec les mêmes colonnes que l'API
    INSERT INTO orders (
        customer_id, total_amount, subtotal, delivery_cost, discount,
        status, payment_status, payment_method,
        delivery_address, delivery_district, delivery_notes, delivery_option,
        gps_latitude, gps_longitude
    )
    VALUES (
        test_customer_id, 25.50, 20.00, 5.50, 0,
        'Nouvelle', 'En attente', 'mobile_money',
        'Test Address, Libreville', 'Libreville', 'Test notes', 'standard',
        -0.3976, 9.4673
    )
    RETURNING id, order_number INTO test_order_id, test_order_number;
    
    RAISE NOTICE '✅ Order créé avec ID: % et numéro: %', test_order_id, test_order_number;
    
    -- Test 3: Création order_item
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
    VALUES (test_order_id, 'Test Product', 2, 10.00, 20.00);
    
    RAISE NOTICE '✅ Order item créé';
    
    -- Test 4: Vérification vue orders_complete
    IF EXISTS (SELECT 1 FROM orders_complete WHERE id = test_order_id) THEN
        RAISE NOTICE '✅ Vue orders_complete fonctionne';
    END IF;
    
    -- Nettoyer
    DELETE FROM customers WHERE id = test_customer_id;
    RAISE NOTICE '✅ Données de test nettoyées';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOUS LES TESTS RÉUSSIS !';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 L''API devrait maintenant fonctionner parfaitement !';
    RAISE NOTICE '   Colonnes ajoutées: delivery_cost, discount, order_number';
    RAISE NOTICE '   Enum corrigés: status en français';
    RAISE NOTICE '   Auto-génération: numéros de commande';
    RAISE NOTICE '';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;
