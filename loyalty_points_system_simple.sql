-- Script SQL simplifié pour le système de points de fidélité
-- À exécuter dans Supabase SQL Editor
-- Version sans dépendance aux enums problématiques

-- 1. S'assurer que la colonne loyalty_points existe dans la table customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;

-- 2. Supprimer la table loyalty_transactions si elle existe (pour éviter les conflits)
DROP TABLE IF EXISTS loyalty_transactions CASCADE;

-- 3. Créer la table loyalty_transactions avec la structure correcte
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  order_id UUID,
  points_earned INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'bonus', 'anniversary'
  source_category VARCHAR(50), -- 'aperos', 'cocktails_maison', 'bonus', 'anniversary'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ajouter les contraintes de clé étrangère
ALTER TABLE loyalty_transactions 
ADD CONSTRAINT loyalty_transactions_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Contrainte order_id optionnelle (peut ne pas exister si orders n'existe pas encore)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE loyalty_transactions 
    ADD CONSTRAINT loyalty_transactions_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Activer RLS sur la table loyalty_transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions" ON loyalty_transactions
FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Service can insert loyalty transactions" ON loyalty_transactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update loyalty transactions" ON loyalty_transactions
FOR UPDATE USING (true);

-- 7. Fonction pour calculer les points selon la catégorie
CREATE OR REPLACE FUNCTION calculate_loyalty_points(category TEXT, order_total DECIMAL DEFAULT 0)
RETURNS INTEGER AS $$
BEGIN
  CASE 
    WHEN category = 'aperos' THEN
      RETURN 10;
    WHEN category = 'cocktails_maison' THEN
      RETURN 15;
    WHEN category = 'bonus' THEN
      RETURN 50;
    WHEN category = 'anniversary' THEN
      RETURN 50;
    WHEN category = 'referral' THEN
      RETURN 25;
    ELSE
      RETURN 10; -- Points par défaut
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour ajouter des points à un client
CREATE OR REPLACE FUNCTION add_loyalty_points(
  customer_email TEXT,
  points INTEGER,
  transaction_type TEXT,
  source_category TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  order_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  customer_record customers%ROWTYPE;
BEGIN
  -- Trouver le client
  SELECT * INTO customer_record 
  FROM customers 
  WHERE email = customer_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client non trouvé avec l''email: %', customer_email;
  END IF;
  
  -- Mettre à jour les points du client
  UPDATE customers 
  SET 
    loyalty_points = COALESCE(loyalty_points, 0) + points,
    updated_at = NOW()
  WHERE id = customer_record.id;
  
  -- Enregistrer la transaction
  INSERT INTO loyalty_transactions (
    customer_id,
    order_id,
    points_earned,
    transaction_type,
    source_category,
    description
  ) VALUES (
    customer_record.id,
    order_id,
    points,
    transaction_type,
    source_category,
    COALESCE(description, 'Points gagnés: ' || points || ' pts')
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Fonction pour utiliser des points (rédemption)
CREATE OR REPLACE FUNCTION use_loyalty_points(
  customer_email TEXT,
  points INTEGER,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  customer_record customers%ROWTYPE;
  current_points INTEGER;
BEGIN
  -- Trouver le client
  SELECT * INTO customer_record 
  FROM customers 
  WHERE email = customer_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client non trouvé avec l''email: %', customer_email;
  END IF;
  
  current_points := COALESCE(customer_record.loyalty_points, 0);
  
  -- Vérifier si le client a assez de points
  IF current_points < points THEN
    RAISE EXCEPTION 'Points insuffisants. Points disponibles: %, Points demandés: %', current_points, points;
  END IF;
  
  -- Déduire les points
  UPDATE customers 
  SET 
    loyalty_points = loyalty_points - points,
    updated_at = NOW()
  WHERE id = customer_record.id;
  
  -- Enregistrer la transaction
  INSERT INTO loyalty_transactions (
    customer_id,
    points_used,
    transaction_type,
    description
  ) VALUES (
    customer_record.id,
    points,
    'redeem',
    COALESCE(description, 'Points utilisés: ' || points || ' pts')
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Fonction pour obtenir le niveau de fidélité d'un client
CREATE OR REPLACE FUNCTION get_loyalty_tier(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN points >= 300 THEN RETURN 'Diamant';
    WHEN points >= 200 THEN RETURN 'Platine';
    WHEN points >= 100 THEN RETURN 'Or';
    WHEN points >= 50 THEN RETURN 'Argent';
    ELSE RETURN 'Bronze';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 11. Vue pour les statistiques de fidélité des clients
CREATE OR REPLACE VIEW customer_loyalty_stats AS
SELECT 
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  COALESCE(c.loyalty_points, 0) as current_points,
  get_loyalty_tier(COALESCE(c.loyalty_points, 0)) as tier,
  COUNT(lt.id) as total_transactions,
  COALESCE(SUM(lt.points_earned), 0) as total_points_earned,
  COALESCE(SUM(lt.points_used), 0) as total_points_used,
  c.created_at as member_since
FROM customers c
LEFT JOIN loyalty_transactions lt ON c.id = lt.customer_id
GROUP BY c.id, c.email, c.first_name, c.last_name, c.loyalty_points, c.created_at;

-- 12. Fonction pour attribuer des points lors d'une commande (à appeler depuis l'API)
CREATE OR REPLACE FUNCTION award_points_for_order(
  customer_email TEXT,
  order_id UUID,
  category TEXT DEFAULT 'aperos'
)
RETURNS BOOLEAN AS $$
DECLARE
  points_to_award INTEGER;
  customer_record customers%ROWTYPE;
BEGIN
  -- Vérifier que la commande n'a pas déjà reçu des points
  IF EXISTS (
    SELECT 1 FROM loyalty_transactions 
    WHERE order_id = award_points_for_order.order_id 
    AND transaction_type = 'earn'
  ) THEN
    RAISE NOTICE 'Points déjà attribués pour cette commande';
    RETURN FALSE;
  END IF;
  
  -- Calculer les points
  points_to_award := calculate_loyalty_points(category);
  
  -- Trouver le client
  SELECT * INTO customer_record 
  FROM customers 
  WHERE email = customer_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client non trouvé avec l''email: %', customer_email;
  END IF;
  
  -- Ajouter les points
  PERFORM add_loyalty_points(
    customer_email,
    points_to_award,
    'earn',
    category,
    'Points gagnés pour commande ' || category,
    order_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 13. Ajouter quelques points de test pour les clients existants (optionnel)
-- Décommentez les lignes suivantes si vous voulez ajouter des points de test

-- UPDATE customers SET loyalty_points = 25 WHERE email LIKE '%@gmail.com' AND loyalty_points IS NULL LIMIT 3;
-- UPDATE customers SET loyalty_points = 75 WHERE email LIKE '%@yahoo.com' AND loyalty_points IS NULL LIMIT 2;
-- UPDATE customers SET loyalty_points = 150 WHERE email LIKE '%@hotmail.com' AND loyalty_points IS NULL LIMIT 1;

-- 14. Vérifications finales et messages de confirmation
SELECT 'Table loyalty_transactions créée avec succès' as status;
SELECT 'Fonctions de fidélité créées avec succès' as status;
SELECT 'Vue customer_loyalty_stats créée avec succès' as status;
SELECT 'Système de points de fidélité opérationnel' as status;

-- Afficher quelques statistiques
SELECT 
  COUNT(*) as total_customers,
  AVG(COALESCE(loyalty_points, 0)) as avg_points,
  MAX(COALESCE(loyalty_points, 0)) as max_points
FROM customers;

-- 15. Exemples d'utilisation
/*
-- Attribuer des points pour une commande Apéros (10 points)
SELECT award_points_for_order('client@example.com', 'uuid-de-la-commande', 'aperos');

-- Attribuer des points pour une commande Cocktails Maison (15 points)
SELECT award_points_for_order('client@example.com', 'uuid-de-la-commande', 'cocktails_maison');

-- Ajouter des points bonus anniversaire (50 points)
SELECT add_loyalty_points('client@example.com', 50, 'bonus', 'anniversary', 'Bonus anniversaire');

-- Utiliser des points pour une réduction
SELECT use_loyalty_points('client@example.com', 30, 'Réduction de 1500 FCFA sur commande');

-- Voir les statistiques d'un client
SELECT * FROM customer_loyalty_stats WHERE email = 'client@example.com';
*/

COMMENT ON TABLE loyalty_transactions IS 'Historique des transactions de points de fidélité';
COMMENT ON FUNCTION add_loyalty_points IS 'Ajoute des points de fidélité à un client';
COMMENT ON FUNCTION use_loyalty_points IS 'Utilise les points de fidélité d''un client';
COMMENT ON FUNCTION get_loyalty_tier IS 'Retourne le niveau de fidélité basé sur les points';
COMMENT ON FUNCTION award_points_for_order IS 'Attribue des points pour une commande spécifique (à appeler depuis l''API)';
COMMENT ON VIEW customer_loyalty_stats IS 'Vue des statistiques de fidélité des clients';
