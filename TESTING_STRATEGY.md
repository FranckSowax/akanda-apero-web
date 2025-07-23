# 🧪 Stratégie de Tests Automatisés - Akanda Apéro

## 📋 Vue d'ensemble

Cette documentation présente la stratégie complète de tests automatisés mise en place pour le projet Akanda Apéro, garantissant la qualité, la stabilité et la fiabilité de l'application.

## 🎯 Objectifs

- **Qualité** : Garantir le bon fonctionnement des fonctionnalités
- **Stabilité** : Prévenir les régressions lors des mises à jour
- **Fiabilité** : Assurer une expérience utilisateur cohérente
- **Maintenance** : Faciliter la maintenance et l'évolution du code

## 🏗️ Architecture de Tests

### 1. Tests Unitaires (Jest + React Testing Library)
- **Localisation** : `src/**/__tests__/` et `tests/unit/`
- **Couverture** : Fonctions utilitaires, hooks, composants isolés
- **Objectif** : Tester les unités de code individuellement

### 2. Tests d'Intégration (Jest)
- **Localisation** : `tests/integration/`
- **Couverture** : Services Supabase, API, interactions entre modules
- **Objectif** : Tester les interactions entre composants

### 3. Tests End-to-End (Playwright)
- **Localisation** : `tests/e2e/`
- **Couverture** : Parcours utilisateur complets, fonctionnalités critiques
- **Objectif** : Tester l'application dans son ensemble

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
- Environment: jsdom pour React
- Setup: jest.setup.js avec mocks globaux
- Coverage: 70% minimum sur branches, fonctions, lignes
- Aliases: Support des imports @/ 
```

### Playwright Configuration (`playwright.config.ts`)
```javascript
- Browsers: Chrome, Firefox, Safari, Mobile
- Reports: HTML, JSON, JUnit
- Screenshots et vidéos sur échec
- Server local automatique
```

## 📊 Scripts NPM Disponibles

```bash
# Tests unitaires
npm run test              # Tous les tests Jest
npm run test:unit         # Tests unitaires uniquement
npm run test:watch        # Mode watch
npm run test:coverage     # Avec rapport de couverture

# Tests d'intégration
npm run test:integration  # Tests d'intégration

# Tests E2E
npm run test:e2e          # Tests Playwright
npm run test:e2e:ui       # Interface graphique
npm run test:e2e:headed   # Mode visible

# Tests complets
npm run test:all          # Unitaires + E2E
npm run test:ci           # Pour CI/CD
```

## 🧩 Composants Testés

### ✅ Utilitaires de Performance
- `formatCurrency` : Formatage devise XAF
- `formatCurrencyWithDiscount` : Calcul remises
- `useDebounce` : Hook de debounce
- `useThrottle` : Hook de throttle
- `useLocalCache` : Cache local avec TTL

### ✅ Services Supabase
- Authentification (session, login, logout)
- Base de données (CRUD operations)
- Storage (upload, download, URLs publiques)
- Real-time (subscriptions)

### ✅ Parcours Utilisateur E2E
- Navigation homepage → produits → panier → checkout
- Authentification utilisateur
- Section cocktails
- Dashboard admin (si accessible)
- Performance et accessibilité

## 🎨 Mocks et Setup

### Mocks Globaux (jest.setup.js)
- Next.js Router et Navigation
- Next.js Image component
- Supabase client complet
- Framer Motion animations
- IntersectionObserver, ResizeObserver
- LocalStorage, SessionStorage
- Window.matchMedia

### Variables d'Environnement Test
```bash
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
NODE_ENV=test
```

## 📈 Couverture de Code

### Objectifs de Couverture
- **Branches** : 70% minimum
- **Fonctions** : 70% minimum  
- **Lignes** : 70% minimum
- **Statements** : 70% minimum

### Exclusions
- Fichiers de configuration (layout, loading, error)
- Pages Next.js (initialement)
- Client Supabase
- Types TypeScript

## 🚀 Intégration CI/CD

### Commandes CI
```bash
npm run test:ci  # Tests avec couverture + E2E
```

### Rapports Générés
- **Coverage** : Rapport HTML de couverture
- **E2E Results** : JSON et XML pour intégration
- **Screenshots** : Captures d'écran sur échec
- **Videos** : Enregistrements des tests E2E

## 🔍 Bonnes Pratiques

### Tests Unitaires
- Un test = une fonctionnalité
- Mocks appropriés pour les dépendances
- Assertions claires et spécifiques
- Noms de tests descriptifs

### Tests d'Intégration
- Tester les interactions réelles
- Mocks minimaux
- Scénarios réalistes
- Gestion des erreurs

### Tests E2E
- Parcours utilisateur complets
- Sélecteurs robustes (data-testid)
- Attentes explicites (waitFor)
- Tests indépendants

## 🐛 Debugging

### Tests Unitaires
```bash
npm run test:watch  # Mode interactif
```

### Tests E2E
```bash
npm run test:e2e:headed  # Mode visible
npm run test:e2e:ui      # Interface graphique
```

## 📝 Maintenance

### Ajout de Nouveaux Tests
1. Créer le fichier test approprié
2. Suivre les conventions de nommage
3. Ajouter les mocks nécessaires
4. Vérifier la couverture

### Mise à Jour des Tests
1. Maintenir la cohérence avec le code
2. Mettre à jour les mocks si nécessaire
3. Vérifier les seuils de couverture
4. Tester sur tous les environnements

## 🎉 Résultats

### ✅ Avantages Obtenus
- **Qualité** : Détection précoce des bugs
- **Confiance** : Déploiements sereins
- **Documentation** : Tests comme spécifications
- **Refactoring** : Modifications sécurisées

### 📊 Métriques
- **Temps d'exécution** : ~30s pour tests unitaires
- **Couverture** : 70%+ sur composants critiques
- **E2E** : Parcours principaux couverts
- **Maintenance** : Tests maintenus à jour

---

## 🚀 Prochaines Étapes

1. **Augmenter la couverture** : Ajouter tests pour composants manquants
2. **Tests visuels** : Intégrer tests de régression visuelle
3. **Performance** : Tests de charge et performance
4. **Accessibilité** : Tests d'accessibilité automatisés

---

*Cette stratégie de tests automatisés garantit la qualité et la fiabilité du projet Akanda Apéro pour un déploiement en production serein.* 🎯
