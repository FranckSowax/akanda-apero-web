-- Script pour nettoyer les noms de produits qui se terminent par " 0"
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Vérifier d'abord quels produits ont des noms se terminant par " 0"
SELECT id, name, 
       CASE 
         WHEN name LIKE '% 0' THEN TRIM(SUBSTRING(name FROM 1 FOR LENGTH(name) - 2))
         ELSE name 
       END as cleaned_name
FROM products 
WHERE name LIKE '% 0';

-- 2. Si les résultats sont corrects, exécuter la mise à jour
UPDATE products 
SET name = TRIM(SUBSTRING(name FROM 1 FOR LENGTH(name) - 2))
WHERE name LIKE '% 0';

-- 3. Vérifier le résultat
SELECT id, name FROM products ORDER BY name;
