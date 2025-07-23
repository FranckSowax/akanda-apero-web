/**
 * 🎯 API Routes Assignations A/B Testing - Akanda Apéro
 * 
 * Endpoints pour la gestion des assignations utilisateurs aux tests A/B
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const testId = searchParams.get('testId');

    let query = supabase
      .from('ab_test_assignments')
      .select(`
        *,
        test:ab_tests(*),
        variant:ab_test_variants(*)
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (testId) {
      query = query.eq('test_id', testId);
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Erreur récupération assignations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Erreur API assignations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, testId, variantId } = await request.json();

    // Vérifier si l'assignation existe déjà
    const { data: existingAssignment } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .single();

    if (existingAssignment) {
      return NextResponse.json(existingAssignment);
    }

    // Créer nouvelle assignation
    const { data: assignment, error } = await supabase
      .from('ab_test_assignments')
      .insert({
        user_id: userId,
        test_id: testId,
        variant_id: variantId,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création assignation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Erreur API création assignation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
