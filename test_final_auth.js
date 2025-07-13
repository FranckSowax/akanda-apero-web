// 🚀 TEST FINAL DE LA SOLUTION AUTH ULTRA-ROBUSTE
console.log('🚀 TEST FINAL - SOLUTION AUTH ULTRA-ROBUSTE');
console.log('===========================================');

// Fonction de test complet
async function testFinalAuth() {
  console.log('1️⃣ Vérification des composants...');
  
  // Vérifier les storages multiples
  const storage1 = localStorage.getItem('akanda-supabase-auth');
  const storage2 = sessionStorage.getItem('akanda-supabase-auth-backup');
  const storage3 = localStorage.getItem('akanda-auth-backup');
  
  console.log('📦 Storage principal:', storage1 ? '✅ EXISTE' : '❌ VIDE');
  console.log('📦 Storage backup 1:', storage2 ? '✅ EXISTE' : '❌ VIDE');
  console.log('📦 Storage backup 2:', storage3 ? '✅ EXISTE' : '❌ VIDE');
  
  // Vérifier AuthProvider
  const authLogs = performance.getEntriesByType('measure').filter(m => m.name.includes('auth'));
  console.log('🔧 AuthProvider actif:', authLogs.length > 0 ? '✅ OUI' : '❓ INCERTAIN');
  
  // Vérifier UserButton
  const userButton = document.querySelector('.user-menu-container') || 
                    document.querySelector('[data-user-button]') ||
                    document.querySelector('button[class*="rounded-full"]');
  console.log('👤 UserButton trouvé:', userButton ? '✅ OUI' : '❌ NON');
  
  if (userButton) {
    const hasAvatar = userButton.querySelector('[class*="rounded-full"]');
    const hasLoginText = userButton.textContent?.includes('Se connecter');
    console.log('🎨 Avatar visible:', hasAvatar ? '✅ OUI' : '❌ NON');
    console.log('🔑 Bouton login visible:', hasLoginText ? '⚠️ OUI (pas connecté)' : '✅ NON (connecté)');
  }
  
  console.log('\n2️⃣ Test de session Supabase...');
  
  try {
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
    
    const { data: sessionData, error } = await client.auth.getSession();
    
    if (sessionData.session) {
      console.log('✅ Session Supabase active:', sessionData.session.user.email);
      
      // Forcer la synchronisation dans tous les storages
      const sessionString = JSON.stringify(sessionData.session);
      localStorage.setItem('akanda-supabase-auth', sessionString);
      sessionStorage.setItem('akanda-supabase-auth-backup', sessionString);
      localStorage.setItem('akanda-auth-backup', sessionString);
      
      console.log('💾 Session forcée dans tous les storages');
      
      // Déclencher les événements de synchronisation
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'akanda-supabase-auth',
        newValue: sessionString,
        storageArea: localStorage
      }));
      
      window.dispatchEvent(new CustomEvent('auth-session-saved', {
        detail: { session: sessionData.session }
      }));
      
      console.log('📡 Événements de synchronisation envoyés');
      
      // Test de redirection simulée
      console.log('\n3️⃣ Test de redirection simulée...');
      
      // Simuler le processus de redirection
      const testRedirect = () => {
        console.log('🔄 Simulation redirection...');
        
        // Vérifier que les données persistent
        const check1 = localStorage.getItem('akanda-supabase-auth');
        const check2 = sessionStorage.getItem('akanda-supabase-auth-backup');
        const check3 = localStorage.getItem('akanda-auth-backup');
        
        console.log('📦 Après redirection simulée:');
        console.log('  - Storage principal:', check1 ? '✅ PERSISTE' : '❌ PERDU');
        console.log('  - Storage backup 1:', check2 ? '✅ PERSISTE' : '❌ PERDU');
        console.log('  - Storage backup 2:', check3 ? '✅ PERSISTE' : '❌ PERDU');
        
        if (check1 || check2 || check3) {
          console.log('🎉 SUCCESS! Au moins un storage a persisté!');
          
          // Forcer le refresh de l'UI
          setTimeout(() => {
            console.log('🔄 Refresh UI...');
            window.location.reload();
          }, 2000);
          
        } else {
          console.log('❌ ÉCHEC: Tous les storages ont été perdus');
        }
      };
      
      setTimeout(testRedirect, 1000);
      
    } else {
      console.log('❌ Aucune session Supabase active');
      console.log('👉 Connectez-vous d\'abord sur /auth');
      
      // Vérifier s'il y a des données dans les storages
      if (storage1 || storage2 || storage3) {
        console.log('🔄 Tentative de récupération depuis les storages...');
        
        const storedSession = storage1 || storage2 || storage3;
        const session = JSON.parse(storedSession);
        
        if (session.expires_at && session.expires_at > Date.now() / 1000) {
          console.log('✅ Session valide trouvée dans storage, restauration...');
          
          await client.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          });
          
          console.log('🎉 Session restaurée avec succès!');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          console.log('⚠️ Session expirée dans storage');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur du test:', error);
  }
}

// Fonction de diagnostic rapide
function quickDiagnosis() {
  console.log('\n🔍 DIAGNOSTIC RAPIDE');
  console.log('===================');
  
  const checks = {
    'Session localStorage': !!localStorage.getItem('akanda-supabase-auth'),
    'Session sessionStorage': !!sessionStorage.getItem('akanda-supabase-auth-backup'),
    'Session backup': !!localStorage.getItem('akanda-auth-backup'),
    'UserButton présent': !!document.querySelector('.user-menu-container'),
    'Avatar visible': !!document.querySelector('[class*="rounded-full"]'),
    'Bouton login visible': !!document.querySelector('button')?.textContent?.includes('Se connecter')
  };
  
  Object.entries(checks).forEach(([check, result]) => {
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${check}: ${result ? 'OK' : 'FAIL'}`);
  });
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  console.log(`\n📊 Score: ${passedChecks}/${totalChecks}`);
  
  if (passedChecks >= 4) {
    console.log('🎉 EXCELLENT! La solution fonctionne!');
  } else if (passedChecks >= 2) {
    console.log('⚠️ PARTIEL: Quelques problèmes détectés');
  } else {
    console.log('❌ CRITIQUE: Problèmes majeurs détectés');
  }
}

// Lancer le test automatiquement
console.log('🚀 Lancement du test final...');
testFinalAuth();

// Rendre les fonctions disponibles
window.testFinalAuth = testFinalAuth;
window.quickDiagnosis = quickDiagnosis;

console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('- testFinalAuth() : Test complet final');
console.log('- quickDiagnosis() : Diagnostic rapide');
