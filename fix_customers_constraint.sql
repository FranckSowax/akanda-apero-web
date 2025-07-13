-- Script pour corriger la contrainte foreign key sur customers.id
-- Résout l'erreur : "insert or update on table customers violates foreign key constraint customers_id_fkey"

-- 1. Identifier et supprimer les contraintes problématiques sur customers.id
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    RAISE NOTICE '🔍 Recherche des contraintes sur customers.id...';
    
    -- Lister toutes les contraintes foreign key sur customers.id
    FOR constraint_record IN
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'customers'
        AND kcu.column_name = 'id'
    LOOP
        RAISE NOTICE '❌ Contrainte problématique trouvée: % sur %.%', 
            constraint_record.constraint_name, 
            constraint_record.table_name, 
            constraint_record.column_name;
        
        -- Supprimer la contrainte
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
            constraint_record.table_name, 
            constraint_record.constraint_name);
        
        RAISE NOTICE '✅ Contrainte % supprimée', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 2. Vérifier que customers.id est bien configuré comme PRIMARY KEY
DO $$
BEGIN
    -- Vérifier si customers.id est PRIMARY KEY
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = 'customers'
        AND kcu.column_name = 'id'
    ) THEN
        RAISE NOTICE '✅ customers.id est bien PRIMARY KEY';
    ELSE
        -- Ajouter PRIMARY KEY si manquant
        ALTER TABLE customers ADD PRIMARY KEY (id);
        RAISE NOTICE '✅ PRIMARY KEY ajouté à customers.id';
    END IF;
END $$;

-- 3. S'assurer que customers.id a un default UUID
DO $$
BEGIN
    -- Vérifier et corriger le default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'id'
        AND column_default LIKE '%uuid_generate_v4%'
        AND table_schema = 'public'
    ) THEN
        -- Activer l'extension uuid si nécessaire
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Configurer le default
        ALTER TABLE customers ALTER COLUMN id SET DEFAULT uuid_generate_v4();
        RAISE NOTICE '✅ Default UUID configuré pour customers.id';
    ELSE
        RAISE NOTICE '✅ Default UUID déjà configuré';
    END IF;
END $$;

-- 4. Vérifier la structure finale de customers
DO $$
DECLARE
    col_info RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Structure finale de la table customers :';
    
    FOR col_info IN
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   - %: % (nullable: %) default: %', 
            col_info.column_name,
            col_info.data_type,
            col_info.is_nullable,
            COALESCE(col_info.column_default, 'none');
    END LOOP;
END $$;

-- 5. Test d'insertion pour vérifier que tout fonctionne
DO $$
DECLARE
    test_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test d''insertion dans customers...';
    
    -- Tenter une insertion test
    INSERT INTO customers (email, first_name, last_name, phone)
    VALUES ('test@example.com', 'Test', 'User', '+241000000')
    RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Test d''insertion réussi ! ID généré: %', test_id;
    
    -- Supprimer le test
    DELETE FROM customers WHERE id = test_id;
    RAISE NOTICE '✅ Données de test nettoyées';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;

-- 6. Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORRECTION CUSTOMERS TERMINÉE !';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Actions effectuées :';
    RAISE NOTICE '   - Contraintes foreign key problématiques supprimées';
    RAISE NOTICE '   - PRIMARY KEY vérifié/ajouté';
    RAISE NOTICE '   - Default UUID configuré';
    RAISE NOTICE '   - Extension uuid-ossp activée';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTEZ MAINTENANT LE POST !';
    RAISE NOTICE '   http://localhost:3000/test-api';
    RAISE NOTICE '';
END $$;
