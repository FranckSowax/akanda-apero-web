import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, previous_status } = body;

    // Vérifier si le statut est passé à "En préparation" (avec majuscule)
    console.log(`🔍 Webhook reçu - Status: "${status}", Previous: "${previous_status}"`);
    
    if (status === 'En préparation' && previous_status !== 'En préparation') {
      console.log(`✅ Commande ${order_id} passée en préparation - envoi notifications`);

      // Récupérer les chauffeurs en ligne (disponibles)
      const chauffeursResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mcp/supabase`, {
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

        // Récupérer les détails de la commande
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/mcp/supabase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'read',
            resource: 'commandes',
            params: {
              id: `eq.${order_id}`
            }
          })
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          const order = orderResult.data?.[0];

          if (order) {
            // 1. Envoyer notification WhatsApp au client
            if (order.telephone_client) {
              try {
                const whapiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/whatsapp/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phone: order.telephone_client,
                    orderNumber: order.numero_commande || order_id,
                    status: 'En préparation',
                    customerName: order.nom_client || 'Client'
                  })
                });

                if (whapiResponse.ok) {
                  console.log(`✅ Notification WhatsApp envoyée au client ${order.nom_client}`);
                } else {
                  console.error('❌ Erreur envoi WhatsApp client:', await whapiResponse.text());
                }
              } catch (error) {
                console.error('❌ Erreur WhatsApp client:', error);
              }
            }

            // 2. Créer automatiquement une livraison
            try {
              const livraisonResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/mcp/supabase`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'create',
                  resource: 'livraisons',
                  data: {
                    commande_id: order_id,
                    adresse_livraison: order.adresse_livraison,
                    telephone_client: order.telephone_client,
                    nom_client: order.nom_client,
                    statut: 'en_attente',
                    date_creation: new Date().toISOString(),
                    priorite: 'normale'
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
            for (const chauffeur of chauffeurs) {
              console.log(`📤 Envoi notification à chauffeur ${chauffeur.id} (${chauffeur.nom})`);
              
              const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/notifications`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'nouvelle_commande',
                  chauffeur_id: chauffeur.id,
                  commande_id: order_id,
                  message: `Nouvelle commande prête pour livraison: ${order.nom_client || 'Client'} - ${order.adresse_livraison || 'Adresse non spécifiée'}`
                })
              });

              if (notificationResponse.ok) {
                console.log(`✅ Notification envoyée avec succès à ${chauffeur.nom}`);
              } else {
                console.error(`❌ Erreur envoi notification à ${chauffeur.nom}:`, await notificationResponse.text());
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
