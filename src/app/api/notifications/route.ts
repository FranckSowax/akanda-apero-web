import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, chauffeur_id, commande_id, message } = body;

    const notificationData = {
      type,
      chauffeur_id,
      livraison_id: commande_id,
      order_id: commande_id,
      titre: 'Nouvelle commande disponible',
      message,
      read: false
    };

    let result;

    // Essayer d'abord l'API MCP
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const mcpResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          resource: 'chauffeur_notifications',
          data: notificationData
        })
      });

      if (mcpResponse.ok) {
        const mcpResult = await mcpResponse.json();
        result = mcpResult.data;
        console.log('✅ Notification créée via MCP API');
      } else {
        throw new Error(`MCP API failed: ${mcpResponse.status}`);
      }
    } catch (mcpError) {
      console.warn('⚠️ MCP API failed, trying direct Supabase:', mcpError);
      
      // Fallback vers Supabase direct
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(notificationData)
      });

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error('❌ Erreur Supabase direct:', supabaseResponse.status, errorText);
        throw new Error(`Erreur Supabase: ${supabaseResponse.status} - ${errorText}`);
      }

      result = await supabaseResponse.json();
      console.log('✅ Notification créée via Supabase direct');
    }

    return NextResponse.json({ 
      success: true, 
      notification: result 
    });

  } catch (error) {
    console.error('❌ Erreur API notifications:', error);
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

    let notifications = [];

    // Essayer d'abord l'API MCP
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const mcpResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
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

      if (mcpResponse.ok) {
        const mcpResult = await mcpResponse.json();
        notifications = mcpResult.data || [];
        console.log('✅ Notifications récupérées via MCP API:', notifications.length);
      } else {
        throw new Error(`MCP API failed: ${mcpResponse.status}`);
      }
    } catch (mcpError) {
      console.warn('⚠️ MCP API failed, trying direct Supabase:', mcpError);
      
      // Fallback vers Supabase direct
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/chauffeur_notifications?chauffeur_id=eq.${chauffeur_id}&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error('❌ Erreur Supabase direct:', supabaseResponse.status, errorText);
        throw new Error(`Erreur Supabase: ${supabaseResponse.status} - ${errorText}`);
      }

      notifications = await supabaseResponse.json();
      console.log('✅ Notifications récupérées via Supabase direct:', notifications.length);
    }

    return NextResponse.json({ 
      notifications: notifications || [] 
    });

  } catch (error) {
    console.error('❌ Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}
