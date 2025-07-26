-- Script pour créer le bucket Supabase 'promotions' et le rendre public
-- À exécuter dans le SQL Editor de Supabase

-- Créer le bucket 'promotions' et le rendre public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('promotions', 'promotions', true, 52428800, 
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Politiques d'accès
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'promotions');

CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'promotions');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'promotions');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'promotions');

-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE id = 'promotions';
