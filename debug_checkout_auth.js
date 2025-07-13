// Script de débogage pour tester l'authentification sur la page checkout
// À exécuter dans la console du navigateur

console.log('🔍 DÉBOGAGE AUTHENTIFICATION CHECKOUT');

// Fonction pour vérifier l'état d'authentification
async function checkAuthState() {
  console.log('📊 Vérification de l\'état d\'authentification...');
  
  try {
    // Importer Supabase (si disponible globalement)
    if (typeof window !== 'undefined' && window.supabase) {
      const { data: { session }, error } = await window.supabase.auth.getSession();
      
      console.log('🔐 Session Supabase:', {
        session: session,
        user: session?.user,
        email: session?.user?.email,
        expires_at: session?.expires_at,
        error: error
      });
      
      return session;
    } else {
      console.log('❌ Supabase non disponible globalement');
    }
  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err);
  }
}

// Fonction pour surveiller les changements d'authentification
function monitorAuthChanges() {
  console.log('👀 Surveillance des changements d\'authentification...');
  
  if (typeof window !== 'undefined' && window.supabase) {
    window.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Changement d\'authentification:', {
        event: event,
        session: session,
        user: session?.user,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Fonction pour tester la navigation vers checkout
function testCheckoutNavigation() {
  console.log('🧪 Test de navigation vers checkout...');
  
  // Vérifier l'état actuel
  checkAuthState().then(session => {
    if (session) {
      console.log('✅ Utilisateur connecté, navigation vers checkout possible');
      console.log('🔗 URL de test: /checkout');
    } else {
      console.log('❌ Utilisateur non connecté, redirection vers /auth nécessaire');
      console.log('🔗 URL de redirection: /auth');
    }
  });
}

// Fonction pour forcer une actualisation de l'authentification
async function forceAuthRefresh() {
  console.log('🔄 Forçage de l\'actualisation de l\'authentification...');
  
  if (typeof window !== 'undefined' && window.supabase) {
    try {
      const { data, error } = await window.supabase.auth.refreshSession();
      console.log('🔄 Résultat de l\'actualisation:', {
        data: data,
        error: error
      });
    } catch (err) {
      console.error('❌ Erreur lors de l\'actualisation:', err);
    }
  }
}

// Exécution automatique
console.log('🚀 Démarrage du débogage...');
checkAuthState();
monitorAuthChanges();

// Fonctions disponibles dans la console
window.debugCheckout = {
  checkAuth: checkAuthState,
  testNavigation: testCheckoutNavigation,
  forceRefresh: forceAuthRefresh,
  monitor: monitorAuthChanges
};

console.log('🛠️ Fonctions disponibles:');
console.log('- debugCheckout.checkAuth() - Vérifier l\'état d\'auth');
console.log('- debugCheckout.testNavigation() - Tester la navigation');
console.log('- debugCheckout.forceRefresh() - Forcer l\'actualisation');
console.log('- debugCheckout.monitor() - Surveiller les changements');
