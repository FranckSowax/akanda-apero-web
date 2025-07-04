-- =====================================================
-- AJOUT DES COORDONNÉES GPS AUX COMMANDES
-- Pour intégration Waze et Google Maps
-- =====================================================

-- Ajouter les colonnes de géolocalisation à la table orders
ALTER TABLE orders 
ADD COLUMN delivery_latitude DECIMAL(10, 8),
ADD COLUMN delivery_longitude DECIMAL(11, 8),
ADD COLUMN delivery_location_address TEXT,
ADD COLUMN delivery_location_accuracy INTEGER; -- Précision en mètres

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN orders.delivery_latitude IS 'Latitude GPS du point de livraison pour navigation';
COMMENT ON COLUMN orders.delivery_longitude IS 'Longitude GPS du point de livraison pour navigation';
COMMENT ON COLUMN orders.delivery_location_address IS 'Adresse formatée obtenue via géolocalisation';
COMMENT ON COLUMN orders.delivery_location_accuracy IS 'Précision de la géolocalisation en mètres';

-- Créer un index spatial pour optimiser les requêtes géographiques
CREATE INDEX idx_orders_location ON orders(delivery_latitude, delivery_longitude);

-- Fonction pour calculer la distance entre deux points GPS (en km)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL,
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- Rayon de la Terre en km
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlng/2) * sin(dlng/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer les liens de navigation
CREATE OR REPLACE FUNCTION get_navigation_links(
    order_id UUID
) RETURNS JSON AS $$
DECLARE
    order_record RECORD;
    result JSON;
BEGIN
    -- Récupérer les informations de la commande
    SELECT 
        delivery_latitude,
        delivery_longitude,
        delivery_location_address,
        delivery_address
    INTO order_record
    FROM orders 
    WHERE id = order_id;
    
    -- Vérifier si les coordonnées existent
    IF order_record.delivery_latitude IS NULL OR order_record.delivery_longitude IS NULL THEN
        RETURN json_build_object(
            'error', 'Coordonnées GPS non disponibles pour cette commande'
        );
    END IF;
    
    -- Construire les liens de navigation
    result := json_build_object(
        'waze', 'https://waze.com/ul?ll=' || order_record.delivery_latitude || ',' || order_record.delivery_longitude || '&navigate=yes',
        'google_maps', 'https://www.google.com/maps/dir/?api=1&destination=' || order_record.delivery_latitude || ',' || order_record.delivery_longitude,
        'apple_maps', 'http://maps.apple.com/?daddr=' || order_record.delivery_latitude || ',' || order_record.delivery_longitude,
        'coordinates', json_build_object(
            'latitude', order_record.delivery_latitude,
            'longitude', order_record.delivery_longitude,
            'address', COALESCE(order_record.delivery_location_address, order_record.delivery_address)
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation :
-- SELECT get_navigation_links('uuid-de-la-commande');

-- Mettre à jour les commandes existantes avec des coordonnées par défaut (Libreville centre)
-- Vous pouvez ajuster ces coordonnées selon vos besoins
UPDATE orders 
SET 
    delivery_latitude = 0.3936,  -- Latitude de Libreville
    delivery_longitude = 9.4573, -- Longitude de Libreville
    delivery_location_address = 'Libreville, Gabon'
WHERE delivery_latitude IS NULL 
AND delivery_longitude IS NULL;

-- Créer une vue pour faciliter l'accès aux informations de livraison avec navigation
CREATE OR REPLACE VIEW orders_with_navigation AS
SELECT 
    o.*,
    CASE 
        WHEN o.delivery_latitude IS NOT NULL AND o.delivery_longitude IS NOT NULL THEN
            json_build_object(
                'waze', 'https://waze.com/ul?ll=' || o.delivery_latitude || ',' || o.delivery_longitude || '&navigate=yes',
                'google_maps', 'https://www.google.com/maps/dir/?api=1&destination=' || o.delivery_latitude || ',' || o.delivery_longitude,
                'apple_maps', 'http://maps.apple.com/?daddr=' || o.delivery_latitude || ',' || o.delivery_longitude,
                'coordinates', json_build_object(
                    'latitude', o.delivery_latitude,
                    'longitude', o.delivery_longitude,
                    'address', COALESCE(o.delivery_location_address, o.delivery_address)
                )
            )
        ELSE NULL
    END as navigation_links
FROM orders o;

-- Accorder les permissions nécessaires
GRANT SELECT ON orders_with_navigation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_navigation_links(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) TO anon, authenticated;
