// Script de test pour vérifier le processus de déconnexion
// À exécuter dans la console du navigateur

console.log('🔍 Test du processus de déconnexion...');

async function testLogout() {
    try {
        console.log('📊 État initial:');
        
        // 1. Vérifier l'état initial
        const { data: { session: initialSession } } = await window.supabase.auth.getSession();
        console.log('Session initiale:', {
            hasSession: !!initialSession,
            user: initialSession?.user?.email
        });
        
        if (!initialSession) {
            console.log('⚠️ Aucune session active pour tester la déconnexion');
            return;
        }
        
        // 2. Effectuer la déconnexion
        console.log('🚪 Déconnexion en cours...');
        const { error } = await window.supabase.auth.signOut();
        
        if (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
            return;
        }
        
        console.log('✅ Déconnexion Supabase réussie');
        
        // 3. Vérifier immédiatement
        const { data: { session: immediateSession } } = await window.supabase.auth.getSession();
        console.log('Session immédiate après déconnexion:', {
            hasSession: !!immediateSession,
            user: immediateSession?.user?.email
        });
        
        // 4. Attendre et vérifier à nouveau
        console.log('⏳ Attente de 1 seconde...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session: delayedSession } } = await window.supabase.auth.getSession();
        console.log('Session après délai:', {
            hasSession: !!delayedSession,
            user: delayedSession?.user?.email
        });
        
        // 5. Vérifier le localStorage
        console.log('📦 Vérification du localStorage...');
        const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        console.log('Clés auth restantes:', authKeys);
        
        authKeys.forEach(key => {
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                console.log(`${key}:`, parsed);
            } catch (e) {
                console.log(`${key}:`, value);
            }
        });
        
        // 6. Résultat final
        if (!delayedSession) {
            console.log('🎯 ✅ Déconnexion complète réussie !');
        } else {
            console.log('🎯 ❌ Session encore active après déconnexion');
        }
        
    } catch (err) {
        console.error('❌ Erreur dans testLogout:', err);
    }
}

// Fonction pour simuler le processus complet
async function simulateFullLogout() {
    console.log('🎬 Simulation du processus complet de déconnexion...');
    
    try {
        // 1. Vérifier l'état initial
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Pas de session active. Connectez-vous d\'abord.');
            return;
        }
        
        console.log('👤 Utilisateur connecté:', session.user.email);
        
        // 2. Simuler le clic sur déconnexion (comme dans le Header)
        console.log('🚪 Simulation de la déconnexion...');
        
        // Déconnexion
        const { error } = await window.supabase.auth.signOut();
        if (error) {
            console.error('❌ Erreur:', error);
            return;
        }
        
        // Attendre comme dans notre fonction signOut
        console.log('⏳ Attente de propagation (500ms)...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Vérifier la session
        const { data: { session: afterLogout } } = await window.supabase.auth.getSession();
        console.log('📊 Session après déconnexion:', {
            hasSession: !!afterLogout,
            user: afterLogout?.user?.email
        });
        
        // 3. Simuler l'arrivée sur /auth avec délai
        console.log('🔄 Simulation de l\'arrivée sur /auth...');
        console.log('⏳ Attente du délai de /auth (800ms)...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Vérifier comme le fait la page /auth
        const { data: { session: authPageSession } } = await window.supabase.auth.getSession();
        console.log('📊 Session vue par /auth:', {
            hasSession: !!authPageSession,
            user: authPageSession?.user?.email
        });
        
        if (authPageSession) {
            console.log('❌ PROBLÈME: /auth détecte encore une session active !');
            console.log('➡️ Cela causerait une redirection vers l\'accueil');
        } else {
            console.log('✅ SUCCÈS: /auth ne détecte pas de session');
            console.log('➡️ L\'utilisateur resterait sur /auth');
        }
        
    } catch (err) {
        console.error('❌ Erreur dans simulateFullLogout:', err);
    }
}

// Exposer les fonctions
window.testLogout = testLogout;
window.simulateFullLogout = simulateFullLogout;

console.log('🎯 Fonctions disponibles:');
console.log('- testLogout() : Teste la déconnexion simple');
console.log('- simulateFullLogout() : Simule le processus complet');

// Exécuter le test automatiquement
console.log('🚀 Exécution automatique du test...');
testLogout();
