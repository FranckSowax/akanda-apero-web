-- Ajout de la relation entre produits et catégories
-- Créé le 12 mai 2025

-- Créer d'abord la table des rôles utilisateurs si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Activer RLS pour la table des rôles
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérifier si la table des catégories existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer une table de jonction pour la relation many-to-many entre produits et catégories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Ajouter un index pour des requêtes plus rapides
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON public.product_categories(category_id);

-- Créer une vue pour faciliter l'accès aux produits avec leurs catégories
CREATE OR REPLACE VIEW public.products_with_categories AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'image_url', c.image_url,
        'color', c.color
      )
    ) FILTER (WHERE c.id IS NOT NULL), 
    '[]'::json
  ) as categories
FROM 
  public.products p
LEFT JOIN 
  public.product_categories pc ON p.id = pc.product_id
LEFT JOIN 
  public.categories c ON pc.category_id = c.id
GROUP BY 
  p.id;

-- Ajouter les politiques RLS appropriées
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour les catégories (lecture publique)
DROP POLICY IF EXISTS "Catégories visibles publiquement" ON public.categories;
CREATE POLICY "Catégories visibles publiquement"
  ON public.categories FOR SELECT
  USING (true);

-- Politique pour les catégories (modification par les administrateurs)
DROP POLICY IF EXISTS "Catégories modifiables par les administrateurs" ON public.categories;
CREATE POLICY "Catégories modifiables par les administrateurs"
  ON public.categories FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Politique pour les relations produit-catégorie (lecture publique)
DROP POLICY IF EXISTS "Relation produit-catégorie visible publiquement" ON public.product_categories;
CREATE POLICY "Relation produit-catégorie visible publiquement"
  ON public.product_categories FOR SELECT
  USING (true);

-- Politique pour les relations produit-catégorie (modification par les administrateurs)
DROP POLICY IF EXISTS "Relation produit-catégorie modifiable par les administrateurs" ON public.product_categories;
CREATE POLICY "Relation produit-catégorie modifiable par les administrateurs"
  ON public.product_categories FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));
