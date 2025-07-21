// Script de test pour vérifier les données Supabase du dashboard
// Exécuter avec: node test_supabase_dashboard_data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Définie' : '❌ Manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
  console.log('🔍 Test des données Supabase pour le dashboard...\n');

  try {
    // Test 1: Commandes récentes
    console.log('📋 Test des commandes récentes:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        customer_name,
        customer_email,
        delivery_address
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.log('❌ Erreur commandes:', ordersError.message);
    } else {
      console.log(`✅ ${orders?.length || 0} commandes trouvées`);
      if (orders && orders.length > 0) {
        console.log('   Exemple:', {
          id: orders[0].id,
          status: orders[0].status,
          amount: orders[0].total_amount,
          customer: orders[0].customer_name
        });
      }
    }

    // Test 2: Produits pour meilleures ventes
    console.log('\n⭐ Test des produits (meilleures ventes):');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, price, image_url')
      .limit(5);

    if (productsError) {
      console.log('❌ Erreur produits:', productsError.message);
    } else {
      console.log(`✅ ${products?.length || 0} produits trouvés`);
      if (products && products.length > 0) {
        console.log('   Exemple:', {
          id: products[0].id,
          name: products[0].name,
          category: products[0].category,
          price: products[0].price
        });
      }
    }

    // Test 3: Order items pour les statistiques de vente
    console.log('\n📊 Test des order_items:');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products(name, category, price)
      `)
      .limit(5);

    if (orderItemsError) {
      console.log('❌ Erreur order_items:', orderItemsError.message);
    } else {
      console.log(`✅ ${orderItems?.length || 0} order_items trouvés`);
      if (orderItems && orderItems.length > 0) {
        console.log('   Exemple:', {
          product_id: orderItems[0].product_id,
          quantity: orderItems[0].quantity,
          product_name: orderItems[0].products?.name
        });
      }
    }

    // Test 4: Stock des produits
    console.log('\n📦 Test du stock des produits:');
    const { data: stockProducts, error: stockError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level, image_url')
      .not('stock_quantity', 'is', null)
      .not('min_stock_level', 'is', null)
      .limit(5);

    if (stockError) {
      console.log('❌ Erreur stock:', stockError.message);
    } else {
      console.log(`✅ ${stockProducts?.length || 0} produits avec stock trouvés`);
      if (stockProducts && stockProducts.length > 0) {
        console.log('   Exemple:', {
          name: stockProducts[0].name,
          stock: stockProducts[0].stock_quantity,
          min_stock: stockProducts[0].min_stock_level
        });
      }
    }

    // Test 5: Clients
    console.log('\n👥 Test des clients:');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, email, created_at')
      .limit(5);

    if (customersError) {
      console.log('❌ Erreur customers:', customersError.message);
      // Essayer avec la table orders pour les clients
      console.log('   Tentative avec les données clients des commandes...');
      const { data: orderCustomers, error: orderCustomersError } = await supabase
        .from('orders')
        .select('customer_name, customer_email')
        .not('customer_name', 'is', null)
        .limit(5);
      
      if (orderCustomersError) {
        console.log('❌ Erreur clients depuis orders:', orderCustomersError.message);
      } else {
        console.log(`✅ ${orderCustomers?.length || 0} clients trouvés dans orders`);
      }
    } else {
      console.log(`✅ ${customers?.length || 0} clients trouvés`);
    }

    // Test 6: Livraisons
    console.log('\n🚚 Test des livraisons:');
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('deliveries')
      .select(`
        id,
        order_id,
        status,
        estimated_delivery_time,
        driver_name,
        created_at
      `)
      .limit(5);

    if (deliveriesError) {
      console.log('❌ Erreur deliveries:', deliveriesError.message);
    } else {
      console.log(`✅ ${deliveries?.length || 0} livraisons trouvées`);
      if (deliveries && deliveries.length > 0) {
        console.log('   Exemple:', {
          id: deliveries[0].id,
          status: deliveries[0].status,
          order_id: deliveries[0].order_id
        });
      }
    }

    // Test 7: Tables disponibles
    console.log('\n🗄️ Test des tables disponibles:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Impossible de lister les tables:', tablesError.message);
    } else {
      console.log('✅ Tables disponibles:', tables?.map(t => t.table_name).join(', '));
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }

  console.log('\n🔍 Test terminé.');
}

testDashboardData();
