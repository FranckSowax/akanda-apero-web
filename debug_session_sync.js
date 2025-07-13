// Debug de synchronisation des sessions
// À exécuter dans la console du navigateur

console.log('🔍 DEBUG SYNCHRONISATION SESSION');
console.log('================================');

// Test 1: Vérifier localStorage avec la bonne clé
const authKey = 'akanda-supabase-auth';
const storedAuth = localStorage.getItem(authKey);
console.log('1️⃣ localStorage[akanda-supabase-auth]:', storedAuth ? 'EXISTE' : 'VIDE');

if (storedAuth) {
  try {
    const parsed = JSON.parse(storedAuth);
    console.log('   📊 Contenu:', {
      hasAccessToken: !!parsed.access_token,
      hasRefreshToken: !!parsed.refresh_token,
      expiresAt: parsed.expires_at,
      user: parsed.user?.email
    });
  } catch (e) {
    console.log('   ❌ Erreur parsing:', e);
  }
}

// Test 2: Vérifier toutes les clés Supabase
console.log('2️⃣ Toutes les clés localStorage:');
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log(`   🔑 ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
  }
});

// Test 3: Test direct avec Supabase (si disponible)
if (typeof window !== 'undefined') {
  console.log('3️⃣ Test direct Supabase...');
  
  // Essayer d'importer le client
  import('/src/lib/supabase/client.js').then(({ supabase }) => {
    console.log('   ✅ Client Supabase importé');
    
    // Test getSession
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('   📊 getSession():', {
        hasSession: !!data.session,
        user: data.session?.user?.email,
        error: error?.message
      });
    });
    
    // Test getUser
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('   👤 getUser():', {
        hasUser: !!data.user,
        user: data.user?.email,
        error: error?.message
      });
    });
  }).catch(e => {
    console.log('   ❌ Impossible d\'importer le client:', e);
  });
}

console.log('================================');
