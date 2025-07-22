// Script de diagnostic pour le problème d'authentification sur "Mes commandes"
// À exécuter dans la console du navigateur sur la page d'accueil

console.log('🔍 DIAGNOSTIC AUTHENTIFICATION - MES COMMANDES');
console.log('================================================');

// 1. Vérifier l'état de l'authentification Supabase
async function checkSupabaseAuth() {
  console.log('\n1️⃣ VÉRIFICATION AUTHENTIFICATION SUPABASE');
  console.log('-------------------------------------------');
  
  try {
    // Importer le client Supabase (ajustez le chemin si nécessaire)
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    
    // Utiliser les mêmes paramètres que votre app
    const supabaseUrl = 'https://xjlgqrjlwwdkqzrxdnqw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbGdxcmpsd3dka3F6cnhkbnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MjIyNzYsImV4cCI6MjA1MTM5ODI3Nn0.8gNYUKGnNGwqbKbEgXCgHGBwwCPVJJqWZHgLzNLGgzw';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Récupérer la session actuelle
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Session Supabase trouvée:', {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: new Date(session.expires_at * 1000).toLocaleString(),
        access_token_length: session.access_token.length,
        refresh_token_length: session.refresh_token?.length || 'N/A'
      });
      return true;
    } else {
      console.log('❌ Aucune session Supabase active');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification Supabase:', error);
    return false;
  }
}

// 2. Vérifier le localStorage
function checkLocalStorage() {
  console.log('\n2️⃣ VÉRIFICATION LOCALSTORAGE');
  console.log('-----------------------------');
  
  const supabaseKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('supabase')) {
      supabaseKeys.push(key);
    }
  }
  
  if (supabaseKeys.length > 0) {
    console.log('✅ Clés Supabase trouvées dans localStorage:', supabaseKeys);
    
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        console.log(`📄 ${key}:`, {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          hasUser: !!parsed.user,
          userEmail: parsed.user?.email,
          expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A'
        });
      } catch (e) {
        console.log(`📄 ${key}: (non-JSON)`, value?.substring(0, 100) + '...');
      }
    });
  } else {
    console.log('❌ Aucune clé Supabase trouvée dans localStorage');
  }
}

// 3. Vérifier les cookies
function checkCookies() {
  console.log('\n3️⃣ VÉRIFICATION COOKIES');
  console.log('------------------------');
  
  const cookies = document.cookie.split(';');
  const supabaseCookies = cookies.filter(cookie => 
    cookie.toLowerCase().includes('supabase') || 
    cookie.toLowerCase().includes('auth') ||
    cookie.toLowerCase().includes('session')
  );
  
  if (supabaseCookies.length > 0) {
    console.log('✅ Cookies d\'authentification trouvés:', supabaseCookies.map(c => c.trim()));
  } else {
    console.log('❌ Aucun cookie d\'authentification trouvé');
  }
}

// 4. Tester la navigation vers "Mes commandes"
function testOrdersNavigation() {
  console.log('\n4️⃣ TEST NAVIGATION MES COMMANDES');
  console.log('----------------------------------');
  
  // Chercher tous les liens "Mes commandes"
  const orderLinks = Array.from(document.querySelectorAll('a')).filter(link => 
    link.textContent.toLowerCase().includes('mes commandes') ||
    link.textContent.toLowerCase().includes('commandes') ||
    link.href.includes('commandes')
  );
  
  console.log(`📍 Trouvé ${orderLinks.length} lien(s) vers les commandes:`);
  orderLinks.forEach((link, index) => {
    console.log(`   ${index + 1}. "${link.textContent.trim()}" -> ${link.href}`);
  });
  
  // Vérifier si on peut accéder à la page
  if (orderLinks.length > 0) {
    console.log('\n🔗 Test d\'accès à la page commandes...');
    console.log('Cliquez sur un des liens ci-dessus pour tester la navigation');
    console.log('Si vous êtes redirigé vers /auth, le problème est confirmé');
  }
}

// 5. Vérifier l'état du contexte React (si accessible)
function checkReactContext() {
  console.log('\n5️⃣ VÉRIFICATION CONTEXTE REACT');
  console.log('-------------------------------');
  
  // Essayer d'accéder aux données React via les dev tools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools détectés');
    console.log('💡 Ouvrez les React DevTools pour inspecter le contexte d\'authentification');
  } else {
    console.log('❌ React DevTools non détectés');
  }
  
  // Vérifier si des variables globales d'auth existent
  if (window.user || window.session || window.auth) {
    console.log('✅ Variables d\'authentification globales trouvées:', {
      user: !!window.user,
      session: !!window.session,
      auth: !!window.auth
    });
  } else {
    console.log('❌ Aucune variable d\'authentification globale trouvée');
  }
}

// Exécuter tous les diagnostics
async function runFullDiagnostic() {
  console.log('🚀 DÉBUT DU DIAGNOSTIC COMPLET\n');
  
  const isAuthenticated = await checkSupabaseAuth();
  checkLocalStorage();
  checkCookies();
  testOrdersNavigation();
  checkReactContext();
  
  console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log('=======================');
  
  if (isAuthenticated) {
    console.log('✅ L\'utilisateur semble être connecté à Supabase');
    console.log('🔍 Le problème pourrait être:');
    console.log('   - Un problème de timing dans le hook useAuth');
    console.log('   - Une condition de redirection trop stricte');
    console.log('   - Un problème de synchronisation entre les composants');
  } else {
    console.log('❌ L\'utilisateur n\'est PAS connecté à Supabase');
    console.log('🔍 Solutions possibles:');
    console.log('   - Se reconnecter via la page de connexion');
    console.log('   - Vider le cache/localStorage et se reconnecter');
    console.log('   - Vérifier les paramètres Supabase');
  }
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('1. Si connecté: vérifier le code du hook useAuth');
  console.log('2. Si non connecté: se reconnecter et tester à nouveau');
  console.log('3. Tester la navigation vers /mon-compte/commandes');
}

// Lancer le diagnostic
runFullDiagnostic();
