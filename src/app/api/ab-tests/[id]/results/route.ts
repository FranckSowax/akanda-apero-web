/**
 * 📊 API Routes Résultats A/B Testing - Akanda Apéro
 * 
 * Endpoints pour calculer et récupérer les résultats des tests A/B
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const testId = resolvedParams.id;

    // Récupérer le test et ses variantes
    const { data: test, error: testError } = await supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(*)
      `)
      .eq('id', testId)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test non trouvé' }, { status: 404 });
    }

    // Calculer les résultats pour chaque variante
    const results: any = {};

    for (const variant of test.variants) {
      // Compter les participants (assignations)
      const { count: participants } = await supabase
        .from('ab_test_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId)
        .eq('variant_id', variant.variant_id);

      // Compter les conversions pour la métrique principale
      const { count: conversions } = await supabase
        .from('ab_test_conversions')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId)
        .eq('variant_id', variant.variant_id)
        .eq('metric', test.metrics.primary);

      // Calculer le taux de conversion
      const conversionRate = participants > 0 ? (conversions / participants) * 100 : 0;

      // Calculer la confiance (approximation simple)
      const confidence = participants > 30 ? Math.min(95, participants / 10) : 0;

      results[variant.variant_id] = {
        participants: participants || 0,
        conversions: conversions || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        confidence: Math.round(confidence)
      };
    }

    // Déterminer le gagnant (variante avec le meilleur taux de conversion)
    let bestVariant = null;
    let bestRate = -1;

    Object.entries(results).forEach(([variantId, data]: [string, any]) => {
      if (data.conversionRate > bestRate && data.participants > 10) {
        bestRate = data.conversionRate;
        bestVariant = variantId;
      }
    });

    // Marquer le gagnant
    if (bestVariant) {
      results[bestVariant].isWinner = true;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur API résultats test:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
