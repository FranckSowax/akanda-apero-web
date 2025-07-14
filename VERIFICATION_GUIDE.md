# 🔍 Guide de Vérification de la Base de Données Akanda Apéro

## Vue d'ensemble

Ce guide vous permet de vérifier complètement l'état de votre base de données Supabase et de l'intégration API pour l'application Akanda Apéro.

## 📋 Scripts Disponibles

### 1. Scripts de Correction (à exécuter en premier si nécessaire)

- **`sync_order_statuses_fixed.sql`** - Script principal de synchronisation des statuts
- **`fix_customers_fkey_clean.sql`** - Correction des contraintes de clés étrangères
- **`fix_column_names.sql`** - Ajout des colonnes manquantes
- **`create_enum_function.sql`** - Création de la fonction pour récupérer les types ENUM

### 2. Scripts de Vérification

- **`verify_database_complete.sql`** - Vérification complète de la structure DB
- **Page `/test-database`** - Interface de test de l'API et de l'intégration

## 🚀 Procédure de Vérification

### Étape 1: Exécuter les Scripts de Correction

1. **Ouvrez Supabase SQL Editor**
2. **Exécutez dans l'ordre :**
   ```sql
   -- 1. Correction des contraintes
   -- Copiez et exécutez le contenu de fix_customers_fkey_clean.sql
   
   -- 2. Ajout des colonnes manquantes  
   -- Copiez et exécutez le contenu de fix_column_names.sql
   
   -- 3. Synchronisation des statuts
   -- Copiez et exécutez le contenu de sync_order_statuses_fixed.sql
   
   -- 4. Création de la fonction ENUM
   -- Copiez et exécutez le contenu de create_enum_function.sql
   ```

### Étape 2: Vérification de la Structure

1. **Exécutez le script de vérification :**
   ```sql
   -- Copiez et exécutez le contenu de verify_database_complete.sql
   ```

2. **Vérifiez les résultats :**
   - Tous les éléments doivent être marqués ✅
   - Si des éléments sont marqués ❌, reprenez l'étape 1

### Étape 3: Test de l'Intégration API

1. **Accédez à la page de test :**
   ```
   http://localhost:3000/test-database
   ```

2. **Cliquez sur "Lancer les Tests"**

3. **Vérifiez que tous les tests passent :**
   - ✅ Connexion Base de Données
   - ✅ Création Commande Test
   - ✅ Récupération Commande
   - ✅ Changement Statut

## 🎯 Résultats Attendus

### Base de Données ✅

- **Tables principales** : customers, orders, order_items, products, categories
- **Types ENUM** : order_status, payment_status avec valeurs françaises
- **Colonnes orders** : Toutes les colonnes requises par l'API
- **Fonctions** : generate_order_number, get_enum_types
- **Test de création** : Commande test créée avec succès

### API ✅

- **Connexion** : Supabase accessible
- **POST /api/orders** : Création de commandes fonctionnelle
- **GET /api/orders** : Récupération de commandes
- **PATCH /api/orders** : Changement de statut
- **Numéros de commande** : Auto-génération (CMD-YYYYMMDD-XXXX)

## 🔧 Résolution des Problèmes

### Erreur "customers_id_fkey"
```sql
-- Exécutez fix_customers_fkey_clean.sql
```

### Colonnes manquantes
```sql
-- Exécutez fix_column_names.sql
```

### Statuts incorrects
```sql
-- Exécutez sync_order_statuses_fixed.sql
```

### Fonction get_enum_types manquante
```sql
-- Exécutez create_enum_function.sql
```

## 📊 Statuts Supportés

### Statuts de Commande
- **Nouvelle** (défaut)
- **Confirmée** 
- **En préparation**
- **Prête**
- **En livraison**
- **Livrée**
- **Annulée**

### Statuts de Paiement
- **En attente** (défaut)
- **Payé**
- **Échoué**
- **Remboursé**

## 🎉 Validation Finale

Une fois tous les tests passés :

1. **✅ Base de données** : Structure complète et cohérente
2. **✅ API** : Endpoints fonctionnels
3. **✅ Intégration** : Frontend ↔ Backend synchronisés
4. **✅ Statuts** : Valeurs françaises partout
5. **✅ WhatsApp** : Notifications prêtes

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Supabase SQL Editor
2. Consultez les détails des erreurs dans la page `/test-database`
3. Assurez-vous que toutes les variables d'environnement sont configurées
4. Vérifiez que RLS (Row Level Security) n'interfère pas avec les tests

---

**🚀 Votre base de données Akanda Apéro est maintenant prête pour la production !**
