import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chauffeur_id, disponible } = body;

    console.log('🔄 Mise à jour statut chauffeur:', { chauffeur_id, disponible });
    console.log('🔧 Variables d\'environnement:', { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY 
    });

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json({ success: false, message: 'Configuration serveur manquante' }, { status: 500 });
    }

    if (!chauffeur_id || typeof disponible !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Paramètres manquants' }, { status: 400 });
    }

    // Validation UUID pour chauffeur_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chauffeur_id)) {
      console.error('❌ ID chauffeur invalide (pas un UUID):', chauffeur_id);
      return NextResponse.json({ 
        success: false, 
        message: 'ID chauffeur invalide' 
      }, { status: 400 });
    }

    // Mettre à jour le statut de disponibilité du chauffeur
    const response = await fetch(`${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeur_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        disponible,
        statut: disponible ? 'en_ligne' : 'hors_ligne',
        derniere_activite: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Supabase:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeur_id}`
      });
      return NextResponse.json({ 
        success: false, 
        message: 'Erreur mise à jour statut',
        details: `Supabase ${response.status}: ${errorText}`
      }, { status: 500 });
    }

    let result;
    try {
      const responseText = await response.text();
      console.log('📄 Réponse Supabase brute:', responseText);
      
      if (responseText.trim() === '') {
        console.log('✅ Mise à jour réussie (réponse vide de Supabase)');
        result = [];
      } else {
        result = JSON.parse(responseText);
        console.log('✅ Statut chauffeur mis à jour:', result);
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.log('✅ Mise à jour probablement réussie malgré l\'erreur de parsing');
      result = [];
    }

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour: ${disponible ? 'disponible' : 'non disponible'}`
    });

  } catch (error) {
    console.error('❌ Erreur API statut chauffeur:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
