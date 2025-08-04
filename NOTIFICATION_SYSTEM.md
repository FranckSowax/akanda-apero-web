# 🔔 Système de Notification des Nouvelles Commandes

## 📋 Vue d'ensemble

Ce système fournit des notifications en temps réel avec alerte sonore et overlay visuel pour les nouvelles commandes dans l'interface d'administration d'Akanda Apéro.

## ✨ Fonctionnalités

### 🎯 Notification Visuelle
- **Overlay vert semi-transparent** couvrant tout l'écran
- **Animation fluide** avec Framer Motion
- **Détails complets** de la commande (client, articles, montant)
- **Design responsive** et professionnel

### 🔊 Alerte Sonore
- **Son généré** avec Web Audio API (pas de fichiers externes)
- **Séquence complexe** : Bip aigu → Bip grave → Triple bip
- **Répétition automatique** toutes les 2 secondes
- **Arrêt au clic** sur l'overlay

### ⚡ Surveillance Temps Réel
- **Supabase Realtime** pour détecter les nouvelles commandes
- **Récupération automatique** des détails complets
- **Évitement des doublons** avec système de tracking
- **Vibration mobile** si supportée

## 🏗️ Architecture

### Fichiers Créés

```
src/
├── hooks/
│   └── useOrderNotifications.ts     # Hook pour surveillance temps réel
├── utils/
│   └── audioAlert.ts                # Générateur de sons d'alerte
├── components/
│   └── OrderNotificationOverlay.tsx # Composant overlay de notification
└── app/admin/
    ├── layout.tsx                   # Intégration dans layout admin
    └── test-notifications/
        └── page.tsx                 # Page de test du système

public/config/
└── notification-config.json         # Configuration des notifications
```

### Dépendances

- **framer-motion** : Animations fluides
- **@supabase/supabase-js** : Surveillance temps réel
- **lucide-react** : Icônes

## 🚀 Utilisation

### Activation Automatique

Le système est automatiquement actif dans l'interface admin. Quand une nouvelle commande arrive :

1. **🔔 Alerte sonore** se déclenche immédiatement
2. **📱 Vibration** sur mobile (si supportée)
3. **🟢 Overlay vert** apparaît avec les détails
4. **🔁 Son répété** toutes les 2 secondes
5. **👆 Clic pour fermer** et arrêter le son

### Contrôles

- **Bouton de contrôle** en haut à droite pour activer/désactiver
- **Clic n'importe où** sur l'overlay pour fermer
- **Permission audio** demandée automatiquement

## 🧪 Tests

Accédez à `/admin/test-notifications` pour :

- **Tester l'audio** et demander les permissions
- **Simuler une commande** pour voir l'overlay
- **Vérifier le fonctionnement** complet du système

## ⚙️ Configuration

### Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuration JSON

Le fichier `public/config/notification-config.json` permet de personnaliser :

- **Séquence sonore** (fréquences, durées)
- **Couleurs de l'overlay**
- **Animations** (vitesse, effets)
- **Vibrations** (pattern, durée)

## 🔧 Personnalisation

### Modifier les Sons

```typescript
// Dans audioAlert.ts
const sequence = [
  { frequency: 1000, duration: 0.3, volume: 0.8 }, // Bip aigu
  { frequency: 600, duration: 0.3, volume: 0.8 },  // Bip grave
  // Ajouter d'autres sons...
];
```

### Modifier l'Overlay

```typescript
// Dans OrderNotificationOverlay.tsx
style={{ backgroundColor: 'rgba(34, 197, 94, 0.85)' }} // Vert
// Changer pour d'autres couleurs
```

### Modifier la Surveillance

```typescript
// Dans useOrderNotifications.ts
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'orders'
}, callback)
```

## 🛠️ Dépannage

### Audio ne Fonctionne Pas

1. **Vérifier les permissions** navigateur
2. **Cliquer d'abord** sur la page (requis par certains navigateurs)
3. **Tester avec** `/admin/test-notifications`

### Notifications ne s'Affichent Pas

1. **Vérifier Supabase** Realtime est activé
2. **Contrôler les variables** d'environnement
3. **Vérifier la table** `orders` existe

### Erreurs d'Import

1. **Installer framer-motion** : `npm install framer-motion`
2. **Vérifier les chemins** relatifs dans les imports
3. **Redémarrer le serveur** de développement

## 📊 Monitoring

Le système inclut des logs détaillés :

```javascript
console.log('🔔 Nouvelle commande détectée:', payload);
console.error('Erreur récupération commande:', error);
```

## 🔒 Sécurité

- **Pas de données sensibles** dans les logs
- **Permissions audio** demandées explicitement
- **Validation des données** avant affichage

## 🚀 Déploiement

1. **Installer les dépendances** : `npm install`
2. **Configurer Supabase** Realtime
3. **Définir les variables** d'environnement
4. **Tester le système** avec la page de test
5. **Déployer** normalement

## 📈 Améliorations Futures

- **Notifications push** pour mobile
- **Historique des notifications**
- **Filtres par type** de commande
- **Intégration Slack/Discord**
- **Analytics des notifications**

---

**🎉 Le système est prêt à être utilisé ! Dès qu'une nouvelle commande sera passée, vous verrez l'overlay vert avec l'alerte sonore puissante.**
