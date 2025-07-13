-- Script simple pour ajouter seulement les colonnes GPS essentielles
-- Version minimale sans vues complexes

-- 1. Ajouter les colonnes GPS si elles n'existent pas
DO $$
BEGIN
    -- Vérifier et ajouter gps_latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'gps_latitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN gps_latitude DECIMAL(10, 8);
        RAISE NOTICE '✅ Colonne gps_latitude ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne gps_latitude existe déjà';
    END IF;

    -- Vérifier et ajouter gps_longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'gps_longitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN gps_longitude DECIMAL(11, 8);
        RAISE NOTICE '✅ Colonne gps_longitude ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne gps_longitude existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_address si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE '✅ Colonne delivery_address ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_address existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_district si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_district'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_district TEXT;
        RAISE NOTICE '✅ Colonne delivery_district ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_district existe déjà';
    END IF;

    -- Vérifier et ajouter total_amount si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne total_amount ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne total_amount existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_fee si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_fee'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne delivery_fee ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne delivery_fee existe déjà';
    END IF;

    -- Vérifier et ajouter discount_amount si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'discount_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Colonne discount_amount ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne discount_amount existe déjà';
    END IF;
END $$;

-- 2. Créer l'index spatial pour les coordonnées GPS
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(gps_latitude, gps_longitude);

-- 3. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 MIGRATION TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE '';
    RAISE NOTICE '📍 Colonnes GPS ajoutées :';
    RAISE NOTICE '   - gps_latitude (DECIMAL 10,8)';
    RAISE NOTICE '   - gps_longitude (DECIMAL 11,8)';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Colonnes de livraison ajoutées :';
    RAISE NOTICE '   - delivery_address (TEXT)';
    RAISE NOTICE '   - delivery_district (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '🗺️ Index spatial créé :';
    RAISE NOTICE '   - idx_orders_location (gps_latitude, gps_longitude)';
    RAISE NOTICE '';
    RAISE NOTICE '💰 Colonnes de montants ajoutées :';
    RAISE NOTICE '   - total_amount (DECIMAL 10,2)';
    RAISE NOTICE '   - delivery_fee (DECIMAL 10,2)';
    RAISE NOTICE '   - discount_amount (DECIMAL 10,2)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÊT POUR LES TESTS !';
    RAISE NOTICE '   Testez l''API sur : http://localhost:3000/test-api';
    RAISE NOTICE '';
END $$;
