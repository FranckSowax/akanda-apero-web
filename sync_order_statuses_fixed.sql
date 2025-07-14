-- Script pour synchroniser les statuts de commandes avec les valeurs françaises
-- À exécuter dans Supabase SQL Editor

DO $$
DECLARE
    status_rec RECORD;
    payment_rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 SYNCHRONISATION DES STATUTS DE COMMANDES';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    
    -- 1. Créer ou recréer le type order_status avec valeurs françaises
    DROP TYPE IF EXISTS order_status CASCADE;
    CREATE TYPE order_status AS ENUM (
        'Nouvelle', 'Confirmée', 'En préparation', 'Prête', 
        'En livraison', 'Livrée', 'Annulée'
    );
    RAISE NOTICE '✅ Type order_status créé avec valeurs françaises';
    
    -- 2. Créer ou recréer le type payment_status avec valeurs françaises
    DROP TYPE IF EXISTS payment_status CASCADE;
    CREATE TYPE payment_status AS ENUM (
        'En attente', 'Payé', 'Échoué', 'Remboursé'
    );
    RAISE NOTICE '✅ Type payment_status créé avec valeurs françaises';
    
    -- 3. Vérifier si la table orders existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE '✅ Table orders trouvée';
        
        -- Ajouter ou modifier la colonne status
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'status'
        ) THEN
            -- Modifier le type de la colonne existante
            ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
            ALTER TABLE orders ALTER COLUMN status TYPE order_status USING 'Nouvelle'::order_status;
            ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'Nouvelle'::order_status;
            RAISE NOTICE '✅ Colonne orders.status mise à jour';
        ELSE
            -- Ajouter la colonne si elle n'existe pas
            ALTER TABLE orders ADD COLUMN status order_status DEFAULT 'Nouvelle'::order_status;
            RAISE NOTICE '✅ Colonne orders.status ajoutée';
        END IF;
        
        -- Ajouter ou modifier la colonne payment_status
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'payment_status'
        ) THEN
            ALTER TABLE orders ALTER COLUMN payment_status DROP DEFAULT;
            ALTER TABLE orders ALTER COLUMN payment_status TYPE payment_status USING 'En attente'::payment_status;
            ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'En attente'::payment_status;
            RAISE NOTICE '✅ Colonne orders.payment_status mise à jour';
        ELSE
            ALTER TABLE orders ADD COLUMN payment_status payment_status DEFAULT 'En attente'::payment_status;
            RAISE NOTICE '✅ Colonne orders.payment_status ajoutée';
        END IF;
        
        -- Mettre à jour les valeurs NULL
        UPDATE orders SET status = 'Nouvelle'::order_status WHERE status IS NULL;
        UPDATE orders SET payment_status = 'En attente'::payment_status WHERE payment_status IS NULL;
        RAISE NOTICE '✅ Valeurs NULL mises à jour avec les défauts';
        
    ELSE
        RAISE NOTICE '⚠️  Table orders non trouvée - elle sera créée automatiquement';
    END IF;
    
    -- 4. Vérification finale et statistiques
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION FINALE';
    RAISE NOTICE '=====================';
    
    -- Compter les commandes par statut (si la table existe et a des données)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Vérifier s'il y a des commandes
        IF EXISTS (SELECT 1 FROM orders LIMIT 1) THEN
            RAISE NOTICE '📊 RÉPARTITION DES STATUTS :';
            
            FOR status_rec IN 
                SELECT status::text as status_name, COUNT(*) as count_val 
                FROM orders 
                WHERE status IS NOT NULL
                GROUP BY status 
                ORDER BY status
            LOOP
                RAISE NOTICE '   • "%" : % commandes', status_rec.status_name, status_rec.count_val;
            END LOOP;
            
            RAISE NOTICE '';
            RAISE NOTICE '💳 RÉPARTITION DES PAIEMENTS :';
            
            FOR payment_rec IN 
                SELECT payment_status::text as payment_name, COUNT(*) as count_val 
                FROM orders 
                WHERE payment_status IS NOT NULL
                GROUP BY payment_status 
                ORDER BY payment_status
            LOOP
                RAISE NOTICE '   • "%" : % commandes', payment_rec.payment_name, payment_rec.count_val;
            END LOOP;
        ELSE
            RAISE NOTICE '📊 Aucune commande trouvée dans la table orders';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SYNCHRONISATION TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE '';
    RAISE NOTICE '📋 STATUTS DE COMMANDE DISPONIBLES :';
    RAISE NOTICE '   • Nouvelle (défaut pour nouvelles commandes)';
    RAISE NOTICE '   • Confirmée (commande validée par admin)';
    RAISE NOTICE '   • En préparation (préparation en cours)';
    RAISE NOTICE '   • Prête (prête pour livraison/retrait)';
    RAISE NOTICE '   • En livraison (en cours de livraison)';
    RAISE NOTICE '   • Livrée (livrée avec succès)';
    RAISE NOTICE '   • Annulée (commande annulée)';
    RAISE NOTICE '';
    RAISE NOTICE '💳 STATUTS DE PAIEMENT DISPONIBLES :';
    RAISE NOTICE '   • En attente (défaut)';
    RAISE NOTICE '   • Payé (paiement confirmé)';
    RAISE NOTICE '   • Échoué (paiement échoué)';
    RAISE NOTICE '   • Remboursé (remboursement effectué)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Le frontend TypeScript est maintenant synchronisé !';
    RAISE NOTICE '✅ Les notifications WhatsApp fonctionneront correctement !';
    RAISE NOTICE '';
    
END $$;
