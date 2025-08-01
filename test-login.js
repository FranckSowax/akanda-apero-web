// Script pour tester la connexion avec un email existant
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔐 Test de connexion...\n');

  try {
    // Email d'un client existant qui a des commandes
    const testEmail = 'sowaxcom@gmail.com'; // Client existant avec un email valide
    const testPassword = 'test123456'; // Mot de passe temporaire
    
    console.log('📧 Tentative de connexion avec:', testEmail);
    
    // Essayer de se connecter
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('❌ Erreur de connexion:', loginError.message);
      
      // Si l'utilisateur n'existe pas, le créer
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('🔧 Création du compte utilisateur...');
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword
        });
        
        if (signupError) {
          console.error('❌ Erreur lors de la création:', signupError);
        } else {
          console.log('✅ Compte créé avec succès:', signupData.user?.email);
        }
      }
    } else {
      console.log('✅ Connexion réussie:', loginData.user?.email);
    }

    // Vérifier les commandes pour cet utilisateur
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (customer) {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount')
        .eq('customer_id', customer.id);

      console.log(`\n📦 ${orders?.length || 0} commandes trouvées pour ce client`);
      orders?.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status} (${order.total_amount} FCFA)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testLogin();
