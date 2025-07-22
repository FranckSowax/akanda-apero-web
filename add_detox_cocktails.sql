-- Script pour ajouter les nouveaux cocktails détox et mettre à jour les existants
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les nouveaux cocktails détox (sans alcool)
INSERT INTO cocktails_maison (
  name, 
  description, 
  ingredients, 
  recipe, 
  price, 
  category, 
  alcohol_percentage, 
  preparation_time, 
  difficulty, 
  image_url,
  is_available
) VALUES 
-- Green Detox
(
  'Green Detox',
  'Cocktail détox rafraîchissant aux légumes verts, riche en vitamines et minéraux',
  '½ concombre frais, 1 pomme verte, Jus d''½ citron, Une poignée d''épinards frais, 20 cl d''eau fraîche',
  '1. Coupe concombre et pomme en morceaux. 2. Mixe-les avec épinards, jus de citron et eau dans un blender. 3. Filtre légèrement si nécessaire et sers frais.',
  2500,
  'detox',
  0,
  10,
  'facile',
  'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=500&fit=crop',
  true
),
-- Menthe-Citron Detox
(
  'Menthe-Citron Detox',
  'Boisson détox rafraîchissante à la menthe et citron, parfaite pour stimuler la digestion',
  'Jus d''1 citron frais, 10 feuilles de menthe fraîche, 25 cl d''eau pétillante, 1 cuillère à café de miel (optionnel), Glaçons',
  '1. Presse le citron dans un verre, ajoute la menthe et écrase légèrement. 2. Complète avec eau pétillante, miel et glaçons. 3. Remue doucement avant dégustation.',
  2000,
  'detox',
  0,
  5,
  'facile',
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=500&fit=crop',
  true
),
-- Citrus Immunity
(
  'Citrus Immunity',
  'Cocktail détox aux agrumes et gingembre pour renforcer l''immunité',
  '1 orange pressée, ½ pamplemousse pressé, Jus d''½ citron, 1 cm de gingembre frais râpé, 20 cl d''eau plate',
  '1. Mélange tous les jus d''agrumes avec le gingembre râpé. 2. Complète avec l''eau fraîche. 3. Serre immédiatement avec des glaçons.',
  2800,
  'detox',
  0,
  8,
  'facile',
  'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&h=500&fit=crop',
  true
),
-- Avocado Colada (cocktail détox alcoolisé)
(
  'Avocado Colada',
  'L''exotisme au naturel - Cocktail détox alcoolisé à l''avocat et ananas',
  '½ avocat mûr, 5 cl rhum blanc, 5 cl jus d''ananas frais, 4 cl lait de coco, 1 c. à café de miel, Glaçons',
  '1. Mets tous les ingrédients dans un blender. 2. Mixe jusqu''à texture parfaitement lisse. 3. Verse dans un grand verre et décore avec un quartier d''ananas.',
  4500,
  'detox',
  12,
  8,
  'moyen',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=500&fit=crop',
  true
),
-- Avo-Gin Detox (cocktail détox alcoolisé)
(
  'Avo-Gin Detox',
  'Fraîcheur & équilibre - Cocktail détox au gin et avocat',
  '½ avocat mûr, 4 cl gin, Jus d''½ citron vert, 1 c. à café de sirop d''agave ou miel, 15 cl d''eau pétillante, Feuilles de menthe, Glaçons',
  '1. Mixe l''avocat avec le gin, citron vert, sirop d''agave dans un blender jusqu''à obtention d''une crème lisse. 2. Verse le mélange dans un verre rempli de glaçons. 3. Complète doucement avec l''eau pétillante. 4. Décore avec des feuilles de menthe et une rondelle de citron vert.',
  4200,
  'detox',
  10,
  10,
  'moyen',
  'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=500&fit=crop',
  true
);

-- 2. Ajouter le nouveau mocktail
INSERT INTO mocktails (
  name, 
  description, 
  ingredients, 
  recipe, 
  price, 
  preparation_time, 
  difficulty, 
  image_url,
  is_available,
  alcohol_percentage
) VALUES 
-- Avo-Banane Smoothie
(
  'Avo-Banane Smoothie',
  'Douceur crémeuse & saine - Smoothie détox pour enfants à l''avocat et banane',
  '½ avocat mûr, 1 banane mûre, 15 cl lait d''amande ou lait classique, 1 c. à café de miel (optionnel), Glaçons',
  '1. Place l''avocat et la banane dans un blender. 2. Verse le lait d''amande et le miel. 3. Mixe jusqu''à obtenir une texture onctueuse. 4. Sers immédiatement avec des glaçons.',
  2200,
  5,
  'facile',
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&h=500&fit=crop',
  true,
  0
);

-- 3. Mettre à jour les recettes existantes Margarita et Mojito
UPDATE cocktails_maison 
SET 
  ingredients = '5 cl tequila, 2 cl triple sec, 2 cl jus de citron vert, Sel pour le bord, Glaçons',
  recipe = '1. Humidifie le bord du verre, trempe-le dans du sel. 2. Secoue tequila, triple sec et citron dans un shaker. 3. Verse sur glaçons dans le verre, décore d''une rondelle de citron.',
  preparation_time = 5,
  difficulty = 'facile'
WHERE LOWER(name) LIKE '%margarita%';

UPDATE cocktails_maison 
SET 
  ingredients = '5 cl de rhum blanc, ½ citron vert (coupé en quartiers), 2 c. à café de sucre de canne, 6 feuilles de menthe, Eau gazeuse, Glaçons (idéalement pilés)',
  recipe = '1. Mets le citron, le sucre et la menthe dans un verre. 2. Utilise le muddler pour presser doucement. 3. Ajoute le rhum, des glaçons, puis l''eau gazeuse. 4. Remue avec la cuillère et garnis d''un brin de menthe fraîche.',
  preparation_time = 5,
  difficulty = 'facile'
WHERE LOWER(name) LIKE '%mojito%';

-- 4. Vérification des données ajoutées
SELECT 'Cocktails détox ajoutés:' as info;
SELECT name, category, price, alcohol_percentage FROM cocktails_maison WHERE category = 'detox';

SELECT 'Nouveau mocktail ajouté:' as info;
SELECT name, price FROM mocktails WHERE name = 'Avo-Banane Smoothie';

SELECT 'Recettes mises à jour:' as info;
SELECT name, preparation_time, difficulty FROM cocktails_maison WHERE LOWER(name) LIKE '%margarita%' OR LOWER(name) LIKE '%mojito%';
