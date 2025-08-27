# Prompt pour Développement Système de Livraison Akanda Apéro

## Contexte du Projet
Développer un système de gestion de livraison pour connecter la plateforme "Akanda Apéro" (commandes d'apéritifs et cocktails) avec les taxis locaux d'Akanda (Gabon) pour assurer les livraisons dans une zone géographique restreinte.

## Architecture Technique Requise

### Phase 1 : MVP avec WhatsApp et Interface Web
- **Backend API** : Node.js/Express ou Python/FastAPI
- **Base de données** : PostgreSQL avec extension PostGIS pour géolocalisation
- **Intégration WhatsApp** : API Whapi.cloud
- **Interface Web Taxi** : React/Vue.js avec géolocalisation HTML5
- **Websockets** : Socket.io pour notifications temps réel
- **Cache** : Redis pour statuts et positions temporaires

### Fonctionnalités Core à Implémenter

#### 1. Webhook Reception Commandes
```javascript
// Endpoint pour recevoir les webhooks de la plateforme Akanda Apéro
POST /api/orders/webhook
{
  "orderId": "string",
  "status": "preparation|ready|delivered",
  "customer": {
    "name": "string",
    "phone": "string",
    "address": "string",
    "coordinates": {
      "lat": number,
      "lng": number
    }
  },
  "items": [],
  "totalAmount": number
}
```

#### 2. Système de Notification Multi-Canal

**A. WhatsApp via Whapi**
- Créer un groupe WhatsApp privé "Taxi Akanda Livraisons"
- Envoyer notification formatée avec:
  - Détails client (nom, téléphone)
  - Adresse de livraison
  - Lien Waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
  - Montant de la course
  - Button action pour accepter

**B. Interface Web Temps Réel**
- Dashboard responsive mobile-first
- Carte interactive avec marqueurs commandes disponibles
- Système de notification avec overlay persistant
- Son d'alerte pour nouvelle commande

#### 3. Système d'Attribution Intelligent

```javascript
// Logique d'attribution basée sur la proximité
class DeliveryAssignment {
  constructor() {
    this.AKANDA_APERO_COORDS = { lat: -0.XXXXX, lng: 9.XXXXX };
    this.MAX_DISTANCE_KM = 10;
    this.BACKUP_DRIVERS_COUNT = 5;
  }

  async assignDelivery(orderId, driverLocation) {
    // 1. Calculer distance driver -> Akanda Apéro
    const distance = calculateHaversine(driverLocation, this.AKANDA_APERO_COORDS);
    
    // 2. Stocker candidature avec timestamp
    await redis.zadd(`order:${orderId}:candidates`, distance, {
      driverId,
      location: driverLocation,
      timestamp: Date.now()
    });
    
    // 3. Attendre 30 secondes pour autres candidatures
    setTimeout(() => this.selectBestDriver(orderId), 30000);
  }

  async selectBestDriver(orderId) {
    // Récupérer les 5 drivers les plus proches
    const candidates = await redis.zrange(`order:${orderId}:candidates`, 0, 4);
    
    // Attribuer au plus proche disponible
    for (const candidate of candidates) {
      if (await this.confirmDriverAvailability(candidate.driverId)) {
        await this.finalizeAssignment(orderId, candidate.driverId);
        break;
      }
    }
  }
}
```

#### 4. Capture Position GPS

**Via WhatsApp (Whapi API)**
```javascript
// Réception position WhatsApp
app.post('/api/whapi/webhook', async (req, res) => {
  if (req.body.type === 'location') {
    const { latitude, longitude, from } = req.body;
    await processDriverLocation(from, { lat: latitude, lng: longitude });
  }
});
```

**Via Interface Web**
```javascript
// Géolocalisation HTML5
navigator.geolocation.getCurrentPosition(
  position => {
    socket.emit('driver:location', {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy
    });
  },
  error => console.error(error),
  { enableHighAccuracy: true, timeout: 5000 }
);
```

#### 5. Statuts et Tracking

```javascript
// États de commande
const ORDER_STATUS = {
  PENDING: 'pending',           // En attente d'attribution
  SEARCHING: 'searching',       // Recherche de chauffeur
  ASSIGNED: 'assigned',         // Chauffeur attribué
  PICKUP: 'pickup',            // En route vers Akanda Apéro
  DELIVERING: 'delivering',     // En livraison
  DELIVERED: 'delivered',       // Livré
  CANCELLED: 'cancelled'        // Annulé
};

// États chauffeur
const DRIVER_STATUS = {
  OFFLINE: 'offline',
  AVAILABLE: 'available',
  BUSY: 'busy',
  BREAK: 'break'
};
```

#### 6. Interface Web Taxi - Pages Essentielles

**Dashboard Principal**
```html
<!-- Vue.js Component -->
<template>
  <div class="taxi-dashboard">
    <!-- Statut et Toggle Disponibilité -->
    <header class="status-bar">
      <toggle-switch v-model="isAvailable" />
      <span>{{ driverStatus }}</span>
    </header>

    <!-- Commandes Disponibles -->
    <section class="available-orders">
      <order-card 
        v-for="order in availableOrders"
        :key="order.id"
        @accept="acceptOrder"
      />
    </section>

    <!-- Commande Active -->
    <section v-if="activeOrder" class="active-delivery">
      <delivery-tracker :order="activeOrder" />
      <waze-button :destination="activeOrder.coordinates" />
      <customer-contact :customer="activeOrder.customer" />
    </section>
  </div>
</template>
```

#### 7. Notifications et Alertes

```javascript
// Service de notification unifié
class NotificationService {
  async sendNewOrderAlert(order, drivers) {
    // 1. WhatsApp Group
    await whapi.sendMessage({
      to: 'TAXI_GROUP_ID',
      type: 'template',
      template: {
        name: 'new_order_alert',
        components: [
          {
            type: 'body',
            parameters: [
              { text: order.customer.name },
              { text: order.customer.address },
              { text: `${order.amount} FCFA` }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              { text: order.wazeLink }
            ]
          }
        ]
      }
    });

    // 2. WebSocket broadcast
    io.to('available-drivers').emit('new-order', {
      order,
      expiresIn: 30000
    });

    // 3. Browser notification
    await sendBrowserNotification({
      title: 'Nouvelle commande!',
      body: `${order.customer.address} - ${order.amount} FCFA`,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    });
  }
}
```

## Structure de Fichiers Recommandée

```
akanda-delivery-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── orderController.js
│   │   │   ├── driverController.js
│   │   │   └── webhookController.js
│   │   ├── services/
│   │   │   ├── assignmentService.js
│   │   │   ├── notificationService.js
│   │   │   ├── geoService.js
│   │   │   └── whapiService.js
│   │   ├── models/
│   │   │   ├── Order.js
│   │   │   ├── Driver.js
│   │   │   └── Delivery.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── utils/
│   │   │   ├── distance.js
│   │   │   └── coordinates.js
│   │   └── app.js
│   ├── config/
│   │   └── database.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderCard.vue
│   │   │   ├── DeliveryTracker.vue
│   │   │   └── DriverStatus.vue
│   │   ├── views/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Login.vue
│   │   │   └── OrderHistory.vue
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── websocket.js
│   │   │   └── geolocation.js
│   │   └── main.js
│   └── package.json
│
├── database/
│   ├── migrations/
│   └── seeds/
│
└── docker-compose.yml
```

## Variables d'Environnement Requises

```env
# Base
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/akanda_delivery

# WhatsApp API (Whapi)
WHAPI_TOKEN=iB1vpNBhV4sbdSPwVwcczBDCXo2bBmcs
TAXI_CHANNEL_ID=120363171744447809@newsletter

# Coordonnées Akanda Apéro
AKANDA_APERO_LAT=-0.512392
AKANDA_APERO_LNG=9.409475

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key

# Limites système
MAX_DELIVERY_DISTANCE_KM=10
ASSIGNMENT_WAIT_TIME_SEC=30
MAX_BACKUP_DRIVERS=5
```

## Requêtes SQL Essentielles

```sql
-- Table drivers avec support géospatial
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    whatsapp_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'offline',
    last_position GEOGRAPHY(POINT, 4326),
    last_position_time TIMESTAMP,
    rating DECIMAL(2,1),
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    external_order_id VARCHAR(100) UNIQUE,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    delivery_location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(10,2),
    driver_id INT REFERENCES drivers(id),
    assigned_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche géospatiale
CREATE INDEX idx_drivers_position ON drivers USING GIST(last_position);
CREATE INDEX idx_orders_location ON orders USING GIST(delivery_location);

-- Vue pour drivers disponibles proches
CREATE VIEW available_nearby_drivers AS
SELECT 
    d.id,
    d.name,
    d.phone,
    ST_Distance(
        d.last_position,
        ST_MakePoint(9.XXXXX, -0.XXXXX)::geography
    ) as distance_meters
FROM drivers d
WHERE 
    d.status = 'available'
    AND d.last_position_time > NOW() - INTERVAL '5 minutes'
ORDER BY distance_meters
LIMIT 10;
```

## Intégration Whapi - Messages Interactifs avec Boutons

```javascript
// Service Whapi avec boutons interactifs pour Channel et chats privés
const axios = require('axios');

class WhapiDeliveryService {
  constructor() {
    this.apiUrl = 'https://gate.whapi.cloud';
    this.token = process.env.WHAPI_TOKEN;
    this.channelId = process.env.TAXI_CHANNEL_ID; // Format: 120363171744447809@newsletter
    this.headers = {
      'accept': 'application/json',
      'authorization': `Bearer ${this.token}`,
      'content-type': 'application/json'
    };
    
    // Cache pour stocker temporairement les commandes en attente
    this.pendingOrders = new Map();
  }

  // Envoyer notification avec boutons au channel taxi
  async sendInteractiveOrderNotification(order) {
    try {
      // Stocker la commande temporairement
      this.pendingOrders.set(order.id, order);
      
      // Formater l'adresse pour l'affichage
      const shortAddress = order.customer.address.length > 50 
        ? order.customer.address.substring(0, 47) + '...' 
        : order.customer.address;

      const response = await axios.post(
        `${this.apiUrl}/messages/interactive`,
        {
          to: this.channelId,
          type: 'button',
          header: {
            text: `🚖 NOUVELLE COURSE - ${order.deliveryFee} FCFA`
          },
          body: {
            text: `📦 *Commande #${order.id}*\n\n` +
                  `👤 *Client:* ${order.customer.name}\n` +
                  `📍 *Destination:* ${shortAddress}\n` +
                  `💳 *Paiement:* ${order.paymentMethod || 'Cash'}\n` +
                  `📏 *Distance estimée:* ${order.estimatedDistance || 'N/A'} km\n\n` +
                  `⏱️ *Expire dans 2 minutes*`
          },
          footer: {
            text: 'Akanda Apéro • Cliquez ACCEPTER pour prendre la course'
          },
          action: {
            buttons: [
              {
                type: 'quick_reply',
                title: '✅ ACCEPTER',
                id: `accept_${order.id}`
              },
              {
                type: 'quick_reply',
                title: '❌ REFUSER',
                id: `decline_${order.id}`
              },
              {
                type: 'quick_reply',
                title: '📍 + D\'INFOS',
                id: `info_${order.id}`
              }
            ]
          }
        },
        { headers: this.headers }
      );
      
      console.log(`Notification interactive envoyée pour commande ${order.id}`);
      
      // Programmer suppression après expiration
      setTimeout(() => {
        this.pendingOrders.delete(order.id);
      }, 120000); // 2 minutes
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur envoi notification interactive:', error);
      throw error;
    }
  }

  // Envoyer demande de position GPS après acceptation
  async sendLocationRequest(driverPhone, orderId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/interactive`,
        {
          to: driverPhone,
          type: 'button',
          header: {
            text: '📍 CONFIRMATION POSITION REQUISE'
          },
          body: {
            text: `Pour confirmer votre acceptation de la commande #${orderId}, nous devons vérifier votre position.\n\n` +
                  `*Instructions:*\n` +
                  `1️⃣ Cliquez sur le bouton "Envoyer Position"\n` +
                  `2️⃣ Ou cliquez sur 📎 puis 📍 Position\n` +
                  `3️⃣ Sélectionnez "Position actuelle"\n\n` +
                  `⚡ Votre position déterminera l'attribution finale de la course.`
          },
          footer: {
            text: 'Attribution basée sur la proximité avec Akanda Apéro'
          },
          action: {
            buttons: [
              {
                type: 'quick_reply',
                title: '📍 Instructions',
                id: `location_help_${orderId}`
              },
              {
                type: 'quick_reply',
                title: '❌ Annuler',
                id: `cancel_${orderId}`
              }
            ]
          }
        },
        { headers: this.headers }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur envoi demande position:', error);
      throw error;
    }
  }

  // Envoyer détails complets avec lien Waze
  async sendOrderDetails(driverPhone, orderId) {
    const order = this.pendingOrders.get(orderId);
    if (!order) {
      throw new Error(`Commande ${orderId} non trouvée`);
    }

    const wazeLink = `https://waze.com/ul?ll=${order.coordinates.lat},${order.coordinates.lng}&navigate=yes`;
    
    try {
      // Message avec bouton Waze et numéro client
      const response = await axios.post(
        `${this.apiUrl}/messages/interactive`,
        {
          to: driverPhone,
          type: 'button',
          header: {
            text: `📋 DÉTAILS COMMANDE #${orderId}`
          },
          body: {
            text: `*CLIENT*\n` +
                  `👤 ${order.customer.name}\n` +
                  `📱 ${order.customer.phone}\n\n` +
                  `*LIVRAISON*\n` +
                  `📍 ${order.customer.address}\n` +
                  `🏘️ Secteur: ${order.sector || 'Akanda'}\n\n` +
                  `*DÉTAILS COURSE*\n` +
                  `💰 Montant: ${order.deliveryFee} FCFA\n` +
                  `📦 Articles: ${order.itemsCount || 'N/A'}\n` +
                  `💳 Paiement: ${order.paymentMethod || 'Cash'}\n\n` +
                  `*NAVIGATION*\n` +
                  `Ouvrez Waze avec le bouton ci-dessous`
          },
          footer: {
            text: 'Acceptez pour recevoir la demande de position'
          },
          action: {
            buttons: [
              {
                type: 'url',
                title: '🗺️ OUVRIR WAZE',
                id: 'waze_link',
                url: wazeLink
              },
              {
                type: 'call',
                title: '📞 APPELER CLIENT',
                id: 'call_customer',
                phone_number: order.customer.phone
              },
              {
                type: 'quick_reply',
                title: '✅ J\'ACCEPTE',
                id: `confirm_accept_${orderId}`
              }
            ]
          }
        },
        { headers: this.headers }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur envoi détails:', error);
      throw error;
    }
  }

  // Envoyer confirmation d'attribution
  async sendAssignmentConfirmation(driverPhone, order, estimatedPickupTime) {
    const wazeLink = `https://waze.com/ul?ll=${process.env.AKANDA_APERO_LAT},${process.env.AKANDA_APERO_LNG}&navigate=yes`;
    
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/interactive`,
        {
          to: driverPhone,
          type: 'button',
          header: {
            text: '✅ COURSE ATTRIBUÉE!'
          },
          body: {
            text: `🎉 *Félicitations!*\n` +
                  `La commande #${order.id} vous a été attribuée.\n\n` +
                  `*PROCHAINE ÉTAPE*\n` +
                  `📍 Rendez-vous à Akanda Apéro pour récupérer la commande\n` +
                  `⏰ Temps estimé: ${estimatedPickupTime} minutes\n\n` +
                  `*RAPPEL CLIENT*\n` +
                  `👤 ${order.customer.name}\n` +
                  `📱 ${order.customer.phone}\n` +
                  `📍 ${order.customer.address}\n\n` +
                  `💰 *Montant course: ${order.deliveryFee} FCFA*`
          },
          footer: {
            text: 'Merci de confirmer la récupération à votre arrivée'
          },
          action: {
            buttons: [
              {
                type: 'url',
                title: '📍 ALLER À AKANDA',
                id: 'waze_pickup',
                url: wazeLink
              },
              {
                type: 'quick_reply',
                title: '✅ EN ROUTE',
                id: `on_way_${order.id}`
              },
              {
                type: 'quick_reply',
                title: '📦 RÉCUPÉRÉ',
                id: `picked_up_${order.id}`
              }
            ]
          }
        },
        { headers: this.headers }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur envoi confirmation:', error);
      throw error;
    }
  }

  // Envoyer liste d'options pour sélection de zone
  async sendZoneSelection(driverPhone) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/interactive`,
        {
          to: driverPhone,
          type: 'list',
          header: {
            text: '📍 SÉLECTION ZONE DE TRAVAIL'
          },
          body: {
            text: 'Choisissez votre zone de travail préférée pour recevoir les commandes prioritaires dans ce secteur.'
          },
          footer: {
            text: 'Vous pouvez changer de zone à tout moment'
          },
          action: {
            list: {
              sections: [
                {
                  title: 'Zones Akanda',
                  rows: [
                    {
                      id: 'zone_angondje',
                      title: 'Angondjé',
                      description: 'Secteur Angondjé et environs'
                    },
                    {
                      id: 'zone_cap_esterias',
                      title: 'Cap Estérias',
                      description: 'Route du Cap et plages'
                    },
                    {
                      id: 'zone_santa_clara',
                      title: 'Santa Clara',
                      description: 'Secteur Santa Clara'
                    },
                    {
                      id: 'zone_akanda_centre',
                      title: 'Akanda Centre',
                      description: 'Centre ville d\'Akanda'
                    },
                    {
                      id: 'zone_all',
                      title: 'Toutes les zones',
                      description: 'Recevoir toutes les commandes'
                    }
                  ]
                }
              ],
              label: 'Choisir ma zone'
            }
          }
        },
        { headers: this.headers }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur envoi sélection zone:', error);
      throw error;
    }
  }
}

// Gestionnaire de webhooks pour les réponses
class WebhookHandler {
  constructor(whapiService, driverService, orderService) {
    this.whapi = whapiService;
    this.drivers = driverService;
    this.orders = orderService;
  }

  async handleWebhook(req, res) {
    try {
      const { messages, event } = req.body;
      
      if (!messages || messages.length === 0) {
        return res.status(200).send('OK');
      }

      const message = messages[0];
      const { type, from, reply, chat_id } = message;

      // Traiter les réponses aux boutons
      if (type === 'reply' && reply?.buttons_reply) {
        await this.handleButtonReply(
          from,
          reply.buttons_reply.id,
          reply.buttons_reply.title
        );
      }

      // Traiter les sélections de liste
      if (type === 'reply' && reply?.list_reply) {
        await this.handleListReply(
          from,
          reply.list_reply.id,
          reply.list_reply.title
        );
      }

      // Traiter les positions GPS
      if (type === 'location' && message.location) {
        await this.handleLocationMessage(
          from,
          message.location
        );
      }

      res.status(200).send('OK');

    } catch (error) {
      console.error('Erreur webhook:', error);
      res.status(500).json({ error: 'Erreur traitement webhook' });
    }
  }

  async handleButtonReply(from, buttonId, buttonTitle) {
    // Parser l'ID du bouton (format: action_orderId)
    const [action, ...idParts] = buttonId.replace('ButtonsV3:', '').split('_');
    const orderId = idParts.join('_');

    switch(action) {
      case 'accept':
        // Taxi accepte la course
        console.log(`Taxi ${from} accepte commande ${orderId}`);
        
        // Enregistrer l'intention d'acceptation
        await this.drivers.registerInterest(from, orderId);
        
        // Demander la position GPS
        await this.whapi.sendLocationRequest(from, orderId);
        break;

      case 'decline':
        console.log(`Taxi ${from} refuse commande ${orderId}`);
        break;

      case 'info':
        // Envoyer détails complets
        await this.whapi.sendOrderDetails(from, orderId);
        break;

      case 'confirm-accept':
        // Confirmation finale après avoir vu les détails
        await this.drivers.registerInterest(from, orderId);
        await this.whapi.sendLocationRequest(from, orderId);
        break;

      case 'on-way':
        // Taxi en route vers Akanda Apéro
        await this.orders.updateStatus(orderId, 'driver_on_way');
        break;

      case 'picked-up':
        // Commande récupérée
        await this.orders.updateStatus(orderId, 'picked_up');
        break;

      case 'delivered':
        // Commande livrée
        await this.orders.updateStatus(orderId, 'delivered');
        break;

      case 'location-help':
        // Envoyer aide pour partager position
        await this.sendLocationHelp(from);
        break;
    }
  }

  async handleListReply(from, listId, title) {
    if (listId.startsWith('zone_')) {
      // Mise à jour de la zone préférée du taxi
      const zone = listId.replace('zone_', '');
      await this.drivers.updatePreferredZone(from, zone);
      
      // Confirmer la sélection
      await this.whapi.sendTextMessage(
        from,
        `✅ Zone mise à jour: ${title}\nVous recevrez en priorité les commandes de cette zone.`
      );
    }
  }

  async handleLocationMessage(from, location) {
    try {
      // Identifier le taxi
      const driver = await this.drivers.findByPhone(from);
      
      if (!driver) {
        console.log(`Taxi non enregistré: ${from}`);
        return;
      }

      // Mettre à jour la position
      await this.drivers.updateLocation(driver.id, {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy || 10
      });

      // Vérifier s'il y a une commande en attente pour ce taxi
      const pendingOrder = await this.orders.getPendingOrderForDriver(driver.id);
      
      if (pendingOrder) {
        // Calculer distance et attribuer si c'est le plus proche
        await this.orders.processDriverLocation(
          pendingOrder.id,
          driver.id,
          location
        );
      }

    } catch (error) {
      console.error('Erreur traitement position:', error);
    }
  }
}

module.exports = { WhapiDeliveryService, WebhookHandler };
```

## Exemple d'Utilisation Complète - Flux de Commande

```javascript
// Controller principal pour gérer le flux complet
class DeliveryController {
  constructor() {
    this.whapiService = new WhapiChannelService();
    this.assignmentService = new AssignmentService();
  }

  // 1. Réception webhook depuis Akanda Apéro
  async handleNewOrder(req, res) {
    try {
      const orderData = req.body;
      
      // Créer la commande dans la BD
      const order = await Order.create({
        external_order_id: orderData.orderId,
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        delivery_address: orderData.customer.address,
        delivery_location: {
          type: 'Point',
          coordinates: [orderData.customer.coordinates.lng, orderData.customer.coordinates.lat]
        },
        amount: orderData.totalAmount,
        delivery_fee: this.calculateDeliveryFee(orderData),
        status: 'pending'
      });

      // 2. Notifier les taxis via WhatsApp Channel
      await this.whapiService.sendNewOrderNotification(order);

      // 3. Notifier via WebSocket pour interface web
      io.to('available-drivers').emit('new-order', {
        order: order.toJSON(),
        expiresAt: Date.now() + 120000 // 2 minutes
      });

      // 4. Programmer vérification après délai d'attente
      setTimeout(() => {
        this.checkAndAssignOrder(order.id);
      }, 30000); // 30 secondes

      res.json({ 
        success: true, 
        orderId: order.id,
        message: 'Commande transmise aux taxis' 
      });

    } catch (error) {
      console.error('Erreur traitement commande:', error);
      res.status(500).json({ error: 'Erreur traitement commande' });
    }
  }

  // 2. Traitement position GPS reçue
  async handleDriverLocation(driverId, location, orderId = null) {
    try {
      // Mettre à jour position du taxi
      await Driver.update(
        {
          last_position: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          last_position_time: new Date()
        },
        { where: { id: driverId }}
      );

      // Si c'est pour une commande spécifique
      if (orderId) {
        // Calculer distance depuis Akanda Apéro
        const distance = this.calculateDistance(
          { lat: process.env.AKANDA_APERO_LAT, lng: process.env.AKANDA_APERO_LNG },
          location
        );

        // Enregistrer candidature
        await this.assignmentService.registerCandidate(orderId, driverId, distance);

        // Confirmer au taxi
        await this.whapiService.sendStatusUpdate(
          orderId,
          driverId,
          `Position reçue - Distance: ${(distance/1000).toFixed(1)}km`
        );
      }

    } catch (error) {
      console.error('Erreur traitement position:', error);
    }
  }

  // 3. Attribution automatique après délai
  async checkAndAssignOrder(orderId) {
    try {
      const candidates = await this.assignmentService.getCandidates(orderId);
      
      if (candidates.length === 0) {
        // Aucun taxi disponible - relancer notification
        await this.whapiService.sendNewOrderNotification(await Order.findByPk(orderId));
        return;
      }

      // Tenter attribution aux 5 plus proches
      for (const candidate of candidates.slice(0, 5)) {
        const assigned = await this.attemptAssignment(orderId, candidate.driverId);
        if (assigned) break;
      }

    } catch (error) {
      console.error('Erreur attribution:', error);
    }
  }

  // 4. Tentative d'attribution à un taxi
  async attemptAssignment(orderId, driverId) {
    try {
      const driver = await Driver.findByPk(driverId);
      
      // Vérifier disponibilité
      if (driver.status !== 'available') {
        return false;
      }

      // Attribuer la commande
      await Order.update(
        {
          driver_id: driverId,
          status: 'assigned',
          assigned_at: new Date()
        },
        { where: { id: orderId }}
      );

      // Mettre à jour statut taxi
      await Driver.update(
        { status: 'busy' },
        { where: { id: driverId }}
      );

      // Notifier le taxi
      const order = await Order.findByPk(orderId);
      const message = `✅ *COURSE ATTRIBUÉE*

Commande #${orderId} vous a été attribuée!

Client: ${order.customer_name}
Tél: ${order.customer_phone}
Adresse: ${order.delivery_address}

Montant course: ${order.delivery_fee} FCFA

Merci de vous rendre à Akanda Apéro pour récupérer la commande.`;

      await this.whapiService.sendTextMessage(driver.whatsapp_id, message);

      // Notifier via WebSocket
      io.to(`driver-${driverId}`).emit('order-assigned', order);

      return true;

    } catch (error) {
      console.error('Erreur attribution:', error);
      return false;
    }
  }

  // Calcul distance Haversine
  calculateDistance(point1, point2) {
    const R = 6371e3; // Rayon terre en mètres
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lng-point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  }

  // Calcul frais de livraison
  calculateDeliveryFee(orderData) {
    const baseRate = 1000; // 1000 FCFA base
    const distance = this.calculateDistance(
      { lat: process.env.AKANDA_APERO_LAT, lng: process.env.AKANDA_APERO_LNG },
      orderData.customer.coordinates
    );
    
    const distanceKm = distance / 1000;
    const distanceFee = Math.ceil(distanceKm) * 200; // 200 FCFA par km
    
    return baseRate + distanceFee;
  }
}

module.exports = DeliveryController;
```

## Roadmap de Développement

### Sprint 1 (Semaine 1-2) - Foundation
- [ ] Setup environnement et base de données
- [ ] API endpoints basiques (orders, drivers)
- [ ] Intégration webhook Akanda Apéro
- [ ] Système d'authentification drivers

### Sprint 2 (Semaine 3-4) - Notifications
- [ ] Intégration Whapi WhatsApp
- [ ] WebSocket server
- [ ] Interface web basique
- [ ] Capture position GPS

### Sprint 3 (Semaine 5-6) - Attribution
- [ ] Algorithme d'attribution par proximité
- [ ] Gestion file d'attente et backup drivers
- [ ] Dashboard temps réel
- [ ] Tests et optimisation

### Sprint 4 (Semaine 7-8) - Production
- [ ] Tests en conditions réelles
- [ ] Formation chauffeurs
- [ ] Monitoring et logs
- [ ] Déploiement production

## Commandes de Développement

```bash
# Installation backend
cd backend
npm init -y
npm install express postgresql socket.io redis whapi-js jsonwebtoken bcrypt cors dotenv
npm install -D nodemon jest supertest

# Installation frontend
cd frontend
npm create vue@latest .
npm install axios socket.io-client vue-router pinia @vueuse/core

# Lancement développement
npm run dev # Frontend et Backend

# Build production
npm run build
pm2 start backend/src/app.js --name akanda-delivery-api
```

## Monitoring et KPIs

- Temps moyen d'attribution: < 1 minute
- Taux d'acceptation première proposition: > 70%
- Temps moyen pickup: < 10 minutes
- Taux de complétion livraisons: > 95%
- Uptime système: > 99.5%

## Support et Évolution

### Phase 2 - Application Mobile Native
- React Native ou Flutter
- Notifications push natives
- Tracking GPS continu
- Mode hors-ligne

### Phase 3 - Optimisations
- Machine Learning pour prédiction demande
- Routing multi-stops
- Système de zones prioritaires
- Programme fidélité chauffeurs