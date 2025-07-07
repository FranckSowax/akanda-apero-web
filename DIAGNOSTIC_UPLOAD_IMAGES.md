# 🔍 DIAGNOSTIC : Problème Upload Images

## 🚨 Problème rapporté
- Impossible d'uploader l'image du produit "Gibson"
- Erreur WebSocket Realtime (peut être liée ou séparée)

## 🔧 Causes probables

### 1. **Bucket Supabase Storage manquant**
Le bucket `images` n'existe pas dans votre projet Supabase.

### 2. **Politiques RLS (Row Level Security)**
Les politiques d'accès au bucket `images` bloquent l'upload.

### 3. **Permissions insuffisantes**
L'utilisateur n'a pas les droits d'écriture sur le bucket.

### 4. **Configuration incorrecte**
Problème avec l'API key ou la configuration Supabase.

## ✅ SOLUTIONS

### Solution 1 : Créer le bucket images
```sql
-- Exécuter dans Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

### Solution 2 : Configurer les politiques RLS
```sql
-- Politique pour permettre l'upload d'images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Politique pour permettre la mise à jour
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

### Solution 3 : Vérifier la configuration
1. **Ouvrez Supabase Dashboard**
2. **Allez dans Storage**
3. **Vérifiez que le bucket `images` existe**
4. **Vérifiez les politiques d'accès**

## 🧪 TEST RAPIDE

### Dans la console du navigateur (F12) :
```javascript
// Tester la connexion Supabase
console.log('Supabase client:', supabase);

// Tester l'accès au bucket
supabase.storage.from('images').list()
  .then(result => console.log('Bucket accessible:', result))
  .catch(error => console.error('Erreur bucket:', error));
```

## 🎯 ÉTAPES DE RÉSOLUTION

1. **Vérifiez l'existence du bucket `images`**
2. **Créez le bucket si nécessaire**
3. **Configurez les politiques RLS**
4. **Testez l'upload d'une image**
5. **Vérifiez les logs d'erreur dans la console**

## 📋 INFORMATIONS TECHNIQUES

- **Bucket utilisé :** `images`
- **Dossier :** `products/`
- **Taille max :** 5MB
- **Formats acceptés :** Tous les types image/*
- **Nommage :** `timestamp-random.extension`

## ⚠️ NOTE SUR L'ERREUR WEBSOCKET

L'erreur WebSocket Realtime peut indiquer :
- Problème de connectivité réseau
- Configuration Realtime incorrecte
- Mais **ne bloque pas** l'upload d'images (API REST différente)
