import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test de connexion basique
    const connectionTest = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });
    
    if (connectionTest.error) {
      return NextResponse.json(
        { 
          error: 'Erreur de connexion à la base de données',
          details: connectionTest.error.message 
        },
        { status: 500 }
      );
    }

    // Vérification des tables principales
    const tables = ['customers', 'orders', 'order_items', 'products', 'categories'];
    const tableChecks = [];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tableChecks.push({
          table,
          exists: !error,
          count: count || 0,
          error: error?.message || null
        });
      } catch (err) {
        tableChecks.push({
          table,
          exists: false,
          count: 0,
          error: `Erreur lors de la vérification: ${err}`
        });
      }
    }

    // Vérification des types ENUM
    const { data: enumTypes, error: enumError } = await supabase
      .rpc('get_enum_types')
      .select();

    // Test des statuts de commande
    let statusTest = null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .limit(1);
      
      statusTest = {
        success: !error,
        error: error?.message || null,
        sample_status: data?.[0]?.status || null
      };
    } catch (err) {
      statusTest = {
        success: false,
        error: `Erreur test statuts: ${err}`,
        sample_status: null
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      connection: {
        url: supabaseUrl,
        connected: true,
        timestamp: new Date().toISOString()
      },
      tables: tableChecks,
      enum_types: {
        available: !enumError,
        error: enumError?.message || null,
        data: enumTypes || []
      },
      status_test: statusTest,
      summary: {
        total_tables: tables.length,
        existing_tables: tableChecks.filter(t => t.exists).length,
        total_records: tableChecks.reduce((sum, t) => sum + (t.count || 0), 0)
      }
    });

  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du test de connexion',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false
      },
      { status: 500 }
    );
  }
}
