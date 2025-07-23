/**
 * 🧪 API Routes A/B Testing - Akanda Apéro
 * 
 * Endpoints pour la gestion des tests A/B
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(*),
        assignments:ab_test_assignments(count),
        conversions:ab_test_conversions(count)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: tests, error } = await query;

    if (error) {
      console.error('Erreur récupération tests A/B:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si userId fourni, inclure les assignations de l'utilisateur
    if (userId) {
      const { data: userAssignments } = await supabase
        .from('ab_test_assignments')
        .select('test_id, variant_id')
        .eq('user_id', userId);

      const testsWithAssignments = tests?.map(test => ({
        ...test,
        userVariant: userAssignments?.find(a => a.test_id === test.id)?.variant_id || null
      }));

      return NextResponse.json(testsWithAssignments);
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Erreur API tests A/B:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const testData = await request.json();

    // Créer le test principal
    const { data: test, error: testError } = await supabase
      .from('ab_tests')
      .insert({
        name: testData.name,
        description: testData.description,
        status: testData.status || 'draft',
        start_date: testData.startDate,
        end_date: testData.endDate,
        target_audience: testData.targetAudience,
        metrics: testData.metrics,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (testError) {
      console.error('Erreur création test:', testError);
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    // Créer les variantes
    if (testData.variants && testData.variants.length > 0) {
      const variants = testData.variants.map((variant: any) => ({
        test_id: test.id,
        variant_id: variant.id,
        name: variant.name,
        weight: variant.weight,
        config: variant.config,
        is_control: variant.isControl
      }));

      const { error: variantsError } = await supabase
        .from('ab_test_variants')
        .insert(variants);

      if (variantsError) {
        console.error('Erreur création variantes:', variantsError);
        // Supprimer le test créé en cas d'erreur
        await supabase.from('ab_tests').delete().eq('id', test.id);
        return NextResponse.json({ error: variantsError.message }, { status: 500 });
      }
    }

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Erreur API création test:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
