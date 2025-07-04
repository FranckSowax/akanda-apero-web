-- =====================================================
-- MISE À JOUR TABLE PRODUCT_OPTIONS
-- Ajout du champ image_url pour les photos des softs
-- =====================================================

-- Ajouter le champ image_url à la table product_options
ALTER TABLE product_options 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ajouter quelques options de soft par défaut avec images
INSERT INTO product_options (product_id, name, description, price_modifier, stock_quantity, is_default, is_active, sort_order, image_url) VALUES
-- Options pour tous les produits (softs génériques)
((SELECT id FROM products LIMIT 1), 'Coca-Cola', 'Boisson gazeuse classique', 0, 100, true, true, 1, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300'),
((SELECT id FROM products LIMIT 1), 'Sprite', 'Limonade rafraîchissante', 0, 100, false, true, 2, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300'),
((SELECT id FROM products LIMIT 1), 'Fanta Orange', 'Soda à l''orange pétillant', 0, 100, false, true, 3, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300'),
((SELECT id FROM products LIMIT 1), 'Jus d''Orange', 'Jus d''orange frais 100% naturel', 500, 50, false, true, 4, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300'),
((SELECT id FROM products LIMIT 1), 'Jus de Mangue', 'Jus de mangue tropical', 500, 50, false, true, 5, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300'),
((SELECT id FROM products LIMIT 1), 'Eau Minérale', 'Eau minérale naturelle', -200, 200, false, true, 6, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300'),
((SELECT id FROM products LIMIT 1), 'Eau Gazeuse', 'Eau pétillante rafraîchissante', 0, 150, false, true, 7, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300'),
((SELECT id FROM products LIMIT 1), 'Thé Glacé', 'Thé glacé au citron', 300, 75, false, true, 8, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300')
ON CONFLICT DO NOTHING;

-- Créer un index pour optimiser les requêtes sur les options de produits
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_active ON product_options(is_active) WHERE is_active = true;
