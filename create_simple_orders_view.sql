-- Version simplifiée de la vue orders_complete
-- À exécuter dans Supabase SQL Editor

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS orders_complete;

-- Créer une vue simple avec seulement les colonnes qui existent
CREATE VIEW orders_complete AS
SELECT 
    o.*,
    
    -- Informations client
    c.email as customer_email,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.phone as customer_phone,
    c.whatsapp_number as customer_whatsapp,
    
    -- Agrégation des articles de commande (optionnel)
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_image', oi.product_image,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
    ) as items

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY 
    o.id, c.id
ORDER BY o.created_at DESC;

-- Test simple
SELECT COUNT(*) as total_orders FROM orders_complete;

-- Afficher une commande pour vérifier
SELECT * FROM orders_complete LIMIT 1;
