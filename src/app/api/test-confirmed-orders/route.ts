import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test récupération commandes confirmées...');

    // Récupérer toutes les commandes avec statut "Confirmée"
    const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?status=eq.Confirmée&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      console.error('❌ Erreur récupération commandes confirmées:', ordersResponse.status);
      const errorText = await ordersResponse.text();
      console.error('❌ Détail erreur:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur récupération commandes',
        details: errorText 
      }, { status: 500 });
    }

    const confirmedOrders = await ordersResponse.json();
    console.log('✅ Commandes confirmées trouvées:', confirmedOrders.length);
    console.log('📋 Exemple commandes:', confirmedOrders.slice(0, 3).map((order: any) => ({
      id: order.id,
      status: order.status,
      order_number: order.order_number,
      delivery_notes: order.delivery_notes
    })));

    return NextResponse.json({
      success: true,
      count: confirmedOrders.length,
      orders: confirmedOrders.slice(0, 5) // Retourner les 5 premières pour debug
    });

  } catch (error) {
    console.error('❌ Erreur API test-confirmed-orders:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
