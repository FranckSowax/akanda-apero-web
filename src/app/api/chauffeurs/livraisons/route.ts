import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeurId = searchParams.get('chauffeur_id');

    if (!chauffeurId) {
      return NextResponse.json({ success: false, message: 'ID chauffeur requis' }, { status: 400 });
    }

    // Récupérer les livraisons assignées au chauffeur
    const response = await fetch(`${SUPABASE_URL}/rest/v1/livraisons?chauffeur_id=eq.${chauffeurId}&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Erreur récupération livraisons' }, { status: 500 });
    }

    const livraisons = await response.json();

    return NextResponse.json({
      success: true,
      livraisons
    });

  } catch (error) {
    console.error('Erreur API livraisons chauffeurs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { livraison_id, action, statut, notes } = body;

    if (!livraison_id || !action) {
      return NextResponse.json({ success: false, message: 'Paramètres manquants' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'accepter':
        updateData = {
          statut: 'acceptee',
          acceptee_at: new Date().toISOString()
        };
        break;
      case 'commencer':
        updateData = {
          statut: 'en_cours',
          commencee_at: new Date().toISOString()
        };
        break;
      case 'livrer':
        updateData = {
          statut: 'livree',
          livree_at: new Date().toISOString()
        };
        break;
      case 'annuler':
        updateData = {
          statut: 'annulee',
          annulee_at: new Date().toISOString(),
          notes: notes || 'Annulée par le chauffeur'
        };
        break;
      default:
        if (statut) {
          updateData.statut = statut;
        }
        if (notes) {
          updateData.notes = notes;
        }
    }

    // Mettre à jour la livraison
    const response = await fetch(`${SUPABASE_URL}/rest/v1/livraisons?id=eq.${livraison_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Erreur mise à jour livraison' }, { status: 500 });
    }

    // Si la livraison est acceptée, mettre à jour le statut du chauffeur
    if (action === 'accepter') {
      const chauffeurId = body.chauffeur_id;
      if (chauffeurId) {
        await fetch(`${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeurId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            disponible: false
          })
        });
      }
    }

    // Si la livraison est terminée ou annulée, remettre le chauffeur disponible
    if (action === 'livrer' || action === 'annuler') {
      const chauffeurId = body.chauffeur_id;
      if (chauffeurId) {
        await fetch(`${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeurId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            disponible: true
          })
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Livraison mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour livraison:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}
