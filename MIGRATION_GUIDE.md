# Guide de Migration - Géolocalisation des Commandes

## 📋 Étapes de Migration

### 1. Exécuter le Script SQL sur Supabase

1. **Connectez-vous à votre dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet Akanda Apéro

2. **Ouvrir l'éditeur SQL**
   - Dans le menu latéral, cliquez sur "SQL Editor"
   - Créez une nouvelle requête

3. **Exécuter le script de migration**
   - Copiez le contenu du fichier `supabase_add_location_to_orders.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter

### 2. Vérifier la Migration

Après l'exécution, vérifiez que :

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'delivery_%';

-- Vérifier les fonctions créées
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_distance_km',
  'generate_waze_url',
  'generate_google_maps_url',
  'generate_apple_maps_url'
);

-- Vérifier la vue
SELECT * FROM orders_with_navigation LIMIT 1;
```

### 3. Tester l'Application

1. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

2. **Tester le processus de commande**
   - Aller sur `/checkout`
   - Sélectionner une localisation sur la carte
   - Finaliser une commande
   - Vérifier que les coordonnées GPS sont sauvegardées

3. **Tester la page de livraisons admin**
   - Aller sur `/admin/deliveries`
   - Vérifier l'affichage des commandes avec coordonnées GPS
   - Tester les liens de navigation (Waze, Google Maps)

## 🔧 Fonctionnalités Ajoutées

### ✅ Base de Données
- **Nouvelles colonnes** : `delivery_latitude`, `delivery_longitude`, `delivery_location_address`, `delivery_location_accuracy`
- **Fonctions SQL** : Calcul de distance et génération d'URLs de navigation
- **Vue enrichie** : `orders_with_navigation` avec liens de navigation automatiques
- **Index spatial** : Optimisation des requêtes géographiques

### ✅ Frontend
- **Hook useOrders** : Mise à jour pour sauvegarder les coordonnées GPS
- **Types TypeScript** : Nouveaux types `NavigationLinks` et `OrderWithNavigation`
- **Service Navigation** : Génération de liens Waze, Google Maps, Apple Maps
- **Composant NavigationLinks** : Interface utilisateur pour la navigation
- **Page Admin Livraisons** : Gestion complète des livraisons avec GPS

### ✅ Fonctionnalités Utilisateur
- **Sélection GPS** : Carte interactive dans le checkout
- **Navigation automatique** : Détection du meilleur app de navigation
- **Liens multiples** : Support Waze, Google Maps, Apple Maps
- **Validation GPS** : Vérification de la validité des coordonnées

## 🚨 Points d'Attention

### Variables d'Environnement
Assurez-vous que ces variables sont configurées :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Permissions Supabase
Vérifiez les politiques RLS (Row Level Security) pour les nouvelles colonnes :
```sql
-- Exemple de politique pour les commandes
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid()::text = customer_id);
```

### Données Existantes
Les commandes existantes auront des coordonnées GPS `NULL`. Pour les mettre à jour :
```sql
-- Exemple de mise à jour pour les commandes existantes
UPDATE orders 
SET delivery_latitude = 3.848, 
    delivery_longitude = 11.502,
    delivery_location_address = 'Yaoundé, Cameroun'
WHERE delivery_latitude IS NULL;
```

## 📱 Test de Navigation

### URLs Générées
- **Waze** : `https://waze.com/ul?ll=3.848,11.502&navigate=yes`
- **Google Maps** : `https://www.google.com/maps/dir/?api=1&destination=3.848,11.502`
- **Apple Maps** : `http://maps.apple.com/?daddr=3.848,11.502`

### Validation
- Coordonnées valides : latitude [-90, 90], longitude [-180, 180]
- Précision GPS : Stockée en mètres
- Adresse formatée : Sauvegardée pour affichage

## 🎯 Prochaines Étapes

1. **Optimisation** : Ajouter la géolocalisation automatique
2. **Analytics** : Statistiques de livraison par zone
3. **Notifications** : Alertes de proximité pour les livreurs
4. **Intégration** : API de routage pour calcul de temps de trajet

---

**✅ Migration terminée avec succès !**
L'application Akanda Apéro dispose maintenant d'un système complet de géolocalisation et navigation pour les livraisons.
