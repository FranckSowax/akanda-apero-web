-- Script pour vérifier la structure actuelle de la table orders
-- Exécutez ce script pour voir quelles colonnes existent déjà

-- 1. Vérifier si la table orders existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Table orders existe';
    ELSE
        RAISE NOTICE '❌ Table orders n''existe pas';
    END IF;
END $$;

-- 2. Lister toutes les colonnes de la table orders
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier spécifiquement les colonnes GPS
DO $$
DECLARE
    gps_lat_exists BOOLEAN;
    gps_lng_exists BOOLEAN;
    total_amount_exists BOOLEAN;
    delivery_fee_exists BOOLEAN;
    discount_amount_exists BOOLEAN;
BEGIN
    -- Vérifier gps_latitude
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'gps_latitude'
        AND table_schema = 'public'
    ) INTO gps_lat_exists;

    -- Vérifier gps_longitude
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'gps_longitude'
        AND table_schema = 'public'
    ) INTO gps_lng_exists;

    -- Vérifier total_amount
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
        AND table_schema = 'public'
    ) INTO total_amount_exists;

    -- Vérifier delivery_fee
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_fee'
        AND table_schema = 'public'
    ) INTO delivery_fee_exists;

    -- Vérifier discount_amount
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'discount_amount'
        AND table_schema = 'public'
    ) INTO discount_amount_exists;

    -- Afficher les résultats
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION DES COLONNES REQUISES :';
    RAISE NOTICE '📍 gps_latitude: %', CASE WHEN gps_lat_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
    RAISE NOTICE '📍 gps_longitude: %', CASE WHEN gps_lng_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
    RAISE NOTICE '💰 total_amount: %', CASE WHEN total_amount_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
    RAISE NOTICE '🚚 delivery_fee: %', CASE WHEN delivery_fee_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
    RAISE NOTICE '🎯 discount_amount: %', CASE WHEN discount_amount_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
    RAISE NOTICE '';

    IF NOT (gps_lat_exists AND gps_lng_exists AND total_amount_exists AND delivery_fee_exists AND discount_amount_exists) THEN
        RAISE NOTICE '⚠️  COLONNES MANQUANTES DÉTECTÉES !';
        RAISE NOTICE '💡 Exécutez le script add_gps_columns.sql pour les ajouter';
    ELSE
        RAISE NOTICE '🎉 Toutes les colonnes requises sont présentes !';
        RAISE NOTICE '🧪 Vous pouvez tester l''API Orders';
    END IF;
END $$;
