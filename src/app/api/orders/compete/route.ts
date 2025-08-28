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

    // 1. Enregistrer cette acceptation dans une table temporaire
    const acceptationData = {
      order_id,
      chauffeur_id,
      chauffeur_name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distance_from_base: calculateDistance(
        AKANDA_APERO_LOCATION.latitude,
        AKANDA_APERO_LOCATION.longitude,
        parseFloat(latitude),
        parseFloat(longitude)
      ),
      accepted_at: new Date().toISOString()
    };

    // Créer ou mettre à jour l'acceptation
    const acceptationResponse = await fetch(`${supabaseUrl}/rest/v1/order_acceptations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(acceptationData)
    });

    if (!acceptationResponse.ok) {
      const errorText = await acceptationResponse.text();
      console.error('❌ Erreur enregistrement acceptation:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de l\'enregistrement de l\'acceptation' 
      }, { status: 500 });
    }

    // 2. Attendre 10 secondes pour permettre à d'autres chauffeurs d'accepter
    setTimeout(async () => {
      try {
        await determineWinner(order_id, supabaseUrl, supabaseKey);
      } catch (error) {
        console.error('❌ Erreur lors de la détermination du gagnant:', error);
      }
    }, 10000); // 10 secondes

    return NextResponse.json({ 
      success: true, 
      message: 'Acceptation enregistrée. Détermination du gagnant en cours...',
      data: acceptationData
    });

  } catch (error) {
    console.error('❌ Erreur API compétition:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

async function determineWinner(order_id: string, supabaseUrl: string, supabaseKey: string) {
  try {
    console.log('🏆 Détermination du gagnant pour commande:', order_id);

    // Récupérer toutes les acceptations pour cette commande
    const acceptationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/order_acceptations?order_id=eq.${order_id}&select=*&order=distance_from_base.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!acceptationsResponse.ok) {
      throw new Error('Erreur lors de la récupération des acceptations');
    }

    const acceptations = await acceptationsResponse.json();
    
    if (acceptations.length === 0) {
      console.log('❌ Aucune acceptation trouvée pour la commande:', order_id);
      return;
    }

    // Le gagnant est celui avec la plus petite distance
    const winner = acceptations[0];
    console.log('🏆 Gagnant déterminé:', winner);

    // Mettre à jour la commande avec le chauffeur gagnant
    const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'En livraison',
        delivery_notes: `Chauffeur: ${winner.chauffeur_name} (${winner.chauffeur_id}) - Distance: ${winner.distance_from_base.toFixed(2)}km`
      })
    });

    if (!updateOrderResponse.ok) {
      throw new Error('Erreur lors de la mise à jour de la commande');
    }

    // Créer une livraison pour le gagnant
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryData = {
      order_id,
      chauffeur_id: winner.chauffeur_id,
      chauffeur_name: winner.chauffeur_name,
      delivery_code: deliveryCode,
      status: 'en_cours',
      distance_from_base: winner.distance_from_base,
      created_at: new Date().toISOString()
    };

    // Utiliser la table orders pour stocker les livraisons (comme défini précédemment)
    const deliveryResponse = await fetch(`${supabaseUrl}/rest/v1/active_deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(deliveryData)
    });

    if (!deliveryResponse.ok) {
      console.error('❌ Erreur création livraison active');
    }

    // Notifier tous les chauffeurs du résultat
    for (const acceptation of acceptations) {
      const isWinner = acceptation.chauffeur_id === winner.chauffeur_id;
      const notificationData = {
        type: isWinner ? 'commande_gagnee' : 'commande_perdue',
        chauffeur_id: acceptation.chauffeur_id,
        order_id,
        message: isWinner 
          ? `🎉 Félicitations ! Vous avez remporté la livraison (${winner.distance_from_base.toFixed(2)}km du siège). Code: ${deliveryCode}`
          : `❌ Un autre chauffeur plus proche a remporté cette livraison.`,
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
    }

    // Nettoyer les acceptations temporaires
    await fetch(`${supabaseUrl}/rest/v1/order_acceptations?order_id=eq.${order_id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    console.log('✅ Compétition terminée pour commande:', order_id);

  } catch (error) {
    console.error('❌ Erreur lors de la détermination du gagnant:', error);
  }
}
