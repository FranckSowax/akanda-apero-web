import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json({ success: false, message: 'ID client requis' }, { status: 400 });
    }

    console.log('👤 Récupération infos client:', customerId);

    // Récupérer les informations du client
    const customerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerId}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!customerResponse.ok) {
      console.error('❌ Erreur récupération client:', customerResponse.status);
      return NextResponse.json({ success: false, message: 'Erreur récupération client' }, { status: 500 });
    }

    const customers = await customerResponse.json();
    const customer = customers[0];

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Client non trouvé' }, { status: 404 });
    }

    console.log('👤 Client trouvé:', { nom: customer.nom, prenom: customer.prenom });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        nom: customer.nom,
        prenom: customer.prenom,
        full_name: `${customer.prenom || ''} ${customer.nom || ''}`.trim(),
        telephone: customer.telephone,
        email: customer.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur API customer-info:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}
