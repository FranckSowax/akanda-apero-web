# 🔧 CORRECTION : Colonnes manquantes dans table categories

## 🚨 Problèmes
```
Erreur lors de la sauvegarde de la catégorie: Could not find the 'emoji' column of 'categories' in the schema cache
Erreur lors de la sauvegarde de la catégorie: Could not find the 'image_url' column of 'categories' in the schema cache
```

## ✅ Solution

### Étape 1 : Exécuter le script SQL
1. Ouvrez votre **tableau de bord Supabase**
2. Allez dans **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase_add_missing_columns.sql`

### Étape 2 : Vérification
Après exécution du script, vous devriez voir :
- ✅ Colonne `emoji` ajoutée à la table `categories`
- ✅ Colonne `image_url` ajoutée à la table `categories`
- ✅ Emojis par défaut assignés aux catégories existantes
- ✅ Possibilité de créer/modifier des catégories avec emojis et images

### Étape 3 : Test
1. Retournez sur la page **Admin > Catégories**
2. Essayez de créer ou modifier une catégorie
3. L'erreur ne devrait plus apparaître

## 📋 Détails techniques

### Colonnes ajoutées :
```sql
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📦';

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;
```

### Emojis par défaut assignés :
- 🎁 Formules/Packs
- 🍷 Vins
- 🍺 Bières  
- 🥃 Spiritueux
- 🍸 Cocktails
- 🥤 Softs/Boissons
- 🍾 Champagnes
- 🧊 Accessoires
- ⭐ Premium

## 🎯 Résultat attendu
Après cette correction, la gestion des catégories sera entièrement fonctionnelle avec support des emojis et images pour une meilleure UX visuelle.
