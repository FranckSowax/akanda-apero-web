// Script de diagnostic et correction pour l'erreur Supabase 400 refresh_token
// À exécuter dans la console du navigateur (F12 > Console)

console.log('=== DIAGNOSTIC SUPABASE AUTH ===');

// 1. Vérifier les variables d'environnement
console.log('1. Variables d\'environnement:');
console.log('SUPABASE_URL:', process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'Non définie (utilise fallback)');
console.log('SUPABASE_ANON_KEY:', process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie (utilise fallback)');

// 2. Vérifier le localStorage pour les tokens
console.log('\n2. Tokens dans localStorage:');
const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('akanda'));
console.log('Clés d\'auth trouvées:', authKeys);

authKeys.forEach(key => {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      const parsed = JSON.parse(value);
      console.log(`${key}:`, {
        hasAccessToken: !!parsed.access_token,
        hasRefreshToken: !!parsed.refresh_token,
        expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A',
        user: parsed.user ? parsed.user.email : 'N/A'
      });
    }
  } catch (e) {
    console.log(`${key}: Erreur de parsing`);
  }
});

// 3. Fonction de nettoyage des tokens corrompus
function clearSupabaseAuth() {
  console.log('\n3. Nettoyage des tokens...');
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('akanda') || key.includes('auth')
  );
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Supprimé: ${key}`);
  });
  
  // Nettoyer aussi sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('supabase') || key.includes('akanda') || key.includes('auth')
  );
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`Supprimé (session): ${key}`);
  });
  
  console.log('Nettoyage terminé. Rechargez la page et reconnectez-vous.');
}

// 4. Fonction de test de connexion
async function testSupabaseConnection() {
  console.log('\n4. Test de connexion Supabase...');
  
  try {
    // Importer dynamiquement le client Supabase
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    // Tester une requête simple
    const { data, error } = await supabase.from('products').select('id').limit(1);
    
    if (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } else {
      console.log('Connexion OK:', data);
      return true;
    }
  } catch (err) {
    console.error('Erreur lors du test:', err);
    return false;
  }
}

// 5. Fonction de reconnexion
async function forceReconnect() {
  console.log('\n5. Tentative de reconnexion...');
  
  try {
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    // Forcer la déconnexion
    await supabase.auth.signOut();
    console.log('Déconnexion forcée effectuée');
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Veuillez vous reconnecter manuellement via l\'interface');
    
  } catch (err) {
    console.error('Erreur lors de la reconnexion:', err);
  }
}

// 6. Instructions d'utilisation
console.log('\n=== INSTRUCTIONS ===');
console.log('1. Pour nettoyer les tokens corrompus: clearSupabaseAuth()');
console.log('2. Pour tester la connexion: testSupabaseConnection()');
console.log('3. Pour forcer une reconnexion: forceReconnect()');
console.log('4. Après nettoyage, rechargez la page et reconnectez-vous');

// Exposer les fonctions globalement
window.clearSupabaseAuth = clearSupabaseAuth;
window.testSupabaseConnection = testSupabaseConnection;
window.forceReconnect = forceReconnect;

console.log('\n=== DIAGNOSTIC TERMINÉ ===');
