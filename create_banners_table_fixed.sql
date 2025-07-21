-- Script SQL simplifié pour créer la table banners
-- Exécutez ce script étape par étape dans Supabase

-- ÉTAPE 1: Supprimer la table si elle existe (pour recommencer proprement)
DROP TABLE IF EXISTS public.banners CASCADE;

-- ÉTAPE 2: Créer la table banners
CREATE TABLE public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    price VARCHAR(50),
    rating VARCHAR(10),
    year VARCHAR(10),
    gradient VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 3: Ajouter les contraintes
ALTER TABLE public.banners 
ADD CONSTRAINT banners_type_check 
CHECK (type IN ('hero_slide', 'cocktail_kit_bg', 'parallax_section'));

-- ÉTAPE 4: Créer les index
CREATE INDEX idx_banners_type_order ON public.banners(type, sort_order);
CREATE INDEX idx_banners_active ON public.banners(is_active);

-- ÉTAPE 5: Activer RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 6: Créer les politiques RLS
CREATE POLICY "Banners are viewable by everyone" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Banners are manageable by admin" ON public.banners
    FOR ALL USING (true);

-- ÉTAPE 7: Insérer les données initiales
INSERT INTO public.banners (type, title, subtitle, price, rating, year, gradient, image_url, sort_order) VALUES
('hero_slide', 'COCKTAIL\nTIME!', 'Cocktails artisanaux préparés\nspécialement pour vous', '2500 XAF', '4.8', '2020', 'from-orange-400/50 to-orange-500/50', 'https://i.imgur.com/hr8w6tp.png', 1),
('hero_slide', 'HAPPY\nHOUR!', 'Profitez de nos offres spéciales\ntous les soirs de 17h à 19h', '1800 XAF', '4.9', '2020', 'from-purple-400/50 to-purple-500/50', 'https://i.imgur.com/9z6CUax.jpg', 2),
('hero_slide', 'LIVRAISON\nRAPIDE!', 'Vos cocktails livrés en moins\nde 30 minutes à Libreville', '1500 XAF', '4.7', '2020', 'from-blue-400/50 to-blue-500/50', 'https://i.imgur.com/N7KKA5C.jpg', 3),
('hero_slide', 'WEEKEND\nSPECIAL!', 'Découvrez nos cocktails exclusifs\npour vos soirées du weekend', '3200 XAF', '4.8', '2020', 'from-pink-400/50 to-pink-500/50', 'https://i.imgur.com/mLt5IU3.jpg', 4),
('cocktail_kit_bg', 'Cocktail Kits', 'Image de fond du module cocktail kits', NULL, NULL, NULL, NULL, 'https://i.imgur.com/lmz5VYR.jpg', 1),
('parallax_section', 'Section Parallax', 'Image parallax avant le cocktail de la semaine', NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3', 1);

-- ÉTAPE 8: Vérifier que tout fonctionne
SELECT 'Table créée avec succès!' as message;
SELECT COUNT(*) as nombre_bannieres FROM public.banners;
SELECT type, COUNT(*) as count FROM public.banners GROUP BY type;
