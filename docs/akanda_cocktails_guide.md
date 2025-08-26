# Guide Complet - Page Cocktails Maison Akanda Apero

## 1. Analyse du Marché et Positionnement

### **Cible Principale**
- **Familles gabonaises** pour réunions à domicile
- **Organisateurs d'événements** (anniversaires, baptêmes, mariages)
- **Entreprises** pour team-building et événements weekend
- **Jeunes adultes** (25-45 ans) urbanisés d'Akanda

### **Proposition de Valeur**
*"Transformez votre maison en bar professionnel - Nous livrons tout, vous créez la magie"*

**Avantages clés :**
- Économie vs sortie en bar/restaurant
- Convivialité et intimité familiale
- Découverte de nouveaux cocktails
- Service clé en main (ingrédients + recettes + matériel)

## 2. Structure de la Page et Fonctionnalités

### **Architecture de Navigation**
```
Page Cocktails Maison
├── Sélection d'Ambiance
│   ├── Réunion Familiale
│   ├── Anniversaire/Fête
│   ├── Événement Entreprise
│   └── Soirée Romantique
├── Catalogue Cocktails
├── Calculateur de Quantités
├── Panier Personnalisé
└── Options Complémentaires
```

### **Fonctionnalités Essentielles**

#### **Sélecteur de Nombre de Personnes**
- Slider interactif : 2-50 personnes
- Calcul automatique des proportions
- Suggestions personnalisées selon le groupe

#### **Système de Filtres**
- **Par difficulté** : Facile / Moyen / Expert
- **Par alcool principal** : Rhum, Whisky, Vodka, Gin, etc.
- **Par occasion** : Apéritif, Digestif, Rafraîchissant
- **Sans alcool** : Mocktails pour enfants/non-buveurs

#### **Calculateur Intelligent**
- Base de calcul : 2-3 cocktails par personne/soirée
- Ajustement selon durée événement (2h, 4h, 6h+)
- Gestion des surplus recommandés (+15-20%)

## 3. Catalogue de Cocktails Adaptés au Gabon

### **Cocktails Populaires Localisés**

#### **Catégorie "Tropical Gabonais"**
1. **Planteur d'Akanda**
   - Rhum blanc, rhum ambré, jus d'ananas, jus d'orange, sirop de canne
   - *Ingrédients locaux privilégiés*

2. **Caïpirinha Équatoriale**
   - Cachaça, citrons verts, sucre de canne, menthe fraîche

3. **Sunset Ogooué**
   - Vodka, jus de mangue, Grenadine, jus de citron

#### **Catégorie "Classiques Internationaux"**
1. **Mojito Traditionnel**
2. **Piña Colada**
3. **Daiquiri Fraise**
4. **Margarita Classique**

#### **Catégorie "Mocktails Famille"**
1. **Virgin Planteur**
2. **Limonade Tropicale**
3. **Smoothie Cocktail Enfants**

### **Fiche Produit Type**
```
Nom du Cocktail : "Planteur d'Akanda"
Difficulté : ⭐⭐ (Facile)
Temps de préparation : 3 minutes
Parfait pour : Réunions familiales, apéritifs

Ingrédients inclus (pour 8 personnes) :
✅ Rhum blanc J.Bally 350ml
✅ Rhum ambré Trois Rivières 200ml  
✅ Jus d'ananas Tropicana 1L
✅ Jus d'orange pressé 500ml
✅ Sirop de canne 200ml
✅ 2 citrons verts
✅ Glaçons (sac 2kg)
✅ Fiche recette illustrée

Prix : 25,000 FCFA (8 cocktails)
Prix unitaire : 3,125 FCFA/cocktail
```

## 4. Système de Calcul des Quantités

### **Base de Calcul Standard**
- **2-4 personnes** : 2 cocktails/pers (soirée courte)
- **5-10 personnes** : 2.5 cocktails/pers (événement moyen)
- **10+ personnes** : 3 cocktails/pers (longue soirée)

### **Ajustements Automatiques**
```javascript
// Exemple de logique de calcul
function calculerQuantites(nbPersonnes, dureeEvent, typeCocktail) {
    let baseMultiplier = 2.5;
    
    if (dureeEvent > 4) baseMultiplier = 3;
    if (dureeEvent < 2) baseMultiplier = 2;
    
    let quantiteBase = nbPersonnes * baseMultiplier;
    let surplus = quantiteBase * 0.15; // 15% de sécurité
    
    return Math.ceil(quantiteBase + surplus);
}
```

### **Gestion des Formats**
- **Petits groupes (2-6)** : Bouteilles 200-350ml
- **Groupes moyens (7-15)** : Bouteilles 500-750ml  
- **Grands groupes (15+)** : Bouteilles 1L + formats économiques

## 5. Interface Utilisateur et Expérience

### **Parcours Client Optimal**

#### **Étape 1 : Sélection d'Ambiance**
```
"Quel type d'événement organisez-vous ?"
[🏠 Réunion Familiale] [🎂 Anniversaire] [🏢 Entreprise] [💕 Romantique]
```

#### **Étape 2 : Configuration**
```
Nombre d'invités : [Slider 2-50]
Durée estimée : [2h] [4h] [6h+]
Budget approximatif : [15k-25k] [25k-50k] [50k+]
```

#### **Étape 3 : Sélection Cocktails**
- Grid de cocktails avec photos appétissantes
- Badges : "Populaire", "Facile", "Exotique"
- Prévisualisation du panier en temps réel

#### **Étape 4 : Personnalisation**
```
Options supplémentaires :
☐ Kit barman (shaker, doseur, cuillère) +3,000 FCFA
☐ Verres cocktail (lot de 8) +5,000 FCFA  
☐ Décoration fruits (ananas, citrons, menthe) +2,000 FCFA
☐ Livraison glaçons extra +1,500 FCFA
```

### **Design et Ergonomie**

#### **Codes Couleurs**
- **Primaire** : Bleu tropical (#2E86AB)
- **Secondaire** : Orange soleil (#F18F01)  
- **Accent** : Vert menthe (#A4D4AE)
- **Neutre** : Blanc cassé (#FEFEFE)

#### **Éléments Visuels**
- Photos haute qualité des cocktails
- Icônes métiers locales (palmiers, plage)
- Animations fluides pour les interactions
- Responsive mobile-first (80% trafic mobile au Gabon)

## 6. Logistique et Livraison

### **Zones de Livraison Akanda**
- **Zone 1** (Centre) : Livraison gratuite, 45min
- **Zone 2** (Périphérie) : +1,000 FCFA, 1h15
- **Zone 3** (Étendue) : +2,000 FCFA, 1h30

### **Créneaux de Livraison**
- **Express** : Dans les 2h (+2,000 FCFA)
- **Standard** : 4-6h (gratuit >20,000 FCFA)
- **Programmée** : J+1 à J+3 (-1,000 FCFA)

### **Packaging Spécialisé**
- Glacières isothermes pour alcools
- Sachets glaçons renforcés
- Fiches recettes plastifiées
- Étiquettes ingrédients claires

## 7. Stratégie Marketing

### **Messages Clés**
1. **"L'art du cocktail à domicile"** - Positionnement premium
2. **"Plus économique qu'une sortie"** - Argument prix
3. **"Moments inoubliables en famille"** - Émotion
4. **"Livraison fraîcheur garantie"** - Confiance

### **Campagnes Ciblées**

#### **Réunions Familiales**
*"Dimanche en famille ? Transformez votre salon en cocktail lounge !"*
- Ciblage : Familles, weekend
- Promotion : Pack famille 4-8 personnes

#### **Anniversaires**
*"Un anniversaire mémorable commence par des cocktails d'exception"*
- Ciblage : 25-45 ans, notifications Facebook anniversaires
- Promotion : Cocktail offert pour l'anniversaire

#### **Entreprises**
*"Team building savoureux : renforcez vos équipes autour de cocktails créatifs"*
- Ciblage LinkedIn : DRH, managers
- Offre B2B : Remises volume, facturation entreprise

### **Programme de Fidélisation**
- **Carte Mixologue** : 10e cocktail offert
- **Parrainage** : -15% pour parrain et filleul
- **Abonnement mensuel** : Kit cocktail surprise

## 8. Aspects Techniques pour Windsurf

### **Stack Technologique Recommandée**
```
Frontend : React/Next.js + TailwindCSS
Backend : Node.js/Express + MongoDB
Paiement : Intégration Mobile Money (MTN/Moov)
Maps : Google Maps API (zones livraison)
Analytics : Google Analytics + Facebook Pixel
```

### **Fonctionnalités Prioritaires MVP**
1. **Catalogue produits** avec filtres
2. **Calculateur quantités** automatique  
3. **Panier intelligent** avec suggestions
4. **Système de commande** simplifié
5. **Suivi livraison** temps réel
6. **Paiement mobile** intégré

### **Base de Données Cocktails**
```json
{
  "cocktail": {
    "id": "planteur_akanda",
    "nom": "Planteur d'Akanda",
    "difficulte": 2,
    "tempsPrep": 3,
    "categories": ["tropical", "rhum", "facile"],
    "ingredients": [
      {"nom": "Rhum blanc", "quantiteBase": 45, "unite": "ml"},
      {"nom": "Rhum ambré", "quantiteBase": 25, "unite": "ml"},
      {"nom": "Jus ananas", "quantiteBase": 60, "unite": "ml"}
    ],
    "recette": "Étapes détaillées...",
    "image": "url_image",
    "prixBase": 3125,
    "occasionsRecommandees": ["familiale", "apéritif"]
  }
}
```

### **Algorithme de Recommandation**
```javascript
function recommanderCocktails(occasion, nbPersonnes, budget) {
    // Filtrer par occasion
    // Calculer quantités optimales  
    // Respecter budget
    // Équilibrer facilité/variété
    // Retourner top 3-5 suggestions
}
```

## 9. Indicateurs de Performance (KPIs)

### **Métriques Business**
- **Panier moyen** : Objectif 25,000 FCFA
- **Taux conversion** : Objectif 3.5%
- **Récurrence client** : Objectif 25% mensuels
- **NPS** : Objectif >50

### **Métriques UX**
- **Temps session** : Objectif >4 minutes
- **Taux rebond** : <60%
- **Étapes abandonnées** : Identifier goulots
- **Mobile conversion** : Priorité absolue

## 10. Roadmap de Développement

### **Phase 1 (MVP - 6 semaines)**
- Catalogue 15 cocktails essentiels
- Calculateur basique
- Commande et paiement Mobile Money
- Zones livraison Akanda centre

### **Phase 2 (3 mois)**
- Extension catalogue (30 cocktails)
- Programme fidélité
- Suivi GPS livraison  
- Chat support client

### **Phase 3 (6 mois)**
- App mobile native
- Réalité augmentée (visualisation cocktails)
- Marketplace barmen à domicile
- Extension autres villes Gabon

---

*Ce guide vous donne toutes les bases pour créer une page cocktails maison performante et adaptée au marché gabonais. L'approche cascade avec Windsurf vous permettra de développer méthodiquement chaque fonctionnalité en partant du MVP vers les features avancées.*