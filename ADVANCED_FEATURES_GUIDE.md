# 🚀 Guide des Fonctionnalités Avancées - Akanda Apéro

Ce guide détaille l'utilisation des fonctionnalités avancées de monitoring, analytics, export et A/B testing intégrées dans l'application Akanda Apéro.

## 📊 Système de Monitoring Avancé

### Vue d'ensemble
Le système de monitoring capture automatiquement :
- **Web Vitals** : LCP, FID, CLS, FCP, TTFB
- **Erreurs JavaScript** avec déduplication et classification
- **Événements utilisateur** et sessions
- **Métriques business** (revenus, conversions)

### Configuration

#### 1. Variables d'environnement
```bash
# Monitoring de base (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Export Google Analytics (optionnel)
NEXT_PUBLIC_GA4_ENABLED=true
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_ga4_api_secret

# Export Mixpanel (optionnel)
NEXT_PUBLIC_MIXPANEL_ENABLED=true
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Export Amplitude (optionnel)
NEXT_PUBLIC_AMPLITUDE_ENABLED=true
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key

# Alertes (optionnel)
SLACK_WEBHOOK_URL=your_slack_webhook
ALERT_WEBHOOK_URL=your_custom_webhook
```

#### 2. Installation des tables
```bash
# Exécuter dans Supabase SQL Editor
psql -f sql/setup_monitoring_tables.sql
psql -f sql/setup_ab_testing_tables.sql
```

### Utilisation dans les composants

#### Tracking d'événements
```tsx
import { useMonitoring } from '@/components/MonitoringProvider';

function MyComponent() {
  const { trackUserEvent, trackEcommerce } = useMonitoring();

  const handleClick = () => {
    trackUserEvent({
      event: 'button_click',
      properties: {
        button_name: 'cta_primary',
        page: 'home'
      }
    });
  };

  const handlePurchase = (order) => {
    trackEcommerce({
      event: 'ecommerce_purchase',
      properties: {
        orderId: order.id,
        total: order.total,
        items: order.items
      }
    });
  };

  return (
    <button onClick={handleClick}>
      Acheter maintenant
    </button>
  );
}
```

#### Monitoring de performance des composants
```tsx
import { useComponentPerformance } from '@/components/MonitoringProvider';

function ExpensiveComponent() {
  useComponentPerformance('ExpensiveComponent');

  return <div>Contenu complexe...</div>;
}
```

## 📈 Export vers Plateformes Analytics

### Google Analytics 4
L'export automatique vers GA4 convertit les événements au format standard :
- `ecommerce_product_view` → `view_item`
- `ecommerce_add_to_cart` → `add_to_cart`
- `ecommerce_purchase` → `purchase`

### Configuration
```typescript
import { analyticsExport } from '@/lib/analytics-export';

// Test de connectivité
const results = await analyticsExport.testConnections();
console.log('Connectivité:', results);

// Export manuel d'un événement
await analyticsExport.exportEvent({
  event: 'custom_event',
  properties: { value: 100 },
  userId: 'user123',
  timestamp: Date.now()
});

// Synchronisation des données existantes
await analyticsExport.syncExistingData(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

## 🧪 Système A/B Testing

### Création d'un test
```typescript
import { abTesting } from '@/lib/ab-testing';

const testId = await abTesting.createTest({
  name: 'Test Couleur Bouton CTA',
  description: 'Tester l\'impact de la couleur sur les conversions',
  targetAudience: { percentage: 50 },
  metrics: {
    primary: 'conversion_rate',
    secondary: ['click_rate']
  },
  variants: [
    {
      id: 'control',
      name: 'Bouton Bleu (Contrôle)',
      weight: 50,
      config: { buttonColor: 'blue' },
      isControl: true
    },
    {
      id: 'variant_a',
      name: 'Bouton Rouge',
      weight: 50,
      config: { buttonColor: 'red' },
      isControl: false
    }
  ]
});

// Démarrer le test
await abTesting.startTest(testId);
```

### Utilisation dans les composants
```tsx
import { useABTest } from '@/lib/ab-testing';

function CTAButton({ userId }) {
  const { variant, config, trackConversion } = useABTest('button_color_test', userId);

  const handleClick = () => {
    // Tracker la conversion
    trackConversion('click_rate');
    
    // Logique métier...
  };

  const buttonColor = config?.buttonColor || 'blue';

  return (
    <button 
      className={`bg-${buttonColor}-500 hover:bg-${buttonColor}-600`}
      onClick={handleClick}
    >
      Acheter maintenant
    </button>
  );
}
```

### Gestion via l'interface admin
1. Accédez à `/admin/ab-testing`
2. Créez un nouveau test avec les variantes
3. Démarrez le test
4. Suivez les résultats en temps réel
5. Terminez le test quand significatif

## 🚨 Système d'Alertes Automatiques

### Configuration des règles d'alerte
```typescript
import { alerting } from '@/lib/alerting';

// Ajouter une règle d'alerte
await alerting.addRule({
  id: 'high_error_rate',
  name: 'Taux d\'erreur élevé',
  condition: {
    metric: 'error_rate',
    operator: 'greater_than',
    threshold: 5, // 5%
    timeWindow: '5m'
  },
  channels: ['email', 'slack'],
  severity: 'critical'
});

// Évaluer les règles (automatique via cron)
await alerting.evaluateRules();
```

### Types d'alertes disponibles
- **Erreurs critiques** : Erreurs JavaScript fréquentes
- **Performance dégradée** : Web Vitals au-dessus des seuils
- **Anomalies business** : Chute soudaine des conversions
- **Indisponibilité** : Erreurs serveur répétées

## 📊 Dashboard Analytics Admin

### Accès
Rendez-vous sur `/admin/analytics` pour accéder au dashboard complet avec :

#### Onglet Vue d'ensemble
- Métriques de performance globales
- Graphiques de tendances
- Alertes actives

#### Onglet Performance
- Web Vitals détaillés
- Temps de chargement par page
- Erreurs JavaScript

#### Onglet E-commerce
- Funnel de conversion
- Revenus par période
- Produits les plus vus

#### Onglet Erreurs
- Log des erreurs en temps réel
- Classification par sévérité
- Résolution des erreurs

## 🔧 API Endpoints

### Analytics
```bash
# Récupérer les métriques
GET /api/analytics?start=2024-01-01&end=2024-12-31&metric=performance

# Envoyer un événement
POST /api/analytics
{
  "event": "page_view",
  "properties": { "page": "/home" },
  "userId": "user123"
}
```

### A/B Testing
```bash
# Lister les tests
GET /api/ab-tests?status=running

# Créer un test
POST /api/ab-tests
{
  "name": "Test Button Color",
  "variants": [...]
}

# Obtenir les résultats
GET /api/ab-tests/test_id/results
```

### Erreurs
```bash
# Lister les erreurs
GET /api/errors?severity=critical&resolved=false

# Marquer comme résolue
POST /api/errors/error_id/resolve
```

## 📈 Métriques et KPIs

### Performance
- **LCP** : < 2.5s (bon), < 4s (acceptable)
- **FID** : < 100ms (bon), < 300ms (acceptable)
- **CLS** : < 0.1 (bon), < 0.25 (acceptable)

### Business
- **Taux de conversion** : Commandes / Visiteurs
- **Panier moyen** : Revenus / Commandes
- **Taux d'abandon** : Paniers abandonnés / Paniers créés

### Engagement
- **Temps sur site** : Durée moyenne des sessions
- **Pages par session** : Navigation utilisateur
- **Taux de rebond** : Sessions d'une seule page

## 🚀 Optimisations Recommandées

### 1. Performance
- Surveillez les Web Vitals quotidiennement
- Optimisez les images lourdes détectées
- Réduisez le JavaScript non critique

### 2. Conversions
- Testez les éléments CTA régulièrement
- Analysez le funnel e-commerce
- Optimisez les pages à fort trafic

### 3. Erreurs
- Résolvez les erreurs critiques immédiatement
- Surveillez les nouvelles erreurs après déploiements
- Maintenez un taux d'erreur < 1%

## 🔒 Sécurité et Confidentialité

### Données personnelles
- Les IDs utilisateurs sont hashés
- Pas de stockage d'informations sensibles
- Conformité RGPD par design

### Accès aux données
- RLS (Row Level Security) activé
- Accès admin sécurisé
- Logs d'audit automatiques

## 🆘 Dépannage

### Problèmes courants

#### Les événements ne s'enregistrent pas
1. Vérifiez la connexion Supabase
2. Contrôlez les permissions RLS
3. Vérifiez la console navigateur

#### Export GA4 ne fonctionne pas
1. Validez les variables d'environnement
2. Testez la connectivité : `analyticsExport.testConnections()`
3. Vérifiez les quotas API Google

#### Tests A/B sans résultats
1. Vérifiez que le test est démarré
2. Contrôlez l'assignation des utilisateurs
3. Vérifiez le tracking des conversions

### Support
Pour toute question technique :
1. Consultez les logs dans `/admin/analytics`
2. Vérifiez la documentation Supabase
3. Contactez l'équipe technique

---

## 🎯 Prochaines Étapes

1. **Configurez les exports** vers vos plateformes analytics
2. **Créez vos premiers tests A/B** sur les éléments critiques
3. **Configurez les alertes** pour votre équipe
4. **Surveillez régulièrement** le dashboard analytics
5. **Optimisez continuellement** basé sur les données

Cette intégration avancée vous donne tous les outils nécessaires pour monitorer, analyser et optimiser votre application Akanda Apéro de manière professionnelle et data-driven ! 🚀
