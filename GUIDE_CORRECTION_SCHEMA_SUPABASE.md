# 🚨 GUIDE DE CORRECTION - ERREUR SCHEMA SUPABASE

## ❌ **Problème identifié**
```
Erreur lors de la sauvegarde: Could not find the 'alcohol_percentage' column of 'mocktails' in the schema cache
```

## 🔍 **Cause**
La table `mocktails` dans Supabase ne contient pas toutes les colonnes utilisées par le code admin, notamment :
- `alcohol_percentage` (colonne manquante causant l'erreur)
- `category`, `difficulty_level`, `is_featured` (pour la cohérence)
- `recipe`, `video_url`, `video_type` (fonctionnalités prévues)

## ✅ **Solution appliquée**

### 1. **Types TypeScript mis à jour**
- ✅ Type `Mocktail` mis à jour avec toutes les colonnes manquantes
- ✅ Type `CocktailMaison` mis à jour avec `recipe`, `video_url`, `video_type`

### 2. **Script SQL créé**
Le fichier `fix_mocktails_schema.sql` contient toutes les modifications nécessaires.

## 🚀 **ÉTAPES À SUIVRE**

### **Étape 1 : Exécuter le script SQL dans Supabase**

1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Se connecter à votre projet

2. **Accéder à l'éditeur SQL**
   - Cliquer sur "SQL Editor" dans le menu latéral
   - Cliquer sur "New query"

3. **Copier-coller le contenu du fichier `fix_mocktails_schema.sql`**
   - Ouvrir le fichier `fix_mocktails_schema.sql`
   - Copier tout le contenu
   - Coller dans l'éditeur SQL Supabase

4. **Exécuter le script**
   - Cliquer sur "Run" ou appuyer sur `Ctrl+Enter`
   - Vérifier qu'il n'y a pas d'erreurs

### **Étape 2 : Vérifier les modifications**

Exécuter cette requête pour vérifier que les colonnes ont été ajoutées :

```sql
-- Vérifier la structure de la table mocktails
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mocktails' 
ORDER BY ordinal_position;

-- Vérifier la structure de la table cocktails_maison
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cocktails_maison' 
ORDER BY ordinal_position;
```

### **Étape 3 : Tester l'admin**

1. **Redémarrer le serveur de développement**
   ```bash
   npm run dev
   ```

2. **Tester la sauvegarde d'un mocktail**
   - Aller sur `/admin/cocktail-kits`
   - Modifier un mocktail existant
   - Sauvegarder et vérifier qu'il n'y a plus d'erreur

## 🎯 **Résultat attendu**

Après l'exécution du script SQL :
- ✅ Plus d'erreur `Could not find the 'alcohol_percentage' column`
- ✅ Sauvegarde des mocktails fonctionnelle
- ✅ Nouvelles fonctionnalités (recipe, video) disponibles
- ✅ Cohérence entre cocktails et mocktails

## 🔧 **Colonnes ajoutées**

### **Table `mocktails`**
- `alcohol_percentage` (DECIMAL, défaut: 0.0)
- `category` (VARCHAR, pour le filtrage)
- `difficulty_level` (INTEGER, défaut: 1)
- `is_featured` (BOOLEAN, défaut: false)
- `recipe` (TEXT, instructions détaillées)
- `video_url` (TEXT, URL de la vidéo)
- `video_type` (VARCHAR, 'url' ou 'upload')

### **Table `cocktails_maison`**
- `recipe` (TEXT, si pas déjà présente)
- `video_url` (TEXT, si pas déjà présente)
- `video_type` (VARCHAR, si pas déjà présente)

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les permissions de votre utilisateur Supabase
2. Assurez-vous d'être sur le bon projet/environnement
3. Consultez les logs d'erreur dans Supabase Dashboard

---

**Une fois le script SQL exécuté, l'erreur sera résolue et vous pourrez sauvegarder les mocktails sans problème !** 🎉
