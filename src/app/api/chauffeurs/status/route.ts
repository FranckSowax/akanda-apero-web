import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chauffeur_id, disponible } = body;

    if (!chauffeur_id || typeof disponible !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Paramètres manquants' }, { status: 400 });
    }

    // Mettre à jour le statut de disponibilité du chauffeur
    const response = await fetch(`${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeur_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        disponible,
        derniere_activite: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Erreur mise à jour statut' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour: ${disponible ? 'disponible' : 'non disponible'}`
    });

  } catch (error) {
    console.error('Erreur API statut chauffeur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}
