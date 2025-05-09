import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../../../lib/types';

// Base de données fictive pour les commandes
let orders: Order[] = [
  {
    id: "ORD-2025050601",
    customerId: 1,
    customerName: "Michel Dupont",
    customerPhone: "+225 07 01 02 03 04",
    customerEmail: "michel.dupont@email.com",
    items: [
      { productId: 1, name: "Pack The Party Mix", quantity: 2, price: 15000, subtotal: 30000 },
      { productId: 3, name: "Cocktail DIY Kit", quantity: 1, price: 28000, subtotal: 28000 }
    ],
    totalAmount: 58000,
    status: 'Prête',
    paymentStatus: 'Payée',
    paymentMethod: 'Mobile Money',
    address: "Cocody, Rue des Jardins, Abidjan",
    date: "2025-05-06T10:30:00.000Z",
    deliveryPersonId: 1,
    createdAt: "2025-05-06T09:15:00.000Z",
    updatedAt: "2025-05-06T10:25:00.000Z"
  },
  {
    id: "ORD-2025050602",
    customerId: 2,
    customerName: "Aminata Koné",
    customerPhone: "+225 05 45 67 89 10",
    customerEmail: "aminata.kone@email.com",
    items: [
      { productId: 5, name: "Vin Rouge Château Margaux", quantity: 1, price: 45000, subtotal: 45000 }
    ],
    totalAmount: 45000,
    status: 'En livraison',
    paymentStatus: 'Payée',
    paymentMethod: 'Carte bancaire',
    address: "Plateau, Avenue de la République, Abidjan",
    date: "2025-05-06T12:00:00.000Z",
    deliveryPersonId: 2,
    deliveryNotes: "Sonner à l'interphone",
    createdAt: "2025-05-06T11:30:00.000Z",
    updatedAt: "2025-05-06T11:45:00.000Z"
  },
  {
    id: "ORD-2025050603",
    customerId: 3,
    customerName: "Jean-Paul Kofi",
    customerPhone: "+225 07 89 34 56 12",
    items: [
      { productId: 2, name: "Whisky Premium", quantity: 1, price: 35000, subtotal: 35000 },
      { productId: 8, name: "Rhum Diplomatico", quantity: 1, price: 25000, subtotal: 25000 }
    ],
    totalAmount: 60000,
    status: 'Nouvelle',
    paymentStatus: 'En attente',
    address: "Marcory, Rue des Alliés, Abidjan",
    date: "2025-05-06T16:00:00.000Z",
    createdAt: "2025-05-06T14:20:00.000Z",
    updatedAt: "2025-05-06T14:20:00.000Z"
  },
  {
    id: "ORD-2025050604",
    customerId: 4,
    customerName: "Fatou Diallo",
    customerPhone: "+225 05 67 23 45 98",
    customerEmail: "fatou.diallo@email.com",
    items: [
      { productId: 4, name: "Bières Artisanales - Assortiment", quantity: 2, price: 12000, subtotal: 24000 }
    ],
    totalAmount: 24000,
    status: 'Livrée',
    paymentStatus: 'Payée',
    paymentMethod: 'Espèces',
    address: "Yopougon, Quartier Millionnaire, Abidjan",
    date: "2025-05-06T09:00:00.000Z",
    deliveryPersonId: 1,
    createdAt: "2025-05-06T08:10:00.000Z",
    updatedAt: "2025-05-06T09:45:00.000Z"
  },
  {
    id: "ORD-2025050605",
    customerId: 5,
    customerName: "Paul Kouamé",
    customerPhone: "+225 07 34 56 78 90",
    items: [
      { productId: 7, name: "Champagne Moët & Chandon", quantity: 2, price: 60000, subtotal: 120000 }
    ],
    totalAmount: 120000,
    status: 'En préparation',
    paymentStatus: 'Payée',
    paymentMethod: 'Mobile Money',
    address: "Deux Plateaux, Rue des Jardins, Abidjan",
    date: "2025-05-06T18:30:00.000Z",
    createdAt: "2025-05-06T15:45:00.000Z",
    updatedAt: "2025-05-06T16:10:00.000Z"
  }
];

// GET /api/orders
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  let filteredOrders = [...orders];

  // Appliquer les filtres
  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }
  
  if (customerId) {
    filteredOrders = filteredOrders.filter(o => o.customerId === parseInt(customerId));
  }
  
  if (startDate) {
    const start = new Date(startDate);
    filteredOrders = filteredOrders.filter(o => new Date(o.date) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    filteredOrders = filteredOrders.filter(o => new Date(o.date) <= end);
  }

  // Trier par date (plus récent en premier)
  filteredOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  return NextResponse.json({
    success: true,
    data: paginatedOrders,
    total: filteredOrders.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(filteredOrders.length / limit)
  });
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.customerName || !body.customerPhone || !body.items || !body.address) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir les informations nécessaires pour la commande.'
      }, { status: 400 });
    }
    
    if (!body.items.length) {
      return NextResponse.json({
        success: false,
        error: 'La commande doit contenir au moins un article.'
      }, { status: 400 });
    }
    
    // Calculer le montant total
    const totalAmount = body.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Générer un ID unique pour la commande
    const date = new Date();
    const orderNumber = String(orders.length + 1).padStart(2, '0');
    const orderId = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${orderNumber}`;
    
    // Créer une nouvelle commande
    const newOrder: Order = {
      id: orderId,
      customerId: body.customerId || 0,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      items: body.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      totalAmount,
      status: 'Nouvelle',
      paymentStatus: body.paymentStatus || 'En attente',
      paymentMethod: body.paymentMethod,
      address: body.address,
      date: new Date().toISOString(),
      deliveryPersonId: body.deliveryPersonId,
      deliveryNotes: body.deliveryNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'Commande créée avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    }, { status: 500 });
  }
}

// Endpoint pour obtenir les statistiques des commandes
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';
  
  // Dans une application réelle, cela serait calculé à partir de la base de données
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  
  // Compter les commandes par statut
  const ordersByStatus: Record<string, number> = {};
  orders.forEach(order => {
    if (!ordersByStatus[order.status]) {
      ordersByStatus[order.status] = 0;
    }
    ordersByStatus[order.status]++;
  });
  
  return NextResponse.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus
    }
  });
}
