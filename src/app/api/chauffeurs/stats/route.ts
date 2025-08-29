import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeurId = searchParams.get('chauffeur_id');

    if (!chauffeurId) {
      return NextResponse.json({ success: false, message: 'ID chauffeur requis' }, { status: 400 });
    }

    console.log('📊 Récupération statistiques pour chauffeur:', chauffeurId);

    // Récupérer toutes les commandes livrées par le chauffeur
    const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?delivery_notes=ilike.*${chauffeurId}*&status=eq.Livrée&select=*&order=delivered_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      console.error('❌ Erreur récupération commandes livrées:', ordersResponse.status);
      return NextResponse.json({ success: false, message: 'Erreur récupération commandes' }, { status: 500 });
    }

    const deliveredOrders = await ordersResponse.json();
    console.log('📦 Commandes livrées trouvées:', deliveredOrders.length);
    console.log('📦 Exemple commande:', deliveredOrders[0] ? { 
      delivery_fee: deliveredOrders[0].delivery_fee, 
      total_amount: deliveredOrders[0].total_amount 
    } : 'Aucune commande');

    // Calculer les statistiques
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Statistiques totales - utiliser delivery_fee ou une valeur par défaut si null
    const totalDeliveries = deliveredOrders.length;
    const totalEarnings = deliveredOrders.reduce((sum: number, order: any) => {
      const fee = order.delivery_fee ? parseFloat(order.delivery_fee) : 2000; // 2000 FCFA par défaut
      return sum + fee;
    }, 0);

    // Statistiques du jour
    const todayDeliveries = deliveredOrders.filter((order: any) => {
      if (!order.delivered_at) return false;
      const deliveredDate = new Date(order.delivered_at);
      return deliveredDate >= today;
    });
    const todayEarnings = todayDeliveries.reduce((sum: number, order: any) => {
      const fee = order.delivery_fee ? parseFloat(order.delivery_fee) : 2000;
      return sum + fee;
    }, 0);

    // Statistiques du mois
    const monthDeliveries = deliveredOrders.filter((order: any) => {
      if (!order.delivered_at) return false;
      const deliveredDate = new Date(order.delivered_at);
      return deliveredDate >= startOfMonth;
    });
    const monthEarnings = monthDeliveries.reduce((sum: number, order: any) => {
      const fee = order.delivery_fee ? parseFloat(order.delivery_fee) : 2000;
      return sum + fee;
    }, 0);

    // Récupérer les commandes actives (En préparation, Prête, En livraison)
    const activeOrdersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?delivery_notes=ilike.*${chauffeurId}*&status=in.(En préparation,Prête,En livraison)&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let activeDeliveries = 0;
    if (activeOrdersResponse.ok) {
      const activeOrders = await activeOrdersResponse.json();
      activeDeliveries = activeOrders.length;
    }

    // Récupérer les commandes confirmées disponibles (non assignées)
    const availableOrdersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?status=eq.Confirmée&delivery_notes=is.null&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let availableOrders = 0;
    if (availableOrdersResponse.ok) {
      const orders = await availableOrdersResponse.json();
      availableOrders = orders.length;
    }

    const stats = {
      // Statistiques totales
      totalDeliveries,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      
      // Statistiques du jour
      todayDeliveries: todayDeliveries.length,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
      
      // Statistiques du mois
      monthDeliveries: monthDeliveries.length,
      monthEarnings: Math.round(monthEarnings * 100) / 100,
      
      // Livraisons actives
      activeDeliveries,
      
      // Commandes disponibles
      availableOrders
    };

    console.log('📊 Statistiques calculées:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Erreur API statistiques chauffeurs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}
