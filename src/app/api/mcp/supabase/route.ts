import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestText = await request.text();
    console.log('🔍 MCP API - Texte brut reçu:', requestText);
    
    if (!requestText || requestText.trim() === '') {
      console.error('❌ Corps de requête vide');
      return NextResponse.json({ 
        success: false, 
        error: 'Empty or invalid json',
        message: 'Empty or invalid json'
      }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(requestText);
      console.log('🔍 MCP API - Body parsé:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Empty or invalid json',
        message: 'Empty or invalid json'
      }, { status: 400 });
    }

    const { action, resource, params, data } = body;
    
    console.log('🔍 MCP API - Paramètres extraits:', {
      action,
      resource,
      params,
      data
    });

    if (!action || !resource) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: action and resource' 
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables Supabase manquantes');
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase configuration missing' 
      }, { status: 500 });
    }

    console.log('🔍 MCP API - Configuration Supabase OK');

    // Gestion des commandes/orders
    if (resource === 'commandes' || resource === 'orders') {
      switch (action) {
        case 'read':
          let commandeUrl = `${supabaseUrl}/rest/v1/orders?select=*`;
          
          if (params?.id) {
            commandeUrl += `&id=eq.${params.id}`;
          }
          if (params?.customer_id) {
            commandeUrl += `&customer_id=eq.${params.customer_id}`;
          }
          if (params?.status) {
            commandeUrl += `&status=eq.${params.status}`;
          }
          commandeUrl += '&order=created_at.desc';

          const commandeResponse = await fetch(commandeUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!commandeResponse.ok) {
            throw new Error(`Erreur Supabase: ${commandeResponse.status}`);
          }

          const commandes = await commandeResponse.json();
          return NextResponse.json({ data: commandes });

        case 'update':
          console.log('🔄 Mise à jour commande:', { id: params.id, data });
          const updateCommandeUrl = `${supabaseUrl}/rest/v1/orders?id=eq.${params.id}`;
          console.log('📡 URL update:', updateCommandeUrl);
          
          const updateCommandeResponse = await fetch(updateCommandeUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });

          console.log('📊 Réponse Supabase:', updateCommandeResponse.status, updateCommandeResponse.statusText);

          if (!updateCommandeResponse.ok) {
            const errorText = await updateCommandeResponse.text();
            console.error('❌ Erreur Supabase détaillée:', errorText);
            return NextResponse.json({ 
              success: false, 
              error: `Erreur Supabase: ${updateCommandeResponse.status}`,
              details: errorText
            }, { status: updateCommandeResponse.status });
          }

          const updatedCommande = await updateCommandeResponse.json();
          console.log('📋 Commande mise à jour:', {
            dataStatus: data.status,
            updatedCommandeLength: updatedCommande?.length,
            updatedCommande: updatedCommande
          });
          
          // Déclencher les notifications WhatsApp pour tous les changements de statut
          console.log('🔍 Vérification condition notification:', {
            hasDataStatus: !!data.status,
            dataStatus: data.status,
            updatedCommandeType: typeof updatedCommande,
            isArray: Array.isArray(updatedCommande),
            length: updatedCommande?.length,
            updatedCommande: updatedCommande
          });
          
          // Force l'exécution du webhook pour diagnostic
          console.log('🚨 FORCE WEBHOOK EXECUTION FOR DIAGNOSTIC');
          
          if (data.status === 'En préparation' && updatedCommande.length > 0) {
            const order = updatedCommande[0];
            console.log('✅ CONDITIONS REMPLIES - Déclenchement notifications pour changement de statut:', {
              orderId: params.id,
              newStatus: data.status,
              orderNumber: order.order_number,
              customerId: order.customer_id
            });

            try {
              // Récupérer les infos client pour les notifications
              console.log('📞 Récupération infos client:', order.customer_id);
              const customerResponse = await fetch(`${supabaseUrl}/rest/v1/customers?id=eq.${order.customer_id}`, {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`
                }
              });

              console.log('📊 Réponse customers:', customerResponse.status);

              if (customerResponse.ok) {
                const customers = await customerResponse.json();
                console.log('👥 Données clients:', customers.length, 'clients trouvés');
                const customer = customers[0];

                if (customer && customer.phone) {
                  console.log('📱 Envoi notification WhatsApp à:', customer.phone);
                  
                  // Envoyer notification WhatsApp via l'API existante
                  const whatsappUrl = process.env.NODE_ENV === 'production' 
                    ? 'https://akanda-apero.netlify.app/api/whatsapp/send'
                    : 'http://localhost:3002/api/whatsapp/send';
                  
                  console.log('🌐 URL WhatsApp:', whatsappUrl);
                  
                  const notificationResponse = await fetch(whatsappUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      orderId: params.id,
                      phone: customer.phone,
                      status: data.status,
                      orderNumber: order.order_number,
                      customerName: customer.name || 'Client',
                      totalAmount: order.total_amount
                    })
                  });

                  console.log('📤 Réponse notification WhatsApp:', notificationResponse.status);
                  
                  if (notificationResponse.ok) {
                    const notifResult = await notificationResponse.json();
                    console.log('✅ Notification WhatsApp envoyée avec succès:', notifResult);
                  } else {
                    const errorText = await notificationResponse.text();
                    console.error('❌ Erreur envoi notification WhatsApp:', errorText);
                  }
                } else {
                  console.warn('⚠️ Client trouvé mais pas de téléphone:', customer);
                }
              } else {
                console.error('❌ Erreur récupération client:', await customerResponse.text());
              }
              
              // Log pour diagnostiquer la condition du webhook
              console.log('🔍 Vérification condition webhook:', {
                statusReçu: data.status,
                typeStatus: typeof data.status,
                conditionEnPreparation: data.status === 'En préparation',
                statusTrimmed: data.status?.trim(),
                statusLength: data.status?.length
              });
              
              // Créer livraison et déclencher webhook pour notifications chauffeurs si statut "En préparation"
              if (data.status === 'En préparation') {
                console.log('🚚 Création livraison pour statut En préparation');
                
                // Pas besoin de créer une livraison séparée - utiliser directement la table orders
                console.log('✅ Livraison intégrée dans la commande (statut En préparation)');

                // Déclencher webhook pour notifications chauffeurs
                console.log('🚚 Déclenchement webhook chauffeurs pour En préparation');
                const webhookUrl = process.env.NODE_ENV === 'production' 
                  ? 'https://akanda-apero.netlify.app/api/orders/webhook'
                  : 'http://localhost:3002/api/orders/webhook';
                
                console.log('🌐 URL webhook:', webhookUrl);
                console.log('📦 Payload webhook:', {
                  order_id: params.id,
                  status: data.status,
                  previous_status: 'pending'
                });
                
                const webhookResponse = await fetch(webhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    order_id: params.id,
                    status: data.status,
                    previous_status: 'pending'
                  })
                });
                console.log('📡 Réponse webhook chauffeurs:', webhookResponse.status);
                
                if (webhookResponse.ok) {
                  const webhookResult = await webhookResponse.json();
                  console.log('✅ Webhook chauffeurs exécuté avec succès:', webhookResult);
                } else {
                  const webhookError = await webhookResponse.text();
                  console.error('❌ Erreur webhook chauffeurs:', webhookResponse.status, webhookError);
                }
              }
            } catch (notificationError) {
              console.error('❌ Erreur notifications:', notificationError);
            }
          }
          
          return NextResponse.json({ 
            success: true, 
            data: updatedCommande,
            message: 'Commande mise à jour avec succès',
            debug: {
              notificationTriggered: data.status === 'En préparation' && Array.isArray(updatedCommande) && updatedCommande.length > 0,
              hasStatus: !!data.status,
              isArray: Array.isArray(updatedCommande),
              length: updatedCommande?.length,
              customerId: updatedCommande?.[0]?.customer_id,
              orderNumber: updatedCommande?.[0]?.order_number
            }
          });
      }
    }

    // Gestion des chauffeurs
    if (resource === 'chauffeurs') {
      switch (action) {
        case 'read':
          let chauffeursUrl = `${supabaseUrl}/rest/v1/chauffeurs?select=*`;
          
          if (params?.id) {
            chauffeursUrl += `&id=eq.${params.id}`;
          }
          if (params?.telephone) {
            chauffeursUrl += `&telephone=eq.${encodeURIComponent(params.telephone)}`;
          }
          if (params?.statut) {
            chauffeursUrl += `&statut=eq.${params.statut}`;
          }
          chauffeursUrl += '&order=nom.asc';

          const chauffeursResponse = await fetch(chauffeursUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!chauffeursResponse.ok) {
            throw new Error(`Erreur Supabase: ${chauffeursResponse.status}`);
          }

          const chauffeurs = await chauffeursResponse.json();
          return NextResponse.json({ data: chauffeurs });

        case 'update':
          console.log('🔄 Mise à jour chauffeur:', { id: params.id, data });
          const updateChauffeurUrl = `${supabaseUrl}/rest/v1/chauffeurs?id=eq.${params.id}`;
          
          const updateChauffeurResponse = await fetch(updateChauffeurUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });

          if (!updateChauffeurResponse.ok) {
            const errorText = await updateChauffeurResponse.text();
            console.error('❌ Erreur Supabase détaillée:', errorText);
            throw new Error(`Erreur Supabase: ${updateChauffeurResponse.status}`);
          }

          const updatedChauffeur = await updateChauffeurResponse.json();
          console.log('✅ Chauffeur mis à jour:', updatedChauffeur);
          
          return NextResponse.json({ 
            success: true, 
            data: updatedChauffeur,
            message: 'Chauffeur mis à jour avec succès'
          });
      }
    }

    // Gestion des notifications chauffeurs
    if (resource === 'chauffeur_notifications') {
      switch (action) {
        case 'create':
          const createNotifResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });

          if (!createNotifResponse.ok) {
            const errorText = await createNotifResponse.text();
            console.error('❌ Erreur création notification:', createNotifResponse.status, errorText);
            throw new Error(`Erreur Supabase: ${createNotifResponse.status} - ${errorText}`);
          }

          const newNotification = await createNotifResponse.json();
          console.log('✅ Notification créée:', newNotification);
          return NextResponse.json({ success: true, data: newNotification });

        case 'read':
          let notifUrl = `${supabaseUrl}/rest/v1/chauffeur_notifications?select=*`;
          
          if (params?.chauffeur_id) {
            notifUrl += `&chauffeur_id=eq.${params.chauffeur_id}`;
          }
          if (params?.type) {
            notifUrl += `&type=eq.${params.type}`;
          }
          if (params?.read !== undefined) {
            notifUrl += `&read=eq.${params.read}`;
          }
          if (params?.order) {
            notifUrl += `&order=${params.order}`;
          } else {
            notifUrl += '&order=created_at.desc';
          }

          const readNotifResponse = await fetch(notifUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!readNotifResponse.ok) {
            throw new Error(`Erreur Supabase: ${readNotifResponse.status}`);
          }

          const notifications = await readNotifResponse.json();
          return NextResponse.json({ data: notifications });
      }
    }

    console.log('❌ Resource ou action non supportée:', {
      resource,
      action
    });
    return NextResponse.json({ 
      success: false, 
      error: `Resource ou action non supportée: ${resource}/${action}`,
      availableResources: ['livraisons', 'deliveries', 'chauffeurs', 'commandes', 'orders', 'chauffeur_notifications', 'chauffeur_positions']
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Erreur MCP API:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : 'No details'
    }, { status: 500 });
  }
}
