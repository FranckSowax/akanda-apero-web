import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeur_id = searchParams.get('chauffeur_id');

    if (!chauffeur_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'chauffeur_id requis' 
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }

    // Récupérer les livraisons actives depuis la table active_deliveries
    const deliveriesResponse = await fetch(
      `${supabaseUrl}/rest/v1/active_deliveries?chauffeur_id=eq.${chauffeur_id}&status=eq.en_cours&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!deliveriesResponse.ok) {
      // Si la table n'existe pas, récupérer depuis orders avec delivery_notes
      const ordersResponse = await fetch(
        `${supabaseUrl}/rest/v1/orders?or=(status.eq.En%20préparation,status.eq.Prête,status.eq.En%20livraison)&delivery_notes=ilike.*%28${chauffeur_id}%29*&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );

      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        console.error('❌ Erreur récupération commandes:', errorText);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la récupération des livraisons' 
        }, { status: 500 });
      }

      const orders = await ordersResponse.json();
      
      // Transformer les commandes en format livraisons avec statut approprié
      const deliveries = orders.map((order: any) => {
        let deliveryStatus = 'en_cours';
        if (order.status === 'En préparation') {
          deliveryStatus = 'pending';
        } else if (order.status === 'Prête') {
          deliveryStatus = 'ready';
        } else if (order.status === 'En livraison') {
          deliveryStatus = 'en_cours';
        }

        return {
          id: order.id,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name || 'Client',
          delivery_address: order.delivery_address,
          delivery_district: order.delivery_district,
          total_amount: order.total_amount,
          delivery_cost: order.delivery_cost,
          status: deliveryStatus,
          order_status: order.status,
          delivery_code: order.delivery_notes?.match(/Code: (\d+)/)?.[1] || 'N/A',
          created_at: order.created_at,
          gps_latitude: order.gps_latitude,
          gps_longitude: order.gps_longitude
        };
      });

      return NextResponse.json({ 
        success: true, 
        deliveries 
      });
    }

    const deliveries = await deliveriesResponse.json();
    return NextResponse.json({ 
      success: true, 
      deliveries 
    });

  } catch (error) {
    console.error('❌ Erreur API active-deliveries:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { delivery_id, status } = body;

    if (!delivery_id || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'delivery_id et status requis' 
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }

    // Mettre à jour le statut de la commande
    const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${delivery_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: status === 'livree' ? 'Livrée' : status,
        updated_at: new Date().toISOString()
      })
    });

    if (!updateOrderResponse.ok) {
      const errorText = await updateOrderResponse.text();
      console.error('❌ Erreur mise à jour commande:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour' 
      }, { status: 500 });
    }

    // Supprimer de active_deliveries si existe
    await fetch(`${supabaseUrl}/rest/v1/active_deliveries?order_id=eq.${delivery_id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const updatedOrder = await updateOrderResponse.json();
    return NextResponse.json({ 
      success: true, 
      data: updatedOrder 
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour livraison:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
