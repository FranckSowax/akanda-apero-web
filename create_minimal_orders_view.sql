-- Version ultra-simplifiée de la vue orders_complete
-- À exécuter dans Supabase SQL Editor

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS orders_complete;

-- Créer une vue minimale avec seulement les colonnes de base
CREATE VIEW orders_complete AS
SELECT 
    o.*,
    
    -- Informations client de base
    c.email as customer_email,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    c.phone as customer_phone

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

-- Test simple
SELECT COUNT(*) as total_orders FROM orders_complete;

-- Afficher une commande pour vérifier
SELECT * FROM orders_complete LIMIT 1;
