import { NextRequest, NextResponse } from 'next/server';

// POST /api/payments/mobile-money
// Initialise un paiement Mobile Money via l'API PromoGabon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reference,
      amount,
      description,
      customer,
      delivery,
      items,
      provider = 'airtel_money',
    } = body || {};

    // Validations de base
    if (!reference || typeof reference !== 'string' || reference.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Référence invalide (<= 15 caractères requise)' },
        { status: 400 }
      );
    }
    const amountInt = Number.parseInt(String(amount), 10);
    if (!amountInt || amountInt <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide (entier positif requis)' },
        { status: 400 }
      );
    }

    // Construction du form-data x-www-form-urlencoded
    const formData = new URLSearchParams();
    // Selon la documentation, utiliser 'subscription' comme source_type
    formData.append('source_type', 'subscription');
    formData.append('reference', reference);
    formData.append('amount', String(amountInt));
    formData.append('currency', 'XOF');
    formData.append('description', description || 'Commande Akanda Apéro');
    formData.append('customer', JSON.stringify(customer || {}));
    formData.append('delivery', JSON.stringify(delivery || { method: 'physical', address: 'Libreville, Gabon' }));
    formData.append('items', JSON.stringify(Array.isArray(items) ? items : []));
    formData.append('payment_method', 'mobile_money');
    formData.append('provider', provider);

    const base = process.env.PROMOGABON_BASE_URL || 'https://dev.promogabon.ga/api/';
    const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base;
    const url = `${baseTrimmed}/pvit_payment.php`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
      // 30s timeout via AbortController si besoin (optionnel)
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // si pas JSON
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
        error: error?.message || 'Erreur serveur lors de l\'initiation du paiement',
      },
      { status: 500 }
    );
  }
}
