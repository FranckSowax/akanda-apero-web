// 🚀 SCRIPT DE TEST DE LA SOLUTION AUTH RADICALE
// À exécuter dans la console du navigateur

console.log('🚀 TEST DE LA SOLUTION AUTH RADICALE');
console.log('=====================================');

async function testAuthSolution() {
  try {
    console.log('1️⃣ Vérification de l\'état initial...');
    
    // Vérifier localStorage
    const storedAuth = localStorage.getItem('akanda-supabase-auth');
    console.log('📦 localStorage:', storedAuth ? 'EXISTE' : 'VIDE');
    
    // Vérifier si AuthProvider est actif
    const authProviderActive = window.React && document.querySelector('[data-auth-provider]');
    console.log('🔧 AuthProvider:', authProviderActive ? 'ACTIF' : 'INACTIF');
    
    // Vérifier UserButton
    const userButton = document.querySelector('.user-menu-container') || 
                      document.querySelector('[data-user-button]');
    console.log('👤 UserButton:', userButton ? 'TROUVÉ' : 'NON TROUVÉ');
    
    console.log('\n2️⃣ Test de connexion...');
    
    // Importer Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
    const client = createClient(
      'https://mcdpzoisorbnhkjhljaj.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'akanda-supabase-auth',
          detectSessionInUrl: true,
          flowType: 'pkce',
        }
      }
    );
    
    // Vérifier session actuelle
    const { data: sessionData, error } = await client.auth.getSession();
    
    if (sessionData.session) {
      console.log('✅ Session Supabase trouvée:', sessionData.session.user.email);
      
      // Forcer la sauvegarde
      localStorage.setItem('akanda-supabase-auth', JSON.stringify(sessionData.session));
      console.log('💾 Session forcée dans localStorage');
      
      // Déclencher un événement pour notifier AuthProvider
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'akanda-supabase-auth',
        newValue: JSON.stringify(sessionData.session),
        storageArea: localStorage
      }));
      
      console.log('📡 Événement de synchronisation envoyé');
      
      // Attendre un peu puis vérifier l'UI
      setTimeout(() => {
        const userButton = document.querySelector('.user-menu-container');
        const avatar = document.querySelector('[class*="rounded-full"]');
        
        console.log('\n3️⃣ Vérification de l\'UI...');
        console.log('👤 UserButton après sync:', userButton ? 'TROUVÉ' : 'NON TROUVÉ');
        console.log('🎨 Avatar visible:', avatar ? 'OUI' : 'NON');
        
        if (avatar) {
          console.log('🎉 SUCCESS! L\'avatar est maintenant visible!');
          console.log('✅ Solution auth radicale FONCTIONNELLE');
        } else {
          console.log('⚠️ Avatar pas encore visible, rechargement nécessaire...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 2000);
      
    } else {
      console.log('❌ Aucune session Supabase - Connectez-vous d\'abord');
      console.log('👉 Allez sur /auth et connectez-vous avec moutouki.lbv@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Erreur du test:', error);
  }
}

// Fonction de diagnostic complet
function diagnosisComplete() {
  console.log('\n🔍 DIAGNOSTIC COMPLET');
  console.log('====================');
  
  // Vérifier tous les éléments
  const checks = {
    'localStorage auth': !!localStorage.getItem('akanda-supabase-auth'),
    'UserButton element': !!document.querySelector('.user-menu-container'),
    'Avatar element': !!document.querySelector('[class*="rounded-full"]'),
    'Auth context': !!window.React,
    'Multiple clients warning': false // À vérifier dans les logs
  };
  
  Object.entries(checks).forEach(([check, result]) => {
    console.log(`${result ? '✅' : '❌'} ${check}: ${result ? 'OK' : 'FAIL'}`);
  });
  
  console.log('\n📊 RÉSUMÉ:');
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  console.log(`${passedChecks}/${totalChecks} vérifications passées`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 TOUT FONCTIONNE!');
  } else {
    console.log('⚠️ Problèmes détectés - Exécutez testAuthSolution()');
  }
}

// Exécuter le test
console.log('🚀 Lancement du test automatique...');
testAuthSolution();

// Rendre les fonctions disponibles globalement
window.testAuthSolution = testAuthSolution;
window.diagnosisComplete = diagnosisComplete;

console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('- testAuthSolution() : Test complet de la solution');
console.log('- diagnosisComplete() : Diagnostic rapide');
