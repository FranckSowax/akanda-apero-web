// Script de diagnostic pour Next.js - Authentification Header
// À exécuter dans la console du navigateur

console.log('🔍 Diagnostic Next.js - Authentification Header...');

// Créer un client Supabase temporaire pour les tests
async function createTempSupabaseClient() {
  const supabaseUrl = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
  
  // Charger Supabase dynamiquement si pas déjà chargé
  if (typeof window.supabase === 'undefined') {
    try {
      // Essayer d'importer depuis CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      
      // Créer le client
      window.tempSupabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'akanda-supabase-auth',
          detectSessionInUrl: true,
          flowType: 'pkce',
        }
      });
      
      console.log('✅ Client Supabase temporaire créé');
      return window.tempSupabase;
      
    } catch (error) {
      console.error('❌ Impossible de charger Supabase:', error);
      return null;
    }
  }
}

async function diagnoseAuth() {
  console.log('🔄 Diagnostic de l\'authentification...');
  
  // 1. Vérifier le localStorage
  console.log('\n📱 1. VÉRIFICATION LOCALSTORAGE:');
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth') || key.includes('akanda')
  );
  
  console.log('🗄️ Clés d\'authentification trouvées:', authKeys);
  
  authKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      const parsed = JSON.parse(value);
      console.log(`📝 ${key}:`, {
        user: parsed?.user?.email || 'Non trouvé',
        access_token: parsed?.access_token ? 'Présent' : 'Absent',
        expires_at: parsed?.expires_at || 'Non défini'
      });
    } catch (e) {
      console.log(`📝 ${key}:`, localStorage.getItem(key));
    }
  });
  
  // 2. Vérifier les éléments DOM
  console.log('\n🎯 2. VÉRIFICATION DOM:');
  const avatar = document.querySelector('.rounded-full.bg-gradient-to-br.from-indigo-500') ||
                document.querySelector('[data-testid="user-avatar"]');
  const loginIcon = document.querySelector('.lucide-log-in');
  const logoutIcon = document.querySelector('.lucide-log-out');
  
  console.log('🔍 Éléments trouvés:', {
    avatar: avatar ? '✅ Trouvé' : '❌ Non trouvé',
    loginIcon: loginIcon ? '✅ Trouvé (PROBLÈME!)' : '❌ Non trouvé',
    logoutIcon: logoutIcon ? '✅ Trouvé' : '❌ Non trouvé'
  });
  
  // 3. Essayer de créer un client Supabase temporaire
  console.log('\n🔧 3. TEST CLIENT SUPABASE:');
  const client = await createTempSupabaseClient();
  
  if (client) {
    try {
      const { data: { session }, error } = await client.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur session:', error);
      } else {
        console.log('📊 Session Supabase:', {
          isConnected: !!session,
          user: session?.user?.email || 'Non connecté',
          expiresAt: session?.expires_at || 'N/A'
        });
        
        if (session && session.user && loginIcon) {
          console.log('🚨 PROBLÈME DÉTECTÉ: Utilisateur connecté mais icône de connexion affichée!');
        }
      }
    } catch (error) {
      console.error('❌ Erreur test session:', error);
    }
  }
  
  // 4. Vérifier les cookies
  console.log('\n🍪 4. VÉRIFICATION COOKIES:');
  const cookies = document.cookie.split(';').filter(cookie => 
    cookie.includes('supabase') || cookie.includes('auth')
  );
  console.log('🍪 Cookies d\'auth:', cookies.length > 0 ? cookies : 'Aucun trouvé');
  
  // 5. Recommandations
  console.log('\n💡 5. RECOMMANDATIONS:');
  
  if (authKeys.length === 0) {
    console.log('❌ Aucune donnée d\'auth trouvée - Vous devez vous reconnecter');
  } else if (loginIcon && !avatar) {
    console.log('⚠️ Problème de synchronisation détecté');
    console.log('🔧 Solutions possibles:');
    console.log('   1. Rechargez la page (Ctrl+F5)');
    console.log('   2. Videz le cache et reconnectez-vous');
    console.log('   3. Utilisez forceReload() ci-dessous');
  } else if (avatar) {
    console.log('✅ Authentification semble correcte');
  }
}

// Fonctions utiles
function forceReload() {
  console.log('🔄 Rechargement forcé...');
  window.location.reload(true);
}

function clearAuthAndReload() {
  console.log('🧹 Nettoyage et rechargement...');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('akanda')) {
      localStorage.removeItem(key);
      console.log('🗑️ Supprimé:', key);
    }
  });
  setTimeout(() => window.location.reload(), 1000);
}

// Exécuter le diagnostic
diagnoseAuth();

// Exposer les fonctions utiles
window.forceReload = forceReload;
window.clearAuthAndReload = clearAuthAndReload;
window.diagnoseAuth = diagnoseAuth;

console.log('\n🛠️ FONCTIONS DISPONIBLES:');
console.log('- forceReload() : Recharge la page');
console.log('- clearAuthAndReload() : Nettoie l\'auth et recharge');
console.log('- diagnoseAuth() : Relance le diagnostic');
