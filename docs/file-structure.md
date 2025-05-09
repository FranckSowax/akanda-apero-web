# Structure des Fichiers du Projet Akanda Apéro

Ce document décrit l'organisation des fichiers et dossiers du projet Akanda Apéro, une application web de livraison de boissons et snacks à Libreville.

## Structure Générale

```
akanda-apero/
├── .next/               # Dossier généré par Next.js (ignoré par git)
├── docs/                # Documentation du projet
├── node_modules/        # Dépendances (ignoré par git)
├── public/              # Fichiers statiques accessibles publiquement
├── src/                 # Code source de l'application
├── .gitignore           # Configuration des fichiers ignorés par git
├── next.config.js       # Configuration de Next.js
├── package.json         # Dépendances et scripts npm
├── postcss.config.js    # Configuration de PostCSS
├── README.md            # Documentation principale du projet
└── tailwind.config.ts   # Configuration de Tailwind CSS
```

## Structure du Dossier `src/`

```
src/
├── ai/                  # Composants et services liés à l'IA (si applicable)
├── app/                 # Pages et routes de l'application (architecture Next.js App Router)
│   ├── category/        # Page de catégorie de produits
│   ├── dashboard/       # Interface d'administration
│   ├── global.css       # Styles globaux
│   ├── layout.tsx       # Layout principal de l'application
│   └── page.tsx         # Page d'accueil
├── components/          # Composants réutilisables
│   ├── layout/          # Composants de mise en page (header, footer, etc.)
│   └── ui/              # Composants d'interface utilisateur
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── index.ts     # Export centralisé des composants UI
├── hooks/               # Hooks React personnalisés
├── lib/                 # Bibliothèques et utilitaires
│   └── utils.ts         # Fonctions utilitaires
└── services/            # Services pour les API et la logique métier
```

## Structure du Dossier `public/`

```
public/
├── favicon.ico          # Favicon du site
└── images/              # Images statiques
```

## Structure du Dossier `docs/`

```
docs/
├── app-flow.md          # Documentation du flux de l'application
├── backend-structure.md # Documentation de la structure du backend
├── blueprint.md         # Plan général du projet
├── file-structure.md    # Ce document
├── frontend-guidelines.md # Directives de développement frontend
└── prd.md               # Document des exigences produit
```

## Pages Principales

- **Page d'accueil** (`src/app/page.tsx`) : Landing page présentant les services d'Akanda Apéro
- **Page de catégorie** (`src/app/category/page.tsx`) : Affiche les produits par catégorie
- **Dashboard** (`src/app/dashboard/page.tsx`) : Interface d'administration pour gérer les produits et commandes

## Composants UI

Le dossier `src/components/ui/` contient des composants d'interface utilisateur réutilisables basés sur une architecture inspirée de Radix UI et stylisés avec Tailwind CSS :

- **Button** : Boutons avec différentes variantes
- **Card** : Composant de carte pour afficher les informations
- **Dialog** : Fenêtres modales
- **Input/Textarea** : Champs de saisie
- **Table** : Tableaux de données
- **Tabs** : Onglets pour organiser le contenu
- **Select/Checkbox** : Éléments de formulaire

## Configuration

- **next.config.js** : Configuration de Next.js, notamment pour les domaines d'images autorisés (imgur.com, placehold.co, picsum.photos)
- **tailwind.config.ts** : Thème et configuration de Tailwind CSS
- **postcss.config.js** : Configuration de PostCSS pour Tailwind

## Dépendances Principales

Les principales dépendances du projet sont :

- **Next.js** : Framework React pour le rendu côté serveur et le routage
- **React** : Bibliothèque UI
- **Tailwind CSS** : Framework CSS utilitaire
- **Radix UI** : Composants accessibles et sans style
- **TypeScript** : Typage statique

## Conventions de Nommage

- Les noms de fichiers pour les composants React utilisent le PascalCase (ex: `Button.tsx`)
- Les noms de fichiers pour les utilitaires et hooks utilisent le camelCase (ex: `utils.ts`)
- Les pages dans le dossier `app/` utilisent `page.tsx` comme nom de fichier
- Les layouts utilisent `layout.tsx` comme nom de fichier
