import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, chauffeur_id } = body;

    console.log('🚚 Démarrage livraison:', { order_id, chauffeur_id });

    if (!order_id || !chauffeur_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données manquantes pour démarrer la livraison' 
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

    // 1. Récupérer les détails de la commande
    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!orderResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Commande non trouvée' 
      }, { status: 404 });
    }

    const orders = await orderResponse.json();
    if (orders.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Commande non trouvée' 
      }, { status: 404 });
    }

    const order = orders[0];

    // Vérifier que la commande est prête
    if (order.status !== 'Prête') {
      return NextResponse.json({ 
        success: false, 
        error: 'La commande doit être prête avant de démarrer la livraison' 
      }, { status: 400 });
    }

    // 2. Mettre à jour le statut de la commande vers "En livraison"
    const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'En livraison'
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

    // 3. Notifier le chauffeur
    const notificationData = {
      type: 'livraison_demarree',
      chauffeur_id,
      message: `🚚 Livraison démarrée ! Commande #${order.order_number} en cours de livraison.`,
      data: {
        order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        delivery_address: order.delivery_address
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

    // 4. Envoyer notification WhatsApp au client
    if (order.customer_phone) {
      const whatsappMessage = `🚚 Votre commande #${order.order_number} est maintenant en cours de livraison ! Notre chauffeur se dirige vers vous. Merci de votre patience.`;
      
      try {
        const whatsappResponse = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://akanda-apero.netlify.app' : 'http://localhost:3002'}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: order.customer_phone,
            message: whatsappMessage
          })
        });

        if (whatsappResponse.ok) {
          console.log('✅ Notification WhatsApp envoyée au client');
        } else {
          console.error('❌ Erreur envoi WhatsApp:', await whatsappResponse.text());
        }
      } catch (whatsappError) {
        console.error('❌ Erreur WhatsApp:', whatsappError);
      }
    }

    console.log(`✅ Livraison démarrée pour commande ${order_id} par chauffeur ${chauffeur_id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Livraison démarrée avec succès!',
      data: {
        order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        delivery_address: order.delivery_address
      }
    });

  } catch (error) {
    console.error('❌ Erreur API start-delivery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
