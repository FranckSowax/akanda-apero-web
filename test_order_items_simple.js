// Test simple pour diagnostiquer les order_items
// À exécuter dans la console du navigateur sur http://localhost:3002/admin

console.log('🔍 Test simple des order_items...\n');

// Fonction de test à exécuter manuellement
const testOrderItems = async () => {
  try {
    // Importer le client Supabase
    const { supabase } = await import('/src/lib/supabase.js');
    
    console.log('1️⃣ Test des commandes existantes:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount')
      .limit(3);
    
    if (ordersError) {
      console.log('❌ Erreur orders:', ordersError);
    } else {
      console.log(`✅ ${orders?.length || 0} commandes trouvées`);
      orders?.forEach(order => console.log(`  - ${order.order_number}: ${order.total_amount} XAF`));
    }
    
    console.log('\n2️⃣ Test direct de la table order_items:');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (orderItemsError) {
      console.log('❌ Erreur order_items:', orderItemsError);
      console.log('💡 Possible: La table order_items n\'existe pas ou est vide');
    } else {
      console.log(`✅ ${orderItems?.length || 0} order_items trouvés`);
      if (orderItems && orderItems.length > 0) {
        console.log('📋 Exemples:', orderItems.slice(0, 2));
      } else {
        console.log('⚠️ La table order_items existe mais est VIDE');
        console.log('💡 Solution: Il faut créer des order_items lors du processus de commande');
      }
    }
    
    console.log('\n3️⃣ Vérification de la structure des tables:');
    
    // Test des produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, base_price')
      .limit(3);
    
    if (productsError) {
      console.log('❌ Erreur products:', productsError);
    } else {
      console.log(`✅ ${products?.length || 0} produits disponibles`);
    }
    
    console.log('\n📊 DIAGNOSTIC:');
    if (orders && orders.length > 0 && (!orderItems || orderItems.length === 0)) {
      console.log('🎯 PROBLÈME IDENTIFIÉ: Il y a des commandes mais pas d\'order_items');
      console.log('💡 SOLUTION: Le processus de commande ne crée pas les order_items');
      console.log('🔧 ACTION: Vérifier le code de création de commande ou créer des données de test');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Instructions
console.log('📋 Instructions:');
console.log('1. Ouvrez la console sur http://localhost:3002/admin');
console.log('2. Exécutez: testOrderItems()');
console.log('3. Analysez les résultats');

// Rendre la fonction disponible globalement
window.testOrderItems = testOrderItems;
