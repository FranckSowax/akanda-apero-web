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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configuration Supabase manquante:', {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }

    console.log('✅ Configuration Supabase OK:', {
      action,
      resource,
      hasParams: !!params,
      hasData: !!data
    });

    // Gestion des livraisons
    if (resource === 'livraisons') {
      switch (action) {
        case 'read':
          let url = `${supabaseUrl}/rest/v1/livraisons?select=*`;
          
          if (params?.chauffeur_id) {
            url += `&chauffeur_id=eq.${params.chauffeur_id}`;
          }
          if (params?.statut) {
            url += `&statut=eq.${params.statut}`;
          }
          url += '&order=created_at.desc';

          const response = await fetch(url, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!response.ok) {
            throw new Error(`Erreur Supabase: ${response.status}`);
          }

          const livraisons = await response.json();
          return NextResponse.json({ data: livraisons });

        case 'update':
          const updateUrl = `${supabaseUrl}/rest/v1/livraisons?id=eq.${params.id}`;
          const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });

          if (!updateResponse.ok) {
            throw new Error(`Erreur Supabase: ${updateResponse.status}`);
          }

          const updatedLivraison = await updateResponse.json();
          return NextResponse.json({ data: updatedLivraison });
      }
    }

    // Gestion des chauffeurs
    if (resource === 'chauffeurs') {
      switch (action) {
        case 'read':
          let chauffeurUrl = `${supabaseUrl}/rest/v1/chauffeurs?select=*`;
          
          if (params?.disponible) {
            chauffeurUrl += `&disponible=${params.disponible}`;
          }
          if (params?.telephone) {
            chauffeurUrl += `&telephone=eq.${encodeURIComponent(params.telephone)}`;
          }
          chauffeurUrl += '&order=created_at.desc';

          console.log('🔍 MCP - URL chauffeurs:', chauffeurUrl);
          const chauffeurResponse = await fetch(chauffeurUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!chauffeurResponse.ok) {
            const errorText = await chauffeurResponse.text();
            console.error('❌ MCP - Erreur Supabase chauffeurs:', chauffeurResponse.status, errorText);
            throw new Error(`Erreur Supabase: ${chauffeurResponse.status} - ${errorText}`);
          }

          const chauffeurs = await chauffeurResponse.json();
          console.log('✅ MCP - Chauffeurs récupérés:', chauffeurs.length, chauffeurs);
          return NextResponse.json({ success: true, data: chauffeurs });

        case 'update':
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
            throw new Error(`Erreur Supabase: ${updateChauffeurResponse.status}`);
          }

          const updatedChauffeur = await updateChauffeurResponse.json();
          return NextResponse.json({ data: updatedChauffeur });

        case 'create':
          try {
            console.log('➕ Création chauffeur via REST API:', data);
            const createChauffeurResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeurs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(data)
            });

            if (!createChauffeurResponse.ok) {
              const errorText = await createChauffeurResponse.text();
              console.error('❌ Erreur REST API create chauffeur:', createChauffeurResponse.status, errorText);
              return NextResponse.json({ 
                success: false, 
                error: `Erreur API: ${createChauffeurResponse.status} - ${errorText}` 
              }, { status: createChauffeurResponse.status });
            }

            const newChauffeur = await createChauffeurResponse.json();
            console.log('✅ Chauffeur créé:', newChauffeur);
            return NextResponse.json({ 
              success: true,
              data: newChauffeur 
            });

          } catch (error) {
            console.error('❌ Erreur lors de la création du chauffeur:', error);
            return NextResponse.json({ 
              success: false, 
              error: 'Erreur interne du serveur' 
            }, { status: 500 });
          }

        case 'delete':
          try {
            console.log('🗑️ Suppression chauffeur ID:', params.id);
            const deleteChauffeurResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeurs?id=eq.${params.id}`, {
              method: 'DELETE',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            });

            if (!deleteChauffeurResponse.ok) {
              const errorText = await deleteChauffeurResponse.text();
              console.error('❌ Erreur REST API delete chauffeur:', deleteChauffeurResponse.status, errorText);
              return NextResponse.json({ 
                success: false, 
                error: `Erreur API: ${deleteChauffeurResponse.status} - ${errorText}` 
              }, { status: deleteChauffeurResponse.status });
            }

            console.log('✅ Chauffeur supprimé');
            return NextResponse.json({ 
              success: true,
              message: 'Chauffeur supprimé avec succès'
            });

          } catch (error) {
            console.error('❌ Erreur lors de la suppression du chauffeur:', error);
            return NextResponse.json({ 
              success: false, 
              error: 'Erreur interne du serveur' 
            }, { status: 500 });
          }
      }
    }

    // Gestion des commandes
    if (resource === 'commandes') {
      switch (action) {
        case 'read':
          let commandeUrl = `${supabaseUrl}/rest/v1/orders?select=*`;
          
          if (params?.id) {
            commandeUrl += `&id=eq.${params.id}`;
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
          
          // Déclencher les notifications WhatsApp pour tous les changements de statut
          if (data.status && updatedCommande.length > 0) {
            const order = updatedCommande[0];
            console.log('🔄 Déclenchement notifications pour changement de statut:', {
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
                  const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/whatsapp/send`, {
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

              // Déclencher webhook pour notifications chauffeurs si statut "En préparation"
              if (data.status === 'En préparation') {
                console.log('🚚 Déclenchement webhook chauffeurs pour En préparation');
                const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/orders/webhook`, {
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
              }
            } catch (notificationError) {
              console.error('❌ Erreur notifications:', notificationError);
            }
          }
          
          return NextResponse.json({ 
            success: true, 
            data: updatedCommande,
            message: 'Commande mise à jour avec succès'
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
            throw new Error(`Erreur Supabase: ${createNotifResponse.status}`);
          }

          const newNotification = await createNotifResponse.json();
          return NextResponse.json({ data: newNotification });

        case 'read':
          let notifUrl = `${supabaseUrl}/rest/v1/chauffeur_notifications?select=*`;
          
          if (params?.chauffeur_id) {
            notifUrl += `&chauffeur_id=eq.${params.chauffeur_id}`;
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

    // Gestion des positions de chauffeurs
    if (resource === 'chauffeur_positions') {
      switch (action) {
        case 'create':
          const createPositionResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_positions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });

          if (!createPositionResponse.ok) {
            throw new Error(`Erreur Supabase: ${createPositionResponse.status}`);
          }

          const newPosition = await createPositionResponse.json();
          return NextResponse.json({ data: newPosition });

        case 'read':
          let positionUrl = `${supabaseUrl}/rest/v1/chauffeur_positions?select=*`;
          
          if (params?.chauffeur_id) {
            positionUrl += `&chauffeur_id=eq.${params.chauffeur_id}`;
          }
          if (params?.limit) {
            positionUrl += `&limit=${params.limit}`;
          }
          positionUrl += '&order=timestamp.desc';

          const readPositionResponse = await fetch(positionUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!readPositionResponse.ok) {
            throw new Error(`Erreur Supabase: ${readPositionResponse.status}`);
          }

          const positions = await readPositionResponse.json();
          return NextResponse.json({ data: positions });
      }
    }

    console.error('❌ Resource ou action non supportée:', {
      resource,
      action,
      availableResources: ['livraisons', 'chauffeurs', 'commandes', 'orders', 'chauffeur_notifications', 'chauffeur_positions']
    });
    
    return NextResponse.json({ 
      success: false, 
      error: `Resource ou action non supportée: ${resource}/${action}`,
      availableResources: ['livraisons', 'chauffeurs', 'commandes', 'orders', 'chauffeur_notifications', 'chauffeur_positions']
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
