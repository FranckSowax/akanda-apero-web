-- Migration pour créer la table de synchronisation des paniers utilisateurs
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table user_carts pour synchroniser les paniers
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  promo_code TEXT,
  promo_discount NUMERIC(10,2) DEFAULT 0,
  delivery_option TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte pour s'assurer qu'un utilisateur n'a qu'un seul panier
  CONSTRAINT unique_user_cart UNIQUE(user_id)
);

-- 2. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_updated_at ON user_carts(updated_at);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Les utilisateurs ne peuvent voir que leur propre panier
CREATE POLICY "Users can view own cart" ON user_carts
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent insérer que leur propre panier
CREATE POLICY "Users can insert own cart" ON user_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent modifier que leur propre panier
CREATE POLICY "Users can update own cart" ON user_carts
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent supprimer que leur propre panier
CREATE POLICY "Users can delete own cart" ON user_carts
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Créer le trigger pour updated_at
CREATE TRIGGER update_user_carts_updated_at
  BEFORE UPDATE ON user_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Ajouter des commentaires pour la documentation
COMMENT ON TABLE user_carts IS 'Table pour synchroniser les paniers des utilisateurs entre appareils';
COMMENT ON COLUMN user_carts.items IS 'Articles du panier au format JSON avec product_id, quantity, etc.';
COMMENT ON COLUMN user_carts.promo_code IS 'Code promo appliqué au panier';
COMMENT ON COLUMN user_carts.promo_discount IS 'Montant de la remise en pourcentage ou valeur fixe';
COMMENT ON COLUMN user_carts.delivery_option IS 'Option de livraison choisie (standard, express, pickup)';

-- 8. Créer une vue pour faciliter les requêtes avec les détails des produits
CREATE OR REPLACE VIEW user_carts_with_products AS
SELECT 
  uc.id,
  uc.user_id,
  uc.items,
  uc.promo_code,
  uc.promo_discount,
  uc.delivery_option,
  uc.created_at,
  uc.updated_at,
  -- Calculer le nombre total d'articles
  (
    SELECT COALESCE(SUM((item->>'quantity')::integer), 0)
    FROM jsonb_array_elements(uc.items) AS item
  ) AS total_items,
  -- Calculer le montant total (nécessite de joindre avec les produits)
  (
    SELECT COALESCE(SUM((item->>'quantity')::integer * p.price), 0)
    FROM jsonb_array_elements(uc.items) AS item
    JOIN products p ON p.id = (item->>'product_id')::integer
    WHERE p.is_active = true
  ) AS total_amount
FROM user_carts uc;

-- 9. Ajouter des exemples de données pour les tests (optionnel)
-- INSERT INTO user_carts (user_id, items, delivery_option) VALUES
-- (
--   '00000000-0000-0000-0000-000000000000', -- Remplacer par un vrai UUID utilisateur
--   '[{"product_id": 1, "quantity": 2, "price": 2500}]'::jsonb,
--   'standard'
-- );

-- 10. Vérification de la migration
SELECT 
  'Migration user_carts completed successfully' as status,
  COUNT(*) as existing_carts
FROM user_carts;
