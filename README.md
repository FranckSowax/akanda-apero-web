# 🍹 Akanda Apéro - Application Web E-commerce

> Application web moderne de vente d'apéritifs et cocktails avec système de fidélité, gestion admin complète et expérience utilisateur optimisée.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Playwright-green?logo=jest)](./TESTING_STRATEGY.md)

## 📋 Table des Matières

- [🎯 Aperçu](#-aperçu)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [💻 Développement](#-développement)
- [🧪 Tests](#-tests)
- [📦 Déploiement](#-déploiement)
- [🔧 Configuration](#-configuration)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

## 🎯 Aperçu

Akanda Apéro est une application web e-commerce complète spécialisée dans la vente d'apéritifs et de cocktails. Elle offre une expérience utilisateur moderne avec un système de fidélité gamifié, une interface d'administration complète et des fonctionnalités avancées de gestion des commandes.

### 🌟 Points Forts

- **Interface moderne** : Design responsive avec Tailwind CSS
- **Performance optimisée** : Next.js 15 avec optimisations avancées
- **Backend robuste** : Supabase avec authentification et base de données
- **Tests automatisés** : Couverture complète (unitaires, intégration, E2E)
- **Admin dashboard** : Gestion complète des produits, commandes, clients
- **Système de fidélité** : Points, récompenses et gamification

## ✨ Fonctionnalités

### 👥 Côté Utilisateur

- **🛒 E-commerce complet**
  - Catalogue de produits avec filtres et recherche
  - Panier intelligent avec persistance
  - Checkout optimisé avec multiple options de paiement
  - Historique des commandes

- **🍸 Section Cocktails**
  - Recettes de cocktails et mocktails
  - Instructions détaillées avec vidéos
  - Système de catégories
  - Cocktail de la semaine rotatif

- **🎯 Programme de Fidélité**
  - Points automatiques sur chaque achat
  - Livraison gratuite à 50 points
  - Interface gamifiée
  - Historique des points

- **👤 Gestion de Compte**
  - Authentification Supabase
  - Profil utilisateur personnalisable
  - Historique des commandes
  - Paramètres de livraison

### 🔧 Côté Administration

- **📊 Dashboard Analytics**
  - Statistiques en temps réel
  - Graphiques de ventes
  - Métriques de performance
  - Rapports détaillés

- **📦 Gestion des Produits**
  - CRUD complet des produits
  - Upload d'images optimisé
  - Gestion des stocks
  - Catégories et tags

- **🛍️ Gestion des Commandes**
  - Suivi en temps réel
  - Statuts de commande
  - Checklist de préparation
  - Gestion des livraisons

- **🍹 Gestion des Cocktails**
  - CRUD cocktails et mocktails
  - Upload images et vidéos
  - Gestion des recettes
  - Système de rotation

- **👥 Gestion Clients**
  - Base de données clients
  - Historique d'achats
  - Points de fidélité
  - Segmentation

## 🏗️ Architecture

### Stack Technique

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ • Next.js 15    │◄──►│ • Supabase API  │◄──►│ • PostgreSQL    │
│ • TypeScript    │    │ • Auth          │    │ • Real-time     │
│ • Tailwind CSS  │    │ • Storage       │    │ • RLS Policies  │
│ • React Query   │    │ • Edge Funcs    │    │ • Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Structure du Projet

```
akanda-apero-web/
├── src/
│   ├── app/                 # Pages Next.js App Router
│   │   ├── admin/          # Interface d'administration
│   │   ├── api/            # Routes API
│   │   ├── auth/           # Authentification
│   │   ├── mon-compte/     # Espace utilisateur
│   │   └── ...
│   ├── components/         # Composants React réutilisables
│   │   ├── admin/         # Composants admin
│   │   ├── ui/            # Composants UI de base
│   │   └── ...
│   ├── contexts/          # Contextes React
│   ├── hooks/             # Hooks personnalisés
│   ├── lib/               # Utilitaires et configurations
│   ├── services/          # Services API et logique métier
│   └── utils/             # Fonctions utilitaires
├── tests/                 # Tests automatisés
│   ├── unit/             # Tests unitaires
│   ├── integration/      # Tests d'intégration
│   └── e2e/              # Tests end-to-end
├── public/               # Assets statiques
└── docs/                 # Documentation
```

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et npm
- **Git** pour le clonage
- **Compte Supabase** pour le backend

### Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/FranckSowax/akanda-apero-web.git
cd akanda-apero-web

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# 4. Lancer en développement
npm run dev
```

### Configuration Supabase

1. **Créer un projet Supabase**
2. **Configurer les tables** (voir `/sql/` pour les scripts)
3. **Configurer l'authentification**
4. **Configurer le storage** pour les images
5. **Mettre à jour les variables d'environnement**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 💻 Développement

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement (port 3002)
npm run dev:turbo        # Mode turbopack (plus rapide)

# Build et Production
npm run build            # Build de production
npm run start            # Serveur de production
npm run build:strict     # Build avec linting strict

# Qualité de Code
npm run lint             # ESLint
npm run typecheck        # Vérification TypeScript

# Tests (voir TESTING_STRATEGY.md)
npm run test             # Tests unitaires
npm run test:e2e         # Tests end-to-end
npm run test:coverage    # Couverture de code
```

### Workflow de Développement

1. **Feature Branch** : Créer une branche pour chaque fonctionnalité
2. **Development** : Développer avec `npm run dev`
3. **Testing** : Lancer les tests avec `npm run test:all`
4. **Quality Check** : Vérifier avec `npm run lint` et `npm run typecheck`
5. **Build Test** : Tester le build avec `npm run build`
6. **Pull Request** : Soumettre pour review

## 🧪 Tests

Le projet dispose d'une stratégie de tests complète. Voir [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) pour les détails.

### Tests Rapides

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tous les tests
npm run test:all
```

### Couverture de Code

- **Objectif** : 70% minimum
- **Rapport** : Généré dans `/coverage/`
- **CI/CD** : Tests automatiques sur chaque PR

## 📦 Déploiement

### Netlify (Recommandé)

```bash
# Build automatique depuis GitHub
# Build command: npm run build
# Publish directory: .next
```

### Variables d'Environnement Production

```env
NEXT_PUBLIC_SUPABASE_URL=prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_supabase_anon_key
NODE_ENV=production
```

### Checklist de Déploiement

- [ ] Tests passent (`npm run test:ci`)
- [ ] Build réussi (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Base de données Supabase migrée
- [ ] Storage Supabase configuré
- [ ] DNS et domaine configurés

## 🔧 Configuration

### Next.js Configuration

- **App Router** : Utilisation du nouveau système de routing
- **TypeScript** : Configuration stricte
- **Tailwind CSS** : Avec plugins personnalisés
- **Images** : Optimisation automatique

### Supabase Configuration

- **Authentication** : Email/Password + OAuth
- **Database** : PostgreSQL avec RLS
- **Storage** : Images et vidéos
- **Real-time** : Subscriptions pour les mises à jour

### Performance

- **Lazy Loading** : Composants et images
- **Code Splitting** : Automatique avec Next.js
- **Caching** : React Query + localStorage
- **Optimizations** : Bundle analyzer, compression

## 📚 Documentation

### Documents Disponibles

- **[README.md](./README.md)** : Ce document
- **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)** : Stratégie de tests
- **[API.md](./docs/API.md)** : Documentation API
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** : Guide de déploiement
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** : Guide de contribution

### Architecture Détaillée

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** : Architecture technique
- **[DATABASE.md](./docs/DATABASE.md)** : Schéma de base de données
- **[SECURITY.md](./docs/SECURITY.md)** : Sécurité et authentification

## 🤝 Contribution

### Comment Contribuer

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de Code

- **TypeScript** strict
- **ESLint** + **Prettier**
- **Tests** obligatoires pour nouvelles fonctionnalités
- **Documentation** mise à jour

### Issues et Bugs

- Utiliser les templates d'issues
- Fournir des étapes de reproduction
- Inclure les informations d'environnement

---

## 📊 Statistiques du Projet

- **Lignes de code** : ~15,000+ lignes
- **Composants** : 50+ composants React
- **Tests** : 70%+ de couverture
- **Performance** : Score Lighthouse 90+
- **Accessibilité** : WCAG 2.1 AA

## 🏆 Crédits

- **Développement** : Équipe Akanda
- **Design** : Interface moderne et responsive
- **Backend** : Supabase
- **Hosting** : Netlify

---

**Akanda Apéro** - *Votre plateforme e-commerce d'apéritifs et cocktails* 🍹

*Pour plus d'informations, consultez la [documentation complète](./docs/) ou contactez l'équipe de développement.*