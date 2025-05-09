import { NextRequest, NextResponse } from 'next/server';
import { Promotion } from '../../../lib/types';

// Base de données fictive pour les promotions
let promotions: Promotion[] = [
  {
    id: 1,
    name: "Offre de Bienvenue",
    code: "BIENVENUE10",
    type: "Pourcentage",
    value: 10,
    minPurchase: 20000,
    status: "Actif",
    usageCount: 87,
    usageLimit: 200,
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-12-31T23:59:59.000Z",
    products: [],
    categories: [],
    createdAt: "2024-12-15T10:00:00.000Z",
    updatedAt: "2025-05-01T14:30:00.000Z"
  },
  {
    id: 2,
    name: "Fête des Mères",
    code: "MAMAN2025",
    type: "Montant fixe",
    value: 5000,
    minPurchase: 25000,
    status: "Planifié",
    usageCount: 0,
    usageLimit: 100,
    startDate: "2025-05-25T00:00:00.000Z",
    endDate: "2025-06-01T23:59:59.000Z",
    products: [],
    categories: [5, 6], // Vins et champagnes
    createdAt: "2025-04-15T09:30:00.000Z",
    updatedAt: "2025-04-15T09:30:00.000Z"
  },
  {
    id: 3,
    name: "Happy Hour",
    code: "HAPPY20",
    type: "Pourcentage",
    value: 20,
    status: "Actif",
    usageCount: 45,
    startDate: "2025-04-01T00:00:00.000Z",
    endDate: "2025-06-30T23:59:59.000Z",
    products: [2, 8], // Certains spiritueux
    categories: [],
    createdAt: "2025-03-20T11:15:00.000Z",
    updatedAt: "2025-05-02T16:45:00.000Z"
  },
  {
    id: 4,
    name: "Livraison Gratuite",
    code: "FREESHIP",
    type: "Livraison gratuite",
    value: 0,
    minPurchase: 50000,
    status: "Actif",
    usageCount: 112,
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-12-31T23:59:59.000Z",
    products: [],
    categories: [],
    createdAt: "2024-12-20T08:45:00.000Z",
    updatedAt: "2025-05-04T10:20:00.000Z"
  },
  {
    id: 5,
    name: "Promo Packs",
    code: "PACKS15",
    type: "Pourcentage",
    value: 15,
    status: "Actif",
    usageCount: 65,
    startDate: "2025-04-15T00:00:00.000Z",
    endDate: "2025-05-15T23:59:59.000Z",
    products: [],
    categories: [1], // Packs
    createdAt: "2025-04-10T13:30:00.000Z",
    updatedAt: "2025-05-05T09:15:00.000Z"
  },
  {
    id: 6,
    name: "Saint-Valentin",
    code: "AMOUR2025",
    type: "Pourcentage",
    value: 14,
    minPurchase: 30000,
    status: "Expiré",
    usageCount: 78,
    usageLimit: 100,
    startDate: "2025-02-01T00:00:00.000Z",
    endDate: "2025-02-14T23:59:59.000Z",
    products: [],
    categories: [5, 6], // Vins et champagnes
    createdAt: "2025-01-15T16:20:00.000Z",
    updatedAt: "2025-02-15T10:00:00.000Z"
  }
];

// GET /api/promotions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const active = searchParams.get('active') === 'true';
  
  let filteredPromotions = [...promotions];

  // Appliquer les filtres
  if (status) {
    filteredPromotions = filteredPromotions.filter(p => p.status === status);
  }
  
  if (type) {
    filteredPromotions = filteredPromotions.filter(p => p.type === type);
  }
  
  if (active) {
    const now = new Date();
    filteredPromotions = filteredPromotions.filter(p => 
      p.status === 'Actif' && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  }

  // Trier par date de création (plus récent en premier)
  filteredPromotions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return NextResponse.json({
    success: true,
    data: filteredPromotions
  });
}

// POST /api/promotions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.name || !body.code || !body.type || !body.value || !body.startDate || !body.endDate) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir toutes les informations requises.'
      }, { status: 400 });
    }
    
    // Vérifier si le code existe déjà
    const existingPromotion = promotions.find(p => p.code === body.code);
    if (existingPromotion) {
      return NextResponse.json({
        success: false,
        error: 'Ce code promotionnel existe déjà.'
      }, { status: 409 });
    }
    
    // Valider les dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return NextResponse.json({
        success: false,
        error: 'Dates invalides. La date de début doit être antérieure à la date de fin.'
      }, { status: 400 });
    }
    
    // Créer une nouvelle promotion
    const newPromotion: Promotion = {
      id: promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1,
      name: body.name,
      code: body.code,
      type: body.type,
      value: body.value,
      minPurchase: body.minPurchase,
      status: body.status || 'Actif',
      usageCount: 0,
      usageLimit: body.usageLimit,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      products: body.products || [],
      categories: body.categories || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    promotions.push(newPromotion);
    
    return NextResponse.json({
      success: true,
      data: newPromotion,
      message: 'Promotion créée avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la promotion'
    }, { status: 500 });
  }
}

// POST /api/promotions/validate
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'validate') {
      const body = await request.json();
      const { code, total } = body;
      
      if (!code) {
        return NextResponse.json({
          success: false,
          error: 'Code promo requis'
        }, { status: 400 });
      }
      
      // Chercher la promotion
      const promotion = promotions.find(p => 
        p.code === code && 
        p.status === 'Actif' &&
        new Date(p.startDate) <= new Date() && 
        new Date(p.endDate) >= new Date() &&
        (!p.usageLimit || p.usageCount < p.usageLimit)
      );
      
      if (!promotion) {
        return NextResponse.json({
          success: false,
          valid: false,
          message: 'Code promo invalide ou expiré'
        });
      }
      
      // Vérifier le montant minimum si applicable
      if (promotion.minPurchase && total < promotion.minPurchase) {
        return NextResponse.json({
          success: false,
          valid: false,
          message: `Le montant minimum d'achat pour ce code est de ${promotion.minPurchase} FCFA`
        });
      }
      
      // Calculer la réduction
      let discount = 0;
      
      if (promotion.type === 'Pourcentage') {
        discount = Math.round(total * (promotion.value / 100));
      } else if (promotion.type === 'Montant fixe') {
        discount = promotion.value;
      } else if (promotion.type === 'Livraison gratuite') {
        discount = 0; // La livraison est gérée séparément
      }
      
      return NextResponse.json({
        success: true,
        valid: true,
        promotion,
        discount,
        message: 'Code promo valide'
      });
    } else if (action === 'stats') {
      // Statistiques globales des promotions (dans une vraie application, cela serait calculé dynamiquement)
      const totalUsage = promotions.reduce((sum, promo) => sum + promo.usageCount, 0);
      const avgDiscount = 15; // Valeur fictive pour la démo
      
      // Promotions les plus utilisées
      const topPromotions = [...promotions]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(p => ({ id: p.id, name: p.name, usage: p.usageCount }));
      
      return NextResponse.json({
        success: true,
        data: {
          totalUsage,
          revenue: 8750000, // Valeur fictive pour la démo
          avgDiscount,
          topPromotions
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Action non valide'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la requête'
    }, { status: 500 });
  }
}
