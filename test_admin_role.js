// Script pour tester le rôle admin après correction des politiques
// À exécuter dans la console du navigateur

console.log('🔍 Test du rôle admin...');

async function testAdminRole() {
    try {
        if (!window.supabase) {
            console.error('❌ Supabase non disponible');
            return;
        }
        
        // 1. Vérifier la session actuelle
        console.log('📊 Vérification de la session...');
        const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Erreur session:', sessionError);
            return;
        }
        
        if (!session) {
            console.log('⚠️ Aucune session active. Connexion...');
            
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
        
        console.log('👤 Utilisateur connecté:', session.user.email);
        console.log('🆔 User ID:', session.user.id);
        
        // 2. Tester la requête admin_profiles directement
        console.log('🔍 Test de la requête admin_profiles...');
        
        const { data: adminProfile, error: adminError } = await window.supabase
            .from('admin_profiles')
            .select('role, is_active')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .single();
        
        if (adminError) {
            console.error('❌ Erreur admin_profiles:', adminError);
            console.log('Code d\'erreur:', adminError.code);
            console.log('Message:', adminError.message);
            console.log('Détails:', adminError.details);
            
            if (adminError.code === '42P17') {
                console.log('🔄 Erreur de récursion infinie détectée !');
                console.log('➡️ Exécutez le script fix_admin_policies.sql dans Supabase');
            }
        } else {
            console.log('✅ Profil admin trouvé:', adminProfile);
            
            if (adminProfile && adminProfile.role && adminProfile.is_active) {
                console.log('🎯 ✅ Utilisateur est ADMIN !');
                console.log('Rôle:', adminProfile.role);
                console.log('Actif:', adminProfile.is_active);
            } else {
                console.log('🎯 ❌ Utilisateur n\'est PAS admin');
                console.log('Profil:', adminProfile);
            }
        }
        
        // 3. Tester toutes les entrées admin_profiles
        console.log('📋 Liste de tous les profils admin...');
        const { data: allProfiles, error: allError } = await window.supabase
            .from('admin_profiles')
            .select('*');
        
        if (allError) {
            console.error('❌ Erreur liste profils:', allError);
        } else {
            console.log('📊 Tous les profils admin:', allProfiles);
            
            const userProfile = allProfiles.find(p => p.user_id === session.user.id);
            if (userProfile) {
                console.log('👤 Profil de l\'utilisateur actuel:', userProfile);
            } else {
                console.log('⚠️ Aucun profil trouvé pour l\'utilisateur actuel');
            }
        }
        
    } catch (err) {
        console.error('❌ Erreur dans testAdminRole:', err);
    }
}

async function createAdminProfile() {
    try {
        console.log('🔧 Création du profil admin...');
        
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.error('❌ Aucune session active');
            return;
        }
        
        const { data, error } = await window.supabase
            .from('admin_profiles')
            .upsert({
                user_id: session.user.id,
                role: 'admin',
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });
        
        if (error) {
            console.error('❌ Erreur création profil:', error);
        } else {
            console.log('✅ Profil admin créé/mis à jour:', data);
        }
        
    } catch (err) {
        console.error('❌ Erreur dans createAdminProfile:', err);
    }
}

// Exposer les fonctions
window.testAdminRole = testAdminRole;
window.createAdminProfile = createAdminProfile;

console.log('🎯 Fonctions disponibles:');
console.log('- testAdminRole() : Tester le rôle admin');
console.log('- createAdminProfile() : Créer/mettre à jour le profil admin');

// Exécuter automatiquement
console.log('🚀 Test automatique...');
testAdminRole();
