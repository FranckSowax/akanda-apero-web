-- =====================================================
-- CONFIGURATION SUPABASE STORAGE
-- Création des buckets pour les images
-- =====================================================

-- Créer le bucket pour les images (si il n'existe pas déjà)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tous de lire les images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs images
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'images';
