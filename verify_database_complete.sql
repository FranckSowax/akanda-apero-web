-- Script de vérification complète de la base de données Akanda Apéro
-- À exécuter dans Supabase SQL Editor après les scripts de correction

DO $$
DECLARE
    table_count INTEGER;
    enum_count INTEGER;
    column_count INTEGER;
    test_order_id UUID;
    result_text TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION COMPLÈTE DE LA BASE DE DONNÉES';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    
    -- 1. VÉRIFICATION DES TABLES PRINCIPALES
    RAISE NOTICE '📋 1. VÉRIFICATION DES TABLES';
    RAISE NOTICE '-----------------------------';
    
    -- Vérifier les tables essentielles
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_name IN ('customers', 'orders', 'order_items', 'products', 'categories')
    AND table_schema = 'public';
    
    RAISE NOTICE 'Tables principales trouvées: %/5', table_count;
    
    -- Détail par table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE NOTICE '✅ Table customers: OK';
    ELSE
        RAISE NOTICE '❌ Table customers: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE '✅ Table orders: OK';
    ELSE
        RAISE NOTICE '❌ Table orders: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
        RAISE NOTICE '✅ Table order_items: OK';
    ELSE
        RAISE NOTICE '❌ Table order_items: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE NOTICE '✅ Table products: OK';
    ELSE
        RAISE NOTICE '❌ Table products: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE '✅ Table categories: OK';
    ELSE
        RAISE NOTICE '❌ Table categories: MANQUANTE';
    END IF;
    
    RAISE NOTICE '';
    
    -- 2. VÉRIFICATION DES TYPES ENUM
    RAISE NOTICE '🏷️  2. VÉRIFICATION DES TYPES ENUM';
    RAISE NOTICE '--------------------------------';
    
    -- Vérifier order_status
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        RAISE NOTICE '✅ Type order_status: OK';
        -- Afficher les valeurs
        SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) INTO result_text
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'order_status';
        RAISE NOTICE '   Valeurs: %', result_text;
    ELSE
        RAISE NOTICE '❌ Type order_status: MANQUANT';
    END IF;
    
    -- Vérifier payment_status
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        RAISE NOTICE '✅ Type payment_status: OK';
        -- Afficher les valeurs
        SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) INTO result_text
        FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'payment_status';
        RAISE NOTICE '   Valeurs: %', result_text;
    ELSE
        RAISE NOTICE '❌ Type payment_status: MANQUANT';
    END IF;
    
    RAISE NOTICE '';
    
    -- 3. VÉRIFICATION DES COLONNES DE LA TABLE ORDERS
    RAISE NOTICE '📊 3. VÉRIFICATION DES COLONNES ORDERS';
    RAISE NOTICE '------------------------------------';
    
    -- Colonnes essentielles pour l'API
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'id') THEN
        RAISE NOTICE '✅ orders.id: OK';
    ELSE
        RAISE NOTICE '❌ orders.id: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        RAISE NOTICE '✅ orders.customer_id: OK';
    ELSE
        RAISE NOTICE '❌ orders.customer_id: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        RAISE NOTICE '✅ orders.status: OK';
    ELSE
        RAISE NOTICE '❌ orders.status: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        RAISE NOTICE '✅ orders.payment_status: OK';
    ELSE
        RAISE NOTICE '❌ orders.payment_status: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        RAISE NOTICE '✅ orders.total_amount: OK';
    ELSE
        RAISE NOTICE '❌ orders.total_amount: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_cost') THEN
        RAISE NOTICE '✅ orders.delivery_cost: OK';
    ELSE
        RAISE NOTICE '❌ orders.delivery_cost: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        RAISE NOTICE '✅ orders.order_number: OK';
    ELSE
        RAISE NOTICE '❌ orders.order_number: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_latitude') THEN
        RAISE NOTICE '✅ orders.delivery_latitude: OK';
    ELSE
        RAISE NOTICE '❌ orders.delivery_latitude: MANQUANTE';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_longitude') THEN
        RAISE NOTICE '✅ orders.delivery_longitude: OK';
    ELSE
        RAISE NOTICE '❌ orders.delivery_longitude: MANQUANTE';
    END IF;
    
    RAISE NOTICE '';
    
    -- 4. VÉRIFICATION DES FONCTIONS
    RAISE NOTICE '⚙️  4. VÉRIFICATION DES FONCTIONS';
    RAISE NOTICE '-------------------------------';
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number') THEN
        RAISE NOTICE '✅ Fonction generate_order_number: OK';
    ELSE
        RAISE NOTICE '❌ Fonction generate_order_number: MANQUANTE';
    END IF;
    
    RAISE NOTICE '';
    
    -- 5. TEST DE CRÉATION D'UNE COMMANDE
    RAISE NOTICE '🧪 5. TEST DE CRÉATION DE COMMANDE';
    RAISE NOTICE '---------------------------------';
    
    BEGIN
        -- Créer un client test s'il n'existe pas
        INSERT INTO customers (
            id, 
            full_name, 
            phone, 
            whatsapp_number,
            email,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Client Test Vérification',
            '+24177123456',
            '+24177123456',
            'test.verification@akanda-apero.com',
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Créer une commande test
        INSERT INTO orders (
            customer_id,
            total_amount,
            subtotal,
            delivery_cost,
            discount,
            status,
            payment_status,
            delivery_address,
            delivery_latitude,
            delivery_longitude,
            whatsapp_number,
            created_at,
            updated_at
        ) VALUES (
            (SELECT id FROM customers WHERE email = 'test.verification@akanda-apero.com' LIMIT 1),
            15000,
            12000,
            3000,
            0,
            'Nouvelle'::order_status,
            'En attente'::payment_status,
            'Adresse test Libreville',
            0.3901,
            9.4544,
            '+24177123456',
            NOW(),
            NOW()
        ) RETURNING id INTO test_order_id;
        
        RAISE NOTICE '✅ Commande test créée avec ID: %', test_order_id;
        
        -- Vérifier le numéro de commande généré
        SELECT order_number INTO result_text FROM orders WHERE id = test_order_id;
        RAISE NOTICE '✅ Numéro de commande généré: %', result_text;
        
        -- Nettoyer la commande test
        DELETE FROM orders WHERE id = test_order_id;
        RAISE NOTICE '✅ Commande test supprimée';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors du test de création: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    
    -- 6. STATISTIQUES DES DONNÉES
    RAISE NOTICE '📈 6. STATISTIQUES DES DONNÉES';
    RAISE NOTICE '-----------------------------';
    
    -- Compter les enregistrements
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        SELECT COUNT(*) INTO table_count FROM customers;
        RAISE NOTICE 'Clients: % enregistrements', table_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        SELECT COUNT(*) INTO table_count FROM orders;
        RAISE NOTICE 'Commandes: % enregistrements', table_count;
        
        -- Statistiques par statut
        FOR result_text IN 
            SELECT status::text || ': ' || COUNT(*)::text 
            FROM orders 
            GROUP BY status 
            ORDER BY status
        LOOP
            RAISE NOTICE '  - %', result_text;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        SELECT COUNT(*) INTO table_count FROM products;
        RAISE NOTICE 'Produits: % enregistrements', table_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        SELECT COUNT(*) INTO table_count FROM categories;
        RAISE NOTICE 'Catégories: % enregistrements', table_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ VÉRIFICATION TERMINÉE';
    RAISE NOTICE '========================';
    RAISE NOTICE '';
    RAISE NOTICE 'Si tous les éléments sont marqués ✅, la base de données est prête !';
    RAISE NOTICE 'Sinon, exécutez les scripts de correction nécessaires.';
    RAISE NOTICE '';
    
END $$;
