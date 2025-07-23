# 📊 Guide du Système de Monitoring - Akanda Apéro

## 🎯 Vue d'ensemble

Le système de monitoring d'Akanda Apéro est une solution complète et avancée qui collecte, analyse et visualise les données de performance, d'utilisation et d'erreurs de l'application. Il fournit des insights précieux pour optimiser l'expérience utilisateur et maintenir la qualité du service.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Supabase      │
│                 │    │                  │    │                 │
│ • MonitoringJS  │───▶│ • /api/analytics │───▶│ • Tables        │
│ • React Hooks   │    │ • /api/errors    │    │ • RLS Policies  │
│ • Auto-tracking │    │ • Validation     │    │ • Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Composants du système

### 1. **Service de Monitoring** (`src/lib/monitoring.ts`)
- Collecte automatique des métriques Web Vitals
- Tracking des erreurs JavaScript
- Monitoring des performances
- Événements utilisateur personnalisés

### 2. **Provider React** (`src/components/MonitoringProvider.tsx`)
- Intégration seamless avec React
- Hooks spécialisés pour e-commerce
- Tracking automatique des composants
- Gestion des erreurs avec contexte

### 3. **API Routes**
- `/api/analytics` : Collecte des données d'analytics
- `/api/errors` : Gestion des erreurs et alertes

### 4. **Base de données** (`sql/setup_monitoring_tables.sql`)
- Tables optimisées avec index
- Politiques RLS pour la sécurité
- Fonctions utilitaires pour l'analyse

## 🚀 Installation et Configuration

### 1. Exécuter le script SQL

```sql
-- Dans votre console Supabase SQL Editor
\i sql/setup_monitoring_tables.sql
```

### 2. Intégrer le Provider dans votre app

```tsx
// src/app/layout.tsx
import { MonitoringProvider } from '@/components/MonitoringProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <MonitoringProvider>
            {children}
          </MonitoringProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📈 Utilisation

### Tracking automatique

Le système track automatiquement :
- ✅ **Web Vitals** (LCP, FID, CLS, FCP, TTFB)
- ✅ **Erreurs JavaScript** (avec déduplication)
- ✅ **Performances de navigation**
- ✅ **Temps de session utilisateur**
- ✅ **Clics sur éléments trackés** (`data-track="element-id"`)

### Tracking manuel avec hooks

```tsx
import { useMonitoringContext, useEcommerceTracking } from '@/components/MonitoringProvider';

function ProductPage({ product }) {
  const { trackEvent } = useMonitoringContext();
  const { trackProductView, trackAddToCart } = useEcommerceTracking();

  useEffect(() => {
    // Tracker la vue produit
    trackProductView(product);
  }, [product]);

  const handleAddToCart = () => {
    trackAddToCart(product, quantity);
    // ... logique d'ajout au panier
  };

  const handleCustomEvent = () => {
    trackEvent('custom_action', {
      productId: product.id,
      action: 'button_click',
      location: 'product_page'
    });
  };

  return (
    <div>
      <button onClick={handleAddToCart}>Ajouter au panier</button>
      <button 
        data-track="product-share" 
        onClick={handleCustomEvent}
      >
        Partager
      </button>
    </div>
  );
}
```

### Tracking des performances de composants

```tsx
import { useComponentPerformance } from '@/components/MonitoringProvider';

function HeavyComponent() {
  const { trackRender } = useComponentPerformance('HeavyComponent');

  useEffect(() => {
    // Logique lourde
    performHeavyOperation().then(() => {
      trackRender('heavy_operation_complete');
    });
  }, []);

  return <div>...</div>;
}
```

### Tracking des erreurs

```tsx
import { useErrorTracking } from '@/components/MonitoringProvider';

function FormComponent() {
  const { trackError, trackFormError, trackAsyncError } = useErrorTracking();

  const handleSubmit = async (data) => {
    try {
      // Wrapper automatique pour les erreurs async
      await trackAsyncError(
        () => submitForm(data),
        { formData: data, component: 'FormComponent' }
      );
    } catch (error) {
      // Gestion d'erreur personnalisée
      trackFormError('contact-form', 'email', 'Invalid email format');
    }
  };
}
```

## 📊 Types de données collectées

### 1. **Métriques de Performance**
```typescript
interface PerformanceMetric {
  name: string;           // 'web_vital_LCP', 'page_load_time'
  value: number;          // Valeur en millisecondes
  timestamp: number;      // Timestamp Unix
  url?: string;          // URL de la page
  userId?: string;       // ID utilisateur (si connecté)
}
```

### 2. **Événements Utilisateur**
```typescript
interface UserEvent {
  event: string;                    // 'click', 'page_view', 'add_to_cart'
  properties: Record<string, any>;  // Propriétés personnalisées
  userId?: string;                  // ID utilisateur
  sessionId: string;                // ID de session
  timestamp: number;                // Timestamp Unix
}
```

### 3. **Métriques Business**
```typescript
interface BusinessMetric {
  metric: string;     // 'revenue', 'conversion_rate'
  value: number;      // Valeur numérique
  category: string;   // 'sales', 'user', 'product', 'order'
  timestamp: number;  // Timestamp Unix
}
```

### 4. **Erreurs**
```typescript
interface ErrorEvent {
  message: string;    // Message d'erreur
  stack?: string;     // Stack trace
  url: string;        // URL où l'erreur s'est produite
  userId?: string;    // ID utilisateur
  severity: string;   // 'low', 'medium', 'high', 'critical'
  timestamp: number;  // Timestamp Unix
}
```

## 🎯 Événements E-commerce pré-configurés

| Événement | Description | Propriétés |
|-----------|-------------|------------|
| `product_view` | Vue d'un produit | `productId`, `productName`, `category`, `price` |
| `add_to_cart` | Ajout au panier | `productId`, `quantity`, `price`, `total` |
| `remove_from_cart` | Suppression du panier | `productId`, `quantity`, `price` |
| `begin_checkout` | Début du checkout | `cartValue`, `itemCount` |
| `purchase` | Achat finalisé | `orderId`, `total`, `items`, `paymentMethod` |
| `category_view` | Vue d'une catégorie | `category` |
| `search` | Recherche | `query`, `results` |
| `wishlist_add` | Ajout à la wishlist | `productId`, `productName` |

## 📈 Métriques Web Vitals trackées

| Métrique | Description | Seuil Recommandé |
|----------|-------------|------------------|
| **LCP** (Largest Contentful Paint) | Temps de chargement du plus gros élément | < 2.5s |
| **FID** (First Input Delay) | Délai de première interaction | < 100ms |
| **CLS** (Cumulative Layout Shift) | Stabilité visuelle | < 0.1 |
| **FCP** (First Contentful Paint) | Premier contenu affiché | < 1.8s |
| **TTFB** (Time to First Byte) | Temps de réponse serveur | < 800ms |

## 🔍 Requêtes d'analyse utiles

### Performances moyennes par page
```sql
SELECT 
  url,
  AVG(metric_value) as avg_load_time,
  COUNT(*) as page_views
FROM analytics_performance 
WHERE metric_name = 'web_vital_LCP'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY url
ORDER BY avg_load_time DESC;
```

### Top des erreurs non résolues
```sql
SELECT 
  message,
  occurrence_count,
  severity,
  last_occurrence
FROM error_logs 
WHERE resolved = FALSE
ORDER BY occurrence_count DESC, last_occurrence DESC
LIMIT 10;
```

### Conversion funnel
```sql
SELECT 
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events 
WHERE event_name IN ('product_view', 'add_to_cart', 'begin_checkout', 'purchase')
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY 
  CASE event_name 
    WHEN 'product_view' THEN 1
    WHEN 'add_to_cart' THEN 2
    WHEN 'begin_checkout' THEN 3
    WHEN 'purchase' THEN 4
  END;
```

### Revenus par jour
```sql
SELECT 
  DATE(timestamp) as date,
  SUM(metric_value) as daily_revenue,
  COUNT(*) as orders
FROM analytics_business 
WHERE metric_name = 'revenue'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## 🛡️ Sécurité et confidentialité

### Row Level Security (RLS)
- ✅ **Utilisateurs** : Accès à leurs propres données uniquement
- ✅ **Admins** : Accès complet à toutes les données
- ✅ **Anonymes** : Aucun accès aux données sensibles

### Données anonymisées
- Les adresses IP sont hashées
- Les données utilisateur sont pseudonymisées
- Conformité RGPD par design

### Nettoyage automatique
```sql
-- Exécuter périodiquement (cron job recommandé)
SELECT cleanup_old_monitoring_data();
```

## 📱 Dashboard et visualisation

### API d'accès aux données
```typescript
// Récupérer les stats du dashboard
const response = await fetch('/api/analytics?type=dashboard&period=7d');
const data = await response.json();

// Récupérer les erreurs
const errors = await fetch('/api/errors?period=7d&severity=high');
const errorData = await errors.json();
```

### Intégration avec des outils externes

Le système peut facilement s'intégrer avec :
- **Google Analytics 4** (via gtag)
- **Mixpanel** (événements personnalisés)
- **Sentry** (error tracking)
- **DataDog** (monitoring infrastructure)
- **Plausible** (analytics privacy-first)

## 🔧 Maintenance et optimisation

### Tâches périodiques recommandées

1. **Quotidien** : Vérifier les erreurs critiques
2. **Hebdomadaire** : Analyser les performances et tendances
3. **Mensuel** : Nettoyer les anciennes données
4. **Trimestriel** : Optimiser les index et requêtes

### Monitoring des performances du système

```sql
-- Vérifier la taille des tables
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename LIKE 'analytics_%' OR tablename LIKE 'error_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Alertes recommandées

- 🚨 **Erreurs critiques** : Notification immédiate
- 📈 **Pic de trafic** : +200% par rapport à la moyenne
- ⚡ **Performance dégradée** : LCP > 4s pendant 5 minutes
- 💰 **Chute des conversions** : -50% par rapport à hier

## 🎯 Bonnes pratiques

### Do ✅
- Tracker les événements métier importants
- Utiliser des noms d'événements cohérents
- Ajouter du contexte aux erreurs
- Respecter la vie privée des utilisateurs
- Nettoyer régulièrement les anciennes données

### Don't ❌
- Ne pas tracker d'informations sensibles (mots de passe, etc.)
- Éviter le sur-tracking (impact performance)
- Ne pas ignorer les erreurs de faible sévérité
- Éviter les noms d'événements génériques
- Ne pas oublier de tester le tracking

## 🚀 Évolutions futures

- **Machine Learning** : Détection d'anomalies automatique
- **Real-time Dashboard** : Visualisation en temps réel
- **A/B Testing** : Intégration avec les tests A/B
- **Alertes intelligentes** : Seuils adaptatifs
- **Export de données** : API pour l'export vers des outils BI

---

## 📞 Support

Pour toute question ou problème avec le système de monitoring :

1. Vérifiez les logs dans la console développeur
2. Consultez les tables `error_logs` pour les erreurs système
3. Utilisez les fonctions SQL utilitaires pour l'analyse
4. Contactez l'équipe technique si nécessaire

**Le monitoring est maintenant prêt ! 🎉**
