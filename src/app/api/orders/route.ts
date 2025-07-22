import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    id: number;
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
  try {
    const orderData: OrderData = await request.json();
    
    console.log('📦 POST /api/orders - Données reçues:', JSON.stringify(orderData, null, 2));
    
    // Vérifications de base
    if (!orderData.customerInfo?.email || !orderData.customerInfo?.phone || 
        !orderData.items?.length || !orderData.deliveryInfo?.address) {
      return NextResponse.json({
        error: 'Données invalides. Informations client, articles et adresse requis.'
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
    const orderItems = orderData.items.map(item => ({
      order_id: newOrder.id,
      product_id: item.id.toString(), // Convertir en string pour correspondre au type Supabase
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity // Utiliser total_price au lieu de subtotal
    }));
    
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
    
  } catch (error) {
    console.error('❌ Erreur POST /api/orders:', error);
    return NextResponse.json({
      error: 'Erreur serveur lors de la création de la commande'
    }, { status: 500 });
  }
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
