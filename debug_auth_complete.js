// Script de diagnostic complet pour l'authentification
// À exécuter dans la console du navigateur

console.log('🔍 Diagnostic complet de l\'authentification...');

async function debugAuthComplete() {
    try {
        console.log('='.repeat(50));
        console.log('🚀 DÉBUT DU DIAGNOSTIC COMPLET');
        console.log('='.repeat(50));
        
        // 1. Vérifier Supabase
        console.log('1️⃣ Vérification de Supabase...');
        if (!window.supabase) {
            console.error('❌ window.supabase non disponible !');
            return;
        }
        console.log('✅ Supabase disponible');
        
        // 2. Vérifier la session
        console.log('2️⃣ Vérification de la session...');
        const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Erreur session:', sessionError);
            return;
        }
        
        if (!session) {
            console.log('⚠️ Aucune session active');
            console.log('🔐 Tentative de connexion...');
            
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: 'ohmygab.marketplace@gmail.com',
                password: 'AkandaAdmin2024!'
            });
            
            if (error) {
                console.error('❌ Erreur de connexion:', error);
                return;
            }
            
            console.log('✅ Connexion réussie');
            session = data.session;
        }
        
        console.log('👤 Session active:', {
            email: session.user.email,
            id: session.user.id,
            expires_at: new Date(session.expires_at * 1000).toLocaleString()
        });
        
        // 3. Vérifier l'état du hook useAuth
        console.log('3️⃣ Vérification de l\'état useAuth...');
        
        // Attendre un peu pour que React se mette à jour
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Forcer une vérification manuelle
        if (window.supabase.auth.getSession) {
            const { data: freshSession } = await window.supabase.auth.getSession();
            console.log('🔄 Session fraîche:', freshSession ? 'Présente' : 'Absente');
        }
        
        // 4. Vérifier les éléments DOM
        console.log('4️⃣ Vérification des éléments DOM...');
        
        const header = document.querySelector('header');
        console.log('Header trouvé:', !!header);
        
        if (header) {
            const avatars = header.querySelectorAll('[class*="rounded-full"][class*="bg-gradient"]');
            console.log('Avatars dans header:', avatars.length);
            
            const buttons = header.querySelectorAll('button');
            console.log('Boutons dans header:', buttons.length);
            
            buttons.forEach((btn, i) => {
                console.log(`Bouton ${i}:`, {
                    text: btn.textContent?.substring(0, 30),
                    classes: btn.className.substring(0, 50),
                    hasAvatar: btn.querySelector('[class*="rounded-full"]') ? 'Oui' : 'Non'
                });
            });
            
            // Chercher spécifiquement le dropdown trigger
            const dropdownTrigger = header.querySelector('[data-radix-dropdown-menu-trigger]');
            console.log('Dropdown trigger trouvé:', !!dropdownTrigger);
        }
        
        // 5. Vérifier localStorage
        console.log('5️⃣ Vérification localStorage...');
        const authKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('supabase')) {
                authKeys.push(key);
            }
        }
        console.log('Clés Supabase dans localStorage:', authKeys);
        
        // 6. Test de l'admin profile (avec gestion d'erreur)
        console.log('6️⃣ Test admin profile...');
        try {
            const { data: adminProfile, error: adminError } = await window.supabase
                .from('admin_profiles')
                .select('role, is_active')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single();
            
            if (adminError) {
                console.error('❌ Erreur admin_profiles:', {
                    code: adminError.code,
                    message: adminError.message,
                    details: adminError.details
                });
                
                if (adminError.code === '42P17') {
                    console.log('🔄 PROBLÈME IDENTIFIÉ: Récursion infinie dans les politiques RLS');
                    console.log('➡️ Solution: Exécuter fix_admin_policies_clean.sql dans Supabase');
                }
            } else {
                console.log('✅ Profil admin:', adminProfile);
            }
        } catch (err) {
            console.error('❌ Exception admin_profiles:', err);
        }
        
        // 7. Forcer le rechargement du composant
        console.log('7️⃣ Tentative de forcer le rechargement...');
        
        // Déclencher un événement auth change
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state change:', event, session ? session.user.email : 'null');
        });
        
        // Forcer un refresh
        const { data: refreshedSession } = await window.supabase.auth.refreshSession();
        console.log('🔄 Session rafraîchie:', refreshedSession.session ? 'OK' : 'Échec');
        
        console.log('='.repeat(50));
        console.log('🏁 FIN DU DIAGNOSTIC');
        console.log('='.repeat(50));
        
        // 8. Recommandations
        console.log('💡 RECOMMANDATIONS:');
        if (session) {
            console.log('✅ Session OK - Problème probablement dans le composant React');
            console.log('🔧 Solutions possibles:');
            console.log('   1. Corriger les politiques RLS (fix_admin_policies_clean.sql)');
            console.log('   2. Recharger la page complètement');
            console.log('   3. Vérifier le hook useAuth');
        } else {
            console.log('❌ Pas de session - Problème de connexion');
        }
        
    } catch (err) {
        console.error('❌ Erreur dans debugAuthComplete:', err);
    }
}

// Fonction pour forcer le rechargement du header
function forceHeaderReload() {
    console.log('🔄 Tentative de rechargement forcé...');
    
    // Déclencher un resize pour forcer le re-render
    window.dispatchEvent(new Event('resize'));
    
    // Déclencher un focus pour réactiver les listeners
    window.dispatchEvent(new Event('focus'));
    
    // Attendre et recharger la page si nécessaire
    setTimeout(() => {
        console.log('🔄 Rechargement de la page...');
        window.location.reload();
    }, 3000);
}

// Exposer les fonctions
window.debugAuthComplete = debugAuthComplete;
window.forceHeaderReload = forceHeaderReload;

console.log('🎯 Fonctions disponibles:');
console.log('- debugAuthComplete() : Diagnostic complet');
console.log('- forceHeaderReload() : Forcer le rechargement');

// Exécuter automatiquement
console.log('🚀 Lancement du diagnostic...');
debugAuthComplete();
