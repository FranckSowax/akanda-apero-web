import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST - Mettre à jour la position d'un chauffeur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chauffeur_id, latitude, longitude, speed, heading } = body;

    if (!chauffeur_id || !latitude || !longitude) {
      return NextResponse.json({ 
        success: false, 
        error: 'chauffeur_id, latitude et longitude sont requis' 
      }, { status: 400 });
    }

    console.log('📍 Mise à jour position chauffeur:', chauffeur_id, { latitude, longitude });

    // Mettre à jour la position du chauffeur
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeurs?id=eq.${chauffeur_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        latitude,
        longitude,
        vitesse: speed || null,
        direction: heading || null,
        derniere_activite: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Erreur mise à jour position:', updateResponse.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur mise à jour: ${updateResponse.status}` 
      }, { status: updateResponse.status });
    }

    // Enregistrer l'historique de position
    const historyResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_positions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chauffeur_id,
        latitude,
        longitude,
        vitesse: speed || null,
        direction: heading || null,
        timestamp: new Date().toISOString()
      })
    });

    if (!historyResponse.ok) {
      console.warn('⚠️ Erreur sauvegarde historique position:', await historyResponse.text());
    }

    const result = await updateResponse.json();
    console.log('✅ Position chauffeur mise à jour:', result);

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour position:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// GET - Récupérer les positions récentes des chauffeurs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeurId = searchParams.get('chauffeur_id');
    const limit = searchParams.get('limit') || '50';

    let url = `${supabaseUrl}/rest/v1/chauffeur_positions?select=*,chauffeurs(nom,telephone)&order=timestamp.desc&limit=${limit}`;
    
    if (chauffeurId) {
      url += `&chauffeur_id=eq.${chauffeurId}`;
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
      console.error('❌ Erreur récupération positions:', response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur API: ${response.status}` 
      }, { status: response.status });
    }

    const positions = await response.json();
    console.log('✅ Positions récupérées:', positions.length);

    return NextResponse.json({ 
      success: true, 
      data: positions 
    });

  } catch (error) {
    console.error('❌ Erreur récupération positions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
