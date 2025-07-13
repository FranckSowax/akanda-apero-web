-- Script pour ajouter les colonnes GPS à une table orders existante
-- Exécutez ce script si la table orders existe déjà sans les colonnes GPS

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
        RAISE NOTICE 'Colonne gps_latitude ajoutée';
    ELSE
        RAISE NOTICE 'Colonne gps_latitude existe déjà';
    END IF;

    -- Vérifier et ajouter gps_longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'gps_longitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN gps_longitude DECIMAL(11, 8);
        RAISE NOTICE 'Colonne gps_longitude ajoutée';
    ELSE
        RAISE NOTICE 'Colonne gps_longitude existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_address si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE 'Colonne delivery_address ajoutée';
    ELSE
        RAISE NOTICE 'Colonne delivery_address existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_district si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_district'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_district TEXT;
        RAISE NOTICE 'Colonne delivery_district ajoutée';
    ELSE
        RAISE NOTICE 'Colonne delivery_district existe déjà';
    END IF;

    -- Vérifier et ajouter total_amount si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Colonne total_amount ajoutée';
    ELSE
        RAISE NOTICE 'Colonne total_amount existe déjà';
    END IF;

    -- Vérifier et ajouter delivery_fee si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_fee'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Colonne delivery_fee ajoutée';
    ELSE
        RAISE NOTICE 'Colonne delivery_fee existe déjà';
    END IF;

    -- Vérifier et ajouter discount_amount si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'discount_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Colonne discount_amount ajoutée';
    ELSE
        RAISE NOTICE 'Colonne discount_amount existe déjà';
    END IF;
END $$;

-- 2. Créer l'index spatial pour les coordonnées GPS
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(gps_latitude, gps_longitude);

-- 3. Créer ou recréer la vue orders_complete avec les bonnes colonnes
DROP VIEW IF EXISTS orders_complete;

CREATE OR REPLACE VIEW orders_complete AS
SELECT 
    o.*,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.email as customer_email,
    c.phone as customer_phone,
    -- Générer les liens de navigation directement
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
    -- Compter les articles
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
    -- Calculer le temps depuis la création
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 as hours_since_created
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- 4. Créer ou recréer la vue order_statistics
DROP VIEW IF EXISTS order_statistics;

CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery') THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN status = 'delivered' THEN total_amount END), 0) as average_order_value,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_orders,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_orders
FROM orders;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Migration terminée !';
    RAISE NOTICE '📍 Colonnes GPS ajoutées à la table orders';
    RAISE NOTICE '🗺️ Vue orders_complete mise à jour avec liens de navigation';
    RAISE NOTICE '📊 Vue order_statistics mise à jour';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Vous pouvez maintenant tester l''API Orders !';
END $$;
