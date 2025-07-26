# 🎯 Guide d'Installation - Système de Promotions Dynamiques

## 📋 Vue d'ensemble

Ce système permet de gérer des promotions dynamiques synchronisées entre l'administration et la page d'accueil, avec upload d'images, compte à rebours en temps réel, et codes promo.

## 🛠️ Installation

### 1. Base de données Supabase

Exécutez les scripts SQL dans l'ordre suivant dans l'éditeur SQL de Supabase :

```bash
# 1. Créer la table et les données d'exemple
sql/setup_promotions_table.sql

# 2. Ajouter les fonctions avancées
sql/promotion_functions.sql
```

### 2. Vérification des fichiers créés

Vérifiez que tous ces fichiers sont présents :

```
src/
├── types/promotions.ts                                    ✅
├── services/promotionsService.ts                          ✅
├── hooks/usePromotions.ts                                 ✅
├── components/promotions/
│   ├── PromotionCountdown.tsx                            ✅
│   ├── PromotionCard.tsx                                 ✅
│   └── DynamicPromotionsModule.tsx                       ✅
└── app/
    ├── page.tsx (modifié avec DynamicPromotionsModule)   ✅
    └── admin/promotions/page-dynamic.tsx                 ✅
```

### 3. Configuration du bucket Supabase

1. Allez dans **Storage** > **Buckets** dans Supabase
2. Vérifiez que le bucket `images` existe et est public
3. Créez le dossier `promotions/` dans le bucket

## 🎮 Utilisation

### Page d'accueil

Le module de promotions s'affiche automatiquement sur la page d'accueil :
- **Chargement dynamique** depuis Supabase
- **Compte à rebours** en temps réel
- **Images uploadées** affichées
- **Gestion des erreurs** avec fallback

### Administration

Accédez à `/admin/promotions` pour :
- **Créer** de nouvelles promotions
- **Modifier** les promotions existantes
- **Upload d'images** par drag & drop
- **Activer/désactiver** les promotions
- **Voir les statistiques** d'utilisation

## 🧪 Tests à effectuer

### 1. Test de la base de données

```sql
-- Vérifier que la table existe
SELECT * FROM promotions LIMIT 5;

-- Tester les fonctions
SELECT * FROM get_active_promotions();
SELECT * FROM validate_promo_code('COCKTAIL30', 50.00);
```

### 2. Test de l'affichage front

1. Allez sur la page d'accueil
2. Vérifiez que le module de promotions s'affiche
3. Vérifiez le compte à rebours (doit se mettre à jour chaque seconde)
4. Vérifiez l'affichage des images

### 3. Test de l'administration

1. Allez sur `/admin/promotions`
2. Créez une nouvelle promotion avec image
3. Vérifiez que l'image s'upload correctement
4. Activez/désactivez la promotion
5. Vérifiez que les changements apparaissent sur la page d'accueil

## 🔧 Configuration avancée

### Couleurs par défaut

Modifiez `DEFAULT_PROMOTION_COLORS` dans `src/types/promotions.ts` :

```typescript
export const DEFAULT_PROMOTION_COLORS = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  BLUE: '#3b82f6',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  // Ajoutez vos couleurs personnalisées
} as const;
```

### Permissions Supabase

Vérifiez les politiques RLS dans Supabase :

```sql
-- Lecture publique des promotions actives
SELECT * FROM pg_policies WHERE tablename = 'promotions';
```

## 🐛 Dépannage

### Problème : Les promotions ne s'affichent pas

1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que la table `promotions` existe dans Supabase
3. Vérifiez les politiques RLS
4. Vérifiez que les promotions ont `is_active = true`

### Problème : Les images ne s'affichent pas

1. Vérifiez que le bucket `images` est public
2. Vérifiez les URLs générées dans la base de données
3. Vérifiez les permissions du bucket Supabase

### Problème : Le compte à rebours ne fonctionne pas

1. Vérifiez les dates `start_date` et `end_date` dans la base
2. Vérifiez la console pour les erreurs JavaScript
3. Vérifiez que le composant `PromotionCountdown` est bien importé

## 📊 Monitoring

### Statistiques disponibles

Le hook `usePromotionStats()` fournit :
- Nombre total de promotions
- Promotions actives
- Promotions mises en avant
- Nombre total d'utilisations
- Taux de conversion

### Logs

Le système utilise `error-handler.ts` pour un logging centralisé :
- Erreurs d'API
- Uploads d'images
- Actions utilisateur

## 🚀 Fonctionnalités avancées

### Codes promo

```typescript
// Valider un code promo
const { validateCode } = usePromoCode();
const promotion = await validateCode('COCKTAIL30', orderAmount);
```

### Compte à rebours personnalisé

```typescript
// Utiliser le hook de compte à rebours
const { countdown, isExpired, timeLeft } = usePromotionCountdown(endDate);
```

### Upload d'images

```typescript
// Service d'upload
const imageUrl = await PromotionsService.uploadPromotionImage(file, promotionId);
```

## 🔄 Workflow complet

1. **Admin crée une promotion** → Sauvegarde en base Supabase
2. **Upload d'image** → Stockage dans bucket Supabase
3. **Activation** → Promotion visible sur la page d'accueil
4. **Compte à rebours** → Mise à jour en temps réel
5. **Expiration** → Promotion automatiquement masquée

## 📝 Notes importantes

- Les promotions expirées restent en base mais ne s'affichent plus
- Les images sont stockées dans `images/promotions/`
- Le système supporte les réductions en % ou en montant fixe
- Les codes promo sont uniques et case-insensitive
- Le système est entièrement responsive

## 🎉 Prêt pour la production !

Le système est maintenant prêt pour la production avec :
- ✅ Gestion complète CRUD
- ✅ Upload d'images sécurisé
- ✅ Synchronisation temps réel
- ✅ Interface admin intuitive
- ✅ Affichage front optimisé
- ✅ Gestion d'erreurs robuste
