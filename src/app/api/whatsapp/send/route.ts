import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Crée une instance Supabase avec la clé service
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

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
 * Récupère le template de message depuis la base de données
 */
async function getMessageTemplate(status: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('message')
      .eq('status', status)
      .single();
    
    if (error) {
      console.error('Erreur récupération template:', error);
      return null;
    }
    
    return data?.message || null;
  } catch (error) {
    console.error('Erreur récupération template:', error);
    return null;
  }
}

/**
 * Remplace les variables dans le template de message
 */
function replaceVariables(template: string, variables: Record<string, string>): string {
  let message = template;
  
  // Remplacer toutes les variables {variableName}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    message = message.replace(regex, value || '');
  });
  
  // Remplacer les \n par de vrais retours à la ligne
  message = message.replace(/\\n/g, '\n');
  
  return message;
}

/**
 * Génère le message WhatsApp selon le statut de la commande
 */
async function generateMessage(status: string, customerName: string, orderNumber: string, totalAmount?: number, deliveryDate?: string, deliveryTime?: string): Promise<string> {
  // Essayer de récupérer le template depuis la base de données
  const template = await getMessageTemplate(status);
  
  if (template) {
    // Préparer les variables pour le remplacement
    const variables: Record<string, string> = {
      customerName: customerName || 'Client',
      orderNumber: orderNumber || '',
      status: status || '',
      totalAmount: totalAmount ? `${totalAmount.toLocaleString()} FCFA` : '',
      deliveryDate: deliveryDate || '',
      deliveryTime: deliveryTime || ''
    };
    
    return replaceVariables(template, variables);
  }
  
  // Fallback vers les messages par défaut si pas de template en base
  const formattedAmount = totalAmount ? `${totalAmount.toLocaleString()} FCFA` : '';
  const deliveryInfo = deliveryDate && deliveryTime 
    ? `\n\n📅 Livraison prévue : ${deliveryDate} à ${deliveryTime}`
    : deliveryDate 
    ? `\n\n📅 Livraison prévue : ${deliveryDate}`
    : '';

  const messages: Record<string, string> = {
    'En attente': `🎉 Bonjour ${customerName},\n\nVotre commande #${orderNumber} a bien été reçue chez Akanda Apéro !\n\nMontant : ${formattedAmount}${deliveryInfo}\n\nNous vous tiendrons informé(e) de l'avancement de votre commande.\n\nMerci pour votre confiance ! 🙏`,
    'Confirmée': `✅ Bonjour ${customerName},\n\nVotre commande #${orderNumber} est confirmée !\n\nMontant : ${formattedAmount}${deliveryInfo}\n\nNous commençons la préparation de vos produits.\n\nÀ très bientôt ! 🍷`,
    'En préparation': `🍷 Bonjour ${customerName},\n\nVotre commande #${orderNumber} est maintenant en préparation !\n\nNos équipes préparent soigneusement vos produits. Vous recevrez une notification dès qu'elle sera prête.${deliveryInfo}\n\nMerci pour votre patience ! 🙏`,
    'Prête': `✅ Excellente nouvelle ${customerName} !\n\nVotre commande #${orderNumber} est prête !\n\n📍 Vous pouvez venir la récupérer ou attendre la livraison selon votre choix.${deliveryInfo}\n\nÀ très bientôt ! 🚀`,
    'En livraison': `🚚 ${customerName}, votre commande est en route !\n\nLe livreur est parti avec votre commande #${orderNumber} et arrivera bientôt à votre adresse.\n\n📱 Il vous contactera quelques minutes avant son arrivée.\n\nMerci de rester disponible ! ⏰`,
    'Livrée': `✅ ${customerName}, votre commande #${orderNumber} a été livrée avec succès !\n\n🙏 Merci pour votre confiance et à très bientôt chez Akanda Apéro !\n\nN'hésitez pas à nous faire part de vos commentaires. 💬`,
    'Annulée': `❌ Bonjour ${customerName},\n\nVotre commande #${orderNumber} a été annulée.\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nÀ bientôt chez Akanda Apéro ! 🍷`
  };
  
  return messages[status] || `📱 ${customerName}, votre commande #${orderNumber} a été mise à jour.\n\nStatut : ${status}\n\nMerci de votre confiance ! 🙏`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phone, status, orderNumber, customerName, totalAmount, deliveryDate, deliveryTime, message: customMessage, notificationId } = body;
    
    // Validation des paramètres requis
    if (!phone || (!status && !customMessage)) {
      return NextResponse.json(
        { error: 'Paramètres manquants : phone et (status ou message) sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que les variables d'environnement sont configurées
    const whapiToken = process.env.WHAPI_TOKEN || process.env.NEXT_PUBLIC_WHAPI_TOKEN;
    const whapiUrl = process.env.WHAPI_BASE_URL || process.env.NEXT_PUBLIC_WHAPI_BASE_URL || 'https://gate.whapi.cloud';
    
    if (!whapiToken) {
      console.error('❌ Token Whapi non configuré');
      return NextResponse.json(
        { 
          error: 'Token Whapi non configuré',
          debug: {
            hasWhapiToken: !!process.env.WHAPI_TOKEN,
            hasPublicWhapiToken: !!process.env.NEXT_PUBLIC_WHAPI_TOKEN,
            whapiUrl
          }
        },
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
    const message = customMessage || await generateMessage(
      status, 
      customerName || 'Client',
      orderNumber || 'TEST', 
      totalAmount,
      deliveryDate,
      deliveryTime
    );
    
    // Créer l'enregistrement de notification dans la base de données
    let currentNotificationId = notificationId;
    if (orderId && !currentNotificationId) {
      try {
        const supabase = getSupabaseServiceClient();
        const { data: notification, error } = await supabase
          .from('whatsapp_notifications')
          .insert({
            order_id: orderId,
            phone_number: formattedPhone,
            message_content: message,
            message_status: 'pending',
            order_status: status,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (error) {
          console.error('❌ Erreur création notification:', error);
        } else {
          currentNotificationId = notification.id;
          console.log('✅ Notification créée avec ID:', currentNotificationId);
        }
      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError);
      }
    }
    
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
      console.error('❌ Erreur API Whapi:', {
        status: response.status,
        statusText: response.statusText,
        responseData,
        requestData: {
          to: formattedPhone,
          body: message,
          typing_time: 3
        },
        whapiUrl,
        hasToken: !!whapiToken
      });
      
      // Enregistrer l'échec dans la base de données
      if (orderId && currentNotificationId) {
        try {
          const supabase = getSupabaseServiceClient();
          await supabase
            .from('whatsapp_notifications')
            .update({ message_status: 'failed', error_message: JSON.stringify(responseData) })
            .eq('id', currentNotificationId);
        } catch (dbError) {
          console.error('❌ Erreur sauvegarde échec:', dbError);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'envoi du message', 
          details: responseData,
          debug: {
            status: response.status,
            statusText: response.statusText,
            whapiUrl,
            hasToken: !!whapiToken,
            phone: formattedPhone
          }
        },
        { status: response.status }
      );
    }
    
    console.log('✅ Message WhatsApp envoyé:', responseData);
    
    // Enregistrer le succès dans la base de données
    if (orderId && currentNotificationId) {
      const supabase = getSupabaseServiceClient();
      await supabase
        .from('whatsapp_notifications')
        .update({ message_status: 'sent' })
        .eq('id', currentNotificationId);
      
      // Enregistrer le changement de statut
      await supabase
        .from('order_status_changes')
        .insert({
          order_id: orderId,
          from_status: null, // On n'a pas l'ancien statut ici
          to_status: status,
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
    
  } catch (error: any) {
    console.error('❌ Erreur générale WhatsApp:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de l\'envoi du message',
        debug: {
          errorMessage: error.message,
          errorName: error.name,
          hasWhapiToken: !!(process.env.WHAPI_TOKEN || process.env.NEXT_PUBLIC_WHAPI_TOKEN),
          whapiUrl: process.env.WHAPI_BASE_URL || process.env.NEXT_PUBLIC_WHAPI_BASE_URL || 'https://gate.whapi.cloud'
        }
      },
      { status: 500 }
    );
  }
}

// Route GET pour tester la configuration
export async function GET() {
  const isConfigured = !!(process.env.WHAPI_TOKEN || process.env.NEXT_PUBLIC_WHAPI_TOKEN);
  
  return NextResponse.json({
    configured: isConfigured,
    baseUrl: process.env.WHAPI_BASE_URL || process.env.NEXT_PUBLIC_WHAPI_BASE_URL || 'https://gate.whapi.cloud'
  });
}
