// Script de diagnostic complet pour la structure order_items et leur création
// À exécuter dans la console du navigateur sur http://localhost:3002

console.log('🔍 === DIAGNOSTIC COMPLET ORDER_ITEMS ===');

async function diagnoseOrderItemsStructure() {
  try {
    // 1. Vérifier la structure de la table order_items
    console.log('\n📋 1. Vérification structure table order_items...');
    
    const { data: orderItemsStructure, error: structureError } = await window.supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erreur structure order_items:', structureError);
      
      // Vérifier si la table existe
      const { data: tables, error: tablesError } = await window.supabase
        .rpc('get_table_names');
      
      if (!tablesError && tables) {
        const hasOrderItems = tables.some(table => table.table_name === 'order_items');
        console.log(`📊 Table order_items existe: ${hasOrderItems ? '✅ OUI' : '❌ NON'}`);
      }
    } else {
      console.log('✅ Structure order_items accessible');
      if (orderItemsStructure && orderItemsStructure.length > 0) {
        console.log('📋 Colonnes disponibles:', Object.keys(orderItemsStructure[0]));
      }
    }

    // 2. Compter les order_items existants
    console.log('\n📊 2. Comptage des order_items...');
    const { count: orderItemsCount, error: countError } = await window.supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage order_items:', countError);
    } else {
      console.log(`📈 Nombre total d'order_items: ${orderItemsCount || 0}`);
    }

    // 3. Vérifier les commandes existantes
    console.log('\n🛒 3. Vérification des commandes...');
    const { data: orders, error: ordersError } = await window.supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError);
    } else {
      console.log(`📦 Nombre de commandes: ${orders?.length || 0}`);
      if (orders && orders.length > 0) {
        console.log('🔍 Dernières commandes:');
        orders.forEach(order => {
          console.log(`  - ID: ${order.id}, Status: ${order.status}, Total: ${order.total_amount}€, Date: ${new Date(order.created_at).toLocaleDateString()}`);
        });
      }
    }

    // 4. Vérifier la relation orders -> order_items
    if (orders && orders.length > 0) {
      console.log('\n🔗 4. Vérification relation orders -> order_items...');
      
      for (const order of orders.slice(0, 3)) {
        const { data: orderItems, error: itemsError } = await window.supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error(`❌ Erreur order_items pour commande ${order.id}:`, itemsError);
        } else {
          console.log(`📋 Commande ${order.id}: ${orderItems?.length || 0} items`);
          if (orderItems && orderItems.length > 0) {
            orderItems.forEach(item => {
              console.log(`  - Product ID: ${item.product_id}, Quantity: ${item.quantity}, Price: ${item.price}€`);
            });
          }
        }
      }
    }

    // 5. Test de requête BestSellers actuelle
    console.log('\n🏆 5. Test requête BestSellers actuelle...');
    const { data: bestSellersData, error: bestSellersError } = await window.supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products!inner(
          id,
          name,
          image_url,
          categories(name)
        )
      `);
    
    if (bestSellersError) {
      console.error('❌ Erreur requête BestSellers:', bestSellersError);
    } else {
      console.log(`📊 Données BestSellers récupérées: ${bestSellersData?.length || 0} items`);
      if (bestSellersData && bestSellersData.length > 0) {
        // Calculer les meilleures ventes
        const salesByProduct = {};
        bestSellersData.forEach(item => {
          const productId = item.product_id;
          if (!salesByProduct[productId]) {
            salesByProduct[productId] = {
              product_name: item.products?.name || 'Produit inconnu',
              total_sold: 0,
              total_revenue: 0,
              image_url: item.products?.image_url,
              category: item.products?.categories?.name || 'Non catégorisé'
            };
          }
          salesByProduct[productId].total_sold += item.quantity || 0;
          salesByProduct[productId].total_revenue += (item.quantity || 0) * (item.price || 0);
        });
        
        const topSellers = Object.entries(salesByProduct)
          .map(([productId, data]) => ({ product_id: productId, ...data }))
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 5);
        
        console.log('🏆 Top 5 meilleures ventes calculées:');
        topSellers.forEach((seller, index) => {
          console.log(`  ${index + 1}. ${seller.product_name}: ${seller.total_sold} vendus (${seller.total_revenue}€)`);
        });
      }
    }

    // 6. Vérifier le processus de création de commande
    console.log('\n⚙️ 6. Analyse du processus de création de commande...');
    console.log('🔍 Recherche des fichiers de gestion des commandes...');
    
    // Suggestions d'amélioration
    console.log('\n💡 RECOMMANDATIONS:');
    
    if (!orderItemsCount || orderItemsCount === 0) {
      console.log('⚠️ PROBLÈME IDENTIFIÉ: Aucun order_items trouvé');
      console.log('📝 SOLUTIONS POSSIBLES:');
      console.log('  1. Vérifier que la création de commande génère bien des order_items');
      console.log('  2. Créer des données de test order_items');
      console.log('  3. Corriger le processus de checkout/commande');
    } else {
      console.log('✅ Des order_items existent, vérifier les requêtes BestSellers');
    }

  } catch (error) {
    console.error('💥 Erreur générale diagnostic:', error);
  }
}

// Initialiser Supabase si pas déjà fait
if (typeof window !== 'undefined' && !window.supabase) {
  console.log('🔧 Initialisation client Supabase...');
  
  // Récupérer les variables d'environnement depuis le DOM ou localStorage
  const supabaseUrl = 'https://your-project.supabase.co'; // À remplacer
  const supabaseKey = 'your-anon-key'; // À remplacer
  
  console.log('⚠️ ATTENTION: Remplacer supabaseUrl et supabaseKey par les vraies valeurs');
  console.log('💡 Ou exécuter ce script depuis une page qui a déjà le client Supabase initialisé');
}

// Lancer le diagnostic
console.log('🚀 Lancement du diagnostic...');
diagnoseOrderItemsStructure();

console.log('\n📋 === FIN DU DIAGNOSTIC ===');
console.log('💡 Exécuter ce script dans la console sur http://localhost:3002/admin');
