-- =====================================================
-- MISE À JOUR DES CATÉGORIES COCKTAILS AKANDA
-- Basé sur le fichier categories_cocktails_akanda_simplifies
-- =====================================================

-- Mise à jour des catégories pour les cocktails selon le fichier de référence

-- 🎉 Tous les événements (catégorie par défaut - pas de mise à jour nécessaire)

-- 🏡 Famille & amis
UPDATE cocktails_maison 
SET category = 'Famille & amis'
WHERE name IN ('Mojito', 'Piña Colada', 'Dark ''n'' Stormy', 'Cosmopolitan', 'Margarita');

-- 🎂 Anniversaire
UPDATE cocktails_maison 
SET category = 'Anniversaire'
WHERE name IN ('Mai Tai', 'Tequila Sunrise', 'Whisky Sour');

-- 💕 Romantique
UPDATE cocktails_maison 
SET category = 'Romantique'
WHERE name IN ('French 75', 'Espresso Martini');

-- 🇬🇦 Local
UPDATE cocktails_maison 
SET category = 'Local'
WHERE name IN ('Ndoss Mix', 'Lambar Cocktail', 'Okoumé Sunset', 'Bissap Breeze');

-- 🚫 Sans alcool
UPDATE mocktails 
SET category = 'Sans alcool'
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
