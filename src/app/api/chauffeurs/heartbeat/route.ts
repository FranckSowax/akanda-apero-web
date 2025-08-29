import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chauffeurId, statut, latitude, longitude } = body;

    console.log('💓 Heartbeat reçu:', { chauffeurId, statut, latitude, longitude });

    if (!chauffeurId) {
      return NextResponse.json({ 
        success: false, 
        error: 'chauffeurId requis' 
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

    // Mettre à jour le statut du chauffeur
    const updateData: any = {
      statut: statut || 'en_ligne',
      disponible: true,
      derniere_activite: new Date().toISOString()
    };

    // Ajouter la position GPS si fournie
    if (latitude && longitude) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    const updateUrl = `${supabaseUrl}/rest/v1/chauffeurs?id=eq.${chauffeurId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Erreur mise à jour chauffeur:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur Supabase: ${updateResponse.status}` 
      }, { status: updateResponse.status });
    }

    const updatedChauffeur = await updateResponse.json();
    console.log('✅ Heartbeat traité:', updatedChauffeur);

    return NextResponse.json({ 
      success: true, 
      data: updatedChauffeur 
    });

  } catch (error) {
    console.error('❌ Erreur heartbeat:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
