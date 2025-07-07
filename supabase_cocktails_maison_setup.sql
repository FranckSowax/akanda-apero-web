-- =====================================================
-- AKANDA APÉRO - SETUP COCKTAILS MAISON
-- Tables pour la fonctionnalité Cocktails Maison
-- =====================================================

-- =====================================================
-- TABLE COCKTAILS_MAISON (Cocktails pour événements)
-- =====================================================

CREATE TABLE IF NOT EXISTS cocktails_maison (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 étoiles
  preparation_time_minutes INTEGER DEFAULT 10,
  base_price INTEGER NOT NULL, -- Prix de base en FCFA
  category VARCHAR(50) DEFAULT 'classique', -- classique, tropical, signature
  alcohol_percentage DECIMAL(4,2),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_price CHECK (base_price > 0),
  CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5)
);

-- =====================================================
-- TABLE COCKTAIL_INGREDIENTS (Ingrédients des cocktails)
-- =====================================================

CREATE TABLE IF NOT EXISTS cocktail_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cocktail_id UUID REFERENCES cocktails_maison(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50) NOT NULL, -- "50ml", "2 cl", "1 pièce"
  unit VARCHAR(20) NOT NULL, -- ml, cl, pièce, trait
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cocktail_id, name)
);

-- =====================================================
-- TABLE COCKTAIL_INSTRUCTIONS (Étapes de préparation)
-- =====================================================

CREATE TABLE IF NOT EXISTS cocktail_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cocktail_id UUID REFERENCES cocktails_maison(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cocktail_id, step_number)
);

-- =====================================================
-- TABLE MOCKTAILS (Cocktails sans alcool)
-- =====================================================

CREATE TABLE IF NOT EXISTS mocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  base_price INTEGER NOT NULL, -- Prix de base en FCFA
  preparation_time_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_price CHECK (base_price > 0)
);

-- =====================================================
-- TABLE MOCKTAIL_INGREDIENTS (Ingrédients des mocktails)
-- =====================================================

CREATE TABLE IF NOT EXISTS mocktail_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mocktail_id UUID REFERENCES mocktails(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(mocktail_id, name)
);

-- =====================================================
-- TABLE COCKTAIL_OPTIONS (Options supplémentaires)
-- =====================================================

CREATE TABLE IF NOT EXISTS cocktail_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  price INTEGER NOT NULL, -- Prix en FCFA
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_price CHECK (price > 0)
);

-- =====================================================
-- DONNÉES INITIALES - COCKTAILS MAISON
-- =====================================================

INSERT INTO cocktails_maison (name, description, emoji, difficulty_level, preparation_time_minutes, base_price, category, alcohol_percentage) VALUES
('Planteur d''Akanda', 'Notre cocktail signature aux saveurs tropicales, parfait pour les soirées gabonaises', '🍹', 2, 8, 2500, 'signature', 12.5),
('Caïpirinha Équatoriale', 'Version tropicale de la caïpirinha avec des fruits locaux', '🍃', 3, 10, 2800, 'tropical', 15.0),
('Sunset Ogooué', 'Cocktail coloré inspiré des couchers de soleil sur l''Ogooué', '🌅', 4, 12, 3500, 'signature', 14.0),
('Mojito Traditionnel', 'Le classique mojito revisité avec de la menthe fraîche', '🌿', 2, 7, 2900, 'classique', 11.0);

-- =====================================================
-- DONNÉES INITIALES - INGRÉDIENTS COCKTAILS
-- =====================================================

-- Planteur d'Akanda
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Rhum blanc', '4', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Rhum ambré', '2', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Jus d''ananas', '8', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Jus de mangue', '4', 'cl', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Sirop de canne', '1', 'cl', 5),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 'Citron vert', '1/2', 'pièce', 6);

-- Caïpirinha Équatoriale
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 'Cachaça', '6', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 'Citron vert', '1', 'pièce', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 'Sucre de canne', '2', 'cuillères', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 'Menthe fraîche', '6', 'feuilles', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 'Glace pilée', '1', 'verre', 5);

-- Sunset Ogooué
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 'Vodka', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 'Jus de mangue', '6', 'cl', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 'Jus de fruit de la passion', '3', 'cl', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 'Sirop de grenadine', '1', 'cl', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 'Citron vert', '1/2', 'pièce', 5);

-- Mojito Traditionnel
INSERT INTO cocktail_ingredients (cocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 'Rhum blanc', '5', 'cl', 1),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 'Menthe fraîche', '8', 'feuilles', 2),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 'Citron vert', '1/2', 'pièce', 3),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 'Sucre blanc', '2', 'cuillères', 4),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 'Eau gazeuse', '10', 'cl', 5);

-- =====================================================
-- DONNÉES INITIALES - INSTRUCTIONS COCKTAILS
-- =====================================================

-- Planteur d'Akanda
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 1, 'Dans un shaker, versez le rhum blanc et le rhum ambré'),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 2, 'Ajoutez les jus d''ananas et de mangue'),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 3, 'Incorporez le sirop de canne et le jus de citron vert'),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 4, 'Secouez vigoureusement avec des glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 5, 'Servez dans un verre hurricane avec des glaçons frais'),
((SELECT id FROM cocktails_maison WHERE name = 'Planteur d''Akanda'), 6, 'Décorez avec une tranche d''ananas et une cerise');

-- Caïpirinha Équatoriale
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 1, 'Coupez le citron vert en quartiers dans le verre'),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 2, 'Ajoutez le sucre de canne et les feuilles de menthe'),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 3, 'Pilez délicatement pour extraire les jus et arômes'),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 4, 'Versez la cachaça directement dans le verre'),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 5, 'Complétez avec de la glace pilée et mélangez'),
((SELECT id FROM cocktails_maison WHERE name = 'Caïpirinha Équatoriale'), 6, 'Décorez avec une branche de menthe fraîche');

-- Sunset Ogooué
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 1, 'Dans un shaker, versez la vodka bien froide'),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 2, 'Ajoutez les jus de mangue et de fruit de la passion'),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 3, 'Incorporez le jus de citron vert fraîchement pressé'),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 4, 'Secouez énergiquement avec des glaçons'),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 5, 'Versez dans un verre à cocktail en filtrant'),
((SELECT id FROM cocktails_maison WHERE name = 'Sunset Ogooué'), 6, 'Ajoutez délicatement la grenadine pour l''effet sunset');

-- Mojito Traditionnel
INSERT INTO cocktail_instructions (cocktail_id, step_number, instruction) VALUES
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 1, 'Placez les feuilles de menthe dans le verre'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 2, 'Ajoutez le sucre et les quartiers de citron vert'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 3, 'Pilez délicatement pour libérer les arômes'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 4, 'Versez le rhum blanc et mélangez'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 5, 'Ajoutez des glaçons et complétez avec l''eau gazeuse'),
((SELECT id FROM cocktails_maison WHERE name = 'Mojito Traditionnel'), 6, 'Remuez délicatement et décorez avec de la menthe');

-- =====================================================
-- DONNÉES INITIALES - MOCKTAILS
-- =====================================================

INSERT INTO mocktails (name, description, emoji, base_price, preparation_time_minutes) VALUES
('Virgin Planteur', 'Version sans alcool de notre planteur signature, parfait pour toute la famille', '🍹', 1500, 5),
('Limonade Tropicale', 'Mélange rafraîchissant de mangue, citron et eau gazeuse', '🥭', 1200, 3),
('Smoothie Cocktail', 'Cocktail crémeux à base de banane, coco et ananas', '🥥', 1800, 7);

-- =====================================================
-- DONNÉES INITIALES - INGRÉDIENTS MOCKTAILS
-- =====================================================

-- Virgin Planteur
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'Virgin Planteur'), 'Jus d''ananas', '10', 'cl', 1),
((SELECT id FROM mocktails WHERE name = 'Virgin Planteur'), 'Jus de mangue', '6', 'cl', 2),
((SELECT id FROM mocktails WHERE name = 'Virgin Planteur'), 'Sirop de canne', '1', 'cl', 3),
((SELECT id FROM mocktails WHERE name = 'Virgin Planteur'), 'Citron vert', '1/2', 'pièce', 4),
((SELECT id FROM mocktails WHERE name = 'Virgin Planteur'), 'Eau gazeuse', '4', 'cl', 5);

-- Limonade Tropicale
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'Limonade Tropicale'), 'Jus de mangue', '8', 'cl', 1),
((SELECT id FROM mocktails WHERE name = 'Limonade Tropicale'), 'Citron vert', '1', 'pièce', 2),
((SELECT id FROM mocktails WHERE name = 'Limonade Tropicale'), 'Sirop de citron', '2', 'cl', 3),
((SELECT id FROM mocktails WHERE name = 'Limonade Tropicale'), 'Eau gazeuse', '12', 'cl', 4),
((SELECT id FROM mocktails WHERE name = 'Limonade Tropicale'), 'Menthe fraîche', '4', 'feuilles', 5);

-- Smoothie Cocktail
INSERT INTO mocktail_ingredients (mocktail_id, name, quantity, unit, sort_order) VALUES
((SELECT id FROM mocktails WHERE name = 'Smoothie Cocktail'), 'Banane', '1', 'pièce', 1),
((SELECT id FROM mocktails WHERE name = 'Smoothie Cocktail'), 'Lait de coco', '8', 'cl', 2),
((SELECT id FROM mocktails WHERE name = 'Smoothie Cocktail'), 'Jus d''ananas', '6', 'cl', 3),
((SELECT id FROM mocktails WHERE name = 'Smoothie Cocktail'), 'Miel', '1', 'cuillère', 4),
((SELECT id FROM mocktails WHERE name = 'Smoothie Cocktail'), 'Glace pilée', '1', 'verre', 5);

-- =====================================================
-- DONNÉES INITIALES - OPTIONS SUPPLÉMENTAIRES
-- =====================================================

INSERT INTO cocktail_options (name, description, emoji, price, sort_order) VALUES
('Kit Barman', 'Shaker professionnel, doseur et cuillère à mélange', '🍸', 3000, 1),
('Verres à Cocktail', 'Lot de 8 verres élégants assortis', '🥃', 5000, 2),
('Décoration Fruits', 'Ananas frais, citrons verts et menthe pour décorer', '🍍', 2000, 3),
('Glaçons Extra', 'Sac de 5kg de glaçons pour vos longues soirées', '🧊', 1500, 4);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cocktails_maison_active ON cocktails_maison(is_active);
CREATE INDEX IF NOT EXISTS idx_cocktails_maison_category ON cocktails_maison(category);
CREATE INDEX IF NOT EXISTS idx_cocktail_ingredients_cocktail ON cocktail_ingredients(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_cocktail_instructions_cocktail ON cocktail_instructions(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_mocktails_active ON mocktails(is_active);
CREATE INDEX IF NOT EXISTS idx_mocktail_ingredients_mocktail ON mocktail_ingredients(mocktail_id);
CREATE INDEX IF NOT EXISTS idx_cocktail_options_active ON cocktail_options(is_active);

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================

-- Cocktails Maison - Lecture publique
ALTER TABLE cocktails_maison ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cocktails maison are viewable by everyone" ON cocktails_maison FOR SELECT USING (is_active = true);

-- Ingrédients - Lecture publique
ALTER TABLE cocktail_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cocktail ingredients are viewable by everyone" ON cocktail_ingredients FOR SELECT USING (true);

-- Instructions - Lecture publique
ALTER TABLE cocktail_instructions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cocktail instructions are viewable by everyone" ON cocktail_instructions FOR SELECT USING (true);

-- Mocktails - Lecture publique
ALTER TABLE mocktails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mocktails are viewable by everyone" ON mocktails FOR SELECT USING (is_active = true);

-- Ingrédients Mocktails - Lecture publique
ALTER TABLE mocktail_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mocktail ingredients are viewable by everyone" ON mocktail_ingredients FOR SELECT USING (true);

-- Options - Lecture publique
ALTER TABLE cocktail_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cocktail options are viewable by everyone" ON cocktail_options FOR SELECT USING (is_active = true);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer le prix total d'un cocktail selon le nombre de personnes
CREATE OR REPLACE FUNCTION calculate_cocktail_total_price(
  cocktail_id UUID,
  nb_personnes INTEGER,
  duree_heures INTEGER DEFAULT 4
) RETURNS INTEGER AS $$
DECLARE
  base_price INTEGER;
  multiplier DECIMAL;
BEGIN
  -- Récupérer le prix de base
  SELECT c.base_price INTO base_price FROM cocktails_maison c WHERE c.id = cocktail_id;
  
  -- Calculer le multiplicateur selon la durée
  multiplier := CASE 
    WHEN duree_heures > 4 THEN 3.0
    ELSE 2.5
  END;
  
  -- Retourner le prix total
  RETURN CEIL(base_price * nb_personnes * multiplier);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE cocktails_maison IS 'Cocktails disponibles pour les événements à domicile';
COMMENT ON TABLE cocktail_ingredients IS 'Ingrédients nécessaires pour chaque cocktail';
COMMENT ON TABLE cocktail_instructions IS 'Instructions étape par étape pour préparer les cocktails';
COMMENT ON TABLE mocktails IS 'Cocktails sans alcool pour toute la famille';
COMMENT ON TABLE mocktail_ingredients IS 'Ingrédients pour les mocktails';
COMMENT ON TABLE cocktail_options IS 'Options supplémentaires (matériel, décoration, etc.)';
