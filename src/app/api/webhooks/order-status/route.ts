/**
 * Webhook API pour recevoir les notifications de changement de statut depuis Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { whatsAppNotifier, OrderData } from '@/services/whatsapp-notifier';
import crypto from 'crypto';

/**
 * Vérifie la signature du webhook Supabase
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * POST /api/webhooks/order-status
 * Reçoit les notifications de changement de statut depuis Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier la signature si le secret est configuré
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-supabase-signature');
      const payload = await request.text();
      
      if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Parser le payload après vérification
      const data = JSON.parse(payload);
      await processWebhook(data);
    } else {
      // Mode développement sans vérification de signature
      const data = await request.json();
      await processWebhook(data);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Traite les données du webhook
 */
async function processWebhook(data: any) {
  try {
    // Structure du webhook Supabase
    const { type, table, record, old_record } = data;

    // Vérifier que c'est bien un changement sur la table orders
    if (table !== 'orders' || type !== 'UPDATE') {
      return;
    }

    // Vérifier qu'il y a bien un changement de statut
    if (!old_record || record.status === old_record.status) {
      return;
    }

    console.log(`Order ${record.order_number}: status changed from ${old_record.status} to ${record.status}`);

    // Récupérer les détails complets de la commande
    const { data: orderDetails, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          email
        ),
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .eq('id', record.id)
      .single();

    if (error || !orderDetails) {
      console.error('Error fetching order details:', error);
      return;
    }

    // Vérifier qu'on a un numéro de téléphone
    if (!orderDetails.customers?.phone) {
      console.warn(`No phone number for order ${orderDetails.order_number}`);
      return;
    }

    // Préparer les données pour la notification
    const orderData: OrderData = {
      order_number: orderDetails.order_number,
      customer_name: orderDetails.customers.name || 'Client',
      customer_phone: orderDetails.customers.phone,
      total_amount: orderDetails.total_amount,
      delivery_address: orderDetails.delivery_address,
      delivery_date: orderDetails.delivery_date,
      tracking_number: orderDetails.tracking_number,
      items: orderDetails.order_items?.map((item: any) => ({
        name: item.products?.name || 'Produit',
        quantity: item.quantity
      })) || []
    };

    // Envoyer la notification WhatsApp
    const result = await whatsAppNotifier.sendStatusChangeNotification(
      orderDetails.id,
      orderData,
      record.status,
      old_record.status
    );

    if (result.sent) {
      console.log(`✅ WhatsApp notification sent for order ${orderDetails.order_number}`);
      
      // Enregistrer le changement de statut
      await supabase.from('order_status_changes').insert({
        order_id: orderDetails.id,
        from_status: old_record.status,
        to_status: record.status,
        notification_sent: true,
        changed_at: new Date().toISOString()
      });
    } else {
      console.error(`❌ Failed to send WhatsApp notification:`, result.error);
      
      // Enregistrer l'échec
      await supabase.from('order_status_changes').insert({
        order_id: orderDetails.id,
        from_status: old_record.status,
        to_status: record.status,
        notification_sent: false,
        changed_at: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
}

/**
 * GET /api/webhooks/order-status
 * Endpoint de test pour vérifier que le webhook est accessible
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Order status webhook is ready',
    timestamp: new Date().toISOString()
  });
}
