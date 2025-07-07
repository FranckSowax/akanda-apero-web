-- =====================================================
-- AKANDA APÉRO - INSERTION MOCKTAILS ET INGRÉDIENTS
-- Suite du script principal
-- =====================================================

-- =====================================================
-- INSERTION DES MOCKTAILS (3 mocktails sans alcool)
-- =====================================================

-- 1. Zébu-Fizz
INSERT INTO mocktails (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, is_active, is_featured) VALUES
('Zébu-Fizz', 'Les bulles tropicales qui pétillent de joie', '🥤', 1, 3, 1500, 'tropical', true, true);

-- 2. Pink Banana
INSERT INTO mocktails (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, is_active, is_featured) VALUES
('Pink Banana', 'La douceur fruitée qui fait sourire les enfants', '🍌', 2, 4, 1800, 'fruité', true, true);

-- 3. CocoKids
INSERT INTO mocktails (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, is_active, is_featured) VALUES
('CocoKids', 'L''île paradisiaque version enfantine', '🥥', 2, 4, 1700, 'tropical', true, true);

-- =====================================================
-- INSERTION DES INGRÉDIENTS COCKTAILS
-- =====================================================

-- Mojito
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Rhum blanc', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Citron vert', '½', 'pièce', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Sucre de canne', '2', 'c. à café', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Feuilles de menthe', '6', 'pièces', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Eau gazeuse', 'Complément', 'ml', 5),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 'Glaçons', 'Selon goût', 'pièces', 6);

-- Piña Colada
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 'Rhum blanc', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 'Jus d''ananas', '10', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 'Crème coco', '4', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- Dark 'n' Stormy
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 'Rhum ambré', '6', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 'Ginger beer', '10', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 'Citron vert', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- Cosmopolitan
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 'Vodka', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 'Triple sec', '2', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 'Jus de cranberry', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 'Jus de citron vert', '1', 'cl', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 'Glaçons', 'Selon goût', 'pièces', 5);

-- Margarita
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 'Tequila', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 'Triple sec', '2', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 'Jus de citron vert', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 'Sel pour le bord', 'Selon goût', 'pincée', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 'Glaçons', 'Selon goût', 'pièces', 5);

-- Mai Tai
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Rhum blanc', '3', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Rhum ambré', '3', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Triple sec', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Jus citron vert', '2', 'cl', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Sirop d''orgeat', '1', 'cl', 5),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 'Glaçons', 'Selon goût', 'pièces', 6);

-- Tequila Sunrise
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 'Tequila', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 'Jus d''orange frais', '10', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 'Grenadine', '1', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 'Glaçons', 'Selon goût', 'pièces', 4);
