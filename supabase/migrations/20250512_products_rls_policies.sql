-- Création des politiques RLS pour la table products
-- Créé le 12 mai 2025

-- Activer RLS sur la table products si ce n'est pas déjà fait
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des produits (pour tout le monde)
DROP POLICY IF EXISTS "Produits visibles publiquement" ON public.products;
CREATE POLICY "Produits visibles publiquement"
  ON public.products FOR SELECT
  USING (true);

-- Politique pour permettre l'insertion de produits par les administrateurs
DROP POLICY IF EXISTS "Produits créés par les administrateurs" ON public.products;
CREATE POLICY "Produits créés par les administrateurs"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Politique permettant aux administrateurs et au staff de modifier les produits existants
DROP POLICY IF EXISTS "Produits modifiables par les administrateurs et le staff" ON public.products;
CREATE POLICY "Produits modifiables par les administrateurs et le staff"
  ON public.products FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'staff')
  ));

-- Politique pour permettre uniquement aux administrateurs de supprimer des produits
DROP POLICY IF EXISTS "Produits supprimables par les administrateurs" ON public.products;
CREATE POLICY "Produits supprimables par les administrateurs"
  ON public.products FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Pour le développement, si nécessaire, on peut ajouter un administrateur par défaut
-- Si un compte admin@akanda-apero.com existe, lui donner le rôle admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@akanda-apero.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Créer aussi une politique pour la table product_images
ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les images de produits
DROP POLICY IF EXISTS "Images de produits visibles publiquement" ON public.product_images;
CREATE POLICY "Images de produits visibles publiquement"
  ON public.product_images FOR SELECT
  USING (true);

-- Politique pour l'insertion d'images par les admins
DROP POLICY IF EXISTS "Images de produits créées par les administrateurs" ON public.product_images;
CREATE POLICY "Images de produits créées par les administrateurs"
  ON public.product_images FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Politique pour la modification d'images par les admins et le staff
DROP POLICY IF EXISTS "Images de produits modifiables par les administrateurs et le staff" ON public.product_images;
CREATE POLICY "Images de produits modifiables par les administrateurs et le staff"
  ON public.product_images FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'staff')
  ));

-- Politique pour la suppression d'images par les admins
DROP POLICY IF EXISTS "Images de produits supprimables par les administrateurs" ON public.product_images;
CREATE POLICY "Images de produits supprimables par les administrateurs"
  ON public.product_images FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));
