-- Script pour insérer des données de test dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Insérer des catégories de test
INSERT INTO categories (name, description, icon, color, is_active, sort_order) VALUES
('🎁 Formules', 'Formules cocktails et bundles', '🎁', 'from-purple-100 to-purple-200', true, 1),
('🍷 Vins', 'Vins rouges, blancs et rosés', '🍷', 'from-red-100 to-red-200', true, 2),
('🍸 Liqueurs', 'Spiritueux et liqueurs premium', '🍸', 'from-pink-100 to-pink-200', true, 3),
('🍺 Bières', 'Bières locales et importées', '🍺', 'from-yellow-100 to-yellow-200', true, 4),
('🥂 Champagnes', 'Bulles festives et champagnes', '🥂', 'from-amber-100 to-amber-200', true, 5);

-- Insérer des produits vedette de test
INSERT INTO products (name, description, price, category_id, is_featured, is_active, stock_quantity, rating) VALUES
('Mojito Classique', 'Cocktail rafraîchissant à la menthe', 2500, (SELECT id FROM categories WHERE name = '🍸 Liqueurs' LIMIT 1), true, true, 50, 4.8),
('Whisky Sour', 'Cocktail équilibré citron-whisky', 3500, (SELECT id FROM categories WHERE name = '🍸 Liqueurs' LIMIT 1), true, true, 30, 4.7),
('Piña Colada', 'Cocktail tropical coco-ananas', 3000, (SELECT id FROM categories WHERE name = '🍸 Liqueurs' LIMIT 1), true, true, 25, 4.9),
('Margarita', 'Cocktail tequila-citron vert', 3200, (SELECT id FROM categories WHERE name = '🍸 Liqueurs' LIMIT 1), true, true, 40, 4.6),
('Cosmopolitan', 'Cocktail élégant vodka-cranberry', 3800, (SELECT id FROM categories WHERE name = '🍸 Liqueurs' LIMIT 1), true, true, 20, 4.8);

-- Insérer quelques produits non-vedette
INSERT INTO products (name, description, price, category_id, is_featured, is_active, stock_quantity, rating) VALUES
('Heineken', 'Bière blonde premium', 1500, (SELECT id FROM categories WHERE name = '🍺 Bières' LIMIT 1), false, true, 100, 4.2),
('Bordeaux Rouge', 'Vin rouge de Bordeaux', 8500, (SELECT id FROM categories WHERE name = '🍷 Vins' LIMIT 1), false, true, 15, 4.5),
('Champagne Brut', 'Champagne traditionnel', 12000, (SELECT id FROM categories WHERE name = '🥂 Champagnes' LIMIT 1), false, true, 8, 4.9);

-- Vérifier les données insérées
SELECT 'Catégories insérées:' as info;
SELECT id, name, icon, is_active FROM categories ORDER BY sort_order;

SELECT 'Produits vedette insérés:' as info;
SELECT p.id, p.name, p.price, c.name as category, p.is_featured, p.rating 
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE p.is_featured = true 
ORDER BY p.rating DESC;

SELECT 'Tous les produits:' as info;
SELECT p.id, p.name, p.price, c.name as category, p.is_featured 
FROM products p 
JOIN categories c ON p.category_id = c.id 
ORDER BY p.is_featured DESC, p.name;
