// Script de debug pour vérifier l'état d'authentification Supabase
// À exécuter dans la console du navigateur (F12)

console.log('🔍 Debug de l\'authentification Supabase...');

// Vérifier si Supabase est disponible
if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Supabase client trouvé');
    
    // Vérifier la session actuelle
    window.supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error('❌ Erreur lors de la récupération de la session:', error);
        } else if (session) {
            console.log('✅ Session active trouvée:', {
                user: session.user,
                email: session.user.email,
                expires_at: session.expires_at,
                access_token: session.access_token ? 'Présent' : 'Absent'
            });
        } else {
            console.log('⚠️ Aucune session active');
        }
    });
    
    // Vérifier l'utilisateur actuel
    window.supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error) {
            console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        } else if (user) {
            console.log('✅ Utilisateur connecté:', {
                id: user.id,
                email: user.email,
                email_confirmed_at: user.email_confirmed_at,
                last_sign_in_at: user.last_sign_in_at,
                user_metadata: user.user_metadata
            });
        } else {
            console.log('⚠️ Aucun utilisateur connecté');
        }
    });
    
} else {
    console.error('❌ Supabase client non trouvé dans window');
    
    // Vérifier le localStorage pour les tokens
    const keys = Object.keys(localStorage).filter(key => key.includes('supabase'));
    if (keys.length > 0) {
        console.log('🔑 Clés Supabase dans localStorage:', keys);
        keys.forEach(key => {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                console.log(`📝 ${key}:`, value);
            } catch (e) {
                console.log(`📝 ${key}:`, localStorage.getItem(key));
            }
        });
    } else {
        console.log('⚠️ Aucune clé Supabase dans localStorage');
    }
}

// Vérifier les cookies
const cookies = document.cookie.split(';').filter(cookie => cookie.includes('supabase'));
if (cookies.length > 0) {
    console.log('🍪 Cookies Supabase:', cookies);
} else {
    console.log('⚠️ Aucun cookie Supabase trouvé');
}

console.log('🔍 Debug terminé. Vérifiez les logs ci-dessus.');
