// Script de débogage pour vérifier les commandes
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrders() {
  console.log('🔍 Débogage des commandes...\n');

  try {
    // 1. Vérifier toutes les commandes
    console.log('1. Toutes les commandes:');
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError);
    } else {
      console.log(`✅ ${allOrders?.length || 0} commandes trouvées`);
      allOrders?.forEach(order => {
        console.log(`   - ID: ${order.id}, Email: ${order.customer_email}, Status: ${order.status}, Total: ${order.total_amount}`);
      });
    }

    // 2. Vérifier tous les clients
    console.log('\n2. Tous les clients:');
    const { data: allCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) {
      console.error('❌ Erreur récupération clients:', customersError);
    } else {
      console.log(`✅ ${allCustomers?.length || 0} clients trouvés`);
      allCustomers?.forEach(customer => {
        console.log(`   - ID: ${customer.id}, Email: ${customer.email}, Nom: ${customer.first_name} ${customer.last_name}`);
      });
    }

    // 3. Vérifier les order_items
    console.log('\n3. Tous les order_items:');
    const { data: allOrderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*');

    if (itemsError) {
      console.error('❌ Erreur récupération order_items:', itemsError);
    } else {
      console.log(`✅ ${allOrderItems?.length || 0} order_items trouvés`);
      allOrderItems?.forEach(item => {
        console.log(`   - Order ID: ${item.order_id}, Produit: ${item.product_name}, Qty: ${item.quantity}, Prix: ${item.unit_price}`);
      });
    }

    // 4. Vérifier les customer_id dans les commandes
    console.log(`\n4. Vérification des customer_id dans les commandes:`);
    const ordersWithCustomerId = allOrders?.filter(order => order.customer_id);
    console.log(`✅ ${ordersWithCustomerId?.length || 0} commandes avec customer_id sur ${allOrders?.length || 0} total`);
    
    // 5. Test avec un téléphone spécifique
    const testPhone = '24166871309'; // D'après les données
    console.log(`\n5. Recherche pour le téléphone: ${testPhone}`);
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', testPhone)
      .single();

    if (customerError) {
      console.log(`❌ Client non trouvé pour ${testPhone}:`, customerError.message);
      
      // Essayer de chercher par email qui contient le téléphone
      const { data: customerByEmail, error: emailError } = await supabase
        .from('customers')
        .select('*')
        .ilike('email', `%${testPhone}%`);
        
      if (!emailError && customerByEmail?.length > 0) {
        console.log(`✅ Client trouvé par email contenant le téléphone:`, customerByEmail[0]);
        const foundCustomer = customerByEmail[0];
        
        // Chercher ses commandes
        const { data: customerOrders, error: customerOrdersError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            created_at,
            status,
            total_amount,
            customer_id,
            order_items (*)
          `)
          .eq('customer_id', foundCustomer.id);

        if (customerOrdersError) {
          console.error('❌ Erreur récupération commandes client:', customerOrdersError);
        } else {
          console.log(`✅ ${customerOrders?.length || 0} commandes pour ce client`);
          customerOrders?.forEach(order => {
            console.log(`   - Commande ${order.order_number || order.id.slice(0, 8)}: ${order.order_items?.length || 0} articles, Status: ${order.status}`);
          });
        }
      }
    } else {
      console.log(`✅ Client trouvé:`, customer);
      
      // Chercher ses commandes
      const { data: customerOrders, error: customerOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', customer.id);

      if (customerOrdersError) {
        console.error('❌ Erreur récupération commandes client:', customerOrdersError);
      } else {
        console.log(`✅ ${customerOrders?.length || 0} commandes pour ce client`);
        customerOrders?.forEach(order => {
          console.log(`   - Commande ${order.order_number}: ${order.order_items?.length || 0} articles`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugOrders();
