import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError, logInfo, safeExecute } from '../../../utils/error-handler';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('🔍 GET /api/orders - Paramètres:', { page, limit, status, customerId, startDate, endDate });
    
    // Si on demande une commande spécifique
    const orderId = searchParams.get('id');
    
    if (orderId) {
      // Récupérer une commande spécifique
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
    
    // 1. Créer ou récupérer le client
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', orderData.customerInfo.email)
      .single();
    
    let customerId = existingCustomer?.id;
    
    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: orderData.customerInfo.email,
          first_name: orderData.customerInfo.first_name,
          last_name: orderData.customerInfo.last_name,
          phone: orderData.customerInfo.phone
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
    const isValidUUID = (uuid: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };
    
    // Filtrer et valider les articles
    const validItems = [];
    const invalidItems = [];
    
    for (let index = 0; index < orderData.items.length; index++) {
      const item = orderData.items[index];
      const productId = typeof item.id === 'string' ? item.id : String(item.id);
      
      console.log(`📎 Article ${index + 1}:`, {
        id: productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isValidUUID: isValidUUID(productId)
      });
      
      if (!isValidUUID(productId)) {
        console.error(`❌ UUID invalide pour l'article ${index + 1}:`, productId);
        invalidItems.push({ index: index + 1, id: productId, name: item.name });
        continue; // Ignorer cet article
      }
      
      validItems.push({
        order_id: newOrder.id,
        product_id: productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      });
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
