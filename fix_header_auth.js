// Script pour corriger l'affichage du Header après connexion
// À exécuter dans la console du navigateur

console.log('🔧 Correction de l\'affichage du Header...');

async function fixHeaderAuth() {
  try {
    // 1. Vérifier la session Supabase
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur session:', error);
      return;
    }
    
    console.log('📊 Session actuelle:', {
      user: session?.user?.email,
      isConnected: !!session
    });
    
    if (session && session.user) {
      console.log('✅ Utilisateur connecté:', session.user.email);
      
      // 2. Forcer le refresh des composants React
      console.log('🔄 Forçage du refresh des composants...');
      
      // Déclencher un événement personnalisé pour forcer le re-render
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { user: session.user, session: session }
      }));
      
      // 3. Attendre un peu puis recharger si nécessaire
      setTimeout(() => {
        const loginIcon = document.querySelector('.lucide-log-in');
        const avatar = document.querySelector('.rounded-full.bg-gradient-to-br.from-indigo-500');
        
        if (loginIcon && !avatar) {
          console.log('⚠️ Problème détecté: icône de connexion toujours visible');
          console.log('🔄 Rechargement de la page...');
          window.location.reload();
        } else if (avatar) {
          console.log('✅ Avatar affiché correctement');
        }
      }, 2000);
      
    } else {
      console.log('❌ Aucune session active');
      console.log('🔑 Veuillez vous reconnecter');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour nettoyer complètement l'auth
async function cleanAuth() {
  console.log('🧹 Nettoyage complet de l\'authentification...');
  
  // Déconnexion
  await window.supabase.auth.signOut();
  
  // Nettoyer localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('🗑️ Supprimé:', key);
    }
  });
  
  console.log('✅ Nettoyage terminé. Rechargez et reconnectez-vous.');
}

// Fonction pour forcer la reconnexion avec vos identifiants
async function forceReconnect() {
  console.log('🔑 Reconnexion forcée...');
  
  try {
    // Nettoyer d'abord
    await window.supabase.auth.signOut();
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reconnecter avec vos identifiants
    const { data, error } = await window.supabase.auth.signInWithPassword({
      email: 'moutouki.lbv@gmail.com',
      password: 'votre_mot_de_passe' // Remplacez par votre mot de passe
    });
    
    if (error) {
      console.error('❌ Erreur de reconnexion:', error);
    } else {
      console.log('✅ Reconnexion réussie:', data.user.email);
      setTimeout(() => window.location.reload(), 1000);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter la correction
fixHeaderAuth();

// Exposer les fonctions
window.fixHeaderAuth = fixHeaderAuth;
window.cleanAuth = cleanAuth;
window.forceReconnect = forceReconnect;

console.log('\n🛠️ FONCTIONS DISPONIBLES:');
console.log('- fixHeaderAuth() : Corrige l\'affichage du header');
console.log('- cleanAuth() : Nettoie complètement l\'auth');
console.log('- forceReconnect() : Force une reconnexion (modifiez le mot de passe dans le code)');
