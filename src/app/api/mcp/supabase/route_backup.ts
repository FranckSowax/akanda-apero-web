import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resource, params, data } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }

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
          chauffeurUrl += '&order=created_at.desc';

          const chauffeurResponse = await fetch(chauffeurUrl, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (!chauffeurResponse.ok) {
            throw new Error(`Erreur Supabase: ${chauffeurResponse.status}`);
          }

          const chauffeurs = await chauffeurResponse.json();
          return NextResponse.json({ data: chauffeurs });

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
            throw new Error(`Erreur Supabase: ${createChauffeurResponse.status}`);
          }

          const newChauffeur = await createChauffeurResponse.json();
          return NextResponse.json({ data: newChauffeur });
      }
    }

    // Gestion des commandes
    if (resource === 'commandes') {
      switch (action) {
        case 'update':
          const updateCommandeUrl = `${supabaseUrl}/rest/v1/commandes?id=eq.${params.id}`;
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

          if (!updateCommandeResponse.ok) {
            throw new Error(`Erreur Supabase: ${updateCommandeResponse.status}`);
          }

          const updatedCommande = await updateCommandeResponse.json();
          
          // Déclencher webhook pour notifications si statut change
          if (data.statut === 'en préparation') {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/orders/webhook`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  order_id: params.id,
                  status: data.statut,
                  previous_status: 'pending'
                })
              });
            } catch (webhookError) {
              console.error('Erreur webhook:', webhookError);
            }
          }
          
          return NextResponse.json({ data: updatedCommande });
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

    return NextResponse.json({ 
      success: false, 
      error: `Resource ou action non supportée: ${resource}/${action}` 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Erreur MCP API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
