-- Script SQL pour créer la table de gestion des bannières
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table banners
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hero_slide', 'cocktail_kit_bg', 'parallax_section')),
    title VARCHAR(255),
    subtitle TEXT,
    price VARCHAR(50),
    rating VARCHAR(10),
    year VARCHAR(10),
    gradient VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Créer un index sur le type et l'ordre
CREATE INDEX IF NOT EXISTS idx_banners_type_order ON public.banners(type, sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active);

-- 3. Créer la fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Créer le trigger pour la mise à jour automatique
DROP TRIGGER IF EXISTS set_banners_updated_at ON public.banners;
CREATE TRIGGER set_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Configurer les politiques RLS (Row Level Security)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture (tous peuvent lire les bannières actives)
DROP POLICY IF EXISTS "Banners are viewable by everyone" ON public.banners;
CREATE POLICY "Banners are viewable by everyone" ON public.banners
    FOR SELECT USING (is_active = true);

-- Politique pour l'insertion/modification/suppression (admin seulement)
DROP POLICY IF EXISTS "Banners are manageable by admin" ON public.banners;
CREATE POLICY "Banners are manageable by admin" ON public.banners
    FOR ALL USING (true);

-- 6. Insérer les données initiales basées sur les heroSlides actuels
INSERT INTO public.banners (type, title, subtitle, price, rating, year, gradient, image_url, sort_order) VALUES
('hero_slide', 'COCKTAIL\nTIME!', 'Cocktails artisanaux préparés\nspécialement pour vous', '2500 XAF', '4.8', '2020', 'from-orange-400/50 to-orange-500/50', 'https://i.imgur.com/hr8w6tp.png', 1),
('hero_slide', 'HAPPY\nHOUR!', 'Profitez de nos offres spéciales\ntous les soirs de 17h à 19h', '1800 XAF', '4.9', '2020', 'from-purple-400/50 to-purple-500/50', 'https://i.imgur.com/9z6CUax.jpg', 2),
('hero_slide', 'LIVRAISON\nRAPID!', 'Vos cocktails livrés en moins\nde 30 minutes à Libreville', '1500 XAF', '4.7', '2020', 'from-blue-400/50 to-blue-500/50', 'https://i.imgur.com/N7KKA5C.jpg', 3),
('hero_slide', 'WEEKEND\nSPECIAL!', 'Découvrez nos cocktails exclusifs\npour vos soirées du weekend', '3200 XAF', '4.8', '2020', 'from-pink-400/50 to-pink-500/50', 'https://i.imgur.com/mLt5IU3.jpg', 4),
('cocktail_kit_bg', 'Cocktail Kits', 'Image de fond du module cocktail kits', NULL, NULL, NULL, NULL, 'https://i.imgur.com/lmz5VYR.jpg', 1),
('parallax_section', 'Section Parallax', 'Image parallax avant le cocktail de la semaine', NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3', 1)
ON CONFLICT DO NOTHING;

-- 7. Vérifier que la table a été créée avec succès
-- Vous pouvez maintenant vérifier les données avec :
-- SELECT * FROM public.banners ORDER BY type, sort_order;

-- 8. Commentaires sur la table
COMMENT ON TABLE public.banners IS 'Table pour gérer les bannières, slides et images de la page d''accueil';
COMMENT ON COLUMN public.banners.type IS 'Type de bannière: hero_slide, cocktail_kit_bg, parallax_section';
COMMENT ON COLUMN public.banners.title IS 'Titre principal (utilisé pour les slides)';
COMMENT ON COLUMN public.banners.subtitle IS 'Sous-titre ou description';
COMMENT ON COLUMN public.banners.price IS 'Prix affiché (pour les slides)';
COMMENT ON COLUMN public.banners.rating IS 'Note affichée (pour les slides)';
COMMENT ON COLUMN public.banners.year IS 'Année affichée (pour les slides)';
COMMENT ON COLUMN public.banners.gradient IS 'Classes CSS pour le gradient de fond';
COMMENT ON COLUMN public.banners.image_url IS 'URL de l''image uploadée';
COMMENT ON COLUMN public.banners.sort_order IS 'Ordre d''affichage';
