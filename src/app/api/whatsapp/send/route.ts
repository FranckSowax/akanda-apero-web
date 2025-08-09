import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec la clé service pour les permissions complètes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Formate un numéro de téléphone pour l'API Whapi.Cloud
 * L'API n'accepte pas le symbole + au début
 */
function formatPhoneNumber(phone: string): string {
  // Supprimer tous les caractères non numériques
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // Si le numéro commence par 0, supposer qu'il s'agit d'un numéro local
  if (cleaned.startsWith('0')) {
    // Par défaut Suisse (41) pour ce projet
    cleaned = '41' + cleaned.substring(1);
  }
  
  // Si le numéro est court (moins de 11 chiffres), probablement local
  if (cleaned.length <= 10 && !cleaned.startsWith('41') && !cleaned.startsWith('33') && !cleaned.startsWith('241')) {
    cleaned = '41' + cleaned; // Par défaut Suisse
  }
  
  return cleaned;
}

/**
 * Génère le message selon le statut de la commande
 */
function getStatusMessage(status: string, orderNumber: string, customerName: string, totalAmount?: number, deliveryDate?: string, deliveryTime?: string): string {
  const formattedAmount = totalAmount ? `CHF ${totalAmount.toFixed(2)}` : '';
  const deliveryInfo = deliveryDate && deliveryTime ? `\n📅 Livraison prévue : ${deliveryDate} à ${deliveryTime}` : '';
  
  const messages: Record<string, string> = {
    'pending': `🎉 Bonjour ${customerName},\n\nVotre commande #${orderNumber} a bien été reçue chez Akanda Apéro !\n\nMontant : ${formattedAmount}${deliveryInfo}\n\nNous vous tiendrons informé(e) de l'avancement de votre commande.\n\nMerci pour votre confiance ! 🙏`,
    
    'confirmed': `✅ Bonjour ${customerName},\n\nVotre commande #${orderNumber} est confirmée !\n\nMontant : ${formattedAmount}${deliveryInfo}\n\nNous commençons la préparation de vos produits.\n\nÀ très bientôt ! 🍷`,
    
    'preparing': `🍷 Bonjour ${customerName},\n\nVotre commande #${orderNumber} est maintenant en préparation !\n\nNos équipes préparent soigneusement vos produits. Vous recevrez une notification dès qu'elle sera prête.${deliveryInfo}\n\nMerci pour votre patience ! 🙏`,
    
    'ready': `✅ Excellente nouvelle ${customerName} !\n\nVotre commande #${orderNumber} est prête !\n\n📍 Vous pouvez venir la récupérer ou attendre la livraison selon votre choix.${deliveryInfo}\n\nÀ très bientôt ! 🚀`,
    
    'delivering': `🚚 ${customerName}, votre commande est en route !\n\nLe livreur est parti avec votre commande #${orderNumber} et arrivera bientôt à votre adresse.\n\n📱 Il vous contactera quelques minutes avant son arrivée.\n\nMerci de rester disponible ! ⏰`,
    
    'delivered': `✅ ${customerName}, votre commande #${orderNumber} a été livrée avec succès !\n\n🙏 Merci pour votre confiance et à très bientôt chez Akanda Apéro !\n\nN'hésitez pas à nous faire part de vos commentaires. 💬`,
    
    'cancelled': `❌ Bonjour ${customerName},\n\nVotre commande #${orderNumber} a été annulée.\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nÀ bientôt chez Akanda Apéro ! 🍷`
  };
  
  return messages[status] || `📱 ${customerName}, votre commande #${orderNumber} a été mise à jour.\n\nStatut : ${status}\n\nMerci de votre confiance ! 🙏`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phone, status, orderNumber, customerName, totalAmount, deliveryDate, deliveryTime, message: customMessage } = body;
    
    // Validation des paramètres requis
    if (!phone || (!status && !customMessage)) {
      return NextResponse.json(
        { error: 'Paramètres manquants : phone et (status ou message) sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que les variables d'environnement sont configurées
    const whapiToken = process.env.WHAPI_TOKEN;
    const whapiUrl = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud';
    
    if (!whapiToken) {
      console.error('❌ Token Whapi non configuré');
      return NextResponse.json(
        { error: 'Service WhatsApp non configuré' },
        { status: 500 }
      );
    }
    
    // Formater le numéro de téléphone
    const formattedPhone = formatPhoneNumber(phone);
    console.log('📱 Envoi WhatsApp:', { 
      originalPhone: phone, 
      formattedPhone, 
      status, 
      orderNumber 
    });
    
    // Utiliser le message personnalisé ou générer selon le statut
    const message = customMessage || getStatusMessage(
      status, 
      orderNumber || 'TEST', 
      customerName || 'Client', 
      totalAmount,
      deliveryDate,
      deliveryTime
    );
    
    // Envoyer le message via l'API Whapi
    const response = await fetch(`${whapiUrl}/messages/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whapiToken}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        body: message,
        typing_time: 3
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API Whapi:', responseData);
      
      // Enregistrer l'échec dans la base de données
      if (orderId) {
        await supabase
          .from('whatsapp_notifications')
          .insert({
            order_id: orderId,
            phone_number: formattedPhone,
            message: message,
            status: 'failed',
            error_message: JSON.stringify(responseData),
            sent_at: new Date().toISOString()
          });
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message', details: responseData },
        { status: response.status }
      );
    }
    
    console.log('✅ Message WhatsApp envoyé:', responseData);
    
    // Enregistrer le succès dans la base de données
    if (orderId) {
      await supabase
        .from('whatsapp_notifications')
        .insert({
          order_id: orderId,
          phone_number: formattedPhone,
          message: message,
          status: 'sent',
          message_id: responseData.sent || responseData.id,
          sent_at: new Date().toISOString()
        });
      
      // Enregistrer le changement de statut
      await supabase
        .from('order_status_changes')
        .insert({
          order_id: orderId,
          old_status: null, // On n'a pas l'ancien statut ici
          new_status: status,
          notification_sent: true,
          changed_at: new Date().toISOString()
        });
    }
    
    return NextResponse.json({
      success: true,
      messageId: responseData.sent || responseData.id,
      phone: formattedPhone,
      status: 'sent'
    });
    
  } catch (error) {
    console.error('❌ Erreur envoi WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

// Route GET pour tester la configuration
export async function GET() {
  const isConfigured = !!process.env.WHAPI_TOKEN;
  
  return NextResponse.json({
    configured: isConfigured,
    service: 'Whapi.Cloud',
    baseUrl: process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'
  });
}
