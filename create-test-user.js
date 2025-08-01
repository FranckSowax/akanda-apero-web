// Script pour créer un utilisateur de test avec un email valide
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...\n');

  try {
    // Utiliser un email de test valide
    const testEmail = 'testuser@gmail.com';
    const testPassword = 'test123456';
    const testPhone = '24166871309';
    
    console.log('📧 Email de test:', testEmail);
    console.log('📞 Téléphone de test:', testPhone);
    
    // Étape 1: Créer l'utilisateur dans Supabase Auth
    console.log('\n1. Création de l\'utilisateur dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Utilisateur déjà existant dans Auth');
      } else {
        console.error('❌ Erreur Auth:', authError.message);
        return;
      }
    } else {
      console.log('✅ Utilisateur créé dans Auth:', authData.user?.email);
    }

    // Étape 2: Vérifier/créer le client dans la table customers
    console.log('\n2. Vérification du client dans la table customers...');
    
    // Chercher le client existant
    const { data: existingCustomer, error: searchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (searchError && searchError.code === 'PGRST116') {
      // Client n'existe pas, le créer
      console.log('📝 Création du client dans la table customers...');
      
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          phone: `+241${testPhone}`,
          full_name: 'Test User'
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création client:', createError);
        return;
      } else {
        console.log('✅ Client créé:', newCustomer);
      }
    } else if (existingCustomer) {
      console.log('✅ Client déjà existant:', existingCustomer);
    }

    // Étape 3: Créer une commande de test
    console.log('\n3. Création d\'une commande de test...');
    
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (customer) {
      const { data: testOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: customer.id,
          order_number: `TEST-${Date.now()}`,
          status: 'confirmed',
          total_amount: 25000,
          subtotal: 23500,
          delivery_fee: 1500,
          delivery_address: 'Libreville, Gabon',
          delivery_district: 'Test District',
          delivery_option: 'standard',
          payment_method: 'cash',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erreur création commande:', orderError);
      } else {
        console.log('✅ Commande de test créée:', testOrder.order_number);
        
        // Ajouter des articles à la commande
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert([{
            order_id: testOrder.id,
            product_name: 'Jack Daniels - 70 cl',
            quantity: 1,
            unit_price: 25000,
            subtotal: 25000
          }]);

        if (itemsError) {
          console.error('❌ Erreur ajout articles:', itemsError);
        } else {
          console.log('✅ Articles ajoutés à la commande');
        }
      }
    }

    console.log('\n🎉 Utilisateur de test créé avec succès !');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Mot de passe: ${testPassword}`);
    console.log('\nVous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createTestUser();
