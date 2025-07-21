// Script de diagnostic détaillé pour les order_items et la structure des commandes
// Exécuter dans la console du navigateur sur la page admin

console.log('🔍 Diagnostic détaillé des order_items et structure des commandes...\n');

// Test direct avec le client Supabase du navigateur
const diagnosticOrderItems = async () => {
  try {
    // Utiliser le client Supabase global si disponible
    if (typeof window !== 'undefined' && window.supabase) {
      const supabase = window.supabase;
      
      console.log('📊 Test 1: Vérification des commandes existantes');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at')
        .limit(5);
      
      if (ordersError) {
        console.log('❌ Erreur orders:', ordersError);
      } else {
        console.log(`✅ ${orders?.length || 0} commandes trouvées:`);
        orders?.forEach(order => {
          console.log(`  - ${order.order_number}: ${order.total_amount} XAF (${order.status})`);
        });
      }
      
      console.log('\n📦 Test 2: Vérification des order_items');
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(10);
      
      if (orderItemsError) {
        console.log('❌ Erreur order_items:', orderItemsError);
        console.log('💡 La table order_items n\'existe peut-être pas ou n\'est pas accessible');
      } else {
        console.log(`✅ ${orderItems?.length || 0} order_items trouvés:`);
        orderItems?.forEach(item => {
          console.log(`  - Order ${item.order_id}: Product ${item.product_id}, Qty: ${item.quantity}, Price: ${item.unit_price}`);
        });
      }
      
      console.log('\n🔗 Test 3: Vérification des jointures order_items + products');
      const { data: joinedData, error: joinError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          unit_price,
          products(
            id,
            name,
            image_url,
            base_price
          )
        `)
        .limit(5);
      
      if (joinError) {
        console.log('❌ Erreur jointure:', joinError);
      } else {
        console.log(`✅ ${joinedData?.length || 0} jointures réussies:`);
        joinedData?.forEach(item => {
          console.log(`  - ${item.products?.name}: ${item.quantity} x ${item.unit_price}`);
        });
      }
      
      console.log('\n📋 Test 4: Structure complète d\'une commande');
      if (orders && orders.length > 0) {
        const { data: fullOrder, error: fullOrderError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            order_items(
              id,
              product_id,
              quantity,
              unit_price,
              products(name, image_url)
            )
          `)
          .eq('id', orders[0].id)
          .single();
        
        if (fullOrderError) {
          console.log('❌ Erreur commande complète:', fullOrderError);
        } else {
          console.log('✅ Structure complète de la commande:');
          console.log(JSON.stringify(fullOrder, null, 2));
        }
      }
      
    } else {
      console.log('❌ Client Supabase non disponible dans le contexte du navigateur');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le diagnostic
diagnosticOrderItems();

// Instructions pour l'utilisateur
console.log('\n💡 Instructions:');
console.log('1. Ouvrez la console du navigateur sur la page admin');
console.log('2. Copiez-collez ce script et exécutez-le');
console.log('3. Analysez les résultats pour identifier le problème');
console.log('4. Si order_items est vide, il faut créer des données de test');
