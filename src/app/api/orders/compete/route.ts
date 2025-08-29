import { NextRequest, NextResponse } from 'next/server';

// Coordonnées du siège d'Akanda Apero (à ajuster selon la localisation réelle)
const AKANDA_APERO_LOCATION = {
  latitude: 0.4077972,
  longitude: 9.4402833
};

// Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, chauffeur_id, chauffeur_name, latitude, longitude } = body;

    console.log('🏁 Compétition pour commande:', { order_id, chauffeur_id, latitude, longitude });

    if (!order_id || !chauffeur_id || !latitude || !longitude) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données manquantes pour la compétition' 
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

    // Calculer la distance depuis le siège
    const distance = calculateDistance(
      AKANDA_APERO_LOCATION.latitude,
      AKANDA_APERO_LOCATION.longitude,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    console.log(`📍 Distance calculée: ${distance.toFixed(2)}km pour chauffeur ${chauffeur_name}`);

    // Approche simplifiée: attribuer directement la commande au premier chauffeur qui accepte
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'En préparation',
        delivery_notes: `Chauffeur: ${chauffeur_name} (${chauffeur_id}) - Distance: ${distance.toFixed(2)}km - Code: ${deliveryCode}`
      })
    });

    if (!updateOrderResponse.ok) {
      const errorText = await updateOrderResponse.text();
      console.error('❌ Erreur mise à jour commande:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour de la commande' 
      }, { status: 500 });
    }

    // Notifier le chauffeur qu'il a accepté la livraison
    const notificationData = {
      type: 'commande_acceptee',
      chauffeur_id,
      message: `✅ Commande acceptée ! En attente de préparation. Distance: ${distance.toFixed(2)}km du siège. Code: ${deliveryCode}`,
      data: {
        order_id,
        delivery_code: deliveryCode,
        distance: distance.toFixed(2),
        status: 'pending'
      },
      created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/chauffeur_notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(notificationData)
    });

    console.log(`✅ Commande ${order_id} acceptée par ${chauffeur_name} - En attente de préparation - Code ${deliveryCode}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Commande acceptée ! En attente de préparation.',
      data: {
        delivery_code: deliveryCode,
        distance: distance.toFixed(2),
        chauffeur_name,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Erreur API compétition:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

