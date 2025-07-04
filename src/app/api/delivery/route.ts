import { NextRequest, NextResponse } from 'next/server';
import { Delivery, DeliveryPerson } from '../../../lib/types';

// Base de données fictive pour les livraisons
let deliveries: Delivery[] = [
  {
    id: 1,
    orderId: "ORD-2025050601",
    customerId: 1,
    customerName: "Michel Dupont",
    customerPhone: "+225 07 01 02 03 04",
    address: "Cocody, Rue des Jardins, Abidjan",
    items: ["Pack The Party Mix (x2)", "Cocktail DIY Kit"],
    totalItems: 3,
    amount: 58000,
    status: 'Livrée',
    deliveryPersonId: 1,
    deliveryPerson: "Konan Kouadio",
    assignedTime: "2025-05-06T10:35:00.000Z",
    estimatedDelivery: "2025-05-06T11:30:00.000Z",
    actualDelivery: "2025-05-06T11:25:00.000Z",
    createdAt: "2025-05-06T10:30:00.000Z",
    updatedAt: "2025-05-06T11:25:00.000Z"
  },
  {
    id: 2,
    orderId: "ORD-2025050602",
    customerId: 2,
    customerName: "Aminata Koné",
    customerPhone: "+225 05 45 67 89 10",
    address: "Plateau, Avenue de la République, Abidjan",
    items: ["Vin Rouge Château Margaux"],
    totalItems: 1,
    amount: 45000,
    status: 'En cours',
    deliveryPersonId: 2,
    deliveryPerson: "Bamba Ibrahim",
    assignedTime: "2025-05-06T12:15:00.000Z",
    estimatedDelivery: "2025-05-06T13:00:00.000Z",
    createdAt: "2025-05-06T12:00:00.000Z",
    updatedAt: "2025-05-06T12:15:00.000Z"
  },
  {
    id: 3,
    orderId: "ORD-2025050605",
    customerId: 5,
    customerName: "Paul Kouamé",
    customerPhone: "+225 07 34 56 78 90",
    address: "Deux Plateaux, Rue des Jardins, Abidjan",
    items: ["Champagne Moët & Chandon (x2)"],
    totalItems: 2,
    amount: 120000,
    status: 'En attente',
    estimatedDelivery: "2025-05-06T19:30:00.000Z",
    createdAt: "2025-05-06T16:15:00.000Z",
    updatedAt: "2025-05-06T16:15:00.000Z"
  },
  {
    id: 4,
    orderId: "ORD-2025050604",
    customerId: 4,
    customerName: "Fatou Diallo",
    customerPhone: "+225 05 67 23 45 98",
    address: "Yopougon, Quartier Millionnaire, Abidjan",
    items: ["Bières Artisanales - Assortiment (x2)"],
    totalItems: 2,
    amount: 24000,
    status: 'Livrée',
    deliveryPersonId: 1,
    deliveryPerson: "Konan Kouadio",
    assignedTime: "2025-05-06T08:45:00.000Z",
    estimatedDelivery: "2025-05-06T09:30:00.000Z",
    actualDelivery: "2025-05-06T09:45:00.000Z",
    createdAt: "2025-05-06T08:30:00.000Z",
    updatedAt: "2025-05-06T09:45:00.000Z"
  }
];

// Base de données fictive pour les livreurs
let deliveryPersons: DeliveryPerson[] = [
  {
    id: 1,
    name: "Konan Kouadio",
    phone: "+225 07 12 34 56 78",
    vehicle: "Moto",
    status: 'En ligne',
    activeDeliveries: 0,
    totalDeliveries: 67,
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    location: "Cocody, Abidjan",
    createdAt: "2024-10-15T09:00:00.000Z",
    updatedAt: "2025-05-06T11:25:00.000Z"
  },
  {
    id: 2,
    name: "Bamba Ibrahim",
    phone: "+225 05 98 76 54 32",
    vehicle: "Moto",
    status: 'Occupé',
    activeDeliveries: 1,
    totalDeliveries: 42,
    avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    location: "Plateau, Abidjan",
    createdAt: "2024-11-20T14:30:00.000Z",
    updatedAt: "2025-05-06T12:15:00.000Z"
  },
  {
    id: 3,
    name: "Camara Mariam",
    phone: "+225 07 45 67 89 01",
    vehicle: "Voiture",
    status: 'En ligne',
    activeDeliveries: 0,
    totalDeliveries: 29,
    avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    location: "Marcory, Abidjan",
    createdAt: "2025-01-10T10:15:00.000Z",
    updatedAt: "2025-05-06T15:30:00.000Z"
  },
  {
    id: 4,
    name: "Traoré Mamadou",
    phone: "+225 05 23 45 67 89",
    vehicle: "Moto",
    status: 'Hors ligne',
    activeDeliveries: 0,
    totalDeliveries: 51,
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    location: "Abobo, Abidjan",
    createdAt: "2024-09-05T11:45:00.000Z",
    updatedAt: "2025-05-05T18:20:00.000Z"
  }
];

// GET /api/delivery
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const deliveryPersonId = searchParams.get('deliveryPersonId');
  const date = searchParams.get('date');
  
  let filteredDeliveries = [...deliveries];

  // Appliquer les filtres
  if (status) {
    filteredDeliveries = filteredDeliveries.filter(d => d.status === status);
  }
  
  if (deliveryPersonId) {
    filteredDeliveries = filteredDeliveries.filter(d => d.deliveryPersonId === parseInt(deliveryPersonId));
  }
  
  if (date) {
    const targetDate = new Date(date);
    const targetDateString = targetDate.toISOString().split('T')[0];
    
    filteredDeliveries = filteredDeliveries.filter(d => {
      const deliveryDate = new Date(d.estimatedDelivery).toISOString().split('T')[0];
      return deliveryDate === targetDateString;
    });
  }

  // Trier par date estimée de livraison (plus récente en premier)
  filteredDeliveries.sort((a, b) => 
    new Date(b.estimatedDelivery).getTime() - new Date(a.estimatedDelivery).getTime()
  );
  
  return NextResponse.json({
    success: true,
    data: filteredDeliveries
  });
}

// POST /api/delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.orderId || !body.customerName || !body.customerPhone || !body.address || !body.items) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir toutes les informations requises.'
      }, { status: 400 });
    }
    
    // Créer une nouvelle livraison
    const newDelivery: Delivery = {
      id: deliveries.length > 0 ? Math.max(...deliveries.map(d => d.id)) + 1 : 1,
      orderId: body.orderId,
      customerId: body.customerId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      address: body.address,
      items: body.items,
      totalItems: body.items.length,
      amount: body.amount,
      status: 'En attente',
      deliveryPersonId: body.deliveryPersonId,
      deliveryPerson: body.deliveryPersonId ? 
        deliveryPersons.find(p => p.id === body.deliveryPersonId)?.name : undefined,
      assignedTime: body.deliveryPersonId ? new Date().toISOString() : undefined,
      estimatedDelivery: body.estimatedDelivery || new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2h par défaut
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    
    // Si un livreur est assigné, mettre à jour son statut
    if (body.deliveryPersonId) {
      const deliveryPersonIndex = deliveryPersons.findIndex(p => p.id === body.deliveryPersonId);
      if (deliveryPersonIndex !== -1) {
        deliveryPersons[deliveryPersonIndex] = {
          ...deliveryPersons[deliveryPersonIndex],
          activeDeliveries: deliveryPersons[deliveryPersonIndex].activeDeliveries + 1,
          status: 'Occupé',
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newDelivery,
      message: 'Livraison créée avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la livraison:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la livraison'
    }, { status: 500 });
  }
}

// GET /api/delivery/persons - Obtenir tous les livreurs
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (endpoint === 'persons') {
    return NextResponse.json({
      success: true,
      data: deliveryPersons
    });
  } else if (endpoint === 'stats') {
    // Statistiques des livraisons
    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(d => d.status === 'Livrée').length;
    
    // Calculer le temps moyen de livraison (en minutes)
    const deliveriesWithTime = deliveries.filter(d => d.status === 'Livrée' && d.assignedTime && d.actualDelivery);
    let averageDeliveryTime = 0;
    
    if (deliveriesWithTime.length > 0) {
      const totalMinutes = deliveriesWithTime.reduce((sum, delivery) => {
        const assignedTime = new Date(delivery.assignedTime!).getTime();
        const actualDelivery = new Date(delivery.actualDelivery!).getTime();
        return sum + ((actualDelivery - assignedTime) / (1000 * 60)); // Différence en minutes
      }, 0);
      
      averageDeliveryTime = Math.round(totalMinutes / deliveriesWithTime.length);
    }
    
    // Compter les livraisons par statut
    const deliveriesByStatus: Record<string, number> = {};
    deliveries.forEach(delivery => {
      if (!deliveriesByStatus[delivery.status]) {
        deliveriesByStatus[delivery.status] = 0;
      }
      deliveriesByStatus[delivery.status]++;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalDeliveries,
        completedDeliveries,
        averageDeliveryTime,
        deliveriesByStatus
      }
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Endpoint non valide'
    }, { status: 400 });
  }
}
