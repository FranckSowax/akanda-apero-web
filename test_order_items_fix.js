// Script de test pour vérifier la correction des order_items dans BestSellersModule
// À exécuter dans la console du navigateur sur http://localhost:3002/admin

console.log('🧪 === TEST CORRECTION ORDER_ITEMS ===');

async function testOrderItemsFix() {
  try {
    // 1. Vérifier la structure des order_items existants
    console.log('\n📋 1. Vérification structure order_items...');
    
    const { data: orderItems, error: orderItemsError } = await window.supabase
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (orderItemsError) {
      console.error('❌ Erreur récupération order_items:', orderItemsError);
    } else {
      console.log(`📊 ${orderItems?.length || 0} order_items trouvés`);
      if (orderItems && orderItems.length > 0) {
        console.log('🔍 Structure du premier order_item:');
        console.log(orderItems[0]);
        
        // Vérifier les colonnes attendues
        const expectedColumns = ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'total_price'];
        const actualColumns = Object.keys(orderItems[0]);
        
        console.log('✅ Colonnes attendues:', expectedColumns);
        console.log('📋 Colonnes présentes:', actualColumns);
        
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.warn('⚠️ Colonnes manquantes:', missingColumns);
        }
        if (extraColumns.length > 0) {
          console.log('ℹ️ Colonnes supplémentaires:', extraColumns);
        }
        
        if (missingColumns.length === 0) {
          console.log('✅ Structure order_items correcte !');
        }
      }
    }

    // 2. Tester la requête BestSellers corrigée
    console.log('\n🏆 2. Test requête BestSellers corrigée...');
    
    const { data: bestSellersData, error: bestSellersError } = await window.supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        total_price,
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
      console.log(`📊 ${bestSellersData?.length || 0} items récupérés pour BestSellers`);
      
      if (bestSellersData && bestSellersData.length > 0) {
        console.log('🔍 Premier item BestSellers:');
        console.log(bestSellersData[0]);
        
        // Calculer les meilleures ventes
        const salesByProduct = {};
        bestSellersData.forEach(item => {
          const productId = item.product_id;
          if (!salesByProduct[productId]) {
            const category = Array.isArray(item.products?.categories) ? item.products.categories[0] : item.products?.categories;
            salesByProduct[productId] = {
              product_id: productId,
              product_name: item.products?.name || 'Produit inconnu',
              category: category?.name || 'Non catégorisé',
              total_sold: 0,
              total_revenue: 0,
              image_url: item.products?.image_url,
              is_alcoholic: category?.name?.toLowerCase().includes('alcool') || 
                           category?.name?.toLowerCase().includes('spiritueux') || 
                           category?.name?.toLowerCase().includes('vin') || 
                           category?.name?.toLowerCase().includes('bière') || false,
            };
          }
          
          salesByProduct[productId].total_sold += item.quantity || 0;
          salesByProduct[productId].total_revenue += item.total_price || 0;
        });
        
        const topSellers = Object.values(salesByProduct)
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 5);
        
        console.log('🏆 Top 5 meilleures ventes calculées:');
        topSellers.forEach((seller, index) => {
          console.log(`  ${index + 1}. ${seller.product_name}: ${seller.total_sold} vendus (${seller.total_revenue}€)`);
        });
        
        if (topSellers.length > 0) {
          console.log('✅ BestSellersModule devrait maintenant afficher des données réelles !');
        }
      } else {
        console.log('⚠️ Aucune donnée trouvée - vérifier si des commandes ont été passées');
      }
    }

    // 3. Créer des données de test si nécessaire
    if (!orderItems || orderItems.length === 0) {
      console.log('\n🧪 3. Création de données de test...');
      console.log('💡 Pour tester complètement, vous pouvez :');
      console.log('  1. Passer une commande test via /checkout');
      console.log('  2. Ou créer des order_items manuellement dans Supabase');
      console.log('  3. Ou utiliser le fallback intelligent déjà en place');
    }

    // 4. Vérifier le dashboard en temps réel
    console.log('\n📊 4. Vérification dashboard...');
    console.log('🔄 Rafraîchir la page /admin pour voir les changements');
    console.log('🎯 Le module BestSellers devrait maintenant afficher les vraies données ou le fallback intelligent');

  } catch (error) {
    console.error('💥 Erreur test order_items:', error);
  }
}

// Initialiser et lancer le test
console.log('🚀 Lancement du test...');
testOrderItemsFix();

console.log('\n📋 === FIN DU TEST ===');
console.log('💡 Exécuter ce script dans la console sur http://localhost:3002/admin');
