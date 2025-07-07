-- =====================================================
-- AKANDA APÉRO - INGRÉDIENTS RESTANTS ET INSTRUCTIONS
-- Suite et fin du script d'insertion
-- =====================================================

-- =====================================================
-- INGRÉDIENTS COCKTAILS (SUITE)
-- =====================================================

-- Whisky Sour
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Whisky', '6', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Jus de citron', '3', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Sirop de sucre', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Tranche d''orange', '1', 'pièce', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Cerise', '1', 'pièce', 5),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 'Glaçons', 'Selon goût', 'pièces', 6);

-- French 75
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 'Gin', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 'Jus de citron', '2', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 'Sirop de sucre', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 'Champagne', 'Complément', 'ml', 4),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 'Glaçons', 'Selon goût', 'pièces', 5);

-- Espresso Martini
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 'Vodka', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 'Liqueur de café', '2', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 'Café expresso refroidi', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- Ndoss Mix
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 'Rhum brun', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 'Jus de mangue', '8', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 'Piment doux', '1', 'pincée', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- Lambar Cocktail
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 'Rhum', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 'Jus de corossol', '4', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 'Jus citron', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 'Sucre de canne', '1', 'c. à café', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 'Glaçons', 'Selon goût', 'pièces', 5);

-- Okoumé Sunset
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 'Gin', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 'Jus de pastèque', '4', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 'Jus citron', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 'Sirop de bissap', '1', 'cl', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 'Glaçons', 'Selon goût', 'pièces', 5);

-- Bissap Breeze
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 'Rhum léger', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 'Infusion de bissap', '6', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 'Jus citron vert', '2', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- =====================================================
-- INSTRUCTIONS DE PRÉPARATION COCKTAILS
-- =====================================================

-- Mojito
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 1, 'Écrase doucement citron, sucre et menthe avec le pilon'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 2, 'Ajoute le rhum et les glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 3, 'Complète avec l''eau gazeuse et remue'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito'), 4, 'Décore d''un brin de menthe');

-- Piña Colada
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 1, 'Mixe tous les ingrédients avec les glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 2, 'Verse dans un grand verre'),
((SELECT id FROM cocktails_maison WHERE name = 'Piña Colada'), 3, 'Décore avec un morceau d''ananas');

-- Dark 'n' Stormy
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 1, 'Remplis le verre de glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 2, 'Verse le rhum puis le citron'),
((SELECT id FROM cocktails_maison WHERE name = 'Dark ''n'' Stormy'), 3, 'Complète avec le ginger beer et remue délicatement');
