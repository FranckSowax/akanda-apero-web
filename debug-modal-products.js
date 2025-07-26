// Script de diagnostic pour identifier les produits problématiques
// À exécuter dans la console du navigateur sur /admin/products

console.log('🔍 === DIAGNOSTIC MODAL PRODUITS ===');

// Fonction pour tester tous les boutons edit
function testAllEditButtons() {
    const editButtons = document.querySelectorAll('button[data-component-name="Button"]');
    const editButtonsWithIcon = Array.from(editButtons).filter(btn => 
        btn.innerHTML.includes('lucide-square-pen') || 
        btn.innerHTML.includes('Edit') ||
        btn.querySelector('svg[class*="square-pen"]')
    );
    
    console.log(`📊 Trouvé ${editButtonsWithIcon.length} boutons edit`);
    
    editButtonsWithIcon.forEach((button, index) => {
        console.log(`\n🔍 Test bouton ${index + 1}:`);
        
        // Trouver la ligne du produit
        const row = button.closest('tr');
        if (row) {
            const productName = row.querySelector('td:first-child')?.textContent?.trim();
            console.log(`📦 Produit: ${productName}`);
            
            // Simuler le clic
            try {
                button.click();
                
                // Vérifier si le modal s'affiche après 100ms
                setTimeout(() => {
                    const modal = document.querySelector('[class*="showForm"]') || 
                                document.querySelector('form') ||
                                document.querySelector('[class*="modal"]');
                    
                    if (modal && modal.style.display !== 'none') {
                        console.log(`✅ ${productName}: Modal visible`);
                    } else {
                        console.log(`❌ ${productName}: Modal NON visible`);
                        console.log('🔍 États React à vérifier pour ce produit');
                    }
                }, 100);
                
            } catch (error) {
                console.error(`❌ Erreur clic sur ${productName}:`, error);
            }
        }
    });
}

// Fonction pour analyser les données des produits
function analyzeProductsData() {
    console.log('\n📊 === ANALYSE DES DONNÉES PRODUITS ===');
    
    // Essayer de récupérer les données depuis le contexte React (si disponible)
    const reactFiber = document.querySelector('#__next')?._reactInternalFiber ||
                      document.querySelector('#__next')?._reactInternalInstance;
    
    if (reactFiber) {
        console.log('⚛️ Contexte React trouvé, analyse en cours...');
        // Analyser les props et states React si possible
    }
    
    // Analyser les éléments DOM pour extraire les infos produits
    const productRows = document.querySelectorAll('tbody tr');
    console.log(`📦 ${productRows.length} produits trouvés dans le DOM`);
    
    productRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            const productInfo = {
                index: index + 1,
                name: cells[0]?.textContent?.trim() || 'N/A',
                category: cells[1]?.textContent?.trim() || 'N/A',
                price: cells[2]?.textContent?.trim() || 'N/A',
                stock: cells[3]?.textContent?.trim() || 'N/A',
                status: cells[4]?.textContent?.trim() || 'N/A'
            };
            
            console.log(`📦 Produit ${index + 1}:`, productInfo);
        }
    });
}

// Fonction pour forcer l'affichage du modal
function forceShowModal() {
    console.log('\n🚀 === FORÇAGE AFFICHAGE MODAL ===');
    
    // Essayer différentes méthodes pour afficher le modal
    const possibleModalSelectors = [
        '[class*="showForm"]',
        'form[class*="space-y"]',
        'div[class*="bg-white rounded-lg shadow-sm"]',
        '.modal',
        '[role="dialog"]'
    ];
    
    possibleModalSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            console.log(`✅ Modal forcé visible avec sélecteur: ${selector}`);
        }
    });
}

// Exécuter le diagnostic
console.log('🚀 Démarrage du diagnostic...');
analyzeProductsData();

setTimeout(() => {
    console.log('\n🧪 Test des boutons edit...');
    testAllEditButtons();
}, 1000);

// Fonction utilitaire pour debug
window.debugModal = {
    testAll: testAllEditButtons,
    analyzeData: analyzeProductsData,
    forceShow: forceShowModal,
    
    // Fonction pour tester un produit spécifique
    testProduct: (productName) => {
        console.log(`🎯 Test spécifique pour: ${productName}`);
        const rows = document.querySelectorAll('tbody tr');
        const targetRow = Array.from(rows).find(row => 
            row.textContent.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (targetRow) {
            const editButton = targetRow.querySelector('button[class*="secondary"]');
            if (editButton) {
                console.log('🔍 Bouton edit trouvé, test en cours...');
                editButton.click();
                
                setTimeout(() => {
                    const modal = document.querySelector('form') || 
                                document.querySelector('[class*="bg-white rounded-lg"]');
                    console.log(modal ? '✅ Modal visible' : '❌ Modal non visible');
                }, 100);
            }
        } else {
            console.log('❌ Produit non trouvé');
        }
    }
};

console.log('✅ Diagnostic prêt! Utilisez:');
console.log('- debugModal.testAll() : Tester tous les boutons');
console.log('- debugModal.testProduct("nom") : Tester un produit spécifique');
console.log('- debugModal.forceShow() : Forcer l\'affichage du modal');
