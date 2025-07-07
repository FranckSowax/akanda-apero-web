-- =====================================================
-- AKANDA APÉRO - INSTRUCTIONS FINALES ET MOCKTAILS
-- Finalisation du script d'insertion complet
-- =====================================================

-- =====================================================
-- INSTRUCTIONS COCKTAILS (SUITE ET FIN)
-- =====================================================

-- Cosmopolitan
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 2, 'Filtre dans un verre à vin'),
((SELECT id FROM cocktails_maison WHERE name = 'Cosmopolitan'), 3, 'Décore d''un zeste de citron vert');

-- Margarita
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 1, 'Humidifie le bord du verre et trempe dans le sel'),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 2, 'Secoue tequila, triple sec et citron avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Margarita'), 3, 'Verse sur glaçons, décore d''une rondelle de citron');

-- Mai Tai
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 2, 'Verse dans un verre sur glace'),
((SELECT id FROM cocktails_maison WHERE name = 'Mai Tai'), 3, 'Décore avec une tranche d''orange et une cerise');

-- Tequila Sunrise
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 1, 'Mélange tequila et jus d''orange dans un verre plein de glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 2, 'Verse doucement la grenadine (effet dégradé)'),
((SELECT id FROM cocktails_maison WHERE name = 'Tequila Sunrise'), 3, 'Ne remue pas, décore d''une rondelle d''orange');

-- Whisky Sour
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 2, 'Verse dans un verre sur glace'),
((SELECT id FROM cocktails_maison WHERE name = 'Whisky Sour'), 3, 'Ajoute orange et cerise');

-- French 75
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 1, 'Secoue gin, citron et sirop avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 2, 'Filtre dans une flûte'),
((SELECT id FROM cocktails_maison WHERE name = 'French 75'), 3, 'Complète avec champagne, décore d''un zeste de citron');

-- Espresso Martini
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 2, 'Filtre dans un verre à vin'),
((SELECT id FROM cocktails_maison WHERE name = 'Espresso Martini'), 3, 'Décore avec 3 grains de café');

-- Ndoss Mix
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 2, 'Filtre dans un verre frais'),
((SELECT id FROM cocktails_maison WHERE name = 'Ndoss Mix'), 3, 'Décore avec une tranche de mangue');

-- Lambar Cocktail
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 2, 'Filtre dans un verre'),
((SELECT id FROM cocktails_maison WHERE name = 'Lambar Cocktail'), 3, 'Décore d''une feuille de menthe');

-- Okoumé Sunset
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 1, 'Secoue gin, pastèque et citron avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 2, 'Verse dans le verre et ajoute délicatement le sirop (effet dégradé)'),
((SELECT id FROM cocktails_maison WHERE name = 'Okoumé Sunset'), 3, 'Décore avec des petits fruits rouges');

-- Bissap Breeze
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 1, 'Secoue tous les ingrédients avec glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 2, 'Filtre dans un grand verre plein de glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Bissap Breeze'), 3, 'Décore avec une rondelle de citron');

-- =====================================================
-- INGRÉDIENTS MOCKTAILS
-- =====================================================

-- Zébu-Fizz
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 'Jus d''ananas', '5', 'cl', 1),
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 'Jus d''orange', '5', 'cl', 2),
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 'Eau gazeuse', 'Complément', 'ml', 3),
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- Pink Banana
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 'Banane', '½', 'pièce', 1),
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 'Lait', '10', 'cl', 2),
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 'Sirop de fraise', '3', 'cl', 3),
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- CocoKids
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 'Lait de coco', '6', 'cl', 1),
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 'Jus d''ananas', '6', 'cl', 2),
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 'Miel', '1', 'c. à café', 3),
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 'Glaçons', 'Selon goût', 'pièces', 4);

-- =====================================================
-- INSTRUCTIONS MOCKTAILS
-- =====================================================

-- Zébu-Fizz
INSERT INTO mocktail_instructions (mocktail_id, step_number, instruction) VALUES
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 1, 'Mélange les jus avec glaçons'),
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 2, 'Complète avec l''eau gazeuse'),
((SELECT id FROM mocktails WHERE name = 'Zébu-Fizz'), 3, 'Remue délicatement, décore d''une rondelle d''orange');

-- Pink Banana
INSERT INTO mocktail_instructions (mocktail_id, step_number, instruction) VALUES
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 1, 'Mixe tous les ingrédients jusqu''à consistance lisse'),
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 2, 'Verse dans un grand verre'),
((SELECT id FROM mocktails WHERE name = 'Pink Banana'), 3, 'Décore avec une fraise ou une paille colorée');

-- CocoKids
INSERT INTO mocktail_instructions (mocktail_id, step_number, instruction) VALUES
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 1, 'Mixe tous les ingrédients avec glaçons'),
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 2, 'Verse dans un verre frais'),
((SELECT id FROM mocktails WHERE name = 'CocoKids'), 3, 'Ajoute une paille colorée');

-- =====================================================
-- FINALISATION
-- =====================================================

-- Mise à jour des timestamps
UPDATE cocktails_maison SET updated_at = NOW();
UPDATE mocktails SET updated_at = NOW();

-- Message de confirmation
SELECT 'Insertion terminée : 14 cocktails et 3 mocktails avec ingrédients et instructions' as status;
