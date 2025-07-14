# Intégration WhatsApp - Akanda Apéro

## Vue d'ensemble

Ce document décrit l'intégration WhatsApp mise en place pour le système de gestion des commandes d'Akanda Apéro. L'intégration permet d'envoyer automatiquement des notifications WhatsApp aux clients lors des changements de statut de leurs commandes.

## Fonctionnalités

### 1. Notifications automatiques de statut
- **En préparation** : Notification envoyée quand la commande passe en préparation
- **Prête** : Notification quand la commande est prête à être récupérée/livrée
- **En livraison** : Notification quand la commande est en cours de livraison
- **Livrée** : Notification de confirmation de livraison

### 2. Collecte du numéro WhatsApp
- Le formulaire de checkout demande maintenant le numéro WhatsApp au lieu de l'email
- Validation automatique du format gabonais (+241)
- Formatage automatique pendant la saisie

### 3. Interface admin améliorée
- Boutons d'action pour changer le statut des commandes
- Envoi automatique de notifications WhatsApp en arrière-plan
- Logs dans la console pour le suivi des notifications

## Configuration

### Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Configuration Whapi pour notifications WhatsApp
NEXT_PUBLIC_WHAPI_BASE_URL=https://gate.whapi.cloud
NEXT_PUBLIC_WHAPI_TOKEN=your_whapi_token_here
```

### Obtenir un token Whapi

1. Rendez-vous sur [https://whapi.cloud/](https://whapi.cloud/)
2. Créez un compte et configurez votre instance WhatsApp
3. Récupérez votre token d'API
4. Ajoutez le token dans vos variables d'environnement

## Structure du code

### Services
- `src/services/whapi.ts` : Service principal pour l'envoi de messages WhatsApp
  - Gestion du token et de l'authentification
  - Templates de messages personnalisés
  - Formatage des numéros de téléphone
  - Méthodes d'envoi et de test

### Utilitaires
- `src/lib/utils/phone.ts` : Utilitaires pour la validation et le formatage des numéros
  - Validation des numéros gabonais
  - Formatage automatique (+241)
  - Messages d'erreur localisés

### Pages modifiées
- `src/app/admin/orders/page.tsx` : Intégration des notifications dans la gestion des statuts
- `src/app/checkout/page.tsx` : Remplacement email → WhatsApp

## Templates de messages

Les messages sont personnalisés selon le statut :

### En préparation
```
🍽️ Bonjour [Nom],

Votre commande #[Numéro] est maintenant en préparation !

Nos chefs s'activent pour préparer vos délicieux plats. Nous vous tiendrons informé(e) dès qu'elle sera prête.

Merci de votre confiance ! 🙏

— L'équipe Akanda Apéro
```

### Prête
```
✅ Bonne nouvelle [Nom] !

Votre commande #[Numéro] est prête !

Vous pouvez maintenant venir la récupérer ou elle sera bientôt livrée selon votre choix.

À très bientôt ! 😊

— L'équipe Akanda Apéro
```

### En livraison
```
🚚 [Nom], votre commande est en route !

Votre commande #[Numéro] est actuellement en cours de livraison.

Notre livreur sera bientôt chez vous. Préparez-vous à déguster ! 🎉

— L'équipe Akanda Apéro
```

### Livrée
```
🎉 Livraison terminée !

Bonjour [Nom],

Votre commande #[Numéro] a été livrée avec succès !

Nous espérons que vous apprécierez vos plats. N'hésitez pas à nous faire part de vos commentaires.

Bon appétit ! 🍽️

— L'équipe Akanda Apéro
```

## Utilisation

### Pour les administrateurs

1. **Changer le statut d'une commande** :
   - Aller dans l'interface admin des commandes
   - Cliquer sur le menu "Actions" d'une commande
   - Sélectionner le nouveau statut
   - La notification WhatsApp sera envoyée automatiquement

2. **Vérifier l'envoi des notifications** :
   - Ouvrir la console du navigateur
   - Les logs indiquent si les notifications ont été envoyées avec succès

### Pour les clients

1. **Lors de la commande** :
   - Entrer le numéro WhatsApp au format gabonais
   - Le système valide et formate automatiquement le numéro

2. **Réception des notifications** :
   - Les notifications arrivent directement sur WhatsApp
   - Chaque changement de statut génère une notification

## Sécurité et bonnes pratiques

- ✅ Token API stocké dans les variables d'environnement
- ✅ Validation côté client et serveur des numéros
- ✅ Envoi des notifications en arrière-plan (non-bloquant)
- ✅ Gestion des erreurs et logs détaillés
- ✅ Formatage automatique des numéros gabonais

## Dépannage

### Les notifications ne sont pas envoyées

1. Vérifiez que les variables d'environnement sont correctement configurées
2. Vérifiez que le token Whapi est valide
3. Consultez les logs dans la console du navigateur
4. Testez la connexion avec `whapiService.testConnection()`

### Numéros de téléphone invalides

- Assurez-vous que le numéro est au format gabonais
- Formats acceptés : `+241XXXXXXXX`, `0XXXXXXXX`, `XXXXXXXX`
- Le système ajoute automatiquement le préfixe +241 si nécessaire

### Erreurs de configuration

```javascript
// Test de configuration dans la console
console.log('Whapi configuré:', whapiService.isConfigured());
whapiService.testConnection().then(result => console.log('Test:', result));
```

## Évolutions futures

- [ ] Interface admin pour personnaliser les templates de messages
- [ ] Historique des notifications envoyées
- [ ] Support d'autres pays (Cameroun, etc.)
- [ ] Notifications pour d'autres événements (nouveaux produits, promotions)
- [ ] Intégration avec d'autres services de messagerie

---

Pour toute question ou problème, consultez les logs ou contactez l'équipe de développement.
