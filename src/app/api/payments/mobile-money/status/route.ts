import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments/mobile-money/status?reference=REF
// Vérifie le statut d'un paiement Mobile Money via l'API PromoGabon
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Paramètre "reference" requis' },
        { status: 400 }
      );
    }

    const base = process.env.PROMOGABON_BASE_URL || 'https://dev.promogabon.ga/api/';
    const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base;
    const url = `${baseTrimmed}/payment_status_check.php?reference=${encodeURIComponent(reference)}&t=${Date.now()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      data = { raw: text };
    }

    return NextResponse.json(
      {
        success: response.ok && data?.success !== false,
        http_code: response.status,
        response: data,
        reference,
      },
      { status: response.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erreur serveur lors de la vérification du paiement',
      },
      { status: 500 }
    );
  }
}
