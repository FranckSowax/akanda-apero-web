/**
 * API Routes pour contrôler le service de monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderStatusMonitor } from '@/services/order-status-monitor';

/**
 * POST /api/whatsapp/monitor/start
 * Démarre le service de monitoring
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await context.params;

    switch (action) {
      case 'start':
        orderStatusMonitor.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Monitoring démarré' 
        });

      case 'stop':
        orderStatusMonitor.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Monitoring arrêté' 
        });

      default:
        return NextResponse.json(
          { error: 'Action invalide' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Monitor control error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/monitor/status
 * Récupère le statut du monitoring
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await context.params;

    if (action === 'status') {
      // Pour l'instant, on utilise une propriété simple
      // Dans une vraie app, on pourrait stocker ça dans Redis ou la DB
      const isRunning = (orderStatusMonitor as any).isRunning || false;
      
      const stats = await orderStatusMonitor.getStats();
      
      return NextResponse.json({
        isRunning,
        stats
      });
    }

    return NextResponse.json(
      { error: 'Action invalide' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Monitor status error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
