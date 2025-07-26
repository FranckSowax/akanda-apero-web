-- Création de la table promotions pour le système de gestion dynamique
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  discount_amount DECIMAL(10,2),
  image_url TEXT,
  background_color VARCHAR(7) DEFAULT '#ef4444', -- Couleur de fond (hex)
  text_color VARCHAR(7) DEFAULT '#ffffff', -- Couleur du texte (hex)
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Pour les promotions mises en avant
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_ids UUID[] DEFAULT '{}', -- Array des IDs produits concernés
  promo_code VARCHAR(50) UNIQUE, -- Code promo optionnel
  max_uses INTEGER, -- Nombre maximum d'utilisations
  current_uses INTEGER DEFAULT 0, -- Utilisations actuelles
  min_order_amount DECIMAL(10,2), -- Montant minimum de commande
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_discount CHECK (
    (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR 
    (discount_percentage IS NULL AND discount_amount IS NOT NULL)
  )
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_featured ON promotions(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category_id);
CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions(sort_order);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- RLS (Row Level Security) - Lecture publique, écriture admin seulement
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les promotions actives
CREATE POLICY "Promotions publiques en lecture" ON promotions
  FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- Politique d'écriture pour les administrateurs (à adapter selon votre système d'auth)
CREATE POLICY "Promotions admin en écriture" ON promotions
  FOR ALL USING (auth.role() = 'authenticated');

-- Données d'exemple pour tester
INSERT INTO promotions (
  title,
  description,
  discount_percentage,
  image_url,
  background_color,
  text_color,
  start_date,
  end_date,
  is_active,
  is_featured,
  promo_code,
  max_uses
) VALUES 
(
  'Cocktails Premium',
  'Réduction exceptionnelle sur tous les cocktails premium',
  30,
  'https://i.imgur.com/ITqFZGC.jpg',
  '#ef4444',
  '#ffffff',
  NOW(),
  NOW() + INTERVAL '7 days',
  true,
  true,
  'COCKTAIL30',
  100
),
(
  'Whiskys d''Exception',
  'Découvrez notre sélection de whiskys premium',
  25,
  NULL,
  '#8b5a2b',
  '#ffffff',
  NOW(),
  NOW() + INTERVAL '5 days',
  true,
  false,
  'WHISKY25',
  50
),
(
  'Pack Bières Artisanales',
  'Offre spéciale sur nos bières artisanales',
  20,
  NULL,
  '#f59e0b',
  '#ffffff',
  NOW(),
  NOW() + INTERVAL '3 days',
  true,
  false,
  'BIERE20',
  75
);

-- Vérification des données insérées
SELECT 
  id,
  title,
  discount_percentage,
  start_date,
  end_date,
  is_active,
  is_featured,
  promo_code
FROM promotions 
ORDER BY sort_order, created_at DESC;
