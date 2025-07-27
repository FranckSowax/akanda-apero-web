/**
 * Script pour vérifier les produits et leurs IDs
 * Utilise l'API Next.js pour éviter les problèmes d'environnement
 */

const fetch = require('node-fetch');

async function checkProducts() {
  console.log('🔍 Vérification des produits et de leurs IDs...\n');

  try {
    // Vérifier si le serveur de développement est en cours d'exécution
    const baseUrl = 'http://localhost:3002';
    
    console.log('📡 Test de connexion à l\'API...');
    
    // Tester la connexion
    try {
      const testResponse = await fetch(`${baseUrl}/api/products?limit=1`);
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}`);
      }
      console.log('✅ Connexion API réussie\n');
    } catch (error) {
      console.log('❌ Impossible de se connecter à l\'API Next.js');
      console.log('💡 Assurez-vous que le serveur de développement est démarré avec: npm run dev');
      console.log('🔗 URL testée:', baseUrl);
      return;
    }

    // Récupérer tous les produits
    console.log('📦 Récupération des produits...');
    const response = await fetch(`${baseUrl}/api/products?limit=100`);
    
    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erreur dans la réponse API:', data.error);
      return;
    }

    const products = data.data || [];
    console.log(`✅ ${products.length} produits récupérés\n`);

    // Analyser les produits
    let validProducts = 0;
    let invalidProducts = 0;
    let duplicateIds = new Map();
    let problems = [];

    console.log('🔍 Analyse des produits:\n');

    products.forEach((product, index) => {
      const productNumber = index + 1;
      let hasProblems = false;
      let productProblems = [];

      // Vérifier l'ID (accepter les UUIDs et les entiers)
      if (product.id === undefined || product.id === null) {
        productProblems.push('ID manquant');
        hasProblems = true;
      } else if (typeof product.id === 'string') {
        // Vérifier si c'est un UUID valide
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(product.id)) {
          productProblems.push(`ID string invalide (pas un UUID): ${product.id}`);
          hasProblems = true;
        }
      } else if (typeof product.id === 'number') {
        if (product.id <= 0) {
          productProblems.push(`ID numérique invalide (≤ 0): ${product.id}`);
          hasProblems = true;
        }
      } else {
        productProblems.push(`Type d'ID invalide: ${typeof product.id}`);
        hasProblems = true;
      }
      
      if (!hasProblems) {
        // Vérifier les doublons
        if (duplicateIds.has(product.id)) {
          duplicateIds.set(product.id, duplicateIds.get(product.id) + 1);
          productProblems.push(`ID dupliqué: ${product.id}`);
          hasProblems = true;
        } else {
          duplicateIds.set(product.id, 1);
        }
      }

      // Vérifier les autres champs critiques
      if (!product.name || product.name.trim() === '') {
        productProblems.push('Nom manquant');
        hasProblems = true;
      }

      if (product.price === undefined || product.price === null || product.price <= 0) {
        productProblems.push(`Prix invalide: ${product.price}`);
        hasProblems = true;
      }

      if (!product.category && !product.categorySlug) {
        productProblems.push('Catégorie manquante');
        hasProblems = true;
      }

      // Compter et afficher
      if (hasProblems) {
        invalidProducts++;
        console.log(`❌ Produit ${productNumber}: ${product.name || 'Sans nom'}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Problèmes:`);
        productProblems.forEach(problem => {
          console.log(`   - ${problem}`);
        });
        console.log('');
        problems.push({
          index: productNumber,
          product,
          problems: productProblems
        });
      } else {
        validProducts++;
        console.log(`✅ Produit ${productNumber}: ${product.name} (ID: ${product.id})`);
      }
    });

    // Vérifier les IDs dupliqués
    const duplicates = Array.from(duplicateIds.entries()).filter(([id, count]) => count > 1);
    
    console.log('\n📊 RÉSUMÉ DE L\'ANALYSE:');
    console.log('========================');
    console.log(`Total produits: ${products.length}`);
    console.log(`Produits valides: ${validProducts}`);
    console.log(`Produits avec problèmes: ${invalidProducts}`);
    console.log(`IDs dupliqués: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      console.log('\n🔄 IDs DUPLIQUÉS:');
      duplicates.forEach(([id, count]) => {
        console.log(`   ID ${id}: ${count} occurrences`);
      });
    }

    console.log(`\nTaux de validité: ${((validProducts / products.length) * 100).toFixed(1)}%`);

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('==================');
    
    if (invalidProducts === 0 && duplicates.length === 0) {
      console.log('✅ Tous les produits ont des IDs valides et uniques !');
      console.log('🎯 Le système de produits est en bon état.');
    } else {
      console.log('🔧 Actions recommandées:');
      
      if (invalidProducts > 0) {
        console.log(`1. Corriger ${invalidProducts} produits avec des problèmes d'ID`);
        console.log('2. Vérifier la logique de génération des IDs');
      }
      
      if (duplicates.length > 0) {
        console.log('3. Résoudre les IDs dupliqués');
        console.log('4. Implémenter une contrainte d\'unicité en base');
      }
      
      console.log('5. Utiliser l\'intégration Supabase pour des IDs auto-générés');
    }

    // Tester l'API de commandes si possible
    console.log('\n🛒 Test de l\'API des commandes...');
    try {
      const ordersResponse = await fetch(`${baseUrl}/api/orders?limit=5`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log(`✅ API commandes accessible - ${ordersData.data?.length || 0} commandes trouvées`);
      } else {
        console.log('⚠️ API commandes non accessible');
      }
    } catch (error) {
      console.log('⚠️ Impossible de tester l\'API commandes');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécuter la vérification
checkProducts();
