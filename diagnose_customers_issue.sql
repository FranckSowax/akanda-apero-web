-- Script de diagnostic approfondi pour identifier le problème avec customers
-- Analyse complète de la structure et des contraintes

-- 1. Analyser la structure complète de la table customers
DO $$
DECLARE
    col_info RECORD;
    constraint_info RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 DIAGNOSTIC COMPLET DE LA TABLE CUSTOMERS';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- Structure des colonnes
    RAISE NOTICE '📋 Structure des colonnes :';
    FOR col_info IN
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   - % : % (max_length: %, nullable: %, default: %)', 
            col_info.column_name,
            col_info.data_type,
            COALESCE(col_info.character_maximum_length::text, 'N/A'),
            col_info.is_nullable,
            COALESCE(col_info.column_default, 'none');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Contraintes sur la table customers :';
    
    -- Toutes les contraintes
    FOR constraint_info IN
        SELECT 
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'customers'
        AND tc.table_schema = 'public'
        ORDER BY tc.constraint_type, tc.constraint_name
    LOOP
        RAISE NOTICE '   - % (%) sur colonne % → %.%', 
            constraint_info.constraint_name,
            constraint_info.constraint_type,
            COALESCE(constraint_info.column_name, 'N/A'),
            COALESCE(constraint_info.referenced_table, 'N/A'),
            COALESCE(constraint_info.referenced_column, 'N/A');
    END LOOP;
END $$;

-- 2. Analyser les contraintes qui RÉFÉRENCENT customers
DO $$
DECLARE
    ref_constraint RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Tables qui référencent customers :';
    
    FOR ref_constraint IN
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'customers'
        ORDER BY tc.table_name
    LOOP
        RAISE NOTICE '   - %.% → %.% (contrainte: %)', 
            ref_constraint.table_name,
            ref_constraint.column_name,
            ref_constraint.referenced_table,
            ref_constraint.referenced_column,
            ref_constraint.constraint_name;
    END LOOP;
END $$;

-- 3. Vérifier s'il y a des données existantes
DO $$
DECLARE
    customers_count INTEGER;
    orders_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO customers_count FROM customers;
    SELECT COUNT(*) INTO orders_count FROM orders;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Données existantes :';
    RAISE NOTICE '   - Customers: %', customers_count;
    RAISE NOTICE '   - Orders: %', orders_count;
    
    -- Vérifier s'il y a des orders avec customer_id NULL ou invalide
    IF orders_count > 0 THEN
        DECLARE
            orphan_orders INTEGER;
        BEGIN
            SELECT COUNT(*) INTO orphan_orders 
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.id 
            WHERE c.id IS NULL AND o.customer_id IS NOT NULL;
            
            RAISE NOTICE '   - Orders orphelins (customer_id invalide): %', orphan_orders;
        END;
    END IF;
END $$;

-- 4. Tester la création d'un customer simple
DO $$
DECLARE
    test_id UUID;
    error_msg TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test de création d''un customer...';
    
    BEGIN
        -- Test 1: Insertion avec ID explicite
        INSERT INTO customers (id, email, first_name, last_name, phone)
        VALUES (uuid_generate_v4(), 'test1@example.com', 'Test1', 'User1', '+241000001')
        RETURNING id INTO test_id;
        
        RAISE NOTICE '✅ Test 1 réussi (avec ID explicite): %', test_id;
        DELETE FROM customers WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        RAISE NOTICE '❌ Test 1 échoué (avec ID explicite): %', error_msg;
    END;
    
    BEGIN
        -- Test 2: Insertion sans ID (auto-généré)
        INSERT INTO customers (email, first_name, last_name, phone)
        VALUES ('test2@example.com', 'Test2', 'User2', '+241000002')
        RETURNING id INTO test_id;
        
        RAISE NOTICE '✅ Test 2 réussi (ID auto-généré): %', test_id;
        DELETE FROM customers WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        RAISE NOTICE '❌ Test 2 échoué (ID auto-généré): %', error_msg;
    END;
END $$;

-- 5. Vérifier les extensions nécessaires
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Extensions installées :';
    
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE NOTICE '   ✅ uuid-ossp installée';
    ELSE
        RAISE NOTICE '   ❌ uuid-ossp manquante';
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        RAISE NOTICE '   ✅ uuid-ossp installée maintenant';
    END IF;
END $$;

-- 6. Recommandations basées sur le diagnostic
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💡 RECOMMANDATIONS :';
    RAISE NOTICE '==================';
    RAISE NOTICE '';
    RAISE NOTICE '1. Vérifiez les contraintes foreign key listées ci-dessus';
    RAISE NOTICE '2. Si customers_id_fkey existe, elle doit être supprimée';
    RAISE NOTICE '3. Assurez-vous que uuid-ossp est installée';
    RAISE NOTICE '4. Vérifiez qu''il n''y a pas de données orphelines';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PROCHAINE ÉTAPE :';
    RAISE NOTICE '   Exécutez le script de correction basé sur ce diagnostic';
    RAISE NOTICE '';
END $$;
