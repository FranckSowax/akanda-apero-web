-- =====================================================
-- MISE À JOUR DES EMOJIS MANQUANTS DES CATÉGORIES
-- Script pour corriger les 3 catégories restantes avec emoji 📦
-- =====================================================

-- Vérifier les catégories avec emoji générique 📦
SELECT name, icon as emoji_actuel, slug, sort_order 
FROM categories 
WHERE icon = '📦'
ORDER BY sort_order;

-- Mise à jour des 3 catégories manquantes

-- Digestifs : 📦 → 🥃 (digestif après repas)
UPDATE categories 
SET icon = '🥃', updated_at = NOW()
WHERE name = 'Digestifs';

-- Glaçons : 📦 → 🧊 (glaçons/glace)
UPDATE categories 
SET icon = '🧊', updated_at = NOW()
WHERE name = 'Glaçons';

-- Sans Alcool : 📦 → 🥤 (boissons sans alcool)
UPDATE categories 
SET icon = '🥤', updated_at = NOW()
WHERE name = 'Sans Alcool';

-- Vérifier qu'il ne reste plus d'emoji générique 📦
SELECT name, icon as nouvel_emoji, slug, sort_order 
FROM categories 
WHERE icon = '📦'
ORDER BY sort_order;

-- Afficher toutes les catégories avec leurs nouveaux emojis
SELECT name, icon as emoji_final, slug, sort_order 
FROM categories 
WHERE is_active = true
ORDER BY sort_order;

-- Résumé final
SELECT 
  'Mise à jour terminée' as statut,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN icon = '📦' THEN 1 END) as categories_avec_emoji_generique,
  COUNT(CASE WHEN icon != '📦' THEN 1 END) as categories_avec_emojis_specifiques
FROM categories 
WHERE is_active = true;
