# **App Name**: Akanda Delivers

## Core Features:

- Homepage Showcase: Attractive homepage with featured products, promotions, and category-based search to improve user experience.
- Advanced Filtering: Product catalog filtering (type, brand, price, availability) enhances product discovery.
- Product Details: Detailed product pages with customer reviews.
- Secure Payments: Streamlined checkout process with secure payment options (MoMo, card, cash on delivery) for smooth transactions.
- User Account Management: User account with age verification (≥ 21 years), addresses, order history, and favorites.

## Style Guidelines:

- Primary color: Deep green (#1A5D2E) to reflect the Gabonese landscape and freshness.
- Secondary color: Earthy brown (#A67B5B) to evoke a sense of reliability and nature.
- Accent color: Gold (#FFD700) to give a premium and sophisticated feel.
- Clean and readable typography to ensure a user-friendly experience.
- Modern and clear icons to facilitate navigation and understanding.
- Mobile-first responsive design for accessibility on all devices.
- Subtle transitions and animations to enhance user engagement without being distracting.

## Original User Request:
Crée une application web complète nommée LBV Apéro, dédiée à la livraison de boissons alcoolisées, softs et snacks à Akanda (Libreville, Gabon). Elle doit intégrer une marketplace multi-vendeurs, un suivi de livraison en temps réel, et respecter les réglementations locales liées à la vente d’alcool (âge, horaires, localisation).

🎯 Objectifs clés :
Interface ergonomique pour particuliers (recherche, commande, paiement, suivi).

Marketplace avec plusieurs vendeurs locaux, catalogue et gestion des stocks.

Module de livraison avec suivi GPS, carte interactive et notifications.

Système d’administration complet (validation, modération, statistiques).

Authentification sécurisée, vérification d’âge, paiements Mobile Money & carte.

Architecture performante, sécurisée et scalable.

🧱 Stack technique à utiliser :
Frontend : React.js + TailwindCSS pour une interface moderne et responsive.

Backend : Node.js + Express avec API RESTful.

Base de données : MongoDB (produits, utilisateurs, commandes).

Hébergement : AWS ou Azure (scalabilité + 99,9 % uptime).

Cartographie : Google Maps API pour le suivi en temps réel.

Sécurité : JWT auth, chiffrement, vérification d’âge (inscription + livraison).

Paiement : Intégration Paystack, Stripe ou API Mobile Money.

🔧 Fonctionnalités détaillées
🔍 Frontend utilisateur
Page d’accueil attractive avec produits phares, promos et recherche par catégorie.

Catalogue produits filtrable (type, marque, prix, dispo).

Fiches produits détaillées avec avis clients.

Panier dynamique + processus de commande fluide.

Paiements sécurisés (MoMo, carte, cash à la livraison).

Compte client avec : vérification d’âge ≥ 21 ans, adresses, historique, favoris.

Suivi en temps réel : carte live, notifications SMS/email à chaque étape.

🛒 Interface vendeur
Dashboard : gestion des stocks, produits, ventes, commandes.

Ajout/modification de produits avec validation admin.

Statistiques des ventes et produits populaires.

Messagerie avec admin ou clients.

🚚 Interface livreur
Vue des livraisons assignées avec itinéraires optimisés.

Scan QR code / code PIN pour confirmer la livraison.

Vérification d'identité et d'âge à la remise.

🛠️ Interface administrateur
Validation des vendeurs et livreurs.

Modération des produits et des avis.

Paramétrage des zones et horaires de livraison (ex : 8h–22h).

Suivi des litiges, génération de rapports et indicateurs de performance.

✅ Contraintes techniques
🔐 Sécurité : Authentification JWT, chiffrement des données sensibles.

📱 UX : Responsive design (mobile-first), Google Fonts élégantes.

🧠 Performances : chargement < 2s, 1000 utilisateurs simultanés.

🎯 SEO + accessibilité : balises meta, balises aria, sitemap, robots.txt.

📈 Analytics intégrés : Google Analytics ou équivalent.

Bonus (à intégrer dans le prompt IA)
Utilise des composants réutilisables : ProductCard, VendorDashboard, DeliveryTracker, OrderSummary, etc.

Implémente des animations et transitions douces pour une UX haut de gamme.

Ajoute une logique d’importation dynamique (next/dynamic) pour les composants lourds.

Crée des tests unitaires et e2e pour les fonctions critiques.
  