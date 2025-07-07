# 🔧 Configuration Storage via Dashboard Supabase

## ❌ Problème SQL
L'erreur `must be owner of table objects` indique que vous n'avez pas les permissions administrateur pour modifier les politiques RLS via SQL.

## ✅ SOLUTION : Interface Dashboard

### **Étape 1 : Créer le bucket**
1. **Ouvrez Supabase Dashboard**
2. **Allez dans Storage**
3. **Cliquez sur "New bucket"**
4. **Nom :** `images`
5. **Public bucket :** ✅ Coché
6. **Cliquez "Save"**

### **Étape 2 : Configurer les politiques**
1. **Dans Storage > images**
2. **Cliquez sur "Policies"**
3. **Cliquez "New Policy"**

#### **Politique 1 : Upload (INSERT)**
- **Name :** `Allow authenticated upload`
- **Allowed operation :** `INSERT`
- **Target roles :** `authenticated`
- **USING expression :** `bucket_id = 'images'`
- **Cliquez "Save"**

#### **Politique 2 : Read (SELECT)**
- **Name :** `Allow public read`
- **Allowed operation :** `SELECT`
- **Target roles :** `public`
- **USING expression :** `bucket_id = 'images'`
- **Cliquez "Save"**

#### **Politique 3 : Update**
- **Name :** `Allow authenticated update`
- **Allowed operation :** `UPDATE`
- **Target roles :** `authenticated`
- **USING expression :** `bucket_id = 'images'`
- **Cliquez "Save"**

#### **Politique 4 : Delete**
- **Name :** `Allow authenticated delete`
- **Allowed operation :** `DELETE`
- **Target roles :** `authenticated`
- **USING expression :** `bucket_id = 'images'`
- **Cliquez "Save"**

## 🧪 **Test rapide**

### **Option A : Script SQL simple**
Exécutez `supabase_setup_storage_simple.sql` pour créer juste le bucket.

### **Option B : Test dans la console**
```javascript
// Dans la console du navigateur (F12)
supabase.storage.from('images').list()
  .then(result => console.log('✅ Bucket accessible:', result))
  .catch(error => console.error('❌ Erreur:', error));
```

## 🎯 **Après configuration**

1. **Retournez dans Admin > Produits**
2. **Essayez d'uploader l'image de Gibson**
3. **Vérifiez la console pour les erreurs**

## ⚡ **Alternative rapide**

Si vous voulez juste tester rapidement :
1. **Utilisez une URL d'image externe** (ex: imgur, cloudinary)
2. **Collez l'URL directement** dans le champ image
3. **Sauvegardez le produit**

Exemple d'URL test : `https://i.imgur.com/example.jpg`

## 🔍 **Diagnostic**

Si l'upload ne fonctionne toujours pas après la configuration :
1. **Vérifiez la console (F12)** pour voir l'erreur exacte
2. **Vérifiez que vous êtes bien connecté** (authentifié)
3. **Testez avec une image plus petite** (< 1MB)
4. **Vérifiez le format** (JPG, PNG, WebP)
