// Script pour déconnexion complète et nettoyage
// À exécuter dans la console du navigateur

console.log('🔄 Déconnexion complète et nettoyage...');

async function forceLogoutAndClean() {
    try {
        console.log('1️⃣ Déconnexion Supabase...');
        
        if (window.supabase) {
            const { error } = await window.supabase.auth.signOut();
            if (error) {
                console.error('❌ Erreur déconnexion:', error);
            } else {
                console.log('✅ Déconnexion Supabase réussie');
            }
        }
        
        console.log('2️⃣ Nettoyage localStorage...');
        
        // Nettoyer toutes les clés liées à Supabase et auth
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('supabase') || 
                key.includes('auth') || 
                key.includes('session') ||
                key.includes('token')
            )) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ Supprimé:', key);
        });
        
        console.log('3️⃣ Nettoyage sessionStorage...');
        
        // Nettoyer sessionStorage aussi
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.includes('supabase') || 
                key.includes('auth') || 
                key.includes('session') ||
                key.includes('token')
            )) {
                sessionKeysToRemove.push(key);
            }
        }
        
        sessionKeysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            console.log('🗑️ Supprimé (session):', key);
        });
        
        console.log('4️⃣ Nettoyage cookies...');
        
        // Nettoyer les cookies liés à l'auth
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('5️⃣ Vérification finale...');
        
        if (window.supabase) {
            const { data: { session } } = await window.supabase.auth.getSession();
            if (session) {
                console.log('⚠️ Session encore présente:', session.user.email);
            } else {
                console.log('✅ Aucune session active');
            }
        }
        
        console.log('6️⃣ Rechargement de la page...');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (err) {
        console.error('❌ Erreur dans forceLogoutAndClean:', err);
    }
}

// Exécuter immédiatement
forceLogoutAndClean();
