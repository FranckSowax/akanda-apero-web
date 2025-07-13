// Test direct de la session Supabase
// À exécuter dans la console du navigateur

console.log('🔍 Test direct de la session Supabase...');

// Importer le client Supabase (si disponible globalement)
if (typeof window !== 'undefined' && window.supabase) {
  const supabase = window.supabase;
  
  // Test 1: getSession()
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('📊 getSession() résultat:', {
      hasSession: !!data.session,
      user: data.session?.user?.email,
      error: error?.message,
      sessionData: data.session
    });
  });
  
  // Test 2: getUser()
  supabase.auth.getUser().then(({ data, error }) => {
    console.log('👤 getUser() résultat:', {
      hasUser: !!data.user,
      user: data.user?.email,
      error: error?.message,
      userData: data.user
    });
  });
  
  // Test 3: Vérifier localStorage
  console.log('💾 localStorage Supabase:', {
    keys: Object.keys(localStorage).filter(k => k.includes('supabase')),
    authToken: localStorage.getItem('sb-' + 'your-project-ref' + '-auth-token')
  });
  
} else {
  console.log('❌ Supabase client non disponible globalement');
  
  // Alternative: vérifier localStorage directement
  console.log('💾 Clés localStorage:', Object.keys(localStorage));
  console.log('🔑 Clés contenant "supabase":', Object.keys(localStorage).filter(k => k.includes('supabase')));
}
