// Script pour forcer la synchronisation de l'état d'authentification
// À exécuter dans la console du navigateur après connexion

console.log('🔄 Forçage de la synchronisation de l\'authentification...');

// Fonction pour forcer la mise à jour de l'état d'authentification
async function forceAuthSync() {
    try {
        // 1. Vérifier la session actuelle
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Erreur lors de la récupération de la session:', error);
            return;
        }
        
        if (session) {
            console.log('✅ Session trouvée:', {
                user: session.user,
                email: session.user.email,
                expires_at: session.expires_at
            });
            
            // 2. Forcer un événement de changement d'état
            console.log('🔄 Déclenchement manuel de l\'événement auth...');
            
            // Simuler un changement d'état d'authentification
            window.dispatchEvent(new CustomEvent('supabase-auth-change', {
                detail: { session: session, user: session.user }
            }));
            
            // 3. Forcer le rechargement des composants React
            console.log('🔄 Tentative de rechargement des composants...');
            
            // Déclencher un événement de stockage pour forcer la mise à jour
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'supabase.auth.token',
                newValue: JSON.stringify(session),
                storageArea: localStorage
            }));
            
            console.log('✅ Synchronisation forcée terminée');
            
        } else {
            console.log('⚠️ Aucune session active trouvée');
            
            // Vérifier le localStorage pour des tokens orphelins
            const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
            if (authKeys.length > 0) {
                console.log('🔍 Tokens trouvés dans localStorage:', authKeys);
                authKeys.forEach(key => {
                    const value = localStorage.getItem(key);
                    try {
                        const parsed = JSON.parse(value);
                        console.log(`📝 ${key}:`, parsed);
                    } catch (e) {
                        console.log(`📝 ${key}:`, value);
                    }
                });
            }
        }
        
    } catch (err) {
        console.error('❌ Erreur dans forceAuthSync:', err);
    }
}

// Fonction pour nettoyer et reconnecter
async function cleanAndReconnect() {
    console.log('🧹 Nettoyage et reconnexion...');
    
    try {
        // 1. Déconnexion propre
        await window.supabase.auth.signOut();
        console.log('✅ Déconnexion effectuée');
        
        // 2. Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Reconnexion
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: 'ohmygab.marketplace@gmail.com',
            password: 'AkandaAdmin2024!'
        });
        
        if (error) {
            console.error('❌ Erreur lors de la reconnexion:', error);
        } else {
            console.log('✅ Reconnexion réussie:', data);
            
            // Forcer la synchronisation après reconnexion
            setTimeout(() => forceAuthSync(), 1000);
        }
        
    } catch (err) {
        console.error('❌ Erreur dans cleanAndReconnect:', err);
    }
}

// Exécuter la synchronisation
forceAuthSync();

// Exposer les fonctions pour utilisation manuelle
window.forceAuthSync = forceAuthSync;
window.cleanAndReconnect = cleanAndReconnect;

console.log('🎯 Fonctions disponibles:');
console.log('- forceAuthSync() : Force la synchronisation');
console.log('- cleanAndReconnect() : Nettoie et reconnecte');
