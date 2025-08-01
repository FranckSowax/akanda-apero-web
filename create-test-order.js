// Script pour créer une commande de test pour l'utilisateur
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestOrder() {
  console.log('📦 Création d\'une commande de test...\n');

  try {
    const testEmail = 'testuser@gmail.com';
    const customerId = '66dad0ee-be7b-446b-aec5-937aeeaf28ce';
    
    console.log('👤 Client ID:', customerId);
    
    // Créer une commande de test
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: customerId,
        order_number: `TEST-${Date.now()}`,
        status: 'Nouvelle',
        total_amount: 50000,
        subtotal: 48500,
        delivery_address: 'Libreville, Gabon',
        delivery_district: 'Test District',
        delivery_option: 'standard',
        gps_latitude: 0.4077972,
        gps_longitude: 9.440283299999999,
        payment_method: 'cash',
        payment_status: 'En attente'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erreur création commande:', orderError);
      return;
    }

    console.log('✅ Commande créée:', testOrder.order_number);
    
    // Ajouter des articles à la commande
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: testOrder.id,
          product_name: 'Jack Daniels - 70 cl',
          quantity: 1,
          unit_price: 25000,
          subtotal: 25000
        },
        {
          order_id: testOrder.id,
          product_name: 'Cîroc Vodka Blue 70cl',
          quantity: 1,
          unit_price: 25000,
          subtotal: 25000
        }
      ]);

    if (itemsError) {
      console.error('❌ Erreur ajout articles:', itemsError);
    } else {
      console.log('✅ Articles ajoutés à la commande');
    }

    // Vérifier les commandes pour cet utilisateur
    console.log('\n📋 Vérification des commandes pour cet utilisateur...');
    const { data: userOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        order_items (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError);
    } else {
      console.log(`✅ ${userOrders?.length || 0} commandes trouvées:`);
      userOrders?.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA) - ${order.order_items?.length || 0} articles`);
      });
    }

    console.log('\n🎉 Commande de test créée avec succès !');
    console.log('Vous pouvez maintenant tester la page des commandes avec l\'utilisateur testuser@gmail.com');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createTestOrder();
