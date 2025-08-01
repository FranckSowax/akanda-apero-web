// Script pour tester directement la logique de récupération des commandes
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersLogic() {
  console.log('🧪 Test de la logique de récupération des commandes...\n');

  try {
    const testEmail = 'testuser@gmail.com';
    console.log('📧 Email de test:', testEmail);
    
    // Étape 1: Recherche par email exact
    console.log('\n1. Recherche par email exact...');
    const { data: exactCustomer, error: exactError } = await supabase
      .from('customers')
      .select('id, email, phone, first_name, last_name')
      .eq('email', testEmail)
      .single();
      
    if (!exactError && exactCustomer) {
      console.log('✅ Client trouvé par email exact:', exactCustomer);
      
      // Étape 2: Récupérer les commandes
      console.log('\n2. Récupération des commandes...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          status,
          payment_status,
          total_amount,
          subtotal,
          delivery_address,
          delivery_district,
          delivery_option,
          payment_method,
          gps_latitude,
          gps_longitude,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('customer_id', exactCustomer.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:');
        console.error('Code d\'erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Détails:', error.details);
        console.error('Hint:', error.hint);
        console.error('Erreur complète:', error);
      } else {
        console.log(`✅ ${data?.length || 0} commandes récupérées`);
        data?.forEach(order => {
          console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA) - ${order.order_items?.length || 0} articles`);
          order.order_items?.forEach(item => {
            console.log(`     * ${item.product_name} x${item.quantity} - ${item.unit_price} FCFA`);
          });
        });
        
        // Étape 3: Transformer les données
        console.log('\n3. Transformation des données...');
        const transformedOrders = (data || []).map(order => ({
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
          status: order.status,
          total_amount: order.total_amount,
          delivery_option: order.delivery_option || order.delivery_district || 'Livraison',
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          subtotal: order.subtotal,
          delivery_fee: 0,
          delivery_address: order.delivery_address,
          gps_latitude: order.gps_latitude,
          gps_longitude: order.gps_longitude,
          items: (order.order_items || []).map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.unit_price,
            product: {
              id: item.product_id,
              name: item.product_name || 'Produit',
              price: item.unit_price,
              image_url: '/placeholder-product.jpg'
            }
          }))
        }));
        
        console.log('✅ Transformation réussie:', transformedOrders.length, 'commandes');
        console.log('📋 Première commande transformée:', JSON.stringify(transformedOrders[0], null, 2));
      }
    } else {
      console.log('❌ Client non trouvé par email exact');
      
      // Étape alternative: Recherche par téléphone
      console.log('\n2. Recherche par téléphone...');
      const phoneFromEmail = testEmail.split('@')[0];
      console.log('📞 Téléphone extrait:', phoneFromEmail);
      
      const { data: phoneCustomers, error: phoneError } = await supabase
        .from('customers')
        .select('id, email, phone, first_name, last_name')
        .or(`phone.eq.${phoneFromEmail},phone.eq.+241${phoneFromEmail},email.ilike.%${phoneFromEmail}%`);
        
      if (!phoneError && phoneCustomers && phoneCustomers.length > 0) {
        console.log('✅ Clients trouvés par téléphone:', phoneCustomers);
      } else {
        console.log('❌ Aucun client trouvé par téléphone');
      }
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testOrdersLogic();
