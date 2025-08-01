// Script pour vérifier l'utilisateur actuellement connecté et créer une commande pour lui
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentUser() {
  console.log('👤 Vérification de l\'utilisateur actuellement connecté...\n');

  try {
    // Récupérer la session actuelle
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur récupération session:', sessionError);
      return;
    }
    
    if (!session || !session.user) {
      console.log('❌ Aucun utilisateur connecté');
      console.log('Connectez-vous d\'abord avec testuser@gmail.com / test123456');
      return;
    }
    
    console.log('✅ Utilisateur connecté:', session.user.email);
    console.log('ID utilisateur:', session.user.id);
    
    // Chercher le client correspondant
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', session.user.email)
      .single();
      
    if (customerError) {
      console.log('❌ Client non trouvé dans la table customers:', customerError.message);
      
      // Créer le client
      console.log('📝 Création du client...');
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{
          email: session.user.email,
          first_name: 'User',
          last_name: 'Connected',
          phone: '+24100000000',
          full_name: 'User Connected'
        }])
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Erreur création client:', createError);
        return;
      }
      
      console.log('✅ Client créé:', newCustomer);
      
      // Créer une commande de test pour ce client
      await createTestOrderForCustomer(newCustomer.id, session.user.email);
    } else {
      console.log('✅ Client trouvé:', customer);
      
      // Vérifier s'il a des commandes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount')
        .eq('customer_id', customer.id);
        
      if (ordersError) {
        console.error('❌ Erreur récupération commandes:', ordersError);
      } else {
        console.log(`📦 ${orders?.length || 0} commandes trouvées pour ce client`);
        orders?.forEach(order => {
          console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA)`);
        });
        
        if (!orders || orders.length === 0) {
          console.log('📝 Création d\'une commande de test...');
          await createTestOrderForCustomer(customer.id, session.user.email);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

async function createTestOrderForCustomer(customerId, email) {
  try {
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: customerId,
        order_number: `USER-${Date.now()}`,
        status: 'Nouvelle',
        total_amount: 35000,
        subtotal: 33500,
        delivery_address: 'Libreville, Gabon',
        delivery_district: 'Test District',
        delivery_option: 'standard',
        gps_latitude: 0.4077972,
        gps_longitude: 9.4402833,
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
    
    // Ajouter des articles
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: testOrder.id,
          product_name: 'Absolut Vodka - 70cl',
          quantity: 1,
          unit_price: 22000,
          subtotal: 22000
        },
        {
          order_id: testOrder.id,
          product_name: 'Bacardi Rhum carta oro - 70cl',
          quantity: 1,
          unit_price: 18000,
          subtotal: 18000
        }
      ]);

    if (itemsError) {
      console.error('❌ Erreur ajout articles:', itemsError);
    } else {
      console.log('✅ Articles ajoutés à la commande');
      console.log(`\n🎉 Commande créée pour ${email} !`);
      console.log('Vous pouvez maintenant tester la page des commandes.');
    }
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
  }
}

checkCurrentUser();
