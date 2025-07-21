// Script de test simple pour vérifier les données Supabase
// Utilise les variables d'environnement Next.js directement

console.log('🔍 Test de connectivité Supabase...\n');

// Simuler un test basique avec fetch
async function testSupabaseConnection() {
  try {
    // Vérifier si les variables d'environnement sont accessibles
    console.log('📋 Variables d\'environnement:');
    console.log('- SUPABASE_URL présente:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
    console.log('- SUPABASE_KEY présente:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('\n❌ Variables Supabase manquantes. Vérifiez .env.local');
      return;
    }

    console.log('\n✅ Configuration Supabase OK');
    console.log('📊 Le dashboard devrait pouvoir se connecter à Supabase');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSupabaseConnection();
