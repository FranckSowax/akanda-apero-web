import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '../../../lib/types';

// Base de données fictive pour les clients
let customers: Customer[] = [
  {
    id: 1,
    name: "Michel Dupont",
    email: "michel.dupont@email.com",
    phone: "+225 07 01 02 03 04",
    location: "Cocody, Abidjan",
    status: 'Actif',
    totalOrders: 12,
    totalSpent: 580000,
    loyaltyPoints: 350,
    lastOrderDate: "2025-05-06T10:30:00.000Z",
    joinDate: "2024-01-15T08:00:00.000Z",
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2025-05-06T10:30:00.000Z"
  },
  {
    id: 2,
    name: "Aminata Koné",
    email: "aminata.kone@email.com",
    phone: "+225 05 45 67 89 10",
    location: "Plateau, Abidjan",
    status: 'VIP',
    totalOrders: 25,
    totalSpent: 1250000,
    loyaltyPoints: 850,
    lastOrderDate: "2025-05-06T12:00:00.000Z",
    joinDate: "2023-08-20T09:30:00.000Z",
    notes: "Cliente fidèle, préfère être livrée en soirée",
    createdAt: "2023-08-20T09:30:00.000Z",
    updatedAt: "2025-05-06T12:00:00.000Z"
  },
  {
    id: 3,
    name: "Jean-Paul Kofi",
    email: "jp.kofi@email.com",
    phone: "+225 07 89 34 56 12",
    location: "Marcory, Abidjan",
    status: 'Actif',
    totalOrders: 8,
    totalSpent: 320000,
    loyaltyPoints: 150,
    lastOrderDate: "2025-05-06T16:00:00.000Z",
    joinDate: "2024-03-10T14:45:00.000Z",
    createdAt: "2024-03-10T14:45:00.000Z",
    updatedAt: "2025-05-06T16:00:00.000Z"
  },
  {
    id: 4,
    name: "Fatou Diallo",
    email: "fatou.diallo@email.com",
    phone: "+225 05 67 23 45 98",
    location: "Yopougon, Abidjan",
    status: 'Actif',
    totalOrders: 5,
    totalSpent: 120000,
    loyaltyPoints: 75,
    lastOrderDate: "2025-05-06T09:00:00.000Z",
    joinDate: "2024-06-05T11:20:00.000Z",
    createdAt: "2024-06-05T11:20:00.000Z",
    updatedAt: "2025-05-06T09:00:00.000Z"
  },
  {
    id: 5,
    name: "Paul Kouamé",
    email: "paul.kouame@email.com",
    phone: "+225 07 34 56 78 90",
    location: "Deux Plateaux, Abidjan",
    status: 'VIP',
    totalOrders: 18,
    totalSpent: 950000,
    loyaltyPoints: 600,
    lastOrderDate: "2025-05-06T18:30:00.000Z",
    joinDate: "2023-11-12T10:15:00.000Z",
    notes: "Amateur de champagne, préfère être contacté par email",
    createdAt: "2023-11-12T10:15:00.000Z",
    updatedAt: "2025-05-06T18:30:00.000Z"
  },
  {
    id: 6,
    name: "Sophie Aka",
    email: "sophie.aka@email.com",
    phone: "+225 05 12 34 56 78",
    location: "Angré, Abidjan",
    status: 'Inactif',
    totalOrders: 3,
    totalSpent: 85000,
    loyaltyPoints: 45,
    lastOrderDate: "2024-12-15T14:20:00.000Z",
    joinDate: "2024-08-30T16:40:00.000Z",
    createdAt: "2024-08-30T16:40:00.000Z",
    updatedAt: "2024-12-15T14:20:00.000Z"
  }
];

// GET /api/customers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  
  let filteredCustomers = [...customers];

  // Appliquer les filtres
  if (status) {
    filteredCustomers = filteredCustomers.filter(c => c.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(search)
    );
  }

  // Trier les clients
  filteredCustomers.sort((a, b) => {
    if (sortBy === 'totalSpent') {
      return sortOrder === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
    } else if (sortBy === 'totalOrders') {
      return sortOrder === 'asc' ? a.totalOrders - b.totalOrders : b.totalOrders - a.totalOrders;
    } else if (sortBy === 'joinDate') {
      return sortOrder === 'asc' 
        ? new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime() 
        : new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      // Par défaut, trier par ID
      return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    }
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
  
  return NextResponse.json({
    success: true,
    data: paginatedCustomers,
    total: filteredCustomers.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(filteredCustomers.length / limit)
  });
}

// POST /api/customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.name || !body.phone) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir au moins un nom et un numéro de téléphone.'
      }, { status: 400 });
    }
    
    // Vérifier si le client existe déjà (email ou téléphone)
    const existingCustomer = customers.find(c => 
      (body.email && c.email === body.email) || 
      c.phone === body.phone
    );
    
    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        error: 'Un client avec cet email ou ce numéro de téléphone existe déjà.'
      }, { status: 409 });
    }
    
    // Créer un nouveau client
    const newCustomer: Customer = {
      id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
      name: body.name,
      email: body.email || '',
      phone: body.phone,
      location: body.location || '',
      status: 'Actif',
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      joinDate: new Date().toISOString(),
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: 'Client créé avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du client'
    }, { status: 500 });
  }
}

// GET /api/customers/vip - Récupérer les clients VIP
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (endpoint === 'vip') {
    const vipCustomers = customers.filter(c => c.status === 'VIP');
    
    return NextResponse.json({
      success: true,
      data: vipCustomers
    });
  } else if (endpoint === 'segments') {
    // Dans une application réelle, ces segments seraient calculés dynamiquement
    // ou stockés dans une base de données
    const segments = [
      {
        id: 'vip',
        name: 'Clients VIP',
        description: 'Clients les plus fidèles avec plus de 10 commandes ou dépenses élevées',
        count: customers.filter(c => c.status === 'VIP').length,
        criteria: { status: 'VIP' }
      },
      {
        id: 'active',
        name: 'Clients actifs',
        description: 'Clients ayant passé une commande au cours des 3 derniers mois',
        count: customers.filter(c => c.status === 'Actif').length,
        criteria: { status: 'Actif' }
      },
      {
        id: 'inactive',
        name: 'Clients inactifs',
        description: 'Clients n\'ayant pas passé de commande depuis plus de 3 mois',
        count: customers.filter(c => c.status === 'Inactif').length,
        criteria: { status: 'Inactif' }
      },
      {
        id: 'new',
        name: 'Nouveaux clients',
        description: 'Clients inscrits au cours du dernier mois',
        count: customers.filter(c => {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return new Date(c.joinDate) >= oneMonthAgo;
        }).length,
        criteria: { joinDateAfter: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() }
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: segments
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Endpoint non valide'
    }, { status: 400 });
  }
}
