-- Script pour mettre à jour les icônes des catégories dans Supabase
-- Correspondance avec les icônes de la page produit

-- Mise à jour des icônes pour correspondre à la page produit
UPDATE categories SET emoji = '🎁' WHERE name = 'Formules';
UPDATE categories SET emoji = '🍷' WHERE name = 'Vins';
UPDATE categories SET emoji = '🍸' WHERE name = 'Liqueurs';
UPDATE categories SET emoji = '🍸' WHERE name = 'Spiritueux'; -- Spiritueux = Liqueurs
UPDATE categories SET emoji = '🍺' WHERE name = 'Bières';
UPDATE categories SET emoji = '🥂' WHERE name = 'Champagnes';
UPDATE categories SET emoji = '🍫' WHERE name = 'Apéritifs & sucreries';
UPDATE categories SET emoji = '🍫' WHERE name = 'Apéritifs';
UPDATE categories SET emoji = '🥤' WHERE name = 'Sodas & jus';
UPDATE categories SET emoji = '🥤' WHERE name = 'Sodas';
UPDATE categories SET emoji = '🥤' WHERE name = 'Boissons';
UPDATE categories SET emoji = '🛒' WHERE name = 'Dépannage';
UPDATE categories SET emoji = '🧊' WHERE name = 'Glaçons';
UPDATE categories SET emoji = '🥤' WHERE name = 'Sans Alcool';
UPDATE categories SET emoji = '🍹' WHERE name = 'Cocktails';
UPDATE categories SET emoji = '🥃' WHERE name = 'Digestifs';

-- Vérification des mises à jour
SELECT id, name, emoji, description FROM categories ORDER BY name;
