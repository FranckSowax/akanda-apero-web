// Script de test pour vérifier l'état d'authentification
// À exécuter dans la console du navigateur

console.log('🔍 Test de l\'état d\'authentification...');

async function testAuthState() {
    try {
        // 1. Vérifier la session Supabase
        console.log('📊 Vérification de la session Supabase...');
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Erreur session:', error);
            return;
        }
        
        console.log('✅ Session Supabase:', {
            user: session?.user,
            email: session?.user?.email,
            expires_at: session?.expires_at,
            access_token: session?.access_token ? 'Présent' : 'Absent'
        });
        
        // 2. Vérifier le localStorage
        console.log('📦 Vérification du localStorage...');
        const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        console.log('🔑 Clés auth trouvées:', authKeys);
        
        // 3. Vérifier les cookies
        console.log('🍪 Vérification des cookies...');
        const cookies = document.cookie.split(';').filter(cookie => cookie.includes('supabase'));
        console.log('🍪 Cookies auth:', cookies);
        
        // 4. Tester la connexion admin
        if (session?.user) {
            console.log('👤 Test du rôle utilisateur...');
            const { data: adminProfile, error: adminError } = await window.supabase
                .from('admin_profiles')
                .select('role, is_active')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single();
                
            console.log('👑 Profil admin:', adminProfile);
            console.log('⚠️ Erreur admin:', adminError);
        }
        
        // 5. Forcer un événement de changement d'état
        console.log('🔄 Déclenchement d\'événement auth...');
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
            detail: { session, user: session?.user }
        }));
        
        return {
            session,
            hasUser: !!session?.user,
            email: session?.user?.email
        };
        
    } catch (err) {
        console.error('❌ Erreur dans testAuthState:', err);
        return null;
    }
}

// Fonction pour nettoyer et reconnecter
async function quickReconnect() {
    console.log('🔄 Reconnexion rapide...');
    
    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: 'ohmygab.marketplace@gmail.com',
            password: 'AkandaAdmin2024!'
        });
        
        if (error) {
            console.error('❌ Erreur reconnexion:', error);
        } else {
            console.log('✅ Reconnexion réussie:', data);
            setTimeout(() => testAuthState(), 1000);
        }
        
    } catch (err) {
        console.error('❌ Erreur dans quickReconnect:', err);
    }
}

// Exécuter le test
testAuthState().then(result => {
    if (result) {
        console.log('🎯 Résultat final:', result);
        
        if (result.hasUser) {
            console.log('✅ Utilisateur connecté détecté !');
            console.log('📧 Email:', result.email);
        } else {
            console.log('⚠️ Aucun utilisateur détecté');
            console.log('💡 Essayez: quickReconnect()');
        }
    }
});

// Exposer les fonctions
window.testAuthState = testAuthState;
window.quickReconnect = quickReconnect;

console.log('🎯 Fonctions disponibles:');
console.log('- testAuthState() : Teste l\'état complet');
console.log('- quickReconnect() : Reconnexion rapide');
