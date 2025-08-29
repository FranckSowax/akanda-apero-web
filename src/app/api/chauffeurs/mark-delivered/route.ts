import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, chauffeur_id } = body;

    console.log('✅ Marquage livraison terminée:', { order_id, chauffeur_id });

    if (!order_id || !chauffeur_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données manquantes pour marquer la livraison comme terminée' 
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

    // Vérifier que la commande est en livraison
    if (order.status !== 'En livraison') {
      return NextResponse.json({ 
        success: false, 
        error: 'La commande doit être en livraison pour être marquée comme livrée' 
      }, { status: 400 });
    }

    // 2. Mettre à jour le statut de la commande vers "Livrée"
    const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'Livrée',
        delivered_at: new Date().toISOString()
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
      type: 'livraison_terminee',
      chauffeur_id,
      message: `✅ Livraison terminée ! Commande #${order.order_number} livrée avec succès.`,
      data: {
        order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount
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
      const whatsappMessage = `✅ Votre commande #${order.order_number} a été livrée avec succès ! Merci d'avoir choisi Akanda Apéro. Nous espérons vous revoir bientôt ! 🎉`;
      
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

    console.log(`✅ Livraison terminée pour commande ${order_id} par chauffeur ${chauffeur_id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Livraison marquée comme terminée avec succès!',
      data: {
        order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount
      }
    });

  } catch (error) {
    console.error('❌ Erreur API mark-delivered:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
