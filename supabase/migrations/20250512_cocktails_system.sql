-- Tables et fonctions pour le système de cocktails

-- Table pour stocker les cocktails
CREATE TABLE IF NOT EXISTS cocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  difficulty TEXT,
  ingredients JSONB,
  method JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour associer des produits à des ingrédients
CREATE TABLE IF NOT EXISTS ingredient_product_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les kits de cocktails générés
CREATE TABLE IF NOT EXISTS cocktail_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cocktail_id UUID REFERENCES cocktails(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les produits inclus dans chaque kit
CREATE TABLE IF NOT EXISTS cocktail_kit_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id UUID REFERENCES cocktail_kits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonctions et triggers pour la mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cocktails_updated_at
BEFORE UPDATE ON cocktails
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cocktail_kits_updated_at
BEFORE UPDATE ON cocktail_kits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Index pour accélérer les recherches
CREATE INDEX IF NOT EXISTS idx_ingredient_name ON ingredient_product_mapping(ingredient_name);
CREATE INDEX IF NOT EXISTS idx_cocktail_kit_is_active ON cocktail_kits(is_active);

-- Politiques RLS pour la sécurité
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_product_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_kit_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cocktails are viewable by everyone" 
ON cocktails FOR SELECT USING (true);

CREATE POLICY "Ingredient mappings are viewable by everyone" 
ON ingredient_product_mapping FOR SELECT USING (true);

CREATE POLICY "Cocktail kits are viewable by everyone" 
ON cocktail_kits FOR SELECT USING (is_active = true);

CREATE POLICY "Cocktail kit products are viewable by everyone" 
ON cocktail_kit_products FOR SELECT USING (true);

-- Politiques d'insertion et de modification pour les admins uniquement
CREATE POLICY "Only admins can insert/update/delete cocktails"
ON cocktails FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can insert/update/delete ingredient mappings"
ON ingredient_product_mapping FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can insert/update/delete cocktail kits"
ON cocktail_kits FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can insert/update/delete cocktail kit products"
ON cocktail_kit_products FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
