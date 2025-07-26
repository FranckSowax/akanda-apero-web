// Script de diagnostic spécifique pour Bombay Sapphire
// À exécuter dans la console du navigateur sur /admin/products

console.log('🍸 === DIAGNOSTIC BOMBAY SAPPHIRE ===');

// Fonction pour trouver et tester spécifiquement Bombay Sapphire
function testBombaySapphire() {
    console.log('🔍 Recherche de Bombay Sapphire...');
    
    // Trouver toutes les lignes de produits
    const productRows = document.querySelectorAll('tbody tr');
    let bombayRow = null;
    
    productRows.forEach(row => {
        const nameCell = row.querySelector('td:first-child');
        if (nameCell && nameCell.textContent.toLowerCase().includes('bombay')) {
            bombayRow = row;
            console.log('🍸 Bombay Sapphire trouvé:', nameCell.textContent.trim());
        }
    });
    
    if (!bombayRow) {
        console.log('❌ Bombay Sapphire non trouvé dans la liste');
        return;
    }
    
    // Analyser les données de Bombay Sapphire
    const cells = bombayRow.querySelectorAll('td');
    const bombayData = {
        name: cells[0]?.textContent?.trim(),
        category: cells[1]?.textContent?.trim(),
        price: cells[2]?.textContent?.trim(),
        stock: cells[3]?.textContent?.trim(),
        status: cells[4]?.textContent?.trim()
    };
    
    console.log('🍸 Données Bombay extraites du DOM:', bombayData);
    
    // Trouver le bouton edit de Bombay
    const editButton = bombayRow.querySelector('button[class*="secondary"]');
    
    if (!editButton) {
        console.log('❌ Bouton edit non trouvé pour Bombay Sapphire');
        return;
    }
    
    console.log('🍸 Bouton edit trouvé pour Bombay Sapphire');
    console.log('🍸 Classes du bouton:', editButton.className);
    
    // Vérifier l'état actuel des modals
    const existingModal = document.querySelector('form[class*="space-y"]') ||
                         document.querySelector('div[class*="bg-white rounded-lg shadow-sm"]');
    
    console.log('🍸 Modal existant avant clic:', existingModal ? 'OUI' : 'NON');
    
    // Cliquer sur le bouton edit de Bombay
    console.log('🍸 Clic sur le bouton edit de Bombay Sapphire...');
    editButton.click();
    
    // Vérifier l'affichage du modal après différents délais
    const checkTimes = [100, 300, 500, 1000, 2000];
    
    checkTimes.forEach(delay => {
        setTimeout(() => {
            const modal = document.querySelector('form[class*="space-y"]') ||
                         document.querySelector('div[class*="bg-white rounded-lg shadow-sm"]');
            
            if (modal) {
                console.log(`🍸 ✅ Modal visible après ${delay}ms`);
                console.log('🍸 Modal trouvé:', modal);
                console.log('🍸 Classes du modal:', modal.className);
                console.log('🍸 Style du modal:', modal.style.cssText);
                
                // Vérifier le contenu du modal
                const nameInput = modal.querySelector('input[id="name"]');
                if (nameInput) {
                    console.log('🍸 Valeur du champ nom:', nameInput.value);
                }
            } else {
                console.log(`🍸 ❌ Modal non visible après ${delay}ms`);
                
                // Chercher tous les formulaires cachés
                const hiddenForms = document.querySelectorAll('form[style*="display: none"], form[style*="visibility: hidden"]');
                if (hiddenForms.length > 0) {
                    console.log(`🍸 🔍 Trouvé ${hiddenForms.length} formulaire(s) caché(s)`);
                    hiddenForms.forEach((form, index) => {
                        console.log(`🍸 Formulaire caché ${index + 1}:`, form.style.cssText);
                    });
                }
            }
        }, delay);
    });
}

// Fonction pour forcer l'affichage du modal Bombay
function forceBombayModal() {
    console.log('🍸 🚀 Forçage du modal Bombay Sapphire...');
    
    // Essayer de trouver et afficher tous les formulaires
    const allForms = document.querySelectorAll('form');
    console.log(`🍸 Trouvé ${allForms.length} formulaire(s) total`);
    
    allForms.forEach((form, index) => {
        console.log(`🍸 Formulaire ${index + 1}:`, {
            display: form.style.display,
            visibility: form.style.visibility,
            opacity: form.style.opacity,
            classes: form.className
        });
        
        // Forcer l'affichage
        form.style.display = 'block';
        form.style.visibility = 'visible';
        form.style.opacity = '1';
        form.style.position = 'relative';
        form.style.zIndex = '9999';
        
        console.log(`🍸 ✅ Formulaire ${index + 1} forcé visible`);
    });
    
    // Chercher aussi les divs qui pourraient être le modal
    const modalDivs = document.querySelectorAll('div[class*="bg-white rounded-lg shadow-sm"]');
    modalDivs.forEach((div, index) => {
        div.style.display = 'block';
        div.style.visibility = 'visible';
        div.style.opacity = '1';
        console.log(`🍸 ✅ Div modal ${index + 1} forcé visible`);
    });
}

// Fonction pour analyser les états React (si possible)
function analyzeBombayReactState() {
    console.log('🍸 🔍 Analyse des états React...');
    
    // Essayer de trouver les éléments React
    const reactElements = document.querySelectorAll('[data-reactroot], #__next');
    
    if (reactElements.length > 0) {
        console.log('🍸 ⚛️ Éléments React trouvés:', reactElements.length);
        
        // Essayer d'accéder aux props/state React (méthode expérimentale)
        reactElements.forEach((element, index) => {
            const reactFiber = element._reactInternalFiber || 
                              element._reactInternalInstance ||
                              Object.keys(element).find(key => key.startsWith('__reactInternalInstance'));
            
            if (reactFiber) {
                console.log(`🍸 ⚛️ Fiber React trouvé pour élément ${index + 1}`);
            }
        });
    }
}

// Exécuter le diagnostic
console.log('🍸 Démarrage du diagnostic Bombay Sapphire...');

// Attendre un peu que la page soit chargée
setTimeout(() => {
    testBombaySapphire();
}, 500);

// Fonctions utilitaires disponibles
window.bombayDebug = {
    test: testBombaySapphire,
    force: forceBombayModal,
    analyze: analyzeBombayReactState,
    
    // Fonction pour surveiller les changements d'état
    monitor: () => {
        console.log('🍸 📊 Surveillance des changements...');
        
        // Observer les changements DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.tagName === 'FORM' || target.className.includes('modal')) {
                        console.log('🍸 📊 Changement détecté:', {
                            element: target.tagName,
                            classes: target.className,
                            style: target.style.cssText
                        });
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('🍸 📊 Surveillance activée');
    }
};

console.log('🍸 ✅ Diagnostic prêt! Utilisez:');
console.log('- bombayDebug.test() : Tester Bombay Sapphire');
console.log('- bombayDebug.force() : Forcer l\'affichage du modal');
console.log('- bombayDebug.monitor() : Surveiller les changements');
console.log('- bombayDebug.analyze() : Analyser les états React');
