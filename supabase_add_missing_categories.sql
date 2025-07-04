-- Script pour ajouter les catégories manquantes dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Vérifier les catégories existantes
SELECT id, name, icon, color, sort_order, is_active 
FROM categories 
ORDER BY sort_order;

-- Insérer les catégories manquantes si elles n'existent pas déjà
-- Utilisation de INSERT avec vérification d'existence

-- Spiritueux
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Spiritueux', 'spiritueux', '🥃', '#8B4513', 1, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Spiritueux');

-- Vins
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Vins', 'vins', '🍷', '#722F37', 2, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Vins');

-- Champagnes
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Champagnes', 'champagnes', '🥂', '#FFD700', 3, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Champagnes');

-- Bières
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Bières', 'bieres', '🍺', '#FFA500', 4, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bières');

-- Liqueurs
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Liqueurs', 'liqueurs', '🍸', '#FF69B4', 5, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Liqueurs');

-- Cocktails
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Cocktails', 'cocktails', '🍹', '#00CED1', 6, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cocktails');

-- Formules
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Formules', 'formules', '🎁', '#32CD32', 7, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Formules');

-- Apéritifs
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Apéritifs', 'aperitifs', '🍾', '#9370DB', 8, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Apéritifs');

-- Digestifs
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Digestifs', 'digestifs', '🥃', '#8B4513', 9, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Digestifs');

-- Sans Alcool
INSERT INTO categories (name, slug, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 'Sans Alcool', 'sans-alcool', '🥤', '#00FF7F', 10, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sans Alcool');

-- Vérifier le résultat
SELECT id, name, icon, color, sort_order, is_active 
FROM categories 
WHERE is_active = true
ORDER BY sort_order;

-- Compter le nombre de catégories actives
SELECT COUNT(*) as total_categories_actives FROM categories WHERE is_active = true;
