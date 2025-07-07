-- =====================================================
-- MISE À JOUR DES CATÉGORIES COCKTAILS AKANDA
-- Basé sur le fichier categories_cocktails_akanda_simplifies
-- =====================================================

-- Mise à jour des catégories pour les cocktails selon le fichier de référence

-- 🎉 Réunion familiale & entre amis
UPDATE cocktails_maison 
SET category = 'Réunion familiale & entre amis'
WHERE name IN ('Mojito', 'Piña Colada', 'Dark ''n'' Stormy', 'Cosmopolitan', 'Margarita');

-- 🎂 Anniversaire festif  
UPDATE cocktails_maison 
SET category = 'Anniversaire festif'
WHERE name IN ('Mai Tai', 'Tequila Sunrise', 'Whisky Sour');

-- ❤️ Ambiance romantique
UPDATE cocktails_maison 
SET category = 'Ambiance romantique'
WHERE name IN ('French 75', 'Espresso Martini');

-- 🌍 Cocktails gabonais inspirés du terroir
UPDATE cocktails_maison 
SET category = 'Cocktails gabonais'
WHERE name IN ('Ndoss Mix', 'Lambar Cocktail', 'Okoumé Sunset', 'Bissap Breeze');

-- Mise à jour des mocktails
UPDATE mocktails 
SET category = 'Mocktails sans alcool'
WHERE name IN ('Zébu-Fizz', 'Pink Banana', 'CocoKids');

-- Vérification des mises à jour
SELECT 'COCKTAILS PAR CATÉGORIE' as info;

SELECT category, COUNT(*) as nombre_cocktails, 
       STRING_AGG(name, ', ') as cocktails_list
FROM cocktails_maison 
WHERE is_active = true
GROUP BY category 
ORDER BY category;

SELECT 'MOCKTAILS PAR CATÉGORIE' as info;

SELECT category, COUNT(*) as nombre_mocktails,
       STRING_AGG(name, ', ') as mocktails_list  
FROM mocktails
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Vérification des cocktails sans catégorie
SELECT 'COCKTAILS SANS CATÉGORIE' as info;

SELECT name, category 
FROM cocktails_maison 
WHERE category IS NULL OR category = '' OR category = 'Classique'
ORDER BY name;

SELECT 'MOCKTAILS SANS CATÉGORIE' as info;

SELECT name, category 
FROM mocktails 
WHERE category IS NULL OR category = '' 
ORDER BY name;

SELECT 'MISE À JOUR TERMINÉE - Catégories synchronisées avec le fichier de référence' as status;
