import { NextRequest } from 'next/server';

// Simuler les données Supabase pour le développement
const mockCategories = [
  {
    id: "cac4a51d-a5a2-4543-810d-3b719d8009f2",
    name: "Apéritifs & sucreries",
    description: "Accompagnements sucrés",
    icon: "🥜",
    color: "from-orange-100 to-orange-200",
    slug: "aperitifs-sucreries",
    is_active: true,
    sort_order: 6,
    emoji: "🍫"
  },
  {
    id: "7d2a4415-31c6-458d-b60a-bd65e554470c",
    name: "Bières",
    description: "Bières locales et importées",
    icon: "🍺",
    color: "from-yellow-100 to-yellow-200",
    slug: "bieres",
    is_active: true,
    sort_order: 4,
    emoji: "🍺"
  },
  {
    id: "fb121d80-ce44-472a-b0a6-8372a1c74a82",
    name: "Cocktails",
    description: "Cocktails et mélanges",
    icon: "🍹",
    color: "#00CED1",
    slug: "cocktails",
    is_active: true,
    sort_order: 5,
    emoji: "🍹"
  },
  {
    id: "21ae5c8b-20d1-4d07-b41d-6748d22af15b",
    name: "Vodka",
    description: "Vodkas premium",
    icon: "🥃",
    color: "#3B82F6",
    slug: "vodka",
    is_active: true,
    sort_order: 3,
    emoji: "🍸"
  },
  {
    id: "11edb1db-5da0-4815-bebd-627b4429d47e",
    name: "Sodas & jus",
    description: "Boissons sans alcool",
    icon: "🥤",
    color: "from-blue-100 to-blue-200",
    slug: "sodas-jus",
    is_active: true,
    sort_order: 7,
    emoji: "🥤"
  }
];

const mockProducts = [
  {
    id: "1",
    name: "Desperados Original",
    description: "Bière aromatisée tequila",
    price: 2.50,
    image_url: "/images/desperados.jpg",
    category_id: "7d2a4415-31c6-458d-b60a-bd65e554470c",
    is_active: true,
    is_featured: true,
    stock_quantity: 50,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Coca-Cola",
    description: "Boisson gazeuse",
    price: 1.50,
    image_url: "/images/coca.jpg",
    category_id: "11edb1db-5da0-4815-bebd-627b4429d47e",
    is_active: true,
    is_featured: false,
    stock_quantity: 100,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Cîroc Vodka Blue 70cl",
    description: "Vodka premium française",
    price: 45.00,
    image_url: "/images/ciroc.jpg",
    category_id: "21ae5c8b-20d1-4d07-b41d-6748d22af15b",
    is_active: true,
    is_featured: true,
    stock_quantity: 20,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Mojito Kit",
    description: "Kit complet pour mojito",
    price: 15.00,
    image_url: "/images/mojito-kit.jpg",
    category_id: "fb121d80-ce44-472a-b0a6-8372a1c74a82",
    is_active: true,
    is_featured: true,
    stock_quantity: 30,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Chocolats fins",
    description: "Assortiment de chocolats",
    price: 8.50,
    image_url: "/images/chocolats.jpg",
    category_id: "cac4a51d-a5a2-4543-810d-3b719d8009f2",
    is_active: true,
    is_featured: false,
    stock_quantity: 25,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getCategories':
        return new Response(JSON.stringify({ 
          categories: mockCategories,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'getProducts':
        // Enrichir les produits avec leurs catégories
        const enrichedProducts = mockProducts.map(product => {
          const category = mockCategories.find(cat => cat.id === product.category_id);
          return {
            ...product,
            categories: category ? [category] : []
          };
        });
        
        return new Response(JSON.stringify({ 
          products: enrichedProducts,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          message: "Action non supportée",
          success: false 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Erreur API MCP Supabase:', error);
    return new Response(JSON.stringify({ 
      message: "Erreur serveur",
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST() {
  return new Response(JSON.stringify({ message: "POST non supporté" }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
