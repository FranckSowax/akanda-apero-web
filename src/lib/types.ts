// Types pour les produits
export interface Product {
  id: string; // UUID string pour compatibilité Supabase
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  status: 'En stock' | 'Stock faible' | 'Épuisé';
  rating?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types pour les catégories
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les commandes
export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Nouvelle' | 'En préparation' | 'Prête' | 'En livraison' | 'Livrée' | 'Annulée' | 'Retardée';
  paymentStatus: 'En attente' | 'Payée' | 'Remboursée';
  paymentMethod?: string;
  address: string;
  date: string;
  deliveryPersonId?: number;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Types pour les clients
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'Actif' | 'Inactif' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate?: string;
  joinDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les promotions
export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'Pourcentage' | 'Montant fixe' | 'Livraison gratuite';
  value: number;
  minPurchase?: number;
  status: 'Actif' | 'Inactif' | 'Planifié' | 'Expiré';
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  products: number[];
  categories: number[];
  createdAt: string;
  updatedAt: string;
}

// Types pour les livraisons
export interface Delivery {
  id: number;
  orderId: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  address: string;
  items: string[];
  totalItems: number;
  amount: number;
  status: 'En attente' | 'En cours' | 'Livrée' | 'Problème';
  deliveryPersonId?: number;
  deliveryPerson?: string;
  assignedTime?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  status: 'En ligne' | 'Occupé' | 'Hors ligne';
  activeDeliveries: number;
  totalDeliveries: number;
  avatarUrl: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Type pour l'authentification
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'delivery';
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
