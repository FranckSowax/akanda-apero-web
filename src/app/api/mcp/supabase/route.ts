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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resource, params, body: data } = body;

    // Gestion des problèmes via MCP
    if (resource === 'problemes') {
      switch (action) {
        case 'read':
          // Utiliser l'API REST Supabase pour récupérer les vrais problèmes
          try {
            console.log('🔍 Tentative de récupération des problèmes via Supabase REST API');
            
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
              console.error('❌ Variables d\'environnement Supabase manquantes');
              return new Response(JSON.stringify({ 
                data: [],
                success: false,
                error: 'Configuration Supabase manquante'
              }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
              });
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/problemes?select=*&order=created_at.desc`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              console.error('❌ Erreur HTTP:', response.status, response.statusText);
              return new Response(JSON.stringify({ 
                data: [],
                success: false,
                error: `Erreur HTTP: ${response.status}`
              }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
              });
            }

            const problems = await response.json();
            console.log('✅ Problèmes récupérés:', problems.length, 'éléments');

            return new Response(JSON.stringify({ 
              data: problems || [],
              success: true 
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (fetchError) {
            console.error('❌ Erreur lors de la récupération des problèmes:', fetchError);
            return new Response(JSON.stringify({ 
              data: [],
              success: false,
              error: fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

        case 'create':
          // Simuler la création d'un problème
          const newProblem = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            status: 'nouveau',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return new Response(JSON.stringify({ 
            data: newProblem,
            success: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });

        case 'update':
          // Mettre à jour un problème via l'API REST Supabase
          try {
            console.log('🔄 Mise à jour du problème:', params.id, 'avec:', data);
            
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
              return new Response(JSON.stringify({ 
                data: null,
                success: false,
                error: 'Configuration Supabase manquante'
              }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
              });
            }

            const updateData = {
              ...data,
              updated_at: new Date().toISOString()
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/problemes?id=eq.${params.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(updateData)
            });

            if (!response.ok) {
              console.error('❌ Erreur HTTP lors de la mise à jour:', response.status, response.statusText);
              return new Response(JSON.stringify({ 
                data: null,
                success: false,
                error: `Erreur HTTP: ${response.status}`
              }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
              });
            }

            const updatedProblems = await response.json();
            const updatedProblem = updatedProblems[0];
            
            console.log('✅ Problème mis à jour:', updatedProblem);

            return new Response(JSON.stringify({ 
              data: updatedProblem,
              success: true 
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (updateError) {
            console.error('❌ Erreur lors de la mise à jour du problème:', updateError);
            return new Response(JSON.stringify({ 
              data: null,
              success: false,
              error: updateError instanceof Error ? updateError.message : 'Erreur inconnue'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

        case 'delete':
          // Simuler la suppression d'un problème
          return new Response(JSON.stringify({ 
            success: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    }

    // Gestion des requêtes SQL
    if (resource === 'sql' && action === 'execute') {
      // Simuler l'exécution SQL pour les politiques RLS
      console.log('Exécution SQL simulée:', data.query);
      return new Response(JSON.stringify({ 
        data: null,
        success: true,
        message: 'SQL exécuté avec succès (simulé)'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: "Action non supportée",
      success: false 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur API MCP Supabase POST:', error);
    return new Response(JSON.stringify({ 
      message: "Erreur serveur",
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
