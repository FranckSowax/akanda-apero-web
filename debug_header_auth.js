// Script de diagnostic pour vérifier l'état d'authentification dans le Header
// À exécuter dans la console du navigateur sur la page d'accueil

console.log('🔍 Diagnostic de l\'authentification Header...');

// Vérifier Supabase
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase client non trouvé');
} else {
  console.log('✅ Supabase client disponible');
  
  // Vérifier la session actuelle
  async function checkAuthState() {
    try {
      console.log('🔄 Vérification de la session...');
      
      const { data: { session }, error } = await window.supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur session:', error);
        return;
      }
      
      console.log('📊 État de la session:', {
        session: session,
        user: session?.user,
        email: session?.user?.email,
        accessToken: session?.access_token ? 'Présent' : 'Absent',
        refreshToken: session?.refresh_token ? 'Présent' : 'Absent'
      });
      
      // Vérifier le localStorage
      const localStorageKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      
      console.log('🗄️ Clés localStorage liées à l\'auth:', localStorageKeys);
      
      localStorageKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          console.log(`📝 ${key}:`, value ? JSON.parse(value) : value);
        } catch (e) {
          console.log(`📝 ${key}:`, localStorage.getItem(key));
        }
      });
      
      // Vérifier les hooks React (si disponibles)
      console.log('🔍 Vérification des éléments DOM...');
      
      // Chercher l'avatar ou le bouton de connexion
      const avatar = document.querySelector('[data-testid="user-avatar"]') || 
                    document.querySelector('.rounded-full.bg-gradient-to-br.from-indigo-500');
      const loginButton = document.querySelector('.lucide-log-in');
      
      console.log('🎯 Éléments trouvés:', {
        avatar: avatar ? 'Trouvé' : 'Non trouvé',
        loginButton: loginButton ? 'Trouvé' : 'Non trouvé'
      });
      
      if (avatar) {
        console.log('👤 Avatar trouvé:', avatar);
      }
      
      if (loginButton) {
        console.log('🔑 Bouton de connexion trouvé:', loginButton);
      }
      
      // Forcer un refresh de l'état d'auth
      console.log('🔄 Tentative de refresh de l\'état d\'auth...');
      
      // Écouter les changements d'état d'auth
      window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 Changement d\'état d\'auth:', {
          event: event,
          session: session,
          user: session?.user?.email
        });
      });
      
      // Recommandations
      console.log('\n📋 RECOMMANDATIONS:');
      
      if (session && session.user) {
        console.log('✅ Vous êtes connecté comme:', session.user.email);
        if (loginButton) {
          console.log('⚠️ PROBLÈME: Bouton de connexion affiché alors que vous êtes connecté');
          console.log('🔧 Solution: Rechargez la page ou videz le cache');
        }
      } else {
        console.log('❌ Aucune session active détectée');
        console.log('🔧 Solution: Reconnectez-vous');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
    }
  }
  
  // Fonction pour forcer le refresh
  function forceAuthRefresh() {
    console.log('🔄 Rechargement forcé de la page...');
    window.location.reload();
  }
  
  // Fonction pour nettoyer et reconnecter
  async function cleanAndReconnect() {
    console.log('🧹 Nettoyage et reconnexion...');
    
    // Déconnexion propre
    await window.supabase.auth.signOut();
    
    // Nettoyer le localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Nettoyage terminé. Rechargez la page et reconnectez-vous.');
  }
  
  // Exécuter le diagnostic
  checkAuthState();
  
  // Exposer les fonctions utiles
  window.forceAuthRefresh = forceAuthRefresh;
  window.cleanAndReconnect = cleanAndReconnect;
  
  console.log('\n🛠️ FONCTIONS DISPONIBLES:');
  console.log('- forceAuthRefresh() : Recharge la page');
  console.log('- cleanAndReconnect() : Nettoie et prépare une reconnexion');
}
