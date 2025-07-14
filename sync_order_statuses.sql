-- Script pour synchroniser les statuts de commandes avec les valeurs françaises
-- À exécuter dans Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 SYNCHRONISATION DES STATUTS DE COMMANDES';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    
    -- 1. Vérifier si les types enum existent déjà avec les bonnes valeurs
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        RAISE NOTICE '✅ Type order_status existe déjà';
        
        -- Vérifier les valeurs
        IF EXISTS (
            SELECT 1 FROM pg_enum e 
            JOIN pg_type t ON e.enumtypid = t.oid 
            WHERE t.typname = 'order_status' 
            AND e.enumlabel = 'Nouvelle'
        ) THEN
            RAISE NOTICE '✅ Valeurs françaises déjà présentes dans order_status';
        ELSE
            RAISE NOTICE '⚠️  Valeurs anglaises détectées, mise à jour nécessaire';
            
            -- Supprimer et recréer le type
            DROP TYPE IF EXISTS order_status CASCADE;
            CREATE TYPE order_status AS ENUM (
                'Nouvelle', 'Confirmée', 'En préparation', 'Prête', 
                'En livraison', 'Livrée', 'Annulée'
            );
            RAISE NOTICE '✅ Type order_status mis à jour avec valeurs françaises';
        END IF;
    ELSE
        -- Créer le type s'il n'existe pas
        CREATE TYPE order_status AS ENUM (
            'Nouvelle', 'Confirmée', 'En préparation', 'Prête', 
            'En livraison', 'Livrée', 'Annulée'
        );
        RAISE NOTICE '✅ Type order_status créé avec valeurs françaises';
    END IF;
    
    -- 2. Même chose pour payment_status
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        RAISE NOTICE '✅ Type payment_status existe déjà';
        
        IF EXISTS (
            SELECT 1 FROM pg_enum e 
            JOIN pg_type t ON e.enumtypid = t.oid 
            WHERE t.typname = 'payment_status' 
            AND e.enumlabel = 'En attente'
        ) THEN
            RAISE NOTICE '✅ Valeurs françaises déjà présentes dans payment_status';
        ELSE
            RAISE NOTICE '⚠️  Valeurs anglaises détectées, mise à jour nécessaire';
            
            DROP TYPE IF EXISTS payment_status CASCADE;
            CREATE TYPE payment_status AS ENUM (
                'En attente', 'Payé', 'Échoué', 'Remboursé'
            );
            RAISE NOTICE '✅ Type payment_status mis à jour avec valeurs françaises';
        END IF;
    ELSE
        CREATE TYPE payment_status AS ENUM (
            'En attente', 'Payé', 'Échoué', 'Remboursé'
        );
        RAISE NOTICE '✅ Type payment_status créé avec valeurs françaises';
    END IF;
    
    -- 3. Mettre à jour la table orders si nécessaire
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        -- Modifier le type de la colonne status
        ALTER TABLE orders ALTER COLUMN status TYPE order_status USING 'Nouvelle'::order_status;
        RAISE NOTICE '✅ Colonne orders.status mise à jour';
    ELSE
        -- Ajouter la colonne si elle n'existe pas
        ALTER TABLE orders ADD COLUMN status order_status DEFAULT 'Nouvelle';
        RAISE NOTICE '✅ Colonne orders.status ajoutée';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ALTER COLUMN payment_status TYPE payment_status USING 'En attente'::payment_status;
        RAISE NOTICE '✅ Colonne orders.payment_status mise à jour';
    ELSE
        ALTER TABLE orders ADD COLUMN payment_status payment_status DEFAULT 'En attente';
        RAISE NOTICE '✅ Colonne orders.payment_status ajoutée';
    END IF;
    
    -- 4. Mettre à jour les commandes existantes avec des statuts par défaut
    UPDATE orders 
    SET status = 'Nouvelle'::order_status 
    WHERE status IS NULL;
    
    UPDATE orders 
    SET payment_status = 'En attente'::payment_status 
    WHERE payment_status IS NULL;
    
    RAISE NOTICE '✅ Commandes existantes mises à jour avec statuts par défaut';
    
    -- 5. Vérification finale
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION FINALE';
    RAISE NOTICE '=====================';
    
    -- Compter les commandes par statut
    DECLARE
        status_rec RECORD;
        payment_rec RECORD;
    BEGIN
        FOR status_rec IN 
            SELECT status::text as status_name, COUNT(*) as count_val 
            FROM orders 
            WHERE status IS NOT NULL
            GROUP BY status 
            ORDER BY status
        LOOP
            RAISE NOTICE '📊 Statut "%" : % commandes', status_rec.status_name, status_rec.count_val;
        END LOOP;
        
        -- Compter les paiements par statut
        FOR payment_rec IN 
            SELECT payment_status::text as payment_name, COUNT(*) as count_val 
            FROM orders 
            WHERE payment_status IS NOT NULL
            GROUP BY payment_status 
            ORDER BY payment_status
        LOOP
            RAISE NOTICE '💳 Paiement "%" : % commandes', payment_rec.payment_name, payment_rec.count_val;
        END LOOP;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SYNCHRONISATION TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Statuts disponibles :';
    RAISE NOTICE '   • Nouvelle (défaut)';
    RAISE NOTICE '   • Confirmée';
    RAISE NOTICE '   • En préparation';
    RAISE NOTICE '   • Prête';
    RAISE NOTICE '   • En livraison';
    RAISE NOTICE '   • Livrée';
    RAISE NOTICE '   • Annulée';
    RAISE NOTICE '';
    RAISE NOTICE '💳 Statuts de paiement :';
    RAISE NOTICE '   • En attente (défaut)';
    RAISE NOTICE '   • Payé';
    RAISE NOTICE '   • Échoué';
    RAISE NOTICE '   • Remboursé';
    RAISE NOTICE '';
    
END $$;
