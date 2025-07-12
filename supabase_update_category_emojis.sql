-- =====================================================
-- MISE À JOUR DES EMOJIS DES CATÉGORIES
-- Script pour améliorer les emojis des catégories
-- =====================================================

-- Vérifier les emojis actuels
SELECT name, icon as emoji_actuel, slug, sort_order 
FROM categories 
ORDER BY sort_order;

-- Mise à jour des emojis pour une meilleure représentation visuelle

-- Liqueurs : 📦 → 🍸 (plus représentatif)
UPDATE categories 
SET icon = '🍸', updated_at = NOW()
WHERE name = 'Liqueurs';

-- Spiritueux : 📦 → 🥃 (whisky/cognac typique)
UPDATE categories 
SET icon = '🥃', updated_at = NOW()
WHERE name = 'Spiritueux';

-- Champagnes : 🍾 → 🥂 (plus festif)
UPDATE categories 
SET icon = '🥂', updated_at = NOW()
WHERE name = 'Champagnes';

-- Cocktails : 🍸 → 🍹 (plus coloré/tropical)
UPDATE categories 
SET icon = '🍹', updated_at = NOW()
WHERE name = 'Cocktails';

-- Apéritifs & sucreries : 📦 → 🥜 (représente mieux)
UPDATE categories 
SET icon = '🥜', updated_at = NOW()
WHERE name = 'Apéritifs & sucreries';

-- Sodas & jus : 📦 → 🥤 (plus approprié)
UPDATE categories 
SET icon = '🥤', updated_at = NOW()
WHERE name = 'Sodas & jus';

-- Apéritifs : 📦 → 🍾 (bouteille d'apéritif)
UPDATE categories 
SET icon = '🍾', updated_at = NOW()
WHERE name = 'Apéritifs';

-- Dépannage : 📦 → ⚡ (urgence/rapidité)
UPDATE categories 
SET icon = '⚡', updated_at = NOW()
WHERE name = 'Dépannage';

-- Vérifier les résultats après mise à jour
SELECT name, icon as nouvel_emoji, slug, sort_order 
FROM categories 
ORDER BY sort_order;

-- Afficher un résumé des changements
SELECT 
  'Mise à jour terminée' as statut,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN icon != '📦' THEN 1 END) as categories_avec_emojis_specifiques
FROM categories 
WHERE is_active = true;
