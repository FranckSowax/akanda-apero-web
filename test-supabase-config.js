// Script pour tester et corriger la configuration Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration correcte obtenue via MCP
const CORRECT_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

console.log('🔧 Test de la configuration Supabase...\n');

// Configuration actuelle depuis .env.local
const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const currentKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Configuration actuelle:');
console.log('URL:', currentUrl);
console.log('Key:', currentKey ? `${currentKey.substring(0, 50)}...` : 'NON DÉFINIE');

console.log('\n📋 Configuration correcte:');
console.log('URL:', CORRECT_URL);
console.log('Key:', `${CORRECT_ANON_KEY.substring(0, 50)}...`);

console.log('\n🔍 Comparaison:');
console.log('URL correcte:', currentUrl === CORRECT_URL ? '✅' : '❌');
console.log('Key correcte:', currentKey === CORRECT_ANON_KEY ? '✅' : '❌');

// Test avec la configuration correcte
console.log('\n🧪 Test de connexion avec la configuration correcte...');

async function testConnection() {
  try {
    const supabase = createClient(CORRECT_URL, CORRECT_ANON_KEY);
    
    // Test 1: Connexion de base
    console.log('1. Test de connexion de base...');
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    
    console.log('✅ Connexion réussie');
    
    // Test 2: Récupération du client FRANCK SOWAX
    console.log('2. Test de récupération du client...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', 'moutouki.lbv@gmail.com')
      .single();
      
    if (customerError) {
      console.error('❌ Erreur récupération client:', customerError);
      return;
    }
    
    console.log('✅ Client récupéré:', customer.first_name, customer.last_name);
    
    // Test 3: Récupération des commandes
    console.log('3. Test de récupération des commandes...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        order_items (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('customer_id', customer.id);
      
    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError);
      return;
    }
    
    console.log(`✅ ${orders.length} commandes récupérées`);
    orders.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA)`);
    });
    
    console.log('\n🎉 Tous les tests sont passés ! La configuration Supabase fonctionne.');
    console.log('\n💡 Si l\'application web ne fonctionne toujours pas, vérifiez:');
    console.log('1. Que les variables d\'environnement sont correctes dans .env.local');
    console.log('2. Que le serveur de développement a été redémarré après modification');
    console.log('3. Que le cache du navigateur a été vidé');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testConnection();
