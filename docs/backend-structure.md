# Structure du Backend - Akanda Apéro

## Architecture Générale

Le backend d'Akanda Apéro est construit sur une architecture RESTful utilisant Node.js avec Express. Il est conçu pour être modulaire, évolutif et maintenable.

```
backend/
├── src/
│   ├── api/              # Routes API et contrôleurs
│   ├── config/           # Configuration de l'application
│   ├── db/               # Modèles de données et migrations
│   ├── middleware/       # Middleware Express
│   ├── services/         # Services métier
│   ├── utils/            # Utilitaires
│   └── app.js            # Point d'entrée de l'application
├── tests/                # Tests unitaires et d'intégration
├── .env                  # Variables d'environnement (non versionné)
└── package.json          # Dépendances et scripts
```

## Modèles de Données

### Utilisateurs et Authentification

```
User
├── id: UUID (PK)
├── email: String (unique)
├── password: String (hashed)
├── firstName: String
├── lastName: String
├── phone: String
├── birthDate: Date
├── role: Enum ['customer', 'admin', 'delivery']
├── createdAt: DateTime
└── updatedAt: DateTime

Address
├── id: UUID (PK)
├── userId: UUID (FK)
├── name: String
├── street: String
├── city: String
├── postalCode: String
├── instructions: String
├── isDefault: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime
```

### Catalogue de Produits

```
Category
├── id: UUID (PK)
├── name: String
├── description: String
├── image: String
├── slug: String
├── isActive: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime

Product
├── id: UUID (PK)
├── categoryId: UUID (FK)
├── name: String
├── description: String
├── price: Decimal
├── salePrice: Decimal
├── images: JSON
├── stock: Integer
├── isAlcoholic: Boolean
├── alcoholPercentage: Decimal
├── isActive: Boolean
├── slug: String
├── tags: JSON
├── createdAt: DateTime
└── updatedAt: DateTime
```

### Commandes et Paiements

```
Order
├── id: UUID (PK)
├── userId: UUID (FK)
├── addressId: UUID (FK)
├── status: Enum ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled']
├── deliveryFee: Decimal
├── subtotal: Decimal
├── total: Decimal
├── paymentMethod: Enum ['cash', 'mobile_money', 'card']
├── paymentStatus: Enum ['pending', 'paid', 'failed']
├── deliveryTime: DateTime
├── notes: String
├── createdAt: DateTime
└── updatedAt: DateTime

OrderItem
├── id: UUID (PK)
├── orderId: UUID (FK)
├── productId: UUID (FK)
├── quantity: Integer
├── unitPrice: Decimal
├── total: Decimal
├── createdAt: DateTime
└── updatedAt: DateTime

Payment
├── id: UUID (PK)
├── orderId: UUID (FK)
├── amount: Decimal
├── provider: String
├── status: Enum ['pending', 'completed', 'failed']
├── transactionId: String
├── metadata: JSON
├── createdAt: DateTime
└── updatedAt: DateTime
```

## API Endpoints

### Authentification

```
POST   /api/auth/register         # Inscription utilisateur
POST   /api/auth/login            # Connexion utilisateur
POST   /api/auth/refresh-token    # Rafraîchir le token d'authentification
POST   /api/auth/forgot-password  # Demande de réinitialisation de mot de passe
POST   /api/auth/reset-password   # Réinitialisation de mot de passe
GET    /api/auth/me               # Informations utilisateur courant
```

### Utilisateurs

```
GET    /api/users/:id             # Récupérer un utilisateur
PUT    /api/users/:id             # Mettre à jour un utilisateur
DELETE /api/users/:id             # Supprimer un utilisateur
GET    /api/users/:id/addresses   # Adresses d'un utilisateur
POST   /api/users/:id/addresses   # Ajouter une adresse
PUT    /api/users/:id/addresses/:addressId  # Mettre à jour une adresse
DELETE /api/users/:id/addresses/:addressId  # Supprimer une adresse
```

### Catalogue

```
GET    /api/categories            # Liste des catégories
GET    /api/categories/:id        # Détails d'une catégorie
GET    /api/categories/:id/products  # Produits d'une catégorie
GET    /api/products              # Liste des produits (avec filtres)
GET    /api/products/:id          # Détails d'un produit
GET    /api/products/search       # Recherche de produits
```

### Commandes

```
GET    /api/orders                # Liste des commandes de l'utilisateur
POST   /api/orders                # Créer une commande
GET    /api/orders/:id            # Détails d'une commande
PUT    /api/orders/:id            # Mettre à jour une commande
DELETE /api/orders/:id            # Annuler une commande
GET    /api/orders/:id/items      # Articles d'une commande
```

### Paiements

```
POST   /api/payments              # Initier un paiement
GET    /api/payments/:id          # Statut d'un paiement
POST   /api/payments/webhook      # Webhook pour notifications de paiement
```

### Admin

```
GET    /api/admin/users           # Gestion des utilisateurs
GET    /api/admin/orders          # Gestion des commandes
PUT    /api/admin/orders/:id/status  # Mise à jour du statut d'une commande
GET    /api/admin/products        # Gestion des produits
POST   /api/admin/products        # Ajouter un produit
PUT    /api/admin/products/:id    # Mettre à jour un produit
DELETE /api/admin/products/:id    # Supprimer un produit
GET    /api/admin/dashboard       # Statistiques du tableau de bord
```

## Middleware

- **Authentication**: Vérification des JWT pour les routes protégées
- **Authorization**: Contrôle d'accès basé sur les rôles
- **Validation**: Validation des entrées avec Joi
- **Error Handling**: Gestion centralisée des erreurs
- **Logging**: Journalisation des requêtes et erreurs
- **CORS**: Configuration des Cross-Origin Resource Sharing
- **Rate Limiting**: Limitation du nombre de requêtes

## Services

### AuthService
Gère l'authentification, la génération de tokens JWT et la vérification des permissions.

### UserService
Gère les opérations CRUD sur les utilisateurs et leurs adresses.

### ProductService
Gère le catalogue de produits, les catégories et la recherche.

### OrderService
Gère le cycle de vie des commandes, de la création à la livraison.

### PaymentService
Intègre les différentes méthodes de paiement et gère les transactions.

### NotificationService
Envoie des notifications par email, SMS ou push.

### CacheService
Gère le cache Redis pour améliorer les performances.

## Sécurité

- Hachage des mots de passe avec bcrypt
- Protection contre les attaques CSRF
- Validation et assainissement des entrées utilisateur
- Rate limiting pour prévenir les attaques par force brute
- Tokens JWT avec expiration
- Vérification de l'âge pour l'achat d'alcool

## Gestion des Erreurs

Structure standardisée pour les réponses d'erreur:

```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

## Logging

Utilisation de Winston pour la journalisation:
- Logs d'accès pour chaque requête
- Logs d'erreur pour le débogage
- Logs de performance pour l'optimisation

## Déploiement

- **Environnement de développement**: Local avec Docker
- **Environnement de test**: Serveur de staging
- **Production**: Cloud (AWS/GCP) avec scaling automatique

## Tests

- **Tests unitaires**: Avec Jest pour les services et utilitaires
- **Tests d'intégration**: Pour les API endpoints
- **Tests de charge**: Pour vérifier la performance sous charge

## Considérations de Performance

- Mise en cache avec Redis pour les données fréquemment accédées
- Pagination pour les listes longues
- Indexation de base de données optimisée
- Compression des réponses HTTP

## Intégrations Externes

- **Passerelles de paiement**: Stripe, Mobile Money (MTN, Airtel)
- **Services de notification**: Twilio (SMS), SendGrid (Email)
- **Géolocalisation**: Optionally integrates with a geolocation service for delivery address validation.

## Dependencies

Key dependencies in package.json:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.3.1",
    "@prisma/client": "^5.3.1",
    "redis": "^4.6.7",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1",
    "axios": "^1.5.0",
    "joi": "^17.10.2",
    "stripe": "^13.7.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1"
  }
}
```

## Setup and Installation

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env` file based on `.env.example`
   - Set database connection, JWT secret, etc.

4. **Run database migrations**:
   ```
   npx prisma migrate dev
   ```

5. **Start the development server**:
   ```
   npm run dev
   ```

## Documentation API

La documentation complète de l'API est disponible via Swagger UI à l'adresse `/api-docs` lorsque le serveur est en cours d'exécution.
