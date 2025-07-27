/**
 * Script de diagnostic pour analyser les problèmes de commandes
 * Identifie les articles avec IDs invalides et les problèmes de synchronisation
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl.includes('supabase.co') || !supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ Veuillez configurer les variables d\'environnement Supabase');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configuré' : 'Non configuré');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseOrders() {
  console.log('🔍 Diagnostic des commandes - Analyse des problèmes d\'IDs invalides\n');

  try {
    // 1. Récupérer toutes les commandes
    console.log('📋 Récupération des commandes...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError);
      return;
    }

    console.log(`✅ ${orders.length} commandes trouvées\n`);

    // 2. Récupérer tous les produits existants
    console.log('📦 Récupération des produits...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, is_active');

    if (productsError) {
      console.error('❌ Erreur récupération produits:', productsError);
      return;
    }

    const activeProductIds = new Set(products.filter(p => p.is_active).map(p => p.id));
    console.log(`✅ ${products.length} produits trouvés (${activeProductIds.size} actifs)\n`);

    // 3. Analyser chaque commande
    let totalProblems = 0;
    let totalOrders = 0;
    let totalItems = 0;
    let invalidItems = 0;

    console.log('🔍 Analyse des commandes:\n');

    for (const order of orders) {
      totalOrders++;
      const orderProblems = [];
      let orderTotal = 0;
      let calculatedTotal = 0;

      if (!order.order_items || order.order_items.length === 0) {
        orderProblems.push('Aucun article dans la commande');
      } else {
        for (const item of order.order_items) {
          totalItems++;
          const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
          calculatedTotal += itemTotal;

          // Vérifier si le produit existe
          if (!activeProductIds.has(item.product_id)) {
            invalidItems++;
            orderProblems.push(
              `Article ID ${item.product_id} invalide/inactif (${item.quantity}x ${item.unit_price} XAF = ${itemTotal} XAF)`
            );
          }

          // Vérifier la cohérence des données
          if (!item.products && !item.product_name) {
            orderProblems.push(`Article ID ${item.product_id} sans nom ni référence produit`);
          }

          if (item.quantity <= 0) {
            orderProblems.push(`Quantité invalide pour l'article ID ${item.product_id}: ${item.quantity}`);
          }

          if (item.unit_price <= 0) {
            orderProblems.push(`Prix invalide pour l'article ID ${item.product_id}: ${item.unit_price}`);
          }
        }
      }

      // Vérifier la cohérence du total
      orderTotal = order.total_amount || 0;
      const totalDifference = Math.abs(orderTotal - calculatedTotal);
      
      if (totalDifference > 1) { // Tolérance de 1 XAF pour les arrondis
        orderProblems.push(
          `Incohérence montant: Total commande ${orderTotal} XAF vs Calculé ${calculatedTotal} XAF (différence: ${totalDifference} XAF)`
        );
      }

      // Afficher les problèmes de cette commande
      if (orderProblems.length > 0) {
        totalProblems++;
        console.log(`❌ Commande ${order.order_number || order.id}:`);
        console.log(`   📅 Date: ${new Date(order.created_at).toLocaleString()}`);
        console.log(`   💰 Montant: ${orderTotal.toLocaleString()} XAF`);
        console.log(`   📦 Articles: ${order.order_items?.length || 0}`);
        console.log(`   🚨 Problèmes:`);
        orderProblems.forEach(problem => {
          console.log(`      - ${problem}`);
        });
        console.log('');
      } else {
        console.log(`✅ Commande ${order.order_number || order.id} - OK`);
      }
    }

    // 4. Résumé du diagnostic
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('========================');
    console.log(`Total commandes analysées: ${totalOrders}`);
    console.log(`Commandes avec problèmes: ${totalProblems}`);
    console.log(`Total articles: ${totalItems}`);
    console.log(`Articles avec IDs invalides: ${invalidItems}`);
    console.log(`Taux de problèmes: ${((totalProblems / totalOrders) * 100).toFixed(1)}%`);
    console.log(`Taux d'articles invalides: ${((invalidItems / totalItems) * 100).toFixed(1)}%`);

    // 5. Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('==================');
    
    if (invalidItems > 0) {
      console.log('🔧 Actions à effectuer:');
      console.log('1. Remplacer l\'API /api/products fictive par l\'intégration Supabase');
      console.log('2. Implémenter la synchronisation du panier avec le profil utilisateur');
      console.log('3. Ajouter une validation stricte des IDs avant création de commande');
      console.log('4. Nettoyer les données existantes avec des IDs invalides');
    }

    if (totalProblems === 0) {
      console.log('✅ Aucun problème détecté ! Toutes les commandes sont cohérentes.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnoseOrders();
