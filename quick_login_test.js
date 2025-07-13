// Script pour connexion rapide et test du menu profil
// À exécuter dans la console du navigateur

console.log('🚀 Script de connexion rapide et test du menu profil');

async function quickLogin() {
    try {
        console.log('🔐 Connexion automatique...');
        
        if (!window.supabase) {
            console.error('❌ Supabase non disponible');
            return;
        }
        
        // Vérifier si déjà connecté
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            console.log('✅ Déjà connecté:', session.user.email);
            testProfileMenu();
            return;
        }
        
        // Se connecter avec les identifiants admin
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: 'ohmygab.marketplace@gmail.com',
            password: 'AkandaAdmin2024!'
        });
        
        if (error) {
            console.error('❌ Erreur de connexion:', error);
            return;
        }
        
        console.log('✅ Connexion réussie:', data.user.email);
        
        // Attendre un peu pour que l'UI se mette à jour
        setTimeout(() => {
            console.log('🔄 Test du menu profil...');
            testProfileMenu();
        }, 2000);
        
    } catch (err) {
        console.error('❌ Erreur dans quickLogin:', err);
    }
}

function testProfileMenu() {
    console.log('🎯 Test du menu profil...');
    
    // Chercher l'avatar dans le header
    const avatars = document.querySelectorAll('[class*="rounded-full"][class*="bg-gradient"]');
    console.log('Avatars trouvés:', avatars.length);
    
    avatars.forEach((avatar, i) => {
        console.log(`Avatar ${i}:`, {
            classes: avatar.className,
            text: avatar.textContent,
            parent: avatar.parentElement?.tagName
        });
    });
    
    // Chercher le trigger du dropdown
    const dropdownTrigger = document.querySelector('[data-radix-dropdown-menu-trigger]');
    console.log('Dropdown trigger trouvé:', !!dropdownTrigger);
    
    if (dropdownTrigger) {
        console.log('🎯 Test du clic sur le trigger...');
        dropdownTrigger.click();
        
        setTimeout(() => {
            const dropdownContent = document.querySelector('[data-radix-dropdown-menu-content]');
            console.log('Menu ouvert après clic:', !!dropdownContent);
            
            if (dropdownContent) {
                console.log('✅ Menu profil fonctionne !');
                console.log('Contenu:', dropdownContent.textContent.substring(0, 200));
            } else {
                console.log('❌ Menu ne s\'ouvre pas');
                
                // Diagnostics supplémentaires
                console.log('Diagnostics:');
                console.log('- Trigger classes:', dropdownTrigger.className);
                console.log('- Trigger disabled:', dropdownTrigger.disabled);
                console.log('- Trigger aria-expanded:', dropdownTrigger.getAttribute('aria-expanded'));
            }
        }, 500);
    } else {
        console.log('❌ Pas de trigger trouvé');
        
        // Chercher tous les boutons dans le header
        const header = document.querySelector('header');
        if (header) {
            const buttons = header.querySelectorAll('button');
            console.log('Boutons dans le header:', buttons.length);
            
            buttons.forEach((btn, i) => {
                console.log(`Bouton ${i}:`, {
                    text: btn.textContent?.substring(0, 30),
                    classes: btn.className.substring(0, 100),
                    hasDropdownAttr: btn.hasAttribute('data-radix-dropdown-menu-trigger')
                });
            });
        }
    }
}

function forceMenuOpen() {
    console.log('🔧 Tentative d\'ouverture forcée...');
    
    // Essayer de trouver et cliquer sur tous les éléments possibles
    const possibleTriggers = [
        '[data-radix-dropdown-menu-trigger]',
        'button[class*="rounded-full"]',
        '[class*="bg-gradient"][class*="rounded-full"]'
    ];
    
    possibleTriggers.forEach((selector, i) => {
        const elements = document.querySelectorAll(selector);
        console.log(`Sélecteur ${i} (${selector}):`, elements.length, 'éléments');
        
        elements.forEach((el, j) => {
            console.log(`  Élément ${j}:`, el.tagName, el.className.substring(0, 50));
            
            // Essayer de cliquer
            try {
                el.click();
                console.log(`  ✅ Clic sur élément ${j} réussi`);
            } catch (err) {
                console.log(`  ❌ Erreur clic sur élément ${j}:`, err.message);
            }
        });
    });
}

// Exposer les fonctions
window.quickLogin = quickLogin;
window.testProfileMenu = testProfileMenu;
window.forceMenuOpen = forceMenuOpen;

console.log('🎯 Fonctions disponibles:');
console.log('- quickLogin() : Connexion automatique + test menu');
console.log('- testProfileMenu() : Tester le menu profil');
console.log('- forceMenuOpen() : Forcer l\'ouverture du menu');

// Exécuter automatiquement
console.log('🚀 Exécution automatique...');
quickLogin();
