# GUIDE : Fix Promotions Image Upload & Display

## 🚨 Problèmes identifiés
- Bucket Supabase `promotions` n'existe pas → erreur 400
- Aucune image_url sauvegardée → toutes valeurs `undefined`
- Upload fonctionne mais sauvegarde échoue

## 🔧 Solutions étape par étape

### 1. Créer le bucket Supabase `promotions`

**Exécuter dans Supabase SQL Editor :**
```sql
-- Script : create_promotions_bucket.sql
-- Créer le bucket 'promotions' et le rendre public

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('promotions', 'promotions', true, 52428800, 
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Politiques d'accès
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'promotions');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'promotions');
```

### 2. Vérifier le bucket

**Dans Supabase Dashboard :**
1. Aller dans **Storage**
2. Vérifier que **bucket `promotions`** existe
3. Vérifier qu'il est **public**

### 3. Tester l'upload

**Script de test dans la console navigateur :**
```javascript
// Tester l'upload d'une image
testPromotionImage()

// Vérifier les données
checkSupabaseData()
```

### 4. Structure attendue des données

**Promotion avec image :**
```json
{
  "id": "uuid",
  "title": "Promo été",
  "description": "Réduction spéciale",
  "image_url": "https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/filename.jpg",
  "discount_percentage": 20,
  "is_active": true,
  "is_featured": true
}
```

### 5. URLs correctes

**Bucket Supabase :**
- Base : `https://mcdpzoisorbnhkjhljaj.supabase.co`
- Storage : `https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/`

## 🎯 Vérification finale

1. **Exécuter le script SQL** pour créer le bucket
2. **Uploader une image** via l'admin promotions
3. **Vérifier que image_url est sauvegardée** en base
4. **Vérifier l'affichage** sur la page d'accueil

## ✅ Succès

Après ces corrections :
- ✅ Upload d'image fonctionne
- ✅ image_url sauvegardée correctement
- ✅ Image affichée dans l'admin et sur la page d'accueil
- ✅ Bucket Supabase accessible
