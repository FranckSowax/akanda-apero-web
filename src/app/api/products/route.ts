import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Product } from '../../../lib/types';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base de données fictive pour fallback uniquement
let fallbackProducts: Product[] = [
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
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    // Construire la requête Supabase
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    
    // Appliquer les filtres
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data: products, error, count } = await query;
    
    if (error) {
      console.error('Erreur Supabase:', error);
      // Fallback vers les données fictives
      let filteredProducts = [...fallbackProducts];

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
    
    // Succès Supabase
    return NextResponse.json({
      success: true,
      data: products || [],
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
    
  } catch (error) {
    console.error('Erreur API products:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la récupération des produits'
    }, { status: 500 });
  }
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
    
    // Créer un nouveau produit dans Supabase
    const productData = {
      name: body.name,
      description: body.description || '',
      price: body.price,
      old_price: body.oldPrice,
      image_url: body.imageUrl || `https://picsum.photos/seed/product${Date.now()}/600/600`,
      category_id: body.category,
      stock: body.stock || 0,
      status: body.stock > 0 ? (body.stock > 10 ? 'En stock' : 'Stock faible') : 'Épuisé',
      rating: body.rating,
      is_featured: body.featured || false,
      is_active: true
    };
    
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
      
    if (error) {
      console.error('Erreur création produit:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création du produit'
      }, { status: 500 });
    }
    
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
