// Script pour forcer la sauvegarde de session après connexion
// À exécuter dans la console IMMÉDIATEMENT après connexion

console.log('🔧 FORÇAGE DE SAUVEGARDE DE SESSION');

async function forceSaveSession() {
  try {
    // 1. Vérifier l'état actuel
    const currentAuth = localStorage.getItem('akanda-supabase-auth');
    console.log('1️⃣ Session actuelle:', currentAuth ? 'EXISTE' : 'VIDE');
    
    // 2. Créer un client Supabase temporaire
    const { createClient } = window.supabase || await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
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
    
    // 3. Forcer une nouvelle connexion si nécessaire
    console.log('2️⃣ Test de connexion...');
    const { data: sessionData, error } = await client.auth.getSession();
    
    if (sessionData.session) {
      console.log('✅ Session trouvée:', sessionData.session.user.email);
      
      // 4. Forcer la sauvegarde manuelle
      const sessionToSave = {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in,
        token_type: sessionData.session.token_type,
        user: sessionData.session.user
      };
      
      localStorage.setItem('akanda-supabase-auth', JSON.stringify(sessionToSave));
      console.log('💾 Session sauvegardée manuellement!');
      
      // 5. Vérifier la sauvegarde
      const saved = localStorage.getItem('akanda-supabase-auth');
      console.log('✅ Vérification:', saved ? 'SESSION SAUVÉE' : 'ÉCHEC');
      
      // 6. Recharger la page pour appliquer
      console.log('🔄 Rechargement dans 2 secondes...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      console.log('❌ Aucune session active - Reconnectez-vous d\'abord');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter immédiatement
forceSaveSession();
