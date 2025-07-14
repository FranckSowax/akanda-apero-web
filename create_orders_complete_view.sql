-- Création de la vue orders_complete pour l'API
-- À exécuter dans Supabase SQL Editor

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS orders_complete;

-- Créer la vue orders_complete avec toutes les informations nécessaires
CREATE VIEW orders_complete AS
SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    o.status,
    o.payment_status,
    o.total_amount,
    o.subtotal,
    o.delivery_cost,
    o.discount,
    o.delivery_address,
    o.delivery_district,
    o.delivery_additional_info,
    o.payment_method,
    o.notes,
    o.created_at,
    o.updated_at,
    
    -- Informations client
    c.email as customer_email,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.phone as customer_phone,
    c.whatsapp_number as customer_whatsapp,
    
    -- Agrégation des articles de commande
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
    o.id, o.order_number, o.customer_id, o.status, o.payment_status,
    o.total_amount, o.subtotal, o.delivery_cost, o.discount,
    o.delivery_address, o.delivery_district, o.delivery_additional_info, 
    o.payment_method, o.notes, o.created_at, o.updated_at,
    c.email, c.first_name, c.last_name, c.phone, c.whatsapp_number
ORDER BY o.created_at DESC;

-- Vérifier que la vue fonctionne
SELECT COUNT(*) as total_orders FROM orders_complete;

-- Test avec une commande spécifique
SELECT * FROM orders_complete LIMIT 1;
