# 🚨 URGENT : Exécuter le Script RLS dans Supabase

## Les erreurs 403 persistent car les politiques RLS bloquent les opérations !

### 📋 **Étapes à suivre MAINTENANT :**

#### 1. **Ouvrir Supabase Dashboard**
- Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Connectez-vous à votre compte
- Sélectionnez votre projet Akanda Apéro

#### 2. **Accéder au SQL Editor**
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Ou utilisez le raccourci dans la barre de navigation

#### 3. **Copier le Script RLS**
- Ouvrez le fichier `supabase_fix_rls_policies.sql` dans votre éditeur
- **Sélectionnez TOUT le contenu** (Ctrl+A / Cmd+A)
- **Copiez** (Ctrl+C / Cmd+C)

#### 4. **Exécuter le Script**
- Dans le SQL Editor de Supabase, **collez** le script (Ctrl+V / Cmd+V)
- Cliquez sur le bouton **"Run"** (ou Ctrl+Enter)
- Attendez que l'exécution se termine

#### 5. **Vérifier l'Exécution**
Vous devriez voir des messages comme :
```
DROP POLICY (if exists)
CREATE POLICY
```

### ✅ **Résultat Attendu :**
Une fois le script exécuté, les erreurs suivantes disparaîtront :
- ❌ `Erreur upload: {statusCode: 403, error: Unauthorized, message: new row violates row-level security policy}`
- ❌ `Erreur upload option: {statusCode: 403, error: Unauthorized, message: new row violates row-level security policy}`

### 📸 **NOUVEAU : Correction Upload d'Images**
Le script inclut maintenant les politiques Supabase Storage pour :
- ✅ **Upload d'images produits** : Bucket 'products' configuré
- ✅ **Upload d'images options** : Bucket 'product-options' configuré
- ✅ **Politiques permissives** : Toutes les opérations Storage autorisées

### 🔄 **Après l'Exécution :**
1. **Rechargez la page** de l'application (F5)
2. **Testez la création d'un produit** dans `/admin/products`
3. **Vérifiez la console** - plus d'erreurs 403 !

---

## 🚨 **IMPORTANT :**
Ce script rend les politiques RLS très permissives pour le développement.
**En production, vous devrez les restreindre pour la sécurité !**

---

### 📞 **Si ça ne marche pas :**
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Assurez-vous d'avoir les droits d'administration
3. Vérifiez qu'il n'y a pas d'erreurs dans l'exécution du script

**Exécutez ce script MAINTENANT pour résoudre les erreurs RLS ! 🚀**
