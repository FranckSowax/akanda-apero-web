-- =====================================================
-- AKANDA APÉRO - INSERTION COCKTAILS COMPLETS
-- Basé sur cocktails_akanda_simplifies.md
-- 17 cocktails et mocktails avec ingrédients et instructions
-- =====================================================

-- Nettoyage des données existantes (optionnel)
-- DELETE FROM cocktail_instructions;
-- DELETE FROM cocktail_ingredients;
-- DELETE FROM mocktails;
-- DELETE FROM cocktails_maison;

-- =====================================================
-- INSERTION DES COCKTAILS MAISON (14 cocktails)
-- =====================================================

-- 1. Mojito - Réunion familiale
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Mojito', 'La fraîcheur cubaine qui réunit les cœurs', '🌿', 2, 5, 2500, 'classique', 11.0, true, true);

-- 2. Piña Colada - Réunion familiale  
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Piña Colada', 'L''évasion tropicale dans votre salon', '🥥', 2, 4, 3000, 'tropical', 12.0, true, true);

-- 3. Dark 'n' Stormy - Réunion familiale
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Dark ''n'' Stormy', 'L''orage tropical qui réveille vos papilles', '⛈️', 1, 3, 2800, 'tropical', 14.0, true, false);

-- 4. Cosmopolitan - Réunion familiale
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Cosmopolitan', 'L''élégance urbaine pour vos soirées chic', '🍸', 3, 5, 3200, 'classique', 15.0, true, true);

-- 5. Margarita - Réunion familiale
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Margarita', 'La fiesta mexicaine à la gabonaise', '🍹', 3, 5, 3100, 'classique', 16.0, true, true);

-- 6. Mai Tai - Anniversaire festif
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Mai Tai', 'Double rhum, double plaisir tropical', '🏝️', 4, 6, 3500, 'tropical', 18.0, true, true);

-- 7. Tequila Sunrise - Anniversaire festif
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Tequila Sunrise', 'Le coucher de soleil équatorial en verre', '🌅', 2, 4, 2900, 'tropical', 14.0, true, false);

-- 8. Whisky Sour - Anniversaire festif
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Whisky Sour', 'Le classique qui réchauffe les cœurs', '🥃', 3, 5, 3300, 'classique', 20.0, true, false);

-- 9. French 75 - Ambiance romantique
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('French 75', 'L''effervescence parisienne sous les tropiques', '🥂', 4, 5, 3800, 'signature', 16.0, true, true);

-- 10. Espresso Martini - Ambiance romantique
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Espresso Martini', 'L''énergie du café, la douceur du cocktail', '☕', 4, 5, 3600, 'signature', 18.0, true, true);

-- 11. Ndoss Mix - Cocktails gabonais
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Ndoss Mix', 'La mangue gabonaise rencontre les Caraïbes', '🥭', 3, 5, 3200, 'signature', 13.0, true, true);

-- 12. Lambar Cocktail - Cocktails gabonais
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Lambar Cocktail', 'Le goût unique du corossol équatorial', '🍃', 3, 5, 3400, 'signature', 12.0, true, false);

-- 13. Okoumé Sunset - Cocktails gabonais
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Okoumé Sunset', 'Les couleurs de Libreville dans votre verre', '🌺', 4, 6, 3700, 'signature', 14.0, true, true);

-- 14. Bissap Breeze - Cocktails gabonais
INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage, is_active, is_featured) VALUES
('Bissap Breeze', 'La fraîcheur de l''hibiscus au rhum des îles', '🌺', 3, 5, 3300, 'signature', 13.0, true, false);
