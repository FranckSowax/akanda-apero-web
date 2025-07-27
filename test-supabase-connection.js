/**
 * Script pour tester directement la connexion Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...\n');

  try {
    // Lire les variables d'environnement depuis .env.local
    const envPath = path.join(__dirname, '.env.local');
    let supabaseUrl, supabaseAnonKey;

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
          supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
          supabaseAnonKey = line.split('=')[1].trim();
        }
      }
    }

    // Fallback vers les variables d'environnement système
    if (!supabaseUrl) supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseAnonKey) supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('📋 Configuration Supabase:');
    console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NON CONFIGURÉ');
    console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NON CONFIGURÉ');
    console.log('');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      console.log('💡 Vérifiez votre fichier .env.local');
      return;
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Connexion de base
    console.log('🔌 Test 1: Connexion de base...');
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Échec de connexion:', error.message);
      return;
    }

    // Test 2: Compter les produits
    console.log('\n📊 Test 2: Comptage des produits...');
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log(`✅ ${count} produits trouvés dans la table`);
    } catch (error) {
      console.error('❌ Erreur comptage:', error.message);
    }

    // Test 3: Récupérer quelques produits
    console.log('\n📦 Test 3: Récupération de produits...');
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, is_active')
        .limit(5);
      
      if (error) throw error;
      console.log(`✅ ${products.length} produits récupérés:`);
      products.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} (ID: ${p.id}, Prix: ${p.price}, Actif: ${p.is_active})`);
      });
    } catch (error) {
      console.error('❌ Erreur récupération:', error.message);
      console.error('Détails:', error);
    }

    // Test 4: Vérifier la structure de la table
    console.log('\n🏗️ Test 4: Structure de la table...');
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      if (products.length > 0) {
        console.log('✅ Colonnes disponibles:', Object.keys(products[0]));
      } else {
        console.log('⚠️ Table vide');
      }
    } catch (error) {
      console.error('❌ Erreur structure:', error.message);
    }

    // Test 5: Tester avec jointure categories
    console.log('\n🔗 Test 5: Test avec jointure categories...');
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          categories (id, name)
        `)
        .limit(3);
      
      if (error) throw error;
      console.log(`✅ ${products.length} produits avec catégories:`);
      products.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} - Catégorie: ${p.categories?.name || 'Aucune'}`);
      });
    } catch (error) {
      console.error('❌ Erreur jointure:', error.message);
      console.log('💡 La table categories existe-t-elle ?');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSupabaseConnection();
