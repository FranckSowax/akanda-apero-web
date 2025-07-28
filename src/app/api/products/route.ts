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
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b815-9dad-11d1-80b4-00c04fd430c8',
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
    id: '6ba7b816-9dad-11d1-80b4-00c04fd430c8',
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
      .select(`
        id,
        name,
        description,
        short_description,
        base_price,
        sale_price,
        image_url,
        emoji,
        category_id,
        stock_quantity,
        is_active,
        is_featured,
        rating,
        rating_count,
        product_type,
        sku,
        volume_ml,
        alcohol_percentage,
        origin_country,
        brand,
        tags,
        created_at,
        updated_at,
        categories (id, name)
      `)
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
      console.error('=== ERREUR SUPABASE DÉTAILLÉE ===');
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Erreur complète:', JSON.stringify(error, null, 2));
      console.error('=====================================');
      
      // Fallback vers les données fictives
      console.log('⚠️ Utilisation du fallback - données fictives');
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
    
    // Succès Supabase - Transformer les données pour compatibilité
    console.log(`✅ Supabase succès: ${products?.length || 0} produits récupérés`);
    console.log('Premier produit (exemple):', products?.[0]);
    
    const transformedProducts = (products || []).map((product: any) => {
      // Calculer le prix final (sale_price si disponible, sinon base_price)
      const finalPrice = product.sale_price || product.base_price || 0;
      const oldPrice = product.sale_price ? product.base_price : null;
      
      // Déterminer le statut basé sur le stock
      let status = 'En stock';
      if (product.stock_quantity <= 0) {
        status = 'Épuisé';
      } else if (product.stock_quantity <= (product.min_stock_level || 5)) {
        status = 'Stock faible';
      }
      
      return {
        id: product.id, // Garder l'UUID comme string
        name: product.name,
        description: product.description || product.short_description || '',
        price: finalPrice,
        oldPrice: oldPrice,
        imageUrl: product.image_url || '',
        category: product.categories?.name || 'Non catégorisé',
        categorySlug: product.categories?.name?.toLowerCase().replace(/\s+/g, '-') || 'non-categorise',
        stock: product.stock_quantity || 0,
        status: status,
        rating: product.rating || 0,
        featured: product.is_featured || false,
        currency: 'XAF',
        // Champs supplémentaires Supabase
        productType: product.product_type,
        sku: product.sku,
        volumeMl: product.volume_ml,
        alcoholPercentage: product.alcohol_percentage,
        originCountry: product.origin_country,
        brand: product.brand,
        tags: product.tags,
        emoji: product.emoji,
        ratingCount: product.rating_count,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedProducts,
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
