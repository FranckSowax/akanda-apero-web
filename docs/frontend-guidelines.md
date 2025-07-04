# Guide de Développement Frontend - Akanda Apéro

Ce document définit les conventions, bonnes pratiques et directives à suivre pour le développement frontend du projet Akanda Apéro.

## Technologies Principales

- **Framework** : Next.js 15.x (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Composants UI** : Composants personnalisés basés sur Radix UI
- **Gestion d'État** : React Context API / React Query (pour les données serveur)
- **Tests** : Jest + React Testing Library

## Structure des Composants

### Organisation des Fichiers
components/ ├── ui/ # Composants UI réutilisables │ ├── button.tsx │ ├── card.tsx │ └── ... ├── layout/ # Composants de mise en page │ ├── Header.tsx │ ├── Footer.tsx │ └── ... ├── features/ # Composants spécifiques à des fonctionnalités │ ├── cart/ │ ├── products/ │ └── ... └── shared/ # Composants partagés entre fonctionnalités


### Conventions de Nommage

- Utilisez le **PascalCase** pour les noms de composants et leurs fichiers (ex: `Button.tsx`)
- Utilisez le **camelCase** pour les fonctions utilitaires et les hooks (ex: `useCart.ts`)
- Préfixez les hooks personnalisés par `use` (ex: `useProductSearch.ts`)
- Suffixez les contextes par `Context` (ex: `CartContext.tsx`)
- Suffixez les providers par `Provider` (ex: `CartProvider.tsx`)

## Bonnes Pratiques React/Next.js

### Composants

- Préférez les composants fonctionnels avec les hooks
- Utilisez la décomposition des props pour une meilleure lisibilité
- Définissez les types d'interface pour les props de chaque composant
- Utilisez les fragments (`<>...</>`) pour éviter les div inutiles
- Limitez la responsabilité de chaque composant (principe de responsabilité unique)

```tsx
// Bon exemple
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = ({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) => {
  return (
    <button 
      className={cn(
        "rounded-md font-medium", 
        variant === 'primary' ? "bg-[#f5a623] text-white" : "bg-gray-200 text-gray-800",
        size === 'sm' ? "px-3 py-1 text-sm" : size === 'lg' ? "px-6 py-3 text-lg" : "px-4 py-2"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
Hooks
Utilisez les hooks standards de React (useState, useEffect, useContext, etc.) de manière appropriée
Créez des hooks personnalisés pour la logique réutilisable
Respectez les règles des hooks (appel uniquement au niveau supérieur, jamais dans des conditions)
Gestion d'État
Utilisez l'état local (useState) pour l'état spécifique au composant
Utilisez le Context API pour l'état partagé entre plusieurs composants
Considérez React Query pour la gestion des données côté serveur et le caching
Performance
Utilisez React.memo() pour les composants qui se re-rendent fréquemment
Utilisez useCallback() pour les fonctions passées aux composants enfants
Utilisez useMemo() pour les calculs coûteux
Implémentez le chargement paresseux avec next/dynamic pour les composants lourds
Styles avec Tailwind CSS
Organisation
Utilisez les classes Tailwind directement dans les composants
Utilisez la fonction utilitaire cn() pour combiner conditionnellement les classes
Pour les styles complexes ou répétitifs, créez des composants dédiés
Thème et Personnalisation
Respectez la palette de couleurs définie dans tailwind.config.ts
Utilisez les variables CSS pour les valeurs de thème (couleurs, espacement, etc.)
Couleurs principales d'Akanda Apéro :
Principal : #f5a623 (orange)
Secondaire : #f5e5a0 (jaune clair)
Texte principal : #333333
Texte secondaire : #666666
Responsive Design
Développez en "mobile-first" en utilisant les préfixes de breakpoints Tailwind
Breakpoints standards :
sm : 640px et plus
md : 768px et plus
lg : 1024px et plus
xl : 1280px et plus
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Contenu */}
</div>
Accessibilité
Utilisez les attributs ARIA appropriés lorsque nécessaire
Assurez-vous que tous les éléments interactifs sont accessibles au clavier
Maintenez un ratio de contraste suffisant pour le texte
Utilisez des balises sémantiques HTML5 (nav, main, section, etc.)
Ajoutez des textes alternatifs descriptifs pour toutes les images
Gestion des Images
Utilisez le composant next/image pour toutes les images
Spécifiez toujours width, height et alt pour chaque image
Utilisez des formats d'image optimisés (WebP si possible)
Pour les images externes, assurez-vous que le domaine est ajouté à next.config.js
<Image 
  src="https://i.imgur.com/qIBlF8u.png" 
  alt="Akanda Apéro Logo" 
  width={150} 
  height={60} 
  className="object-contain"
/>
## Tests

- Écrivez des tests unitaires pour les composants et les hooks
- Testez les comportements plutôt que l'implémentation
- Utilisez React Testing Library pour tester les composants comme un utilisateur
- Utilisez Jest pour les tests unitaires de fonctions utilitaires
- Visez une couverture de test d'au moins 70% pour le code critique

```tsx
// Exemple de test avec React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
## Gestion des Formulaires

- Utilisez des bibliothèques comme React Hook Form pour les formulaires complexes
- Implémentez la validation côté client avec Zod ou Yup
- Fournissez un feedback visuel clair pour les erreurs de validation
- Utilisez des composants de formulaire accessibles (labels, messages d'erreur, etc.)

## Internationalisation (i18n)

- Utilisez next-intl ou react-i18next pour la gestion des traductions
- Externalisez tous les textes dans des fichiers de traduction
- Évitez les chaînes de caractères codées en dur dans les composants
- Prenez en compte les différences de longueur de texte entre les langues

## Sécurité

- Échappez correctement les données utilisateur pour éviter les attaques XSS
- Utilisez les attributs rel="noopener noreferrer" pour les liens externes
- Évitez d'exposer des informations sensibles dans le code client
- Implémentez la protection CSRF pour les formulaires

## Optimisation des Performances

### Chargement Initial

- Minimisez le JavaScript initial avec le code splitting
- Utilisez les métadonnées Next.js pour optimiser le SEO
- Implémentez le chargement paresseux des images et composants
- Optimisez le chemin critique de rendu (Critical Rendering Path)

### Runtime

- Évitez les re-rendus inutiles
- Utilisez la pagination ou l'infinite scroll pour les grandes listes
- Implémentez la virtualisation pour les listes très longues
- Optimisez les animations pour éviter les jank visuels

## Gestion des Erreurs

- Implémentez des limites d'erreurs (Error Boundaries) pour isoler les plantages
- Fournissez des messages d'erreur utiles et conviviaux
- Journalisez les erreurs côté client avec un service comme Sentry
- Créez des états de fallback pour les composants qui dépendent de données externes

## Conventions de Code

- Suivez les règles ESLint et Prettier configurées pour le projet
- Utilisez des commentaires pour expliquer le "pourquoi" plutôt que le "quoi"
- Documentez les composants complexes et les hooks personnalisés
- Utilisez les JSDoc pour documenter les fonctions et les types

```tsx
/**
 * Composant qui affiche un produit avec son image, titre et prix
 * @param {Product} product - Les données du produit à afficher
 * @param {boolean} isPromoted - Indique si le produit est en promotion
 * @returns {JSX.Element} Carte de produit
 */
const ProductCard = ({ product, isPromoted }: ProductCardProps) => {
  // Implémentation
};
```

## Processus de Développement

- Utilisez le système de branches Git (feature branches)
- Créez des Pull Requests pour chaque fonctionnalité ou correction
- Effectuez des code reviews avant de merger
- Suivez les conventions de commit sémantique (feat, fix, docs, etc.)

## Ressources et Documentation

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation React](https://reactjs.org/docs)
- [Guide d'accessibilité WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
