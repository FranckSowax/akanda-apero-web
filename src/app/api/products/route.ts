import { NextRequest, NextResponse } from 'next/server';
import { Product } from '../../../lib/types';

// Base de données fictive pour la démonstration
// Dans un environnement de production, cela serait remplacé par une base de données réelle
let products: Product[] = [
  {
    id: 1,
    name: "Pack The Party Mix",
    description: "Assortiment de 12 canettes de diverses boissons pour vos soirées",
    price: 15000,
    oldPrice: 18000,
    imageUrl: "https://picsum.photos/seed/pack1/600/600",
    category: "Packs",
    stock: 25,
    status: 'En stock',
    rating: 4.5,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Whisky Premium",
    description: "Whisky de qualité premium, vieilli en fût de chêne pendant 12 ans",
    price: 35000,
    imageUrl: "https://picsum.photos/seed/whisky1/600/600",
    category: "Spiritueux",
    stock: 10,
    status: 'En stock',
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Cocktail DIY Kit",
    description: "Kit complet pour préparer vos cocktails maison",
    price: 28000,
    oldPrice: 32000,
    imageUrl: "https://picsum.photos/seed/cocktail1/600/600",
    category: "Cocktails",
    stock: 15,
    status: 'En stock',
    rating: 4.3,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Bières Artisanales - Assortiment",
    description: "Sélection de bières artisanales locales et importées",
    price: 12000,
    imageUrl: "https://picsum.photos/seed/beer1/600/600",
    category: "Bières",
    stock: 30,
    status: 'En stock',
    rating: 4.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Vin Rouge Château Margaux",
    description: "Vin rouge de première qualité, aux arômes complexes",
    price: 45000,
    imageUrl: "https://picsum.photos/seed/wine1/600/600",
    category: "Vins",
    stock: 5,
    status: 'Stock faible',
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: "Pack Football Spécial",
    description: "Pack idéal pour regarder les matchs entre amis",
    price: 20000,
    imageUrl: "https://picsum.photos/seed/football1/600/600",
    category: "Packs",
    stock: 0,
    status: 'Épuisé',
    rating: 4.6,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    name: "Champagne Moët & Chandon",
    description: "Champagne de qualité supérieure pour vos célébrations",
    price: 60000,
    imageUrl: "https://picsum.photos/seed/champagne1/600/600",
    category: "Champagnes",
    stock: 8,
    status: 'Stock faible',
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    name: "Rhum Diplomatico",
    description: "Rhum d'exception avec des notes de vanille et de caramel",
    price: 25000,
    imageUrl: "https://picsum.photos/seed/rhum1/600/600",
    category: "Spiritueux",
    stock: 12,
    status: 'En stock',
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  
  let filteredProducts = [...products];

  // Appliquer les filtres
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (status) {
    filteredProducts = filteredProducts.filter(p => p.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return NextResponse.json({
    success: true,
    data: paginatedProducts,
    total: filteredProducts.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(filteredProducts.length / limit)
  });
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir au moins un nom, un prix et une catégorie.'
      }, { status: 400 });
    }
    
    // Créer un nouveau produit
    const newProduct: Product = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name: body.name,
      description: body.description || '',
      price: body.price,
      oldPrice: body.oldPrice,
      imageUrl: body.imageUrl || `https://picsum.photos/seed/product${Date.now()}/600/600`,
      category: body.category,
      stock: body.stock || 0,
      status: body.stock > 0 ? (body.stock > 10 ? 'En stock' : 'Stock faible') : 'Épuisé',
      rating: body.rating,
      featured: body.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Produit créé avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du produit'
    }, { status: 500 });
  }
}
