# Guide de Test du Checkout Mobile - Akanda Apéro

## ✅ Correction Appliquée
**Problème résolu** : Erreur "ID d'article invalide: 0" lors de la finalisation de commande

## 🧪 Tests à Effectuer

### 1. Test de Base - Accès au Checkout
- [ ] Ouvrir http://localhost:3002
- [ ] Ajouter des articles au panier
- [ ] Se connecter (si nécessaire)
- [ ] Aller au checkout
- [ ] Vérifier que la page se charge sans erreur

### 2. Test du Formulaire de Livraison
- [ ] **Nom complet** : Saisir un nom valide
- [ ] **Téléphone** : Tester avec formats gabonais (06 XX XX XX XX, 07 XX XX XX XX)
- [ ] **Adresse** : Vérifier que la carte Google Maps se charge
- [ ] **Géolocalisation** : Tester le bouton "Ma position"
- [ ] **Quartier** : Saisir un quartier (obligatoire)
- [ ] **Options de livraison** : Tester les 4 options
  - [ ] Retrait au shop (0 FCFA) - Badge vert "GRATUIT"
  - [ ] Livraison Standard (2000 FCFA)
  - [ ] Livraison Express (3000 FCFA)
  - [ ] Livraison nuit (3500 FCFA)

### 3. Test du Formulaire de Paiement
- [ ] **Email** : Saisir une adresse email valide
- [ ] **Méthodes de paiement** : Tester les 3 options
  - [ ] Paiement à la livraison
  - [ ] Mobile Money
  - [ ] Carte bancaire

### 4. Test de Finalisation
- [ ] Cliquer sur "Finaliser la commande"
- [ ] Vérifier que l'overlay de chargement s'affiche (mobile)
- [ ] Attendre la confirmation
- [ ] Vérifier qu'aucune erreur "ID invalide" n'apparaît
- [ ] Confirmer la redirection après succès
- [ ] Vérifier que le panier est vidé

### 5. Tests d'Erreur
- [ ] **Champs vides** : Laisser des champs obligatoires vides
- [ ] **Téléphone invalide** : Saisir un format incorrect
- [ ] **Email invalide** : Saisir un email incorrect
- [ ] **Panier vide** : Tenter d'accéder au checkout sans articles

### 6. Tests Mobile Spécifiques
- [ ] **Responsive** : Tester sur différentes tailles d'écran
- [ ] **Tactile** : Vérifier la navigation tactile de la carte
- [ ] **Overlay** : Confirmer l'affichage de l'overlay de chargement
- [ ] **Clavier** : Tester la saisie sur clavier mobile

## 🔧 Points de Validation Technique

### API et Backend
- [ ] API produits : `curl http://localhost:3002/api/products`
- [ ] API commandes : `curl http://localhost:3002/api/orders`
- [ ] Logs serveur : Vérifier qu'il n'y a pas d'erreurs

### Base de Données
- [ ] Vérifier que les commandes sont créées dans Supabase
- [ ] Confirmer que les clients sont enregistrés
- [ ] Valider les coordonnées GPS sauvegardées

### Validation des Données
- [ ] Articles avec ID valide (> 0) uniquement
- [ ] Numéros de téléphone formatés (+241...)
- [ ] Coordonnées GPS dans les limites valides
- [ ] Totaux calculés correctement

## 🚨 Cas d'Erreur à Tester

### Scénarios de Panne
- [ ] **Connexion Internet** : Tester hors ligne
- [ ] **API Supabase** : Simuler une panne backend
- [ ] **Google Maps** : Tester sans clé API
- [ ] **Géolocalisation** : Refuser l'accès à la position

### Données Corrompues
- [ ] **Articles invalides** : Vérifier le filtrage automatique
- [ ] **Session expirée** : Tester avec une session invalide
- [ ] **Panier corrompu** : Vérifier la robustesse

## ✅ Critères de Succès

### Fonctionnel
- ✅ Aucune erreur "ID d'article invalide"
- ✅ Commandes créées avec succès
- ✅ Panier vidé après confirmation
- ✅ Redirection correcte après succès

### UX/UI
- ✅ Interface responsive sur mobile
- ✅ Overlay de chargement fluide
- ✅ Messages d'erreur clairs
- ✅ Navigation intuitive

### Performance
- ✅ Chargement rapide de la carte
- ✅ Validation en temps réel
- ✅ Pas de blocage de l'interface

## 🎯 Résultat Attendu
Le checkout mobile doit être **entièrement fonctionnel** sans l'erreur "ID d'article invalide: 0" et permettre la finalisation complète des commandes.

---

**Version** : Basée sur commit 819e632 + correction 9a8a2e9  
**Branche** : fix-mobile-checkout-from-stable  
**Date** : 2025-07-27
