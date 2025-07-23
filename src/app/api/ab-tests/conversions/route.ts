/**
 * 🏆 API Routes Conversions A/B Testing - Akanda Apéro
 * 
 * Endpoints pour le tracking des conversions des tests A/B
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const userId = searchParams.get('userId');
    const metric = searchParams.get('metric');

    let query = supabase
      .from('ab_test_conversions')
      .select(`
        *,
        test:ab_tests(*),
        assignment:ab_test_assignments(*)
      `);

    if (testId) {
      query = query.eq('test_id', testId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (metric) {
      query = query.eq('metric', metric);
    }

    const { data: conversions, error } = await query;

    if (error) {
      console.error('Erreur récupération conversions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(conversions);
  } catch (error) {
    console.error('Erreur API conversions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, testId, variantId, metric, value } = await request.json();

    // Vérifier que l'utilisateur est bien assigné à ce test
    const { data: assignment } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .eq('variant_id', variantId)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: 'Utilisateur non assigné à ce test' },
        { status: 400 }
      );
    }

    // Enregistrer la conversion
    const { data: conversion, error } = await supabase
      .from('ab_test_conversions')
      .insert({
        user_id: userId,
        test_id: testId,
        variant_id: variantId,
        metric,
        value: value || 1,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création conversion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(conversion, { status: 201 });
  } catch (error) {
    console.error('Erreur API création conversion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
