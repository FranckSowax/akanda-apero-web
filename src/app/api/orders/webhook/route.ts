import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, previous_status } = body;

    // Vérifier si le statut est passé à "En préparation" (avec majuscule)
    console.log(`🔍 Webhook reçu - Order: "${order_id}", Status: "${status}", Previous: "${previous_status}"`);
    
    if (status === 'En préparation' && previous_status !== 'En préparation') {
      console.log(`✅ Commande ${order_id} passée en préparation - envoi notifications`);
      
      // Vérifier si la commande existe
      console.log(`🔍 Vérification existence commande ${order_id}...`);

      // Récupérer les chauffeurs en ligne (disponibles)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const chauffeursResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'chauffeurs',
          action: 'read',
          params: { statut: 'en_ligne' }
        })
      });

      if (chauffeursResponse.ok) {
        const chauffeursResult = await chauffeursResponse.json();
        const chauffeurs = chauffeursResult.data || [];
        console.log(`📱 ${chauffeurs.length} chauffeurs en ligne trouvés:`, chauffeurs.map((c: any) => ({ id: c.id, nom: c.nom })));

        // Récupérer les détails de la commande directement via Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`
          }
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          const order = orderResult[0];
          
          console.log(`🔍 Commande trouvée:`, order ? 'OUI' : 'NON');
          if (order) {
            console.log(`📋 Détails commande:`, {
              id: order.id,
              numero: order.order_number,
              client: order.customer_id,
              adresse: order.delivery_address
            });
          }

          if (order) {
            // 1. Récupérer les infos client pour WhatsApp
            const customerResponse = await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${order.customer_id}`, {
              headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey!}`
              }
            });

            let customer = null;
            if (customerResponse.ok) {
              const customers = await customerResponse.json();
              customer = customers[0];
              console.log(`👤 Client trouvé:`, customer ? `${customer.name} - ${customer.phone}` : 'NON');
            } else {
              console.log(`❌ Erreur récupération client: ${customerResponse.status}`);
            }

            // 2. Envoyer notification WhatsApp au client
            if (customer?.phone) {
              try {
                const whapiResponse = await fetch(`${baseUrl}/api/whatsapp/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phone: customer.phone,
                    orderNumber: order.order_number || order_id,
                    status: 'En préparation',
                    customerName: customer.name || 'Client'
                  })
                });

                if (whapiResponse.ok) {
                  console.log(`✅ Notification WhatsApp envoyée au client ${customer.name}`);
                } else {
                  console.error('❌ Erreur envoi WhatsApp client:', await whapiResponse.text());
                }
              } catch (error) {
                console.error('❌ Erreur WhatsApp client:', error);
              }
            }

            // 2. Créer automatiquement une livraison
            try {
              const livraisonResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'create',
                  resource: 'livraisons',
                  data: {
                    order_id: order.id,
                    delivery_address: order.delivery_address,
                    customer_phone: customer?.phone,
                    customer_name: customer?.name,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    priority: 'normal'
                  }
                })
              });

              if (livraisonResponse.ok) {
                console.log(`✅ Livraison créée automatiquement pour commande ${order_id}`);
              } else {
                console.error('❌ Erreur création livraison:', await livraisonResponse.text());
              }
            } catch (error) {
              console.error('❌ Erreur création livraison:', error);
            }

            // 3. Envoyer notification à tous les chauffeurs disponibles
            console.log(`🚨 DÉBUT ENVOI NOTIFICATIONS - ${chauffeurs.length} chauffeurs trouvés`);
            for (const chauffeur of chauffeurs) {
              console.log(`📤 Envoi notification à chauffeur ${chauffeur.id} (${chauffeur.nom})`);
              
              const notificationData = {
                type: 'info',
                chauffeur_id: chauffeur.id,
                message: `Nouvelle commande ${order.order_number} prête pour livraison: ${customer?.name || 'Client'} - ${order.delivery_address || 'Adresse non spécifiée'}`,
                data: {
                  order_id: order.id,
                  order_number: order.order_number,
                  client_name: customer?.name || 'FRANCK SOWAX',
                  client_phone: customer?.phone || '+33624576620',
                  delivery_address: order.delivery_address || 'Adresse non spécifiée',
                  delivery_district: order.delivery_district || 'Pessac',
                  total_amount: order.total_amount || 0,
                  delivery_cost: order.delivery_cost || 0,
                  subtotal: order.subtotal || 0,
                  delivery_option: order.delivery_option || 'standard',
                  gps_latitude: order.gps_latitude,
                  gps_longitude: order.gps_longitude,
                  waze_text: 'Waze'
                }
              };
              
              console.log(`📋 Données notification:`, notificationData);
              
              const notificationResponse = await fetch(`${baseUrl}/api/notifications`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData)
              });

              console.log(`📡 Réponse notification API: ${notificationResponse.status} ${notificationResponse.statusText}`);

              if (notificationResponse.ok) {
                const responseData = await notificationResponse.json();
                console.log(`✅ Notification créée avec succès pour ${chauffeur.nom}:`, responseData);
              } else {
                const errorText = await notificationResponse.text();
                console.error(`❌ Erreur envoi notification à ${chauffeur.nom}:`, errorText);
              }
            }

            console.log(`📱 Notifications traitées pour ${chauffeurs.length} chauffeurs disponibles`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur webhook commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}
