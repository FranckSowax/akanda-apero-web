/**
 * API Route pour récupérer les statistiques WhatsApp
 */

import { NextResponse } from 'next/server';
import { whatsAppNotifier } from '@/services/whatsapp-notifier';

/**
 * GET /api/whatsapp/stats
 * Récupère les statistiques d'envoi WhatsApp
 */
export async function GET() {
  try {
    const stats = await whatsAppNotifier.getStats();
    
    if (stats) {
      return NextResponse.json(stats);
    } else {
      return NextResponse.json({
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        successRate: 0,
        queueSize: 0
      });
    }
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
