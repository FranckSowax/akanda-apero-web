import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, chauffeur_id, commande_id, message } = body;

    // Créer une notification via MCP API
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/mcp/supabase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        resource: 'chauffeur_notifications',
        data: {
          type,
          chauffeur_id,
          livraison_id: commande_id,
          order_id: commande_id,
          titre: 'Nouvelle commande disponible',
          message,
          read: false
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error('Erreur lors de la création de la notification');
    }

    const result = await mcpResponse.json();

    return NextResponse.json({ 
      success: true, 
      notification: result.data 
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chauffeur_id = searchParams.get('chauffeur_id');

    if (!chauffeur_id) {
      return NextResponse.json(
        { error: 'chauffeur_id requis' },
        { status: 400 }
      );
    }

    // Récupérer les notifications via MCP API
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/mcp/supabase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'read',
        resource: 'chauffeur_notifications',
        params: {
          chauffeur_id,
          order: 'created_at.desc'
        }
      })
    });

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('❌ Erreur MCP notifications:', mcpResponse.status, errorText);
      throw new Error(`Erreur MCP: ${mcpResponse.status} - ${errorText}`);
    }

    const result = await mcpResponse.json();

    return NextResponse.json({ 
      notifications: result.data || [] 
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}
