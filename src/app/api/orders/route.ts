import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError, logInfo, safeExecute } from '../../../utils/error-handler';

// Configuration Supabase - Initialisation lazy pour éviter les erreurs de build
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables d\'environnement Supabase manquantes');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Types pour les données de commande
interface OrderData {
  customerInfo: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  deliveryInfo: {
    address: string;
    city?: string; // Champ envoyé par le checkout
    district?: string;
    additionalInfo?: string;
    location: {
      lat: number;
      lng: number;
      hasLocation: boolean;
    };
    deliveryOption: string;
  };
  paymentInfo: {
    method: string;
    [key: string]: any;
  };
  items: Array<{
    id: string; // Support UUID
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
  totalAmount: number;
  subtotal: number;
  deliveryCost: number;
  discount: number;
}

// Fonction de validation robuste des données de commande
function validateOrderData(orderData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validation des informations client
  if (!orderData.customerInfo) {
    errors.push('Informations client manquantes');
  } else {
    if (!orderData.customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.customerInfo.email)) {
      errors.push('Email client invalide ou manquant');
    }
    if (!orderData.customerInfo.first_name || orderData.customerInfo.first_name.trim().length < 2) {
      errors.push('Prénom client invalide ou manquant');
    }
    if (!orderData.customerInfo.last_name || orderData.customerInfo.last_name.trim().length < 2) {
      errors.push('Nom client invalide ou manquant');
    }
    if (!orderData.customerInfo.phone || orderData.customerInfo.phone.trim().length < 8) {
      errors.push('Téléphone client invalide ou manquant');
    }
  }
  
  // Validation des informations de livraison
  if (!orderData.deliveryInfo) {
    errors.push('Informations de livraison manquantes');
  } else {
    if (!orderData.deliveryInfo.address || orderData.deliveryInfo.address.trim().length < 5) {
      errors.push('Adresse de livraison invalide ou manquante');
    }
    if (!orderData.deliveryInfo.deliveryOption) {
      errors.push('Option de livraison manquante');
    }
  }
  
  // Validation des articles avec messages plus détaillés
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Aucun article dans la commande');
  } else {
    orderData.items.forEach((item: any, index: number) => {
      // Validation stricte de l'ID (support UUID)
      if (item.id === undefined || item.id === null) {
        errors.push(`Article ${index + 1}: ID manquant (valeur reçue: ${item.id})`);
      } else if (typeof item.id !== 'string' || item.id.trim().length === 0) {
        errors.push(`Article ${index + 1}: ID invalide - doit être une chaîne non vide (reçu: ${typeof item.id} ${item.id})`);
      }
      
      // Validation du nom
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
        errors.push(`Article ${index + 1}: Nom manquant ou invalide (reçu: ${item.name})`);
      }
      
      // Validation du prix
      if (item.price === undefined || item.price === null) {
        errors.push(`Article ${index + 1}: Prix manquant (reçu: ${item.price})`);
      } else if (typeof item.price !== 'number' || isNaN(item.price)) {
        errors.push(`Article ${index + 1}: Prix invalide - doit être un nombre (reçu: ${typeof item.price} ${item.price})`);
      } else if (item.price <= 0) {
        errors.push(`Article ${index + 1}: Prix invalide - doit être positif (reçu: ${item.price})`);
      }
      
      // Validation de la quantité
      if (item.quantity === undefined || item.quantity === null) {
        errors.push(`Article ${index + 1}: Quantité manquante (reçu: ${item.quantity})`);
      } else if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        errors.push(`Article ${index + 1}: Quantité invalide - doit être un nombre (reçu: ${typeof item.quantity} ${item.quantity})`);
      } else if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`Article ${index + 1}: Quantité invalide - doit être un entier positif (reçu: ${item.quantity})`);
      }
    });
  }
  
  // Validation des montants
  if (!orderData.totalAmount || typeof orderData.totalAmount !== 'number' || orderData.totalAmount <= 0) {
    errors.push('Montant total invalide');
  }
  if (typeof orderData.subtotal !== 'number' || orderData.subtotal < 0) {
    errors.push('Sous-total invalide');
  }
  if (typeof orderData.deliveryCost !== 'number' || orderData.deliveryCost < 0) {
    errors.push('Coût de livraison invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET /api/orders - Récupérer les commandes depuis Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const chauffeurId = searchParams.get('chauffeur_id');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('🔍 GET /api/orders - Paramètres:', { page, limit, status, customerId, chauffeurId, startDate, endDate });
    
    // Si on demande une commande spécifique
    const orderId = searchParams.get('id');
    
    if (orderId) {
      // Récupérer une commande spécifique
      const supabase = getSupabaseClient();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error('Erreur lors de la récupération de la commande:', orderError);
        return NextResponse.json(
          { error: 'Commande non trouvée', details: orderError.message },
          { status: 404 }
        );
      }
      
      return NextResponse.json(order);
    }
    
    // Construire la requête pour toutes les commandes
    const supabase = getSupabaseClient();
    let query = supabase
      .from('orders')
      .select('*');
    
    // Appliquer les filtres
    if (status) {
      query = query.eq('status', status);
    }
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    if (chauffeurId) {
      query = query.eq('delivery_person_id', chauffeurId);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Appliquer la pagination et le tri
    const startIndex = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);
    
    // Exécuter la requête
    const { data: orders, error } = await query;
    
    if (error) {
      console.error('Erreur récupération commandes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`${orders?.length || 0} commandes récupérées`);
    
    return NextResponse.json({
      orders: orders || [],
      total: orders?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Erreur GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Créer une nouvelle commande dans Supabase
export async function POST(request: NextRequest) {
  const result = await safeExecute(async () => {
    logInfo('POST /api/orders - Début de création de commande');
    
    // Récupération et validation des données
    let orderData: OrderData;
    try {
      orderData = await request.json();
      logInfo(`Données de commande reçues - Email: ${orderData.customerInfo?.email}, Articles: ${orderData.items?.length}, Total: ${orderData.totalAmount}`);
    } catch (error) {
      logError(error, 'parsing_json_order_data');
      return NextResponse.json({
        success: false,
        error: 'Format de données invalide'
      }, { status: 400 });
    }
    
    // Validation robuste des données
    const validation = validateOrderData(orderData);
    if (!validation.isValid) {
      logError(`Validation des données de commande échouée: ${validation.errors.join(', ')}`, 'order_validation');
      return NextResponse.json({
        success: false,
        error: 'Données de commande invalides',
        details: validation.errors
      }, { status: 400 });
    }
    
    // Vérifier et corriger les coordonnées GPS
    let gpsLat = orderData.deliveryInfo.location?.lat;
    let gpsLng = orderData.deliveryInfo.location?.lng;
    
    // Si pas de coordonnées GPS valides, utiliser les coordonnées par défaut de Libreville
    if (!gpsLat || !gpsLng || gpsLat === 0 || gpsLng === 0) {
      console.log('⚠️ Coordonnées GPS manquantes, utilisation des coordonnées par défaut de Libreville');
      gpsLat = 0.4162; // Latitude de Libreville
      gpsLng = 9.4167; // Longitude de Libreville
    }
    
    console.log('📍 Coordonnées GPS utilisées:', { lat: gpsLat, lng: gpsLng });
    
    // 1. Créer ou mettre à jour le client avec les données du formulaire
    const supabase = getSupabaseClient();
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', orderData.customerInfo.email)
      .single();
    
    let customerId = existingCustomer?.id;
    
    if (!customerId) {
      // Créer un nouveau client
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: orderData.customerInfo.email,
          first_name: orderData.customerInfo.first_name,
          last_name: orderData.customerInfo.last_name,
          phone: orderData.customerInfo.phone,
          full_name: `${orderData.customerInfo.first_name} ${orderData.customerInfo.last_name}`.trim()
        })
        .select('id')
        .single();
      
      if (customerError) {
        console.error('❌ Erreur création client:', customerError);
        return NextResponse.json(
          { error: 'Erreur lors de la création du client', details: customerError.message },
          { status: 500 }
        );
      }
      
      customerId = newCustomer.id;
      console.log('✅ Nouveau client créé avec ID:', customerId);
    } else {
      // Mettre à jour le client existant avec les données du formulaire
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          first_name: orderData.customerInfo.first_name,
          last_name: orderData.customerInfo.last_name,
          phone: orderData.customerInfo.phone,
          full_name: `${orderData.customerInfo.first_name} ${orderData.customerInfo.last_name}`.trim()
        })
        .eq('id', customerId);
      
      if (updateError) {
        console.error('❌ Erreur mise à jour client:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du client', details: updateError.message },
          { status: 500 }
        );
      }
      
      console.log('✅ Client existant mis à jour avec ID:', customerId, {
        first_name: orderData.customerInfo.first_name,
        last_name: orderData.customerInfo.last_name,
        phone: orderData.customerInfo.phone
      });
    }
    
    // 2. Créer la commande avec coordonnées GPS
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: orderData.totalAmount,
        subtotal: orderData.subtotal,
        delivery_cost: orderData.deliveryCost,
        discount: orderData.discount || 0,
        status: 'Nouvelle',
        payment_status: 'En attente',
        payment_method: orderData.paymentInfo.method,
        delivery_address: orderData.deliveryInfo.address,
        delivery_district: orderData.deliveryInfo.district,
        delivery_notes: orderData.deliveryInfo.additionalInfo,
        delivery_option: orderData.deliveryInfo.deliveryOption,
        gps_latitude: gpsLat,
        gps_longitude: gpsLng
      })
      .select('id, order_number')
      .single();
    
    if (orderError) {
      console.error('❌ Erreur création commande:', orderError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande', details: orderError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Commande créée avec ID:', newOrder.id, 'Numéro:', newOrder.order_number);
    
    // 3. Ajouter les articles de la commande
    console.log('📝 Préparation des articles:', orderData.items.length, 'articles');
    
    // Fonction pour valider un UUID
    const validItems = [];
    const invalidItems = [];
    
    for (let index = 0; index < orderData.items.length; index++) {
      const item = orderData.items[index];
      const productId = typeof item.id === 'string' ? item.id : String(item.id);
      
      console.log(`🔍 Vérification article ${index + 1}:`, {
        id: productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      });
      
      // Vérifier dans la vue unifiée qui combine tous les types de produits
      let { data: product, error } = await supabase
        .from('products_unified')
        .select('id, name, source_table')
        .eq('id', productId)
        .single();
      
      // Si pas trouvé dans products_unified, vérifier dans ready_cocktails
      if (error || !product) {
        console.log(`🔍 Produit non trouvé dans products_unified, vérification dans ready_cocktails...`);
        const { data: readyCocktail, error: cocktailError } = await supabase
          .from('ready_cocktails')
          .select('id, name')
          .eq('id', productId)
          .eq('is_active', true)
          .single();
        
        if (readyCocktail && !cocktailError) {
          console.log(`✅ Cocktail prêt trouvé:`, { id: productId, name: readyCocktail.name });
          product = { 
            id: readyCocktail.id, 
            name: readyCocktail.name, 
            source_table: 'ready_cocktails' 
          };
        } else {
          // Si toujours pas trouvé, vérifier dans cocktails_maison
          console.log(`🔍 Produit non trouvé dans ready_cocktails, vérification dans cocktails_maison...`);
          const { data: cocktailMaison, error: maisonError } = await supabase
            .from('cocktails_maison')
            .select('id, name')
            .eq('id', productId)
            .eq('is_active', true)
            .single();
          
          if (cocktailMaison && !maisonError) {
            console.log(`✅ Kit cocktail trouvé:`, { id: productId, name: cocktailMaison.name });
            product = { 
              id: cocktailMaison.id, 
              name: cocktailMaison.name, 
              source_table: 'cocktails_maison' 
            };
          }
        }
      }
      
      if (!product) {
        console.warn(`⚠️ Article invalide - non trouvé dans aucune table:`, { 
          index: index + 1, 
          id: productId, 
          name: item.name,
          originalError: error?.message 
        });
        invalidItems.push({ index: index + 1, id: productId, name: item.name });
        continue;
      }
      
      // Déterminer le type de produit
      const isReadyCocktail = product.source_table === 'ready_cocktails';
      const isCocktailMaison = product.source_table === 'cocktails_maison';
      const isRegularProduct = product.source_table === 'product' || !product.source_table;
      
      console.log(`✅ Produit trouvé:`, { 
        id: productId, 
        name: item.name, 
        source: product.source_table,
        isReadyCocktail: isReadyCocktail,
        isCocktailMaison: isCocktailMaison,
        isRegularProduct: isRegularProduct
      });
      
      // Ajouter l'article valide avec le bon ID selon le type
      const orderItem: any = {
        order_id: newOrder.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      };

      // Assigner le bon champ selon le type de produit
      if (isRegularProduct) {
        orderItem.product_id = productId;
      } else if (isReadyCocktail) {
        // Pour les cocktails prêts, on utilise un champ spécifique ou on les traite comme des produits spéciaux
        // Temporairement, on va les traiter comme des produits normaux pour éviter l'erreur de contrainte
        orderItem.product_id = null; // Pas de product_id car ce n'est pas dans la table products
        orderItem.ready_cocktail_id = productId; // Utiliser un champ dédié aux cocktails prêts
        orderItem.product_type = 'ready_cocktail';
      } else if (isCocktailMaison) {
        orderItem.product_id = null;
        orderItem.cocktail_maison_id = productId;
        orderItem.product_type = 'cocktail_maison';
      }

      validItems.push(orderItem);
    }
    
    // Vérifier s'il y a des articles invalides
    if (invalidItems.length > 0) {
      console.error('❌ Articles avec IDs invalides détectés:', invalidItems);
      // Supprimer la commande créée
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json(
        { 
          error: 'Articles invalides détectés', 
          details: `${invalidItems.length} article(s) avec des IDs invalides`,
          invalidItems: invalidItems
        },
        { status: 400 }
      );
    }
    
    // Vérifier qu'il reste des articles valides
    if (validItems.length === 0) {
      console.error('❌ Aucun article valide dans la commande');
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json(
        { error: 'Aucun article valide dans la commande' },
        { status: 400 }
      );
    }
    
    const orderItems = validItems;
    
    console.log('📦 Articles prêts pour insertion:', orderItems);
    console.log('🔍 IDs des produits à insérer:', orderItems.map(item => item.product_id));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('❌ Erreur ajout articles:', itemsError);
      // Supprimer la commande si les articles n'ont pas pu être ajoutés
      await supabase.from('orders').delete().eq('id', newOrder.id);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des articles', details: itemsError.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ ${orderItems.length} articles ajoutés à la commande`);
    
    // 4. Récupérer la commande complète avec les liens de navigation
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders_complete')
      .select('*')
      .eq('id', newOrder.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur récupération commande complète:', fetchError);
    }
    
    logInfo(`Commande ${newOrder.order_number} créée avec succès`);
    
    return NextResponse.json({
      success: true,
      order: completeOrder || {
        id: newOrder.id,
        order_number: newOrder.order_number,
        status: 'Nouvelle',
        total_amount: orderData.totalAmount
      },
      message: `Commande ${newOrder.order_number} créée avec succès avec coordonnées GPS`
    }, { status: 201 });
    
  }, 'post_orders_api', NextResponse.json({
    success: false,
    error: 'Erreur serveur lors de la création de la commande'
  }, { status: 500 }));
  
  return result || NextResponse.json({
    success: false,
    error: 'Erreur serveur lors de la création de la commande'
  }, { status: 500 });
}

// PATCH /api/orders - Mettre à jour une commande
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const body = await request.json();
    
    console.log('🔍 PATCH /api/orders - Debug:', {
      url: request.url,
      orderId,
      body,
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    if (!orderId) {
      console.error('❌ ID de commande manquant');
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 PATCH /api/orders - Mise à jour commande ${orderId}:`, body);
    
    const supabase = getSupabaseClient();
    
    // Récupérer d'abord la commande pour avoir le statut précédent
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (fetchError || !currentOrder) {
      console.error('❌ Erreur récupération commande:', fetchError);
      return NextResponse.json(
        { error: 'Commande non trouvée', details: fetchError?.message },
        { status: 404 }
      );
    }
    
    // Récupérer les infos du client séparément
    console.log('🔍 Récupération infos client pour customer_id:', currentOrder.customer_id);
    let customerWhatsapp = null;
    let customerName = null;
    if (currentOrder.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('phone, first_name, last_name')
        .eq('id', currentOrder.customer_id)
        .single();
      
      console.log('📊 Résultat requête customer:', { customer, error: customerError });
      
      if (customer) {
        // Supprimer le + au début du numéro si présent
        customerWhatsapp = customer.phone ? customer.phone.replace(/^\+/, '') : null;
        customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client';
        console.log('📱 Infos client récupérées:', { 
          phoneOriginal: customer.phone,
          phoneFormatted: customerWhatsapp, 
          name: customerName 
        });
      } else {
        console.log('⚠️ Aucune info client trouvée pour customer_id:', currentOrder.customer_id);
      }
    } else {
      console.log('⚠️ Pas de customer_id dans la commande');
    }
    
    const oldStatus = currentOrder.status;
    const newStatus = body.status || oldStatus;
    
    // Mettre à jour la commande
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: body.status,
        payment_status: body.payment_status,
        delivery_person_id: body.delivery_person_id,
        delivery_notes: body.delivery_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Erreur mise à jour commande:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Commande mise à jour:', updatedOrder.order_number);
    
    // Si le statut a changé et qu'on a un numéro WhatsApp, envoyer une notification
    console.log('🔍 Vérification conditions notification WhatsApp:', {
      hasBodyStatus: !!body.status,
      oldStatus,
      newStatus,
      statusChanged: oldStatus !== newStatus,
      hasCustomerWhatsapp: !!customerWhatsapp,
      customerWhatsapp,
      shouldSendNotification: body.status && oldStatus !== newStatus && customerWhatsapp
    });
    
    if (body.status && oldStatus !== newStatus && customerWhatsapp) {
      console.log('📱 Envoi notification WhatsApp pour changement de statut:', {
        oldStatus,
        newStatus,
        phone: customerWhatsapp
      });
      
      try {
        // Appeler l'API WhatsApp pour envoyer la notification
        const notificationResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId,
            phone: customerWhatsapp,
            status: newStatus,
            orderNumber: updatedOrder.order_number,
            customerName: customerName || 'Client',
            totalAmount: updatedOrder.total_amount,
            deliveryDate: updatedOrder.delivery_date,
            deliveryTime: updatedOrder.delivery_time
          })
        });
        
        if (!notificationResponse.ok) {
          console.error('❌ Erreur envoi notification WhatsApp:', await notificationResponse.text());
        } else {
          console.log('✅ Notification WhatsApp envoyée avec succès');
        }
      } catch (notifError) {
        console.error('❌ Erreur lors de l\'envoi de la notification WhatsApp:', notifError);
        // On ne bloque pas la mise à jour même si la notification échoue
      }
    }
    
    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
    
  } catch (error) {
    console.error('❌ Erreur PATCH /api/orders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
