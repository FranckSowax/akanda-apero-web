// Script de diagnostic pour comprendre l'état d'authentification
// À exécuter dans la console du navigateur

console.log('🔍 DIAGNOSTIC ÉTAT AUTHENTIFICATION REACT');
console.log('==========================================');

// 1. Vérifier l'état Supabase direct
async function checkDirectSupabaseState() {
  console.log('\n1️⃣ ÉTAT SUPABASE DIRECT');
  console.log('------------------------');
  
  try {
    // Accéder au client Supabase global s'il existe
    if (window.supabase) {
      console.log('✅ Client Supabase global trouvé');
      
      const { data: { session }, error } = await window.supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur getSession:', error);
        return null;
      }
      
      if (session) {
        console.log('✅ Session Supabase directe:', {
          user_id: session.user.id,
          email: session.user.email,
          expires_at: new Date(session.expires_at * 1000).toLocaleString(),
          is_expired: session.expires_at * 1000 < Date.now()
        });
        return session;
      } else {
        console.log('❌ Aucune session Supabase directe');
        return null;
      }
    } else {
      console.log('❌ Client Supabase global non trouvé');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification directe:', error);
    return null;
  }
}

// 2. Vérifier l'état du hook useAuth via React DevTools
function checkReactAuthState() {
  console.log('\n2️⃣ ÉTAT HOOK USEAUTH REACT');
  console.log('----------------------------');
  
  // Essayer d'accéder aux données React via les dev tools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools disponibles');
    console.log('💡 Inspectez le composant UserAccountLayout dans React DevTools');
    console.log('💡 Recherchez les props: user, loading, session');
  } else {
    console.log('❌ React DevTools non disponibles');
  }
  
  // Chercher des éléments DOM qui pourraient indiquer l'état d'auth
  const authIndicators = [
    document.querySelector('[data-auth-state]'),
    document.querySelector('.auth-loading'),
    document.querySelector('.user-menu'),
    document.querySelector('[data-user-email]')
  ].filter(Boolean);
  
  if (authIndicators.length > 0) {
    console.log('✅ Indicateurs d\'authentification trouvés:', authIndicators.length);
    authIndicators.forEach((el, i) => {
      console.log(`   ${i + 1}. ${el.tagName} - ${el.className} - ${el.textContent?.substring(0, 50)}...`);
    });
  } else {
    console.log('❌ Aucun indicateur d\'authentification trouvé dans le DOM');
  }
}

// 3. Vérifier les erreurs dans la console
function checkConsoleErrors() {
  console.log('\n3️⃣ VÉRIFICATION ERREURS CONSOLE');
  console.log('--------------------------------');
  
  // Intercepter les erreurs futures
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let errorCount = 0;
  let warnCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    if (args.some(arg => typeof arg === 'string' && (
      arg.includes('auth') || 
      arg.includes('session') || 
      arg.includes('user') ||
      arg.includes('hydration')
    ))) {
      console.log(`🚨 ERREUR AUTH DÉTECTÉE #${errorCount}:`, ...args);
    }
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnCount++;
    if (args.some(arg => typeof arg === 'string' && (
      arg.includes('auth') || 
      arg.includes('session') || 
      arg.includes('user') ||
      arg.includes('hydration')
    ))) {
      console.log(`⚠️ WARNING AUTH DÉTECTÉ #${warnCount}:`, ...args);
    }
    originalWarn.apply(console, args);
  };
  
  console.log('✅ Interception des erreurs activée');
  console.log('💡 Les erreurs liées à l\'auth seront maintenant marquées');
  
  // Restaurer après 30 secondes
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log('🔄 Interception des erreurs désactivée');
  }, 30000);
}

// 4. Tester la navigation et observer les changements
function testNavigationFlow() {
  console.log('\n4️⃣ TEST FLUX DE NAVIGATION');
  console.log('---------------------------');
  
  console.log('📍 URL actuelle:', window.location.href);
  console.log('📍 Pathname:', window.location.pathname);
  
  // Vérifier si on est sur la page d'auth
  if (window.location.pathname.includes('/auth')) {
    console.log('✅ Sur la page d\'authentification');
    
    // Chercher les paramètres de redirection
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect_to');
    
    if (redirectTo) {
      console.log('📋 Redirection prévue vers:', redirectTo);
    } else {
      console.log('❌ Aucune redirection configurée');
    }
  } else {
    console.log('📍 Pas sur la page d\'authentification');
  }
  
  // Observer les changements d'URL
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      console.log('🔄 Navigation détectée:', lastUrl, '->', window.location.href);
      lastUrl = window.location.href;
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
  
  console.log('✅ Observation des changements d\'URL activée');
  
  // Arrêter l'observation après 30 secondes
  setTimeout(() => {
    observer.disconnect();
    console.log('🔄 Observation des changements d\'URL désactivée');
  }, 30000);
}

// 5. Diagnostic complet
async function runCompleteDiagnostic() {
  console.log('🚀 DÉBUT DU DIAGNOSTIC COMPLET\n');
  
  const session = await checkDirectSupabaseState();
  checkReactAuthState();
  checkConsoleErrors();
  testNavigationFlow();
  
  console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log('=======================');
  
  if (session) {
    console.log('✅ Session Supabase active détectée');
    console.log('🔍 Le problème semble être dans la synchronisation React/Supabase');
    console.log('💡 Solutions possibles:');
    console.log('   1. Vérifier le hook useAuth pour les erreurs de timing');
    console.log('   2. Vérifier les erreurs d\'hydratation SSR');
    console.log('   3. Forcer un refresh de la session dans useAuth');
  } else {
    console.log('❌ Aucune session Supabase active');
    console.log('💡 L\'utilisateur doit se connecter');
  }
  
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  console.log('1. Observez les erreurs interceptées pendant 30 secondes');
  console.log('2. Vérifiez React DevTools pour l\'état du hook useAuth');
  console.log('3. Testez la connexion si aucune session active');
}

// Lancer le diagnostic
runCompleteDiagnostic();
