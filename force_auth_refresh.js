// Script pour forcer le refresh de l'état d'authentification
// À exécuter dans la console après connexion

console.log('🔄 Forçage du refresh d\'authentification...');

async function forceAuthRefresh() {
  try {
    console.log('1️⃣ Vérification de la session actuelle...');
    
    // Créer un client Supabase temporaire
    const supabaseUrl = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
    
    // Charger Supabase si nécessaire
    if (typeof window.supabase === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
    
    const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'akanda-supabase-auth',
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    });
    
    // Vérifier la session
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur session:', error);
      return;
    }
    
    console.log('📊 Session trouvée:', {
      isConnected: !!session,
      user: session?.user?.email,
      expiresAt: session?.expires_at
    });
    
    if (session && session.user) {
      console.log('✅ Utilisateur connecté détecté!');
      
      // 2. Forcer le re-render des composants React
      console.log('2️⃣ Forçage du re-render React...');
      
      // Déclencher des événements pour forcer le refresh
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new CustomEvent('auth-refresh', {
        detail: { user: session.user, session: session }
      }));
      
      // 3. Manipuler le DOM directement si nécessaire
      setTimeout(() => {
        console.log('3️⃣ Vérification du DOM...');
        
        const loginIcon = document.querySelector('.lucide-log-in');
        const avatar = document.querySelector('.rounded-full.bg-gradient-to-br.from-indigo-500');
        
        if (loginIcon && !avatar) {
          console.log('⚠️ DOM pas encore mis à jour, rechargement nécessaire');
          console.log('🔄 Rechargement automatique dans 2 secondes...');
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (avatar) {
          console.log('✅ Avatar trouvé! Problème résolu.');
        }
      }, 1000);
      
    } else {
      console.log('❌ Aucune session active - Reconnexion nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour forcer un rechargement complet
function hardRefresh() {
  console.log('🔄 Rechargement complet...');
  window.location.reload(true);
}

// Fonction pour nettoyer et forcer la reconnexion
async function cleanAndForceReconnect() {
  console.log('🧹 Nettoyage et reconnexion forcée...');
  
  // Nettoyer le localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('🗑️ Supprimé:', key);
    }
  });
  
  // Attendre et recharger
  setTimeout(() => {
    console.log('🔄 Rechargement...');
    window.location.href = '/auth';
  }, 1000);
}

// Fonction pour injecter du CSS de debug
function debugAuthUI() {
  console.log('🎨 Ajout de styles de debug...');
  
  const style = document.createElement('style');
  style.textContent = `
    .lucide-log-in {
      border: 3px solid red !important;
      background: rgba(255,0,0,0.1) !important;
    }
    .rounded-full.bg-gradient-to-br.from-indigo-500 {
      border: 3px solid green !important;
      box-shadow: 0 0 10px green !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('🎨 Styles appliqués - Icône de connexion = rouge, Avatar = vert');
}

// Exécuter le forçage
forceAuthRefresh();

// Exposer les fonctions
window.forceAuthRefresh = forceAuthRefresh;
window.hardRefresh = hardRefresh;
window.cleanAndForceReconnect = cleanAndForceReconnect;
window.debugAuthUI = debugAuthUI;

console.log('\n🛠️ FONCTIONS DISPONIBLES:');
console.log('- forceAuthRefresh() : Force le refresh de l\'auth');
console.log('- hardRefresh() : Rechargement complet');
console.log('- cleanAndForceReconnect() : Nettoie et redirige vers /auth');
console.log('- debugAuthUI() : Ajoute des styles de debug');
