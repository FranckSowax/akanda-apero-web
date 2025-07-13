// Script de test pour vérifier le menu profil
// À exécuter dans la console du navigateur

console.log('🔍 Test du menu profil...');

function testProfileMenu() {
    console.log('🎯 Recherche du bouton profil...');
    
    // Chercher le bouton profil (avatar avec initiale)
    const profileButtons = document.querySelectorAll('[data-radix-collection-item]');
    const avatarButtons = document.querySelectorAll('div[class*="rounded-full"][class*="bg-gradient"]');
    
    console.log('Boutons profil trouvés:', profileButtons.length);
    console.log('Avatars trouvés:', avatarButtons.length);
    
    // Chercher le trigger du dropdown
    const dropdownTrigger = document.querySelector('[data-radix-dropdown-menu-trigger]');
    console.log('Dropdown trigger trouvé:', !!dropdownTrigger);
    
    if (dropdownTrigger) {
        console.log('✅ Trigger trouvé, test du clic...');
        
        // Simuler un clic
        dropdownTrigger.click();
        
        // Attendre un peu et vérifier si le menu s'ouvre
        setTimeout(() => {
            const dropdownContent = document.querySelector('[data-radix-dropdown-menu-content]');
            console.log('Menu ouvert:', !!dropdownContent);
            
            if (dropdownContent) {
                console.log('✅ Menu profil fonctionne !');
                console.log('Contenu du menu:', dropdownContent.textContent);
                
                // Chercher le bouton de déconnexion
                const logoutButton = Array.from(dropdownContent.querySelectorAll('*'))
                    .find(el => el.textContent?.includes('déconnecter'));
                console.log('Bouton déconnexion trouvé:', !!logoutButton);
                
            } else {
                console.log('❌ Menu ne s\'ouvre pas');
            }
        }, 500);
        
    } else {
        console.log('❌ Trigger non trouvé');
        
        // Chercher d'autres éléments
        const allButtons = document.querySelectorAll('button');
        console.log('Tous les boutons:', allButtons.length);
        
        allButtons.forEach((btn, i) => {
            if (btn.textContent?.includes('U') || btn.querySelector('[class*="rounded-full"]')) {
                console.log(`Bouton ${i}:`, btn.outerHTML.substring(0, 200));
            }
        });
    }
}

function checkAuthState() {
    console.log('🔍 Vérification de l\'état d\'authentification...');
    
    // Vérifier si l'utilisateur est connecté
    if (window.supabase) {
        window.supabase.auth.getSession().then(({ data }) => {
            console.log('Session active:', !!data.session);
            if (data.session) {
                console.log('Utilisateur:', data.session.user.email);
                console.log('✅ Utilisateur connecté - le menu profil devrait être visible');
            } else {
                console.log('❌ Aucune session - bouton de connexion devrait être visible');
            }
        });
    } else {
        console.log('⚠️ Supabase non disponible');
    }
}

// Fonction pour forcer l'ouverture du menu
function forceOpenProfileMenu() {
    console.log('🔧 Tentative d\'ouverture forcée du menu...');
    
    // Chercher tous les éléments cliquables dans le header
    const header = document.querySelector('header') || document.querySelector('[class*="header"]');
    if (header) {
        const clickableElements = header.querySelectorAll('button, [role="button"], [data-radix-dropdown-menu-trigger]');
        console.log('Éléments cliquables dans le header:', clickableElements.length);
        
        clickableElements.forEach((el, i) => {
            console.log(`Élément ${i}:`, {
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent?.substring(0, 50),
                hasDropdownTrigger: el.hasAttribute('data-radix-dropdown-menu-trigger')
            });
        });
        
        // Essayer de cliquer sur le trigger
        const trigger = header.querySelector('[data-radix-dropdown-menu-trigger]');
        if (trigger) {
            console.log('🎯 Clic sur le trigger...');
            trigger.click();
        }
    }
}

// Exposer les fonctions
window.testProfileMenu = testProfileMenu;
window.checkAuthState = checkAuthState;
window.forceOpenProfileMenu = forceOpenProfileMenu;

console.log('🎯 Fonctions disponibles:');
console.log('- checkAuthState() : Vérifier l\'état d\'auth');
console.log('- testProfileMenu() : Tester le menu profil');
console.log('- forceOpenProfileMenu() : Forcer l\'ouverture du menu');

// Exécuter les tests automatiquement
console.log('🚀 Exécution automatique des tests...');
checkAuthState();
setTimeout(() => {
    testProfileMenu();
}, 1000);
