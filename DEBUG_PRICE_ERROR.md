# 🔍 Diagnostic : Erreur "Could not find the 'price' column"

## 🚨 **Erreur Identifiée :**
```
Erreur lors de la sauvegarde: {code: PGRST204, details: null, hint: null, message: Could not find the 'price' column of 'products' in the schema cache}
```

## 🔍 **Sources Potentielles :**

### 1. **Pages Admin à Vérifier :**
- `/admin/products` - ✅ Corrigé (utilise `base_price`)
- `/admin/cocktail-kits` - ⚠️ Utilise encore `price`
- `/admin/import-demo-cocktails` - ⚠️ Utilise encore `price`

### 2. **Contexte Application :**
- `src/context/types.ts` - ⚠️ Type Product utilise `price`
- `src/lib/types.ts` - ⚠️ Interface Product utilise `price`

### 3. **Pages Frontend :**
- `src/app/checkout/page.tsx` - ⚠️ Utilise `item.product.price`
- `src/app/cart/page.tsx` - ⚠️ Utilise `product.price`

## 🎯 **Action Immédiate :**

### Étape 1 : Identifier la Source Exacte
L'erreur vient probablement d'une de ces pages qui essaie de :
1. **Insérer** un produit avec un champ `price`
2. **Sélectionner** spécifiquement la colonne `price`
3. **Mettre à jour** un produit avec `price`

### Étape 2 : Vérifier les Requêtes Supabase
Chercher dans le code :
- `insert([{...price...}])`
- `update({...price...})`
- `select('price')`

### Étape 3 : Corriger les Types
Les types dans `context/types.ts` et `lib/types.ts` doivent être mis à jour pour utiliser `base_price`.

## 🚀 **Solution Temporaire :**
1. **Exécuter le script RLS** pour résoudre les erreurs 403
2. **Identifier la page** qui génère l'erreur de schéma
3. **Corriger les types** et requêtes problématiques

## 📋 **Test de Diagnostic :**
1. Ouvrir la console (F12)
2. Aller sur `/admin/products`
3. Essayer de créer un produit
4. Noter exactement quelle action génère l'erreur

**L'erreur de schéma peut être corrigée rapidement une fois la source identifiée !**
