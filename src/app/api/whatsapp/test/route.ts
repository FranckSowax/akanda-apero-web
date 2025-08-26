/**
 * API Route pour tester l'envoi de messages WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/whatsapp/test
 * Envoie un message test WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Utiliser l'API /api/whatsapp/send pour envoyer le message
    const response = await fetch(`${request.nextUrl.origin}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: null, // Pas d'ordre pour un test
        phone: phone,
        status: 'test',
        orderNumber: 'TEST',
        customerName: 'Test',
        message: message || `🧪 Ceci est un message test d'Akanda Apéro.\n\n✅ Votre système WhatsApp fonctionne correctement !\n\n📱 Numéro : ${phone}`
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ 
        sent: true, 
        messageId: data.messageId,
        phone: data.phone 
      });
    } else {
      return NextResponse.json(
        { sent: false, error: data.error || 'Erreur lors de l\'envoi' },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Test message error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
