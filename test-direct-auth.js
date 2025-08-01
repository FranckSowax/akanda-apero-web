// Test direct de l'authentification Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔐 Test d\'authentification directe...\n');

async function testAuth() {
  try {
    // Test 1: Connexion avec l'utilisateur existant
    console.log('1. Tentative de connexion avec moutouki.lbv@gmail.com...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'moutouki.lbv@gmail.com',
      password: 'motdepasse123' // Mot de passe par défaut
    });
    
    if (authError) {
      console.log('❌ Échec de connexion:', authError.message);
      
      // Essayons de créer l'utilisateur s'il n'existe pas
      console.log('\n2. Tentative de création du compte...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'moutouki.lbv@gmail.com',
        password: 'motdepasse123',
        options: {
          data: {
            first_name: 'FRANCK',
            last_name: 'SOWAX'
          }
        }
      });
      
      if (signUpError) {
        console.log('❌ Échec de création:', signUpError.message);
        return;
      }
      
      console.log('✅ Compte créé:', signUpData.user?.email);
      
      // Réessayons la connexion
      console.log('\n3. Nouvelle tentative de connexion...');
      const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
        email: 'moutouki.lbv@gmail.com',
        password: 'motdepasse123'
      });
      
      if (authError2) {
        console.log('❌ Échec de la nouvelle connexion:', authError2.message);
        return;
      }
      
      console.log('✅ Connexion réussie après création');
    } else {
      console.log('✅ Connexion réussie directement');
    }
    
    // Test 2: Vérifier la session
    console.log('\n4. Vérification de la session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erreur session:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ Aucune session active');
      return;
    }
    
    console.log('✅ Session active:', session.user.email);
    
    // Test 3: Récupérer les commandes avec la session
    console.log('\n5. Test de récupération des commandes avec session...');
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', session.user.email)
      .single();
      
    if (customerError) {
      console.log('❌ Client non trouvé:', customerError.message);
      return;
    }
    
    console.log('✅ Client trouvé:', customer.first_name, customer.last_name);
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        order_items (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
      
    if (ordersError) {
      console.log('❌ Erreur commandes:', ordersError.message);
      return;
    }
    
    console.log(`✅ ${orders.length} commandes récupérées`);
    orders.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA)`);
      if (order.order_items) {
        order.order_items.forEach(item => {
          console.log(`     • ${item.product_name} x${item.quantity}`);
        });
      }
    });
    
    console.log('\n🎉 Test complet réussi !');
    console.log('\n💡 Instructions pour l\'application web:');
    console.log('1. Allez sur http://localhost:3003/auth');
    console.log('2. Connectez-vous avec:');
    console.log('   Email: moutouki.lbv@gmail.com');
    console.log('   Mot de passe: motdepasse123');
    console.log('3. Naviguez vers /mon-compte/commandes');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAuth();
