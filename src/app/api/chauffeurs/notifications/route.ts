import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST - Envoyer notification à un chauffeur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chauffeur_id, type, message, delivery_id, priority = 'normal' } = body;

    if (!chauffeur_id || !type || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'chauffeur_id, type et message sont requis' 
      }, { status: 400 });
    }

    console.log('🔔 Envoi notification chauffeur:', chauffeur_id, type);

    // Récupérer les infos du chauffeur
    const chauffeurResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeurs?id=eq.${chauffeur_id}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!chauffeurResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chauffeur non trouvé' 
      }, { status: 404 });
    }

    const chauffeurs = await chauffeurResponse.json();
    if (chauffeurs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chauffeur non trouvé' 
      }, { status: 404 });
    }

    const chauffeur = chauffeurs[0];

    // Enregistrer la notification
    const notificationData = {
      chauffeur_id,
      type,
      message,
      delivery_id: delivery_id || null,
      priority,
      status: 'sent',
      sent_at: new Date().toISOString()
    };

    const notificationResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_notifications`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(notificationData)
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error('❌ Erreur sauvegarde notification:', errorText);
    }

    // Envoyer via WhatsApp si disponible
    if (chauffeur.telephone) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: chauffeur.telephone,
            template: 'driver_notification',
            variables: {
              driver_name: chauffeur.nom,
              message: message,
              type: type,
              priority: priority
            }
          })
        });

        if (whatsappResponse.ok) {
          console.log('✅ Notification WhatsApp envoyée');
        } else {
          console.error('❌ Erreur WhatsApp:', await whatsappResponse.text());
        }
      } catch (whatsappError) {
        console.error('❌ Erreur WhatsApp:', whatsappError);
      }
    }

    // Envoyer notification push si disponible
    // Ici on pourrait intégrer Firebase Cloud Messaging ou autre service push

    return NextResponse.json({ 
      success: true, 
      message: 'Notification envoyée avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur envoi notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// GET - Récupérer les notifications d'un chauffeur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeurId = searchParams.get('chauffeur_id');
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status');

    if (!chauffeurId) {
      return NextResponse.json({ 
        success: false, 
        error: 'chauffeur_id requis' 
      }, { status: 400 });
    }

    let url = `${supabaseUrl}/rest/v1/chauffeur_notifications?chauffeur_id=eq.${chauffeurId}&order=sent_at.desc&limit=${limit}`;
    
    if (status) {
      url += `&status=eq.${status}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur récupération notifications:', response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur API: ${response.status}` 
      }, { status: response.status });
    }

    const notifications = await response.json();
    console.log('✅ Notifications récupérées:', notifications.length);

    return NextResponse.json({ 
      success: true, 
      data: notifications 
    });

  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
