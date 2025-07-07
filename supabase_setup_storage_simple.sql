-- Script simplifié pour configurer Supabase Storage
-- Version sans permissions administrateur avancées

-- 1. Créer le bucket images (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Vérifier que le bucket a été créé
SELECT 
  id, 
  name, 
  public, 
  created_at
FROM storage.buckets 
WHERE id = 'images';

-- 3. Tester l'accès au bucket
SELECT COUNT(*) as total_images
FROM storage.objects 
WHERE bucket_id = 'images';
