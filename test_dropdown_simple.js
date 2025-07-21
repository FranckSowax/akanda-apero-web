/**
 * Test simple pour vérifier l'ouverture des dropdowns
 * À exécuter dans la console du navigateur sur /admin/orders
 */

console.log('🔧 TEST SIMPLE DROPDOWN - DÉMARRAGE');
console.log('==================================');

const log = (message, type = 'info') => {
  const colors = {
    info: 'color: #2196F3',
    success: 'color: #4CAF50; font-weight: bold',
    error: 'color: #F44336; font-weight: bold',
    warning: 'color: #FF9800; font-weight: bold'
  };
  console.log(`%c${message}`, colors[type]);
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testDropdownSimple() {
  try {
    // Étape 1: Trouver les boutons d'action
    log('🔍 Recherche des boutons d\'action...');
    const actionButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
    log(`Trouvé ${actionButtons.length} boutons d'action`);
    
    if (actionButtons.length === 0) {
      log('❌ Aucun bouton d\'action trouvé', 'error');
      return;
    }
    
    // Étape 2: Analyser le premier bouton
    const firstButton = actionButtons[0];
    log('🔍 Analyse du premier bouton...');
    log(`Bouton HTML: ${firstButton.outerHTML}`);
    log(`Classes: ${firstButton.className}`);
    log(`Attributs: aria-haspopup="${firstButton.getAttribute('aria-haspopup')}", aria-expanded="${firstButton.getAttribute('aria-expanded')}"`);
    
    // Étape 3: Compter tous les éléments avant le clic
    const elementsBefore = document.querySelectorAll('*').length;
    log(`Éléments DOM avant clic: ${elementsBefore}`);
    
    // Étape 4: Cliquer sur le bouton
    log('🖱️ Clic sur le bouton...');
    firstButton.click();
    
    // Étape 5: Attendre et vérifier les changements
    await wait(1000);
    
    const elementsAfter = document.querySelectorAll('*').length;
    log(`Éléments DOM après clic: ${elementsAfter}`);
    log(`Différence: ${elementsAfter - elementsBefore} nouveaux éléments`);
    
    // Étape 6: Vérifier l'attribut aria-expanded
    const expandedAfter = firstButton.getAttribute('aria-expanded');
    log(`aria-expanded après clic: "${expandedAfter}"`);
    
    // Étape 7: Chercher tous les éléments visibles récemment ajoutés
    log('🔍 Recherche d\'éléments visibles...');
    const allElements = document.querySelectorAll('*');
    let visibleElements = 0;
    let hiddenElements = 0;
    
    Array.from(allElements).forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        visibleElements++;
      } else {
        hiddenElements++;
      }
    });
    
    log(`Éléments visibles: ${visibleElements}, cachés: ${hiddenElements}`);
    
    // Étape 8: Chercher spécifiquement les éléments de menu
    const menuSelectors = [
      '[role="menu"]',
      '[role="menuitem"]', 
      '[class*="dropdown"]',
      '[data-radix-dropdown-menu-content]',
      '[data-state="open"]',
      '[data-side]'
    ];
    
    log('🔍 Recherche avec sélecteurs spécifiques...');
    menuSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        log(`✅ ${selector}: ${elements.length} trouvé(s)`, 'success');
        elements.forEach((el, i) => {
          const style = window.getComputedStyle(el);
          const visible = style.display !== 'none' && style.visibility !== 'hidden';
          log(`  [${i}] Visible: ${visible}, Classes: ${el.className}`);
        });
      } else {
        log(`❌ ${selector}: 0 trouvé`);
      }
    });
    
    // Étape 9: Fermer en cliquant ailleurs
    log('🔄 Fermeture du menu...');
    document.body.click();
    await wait(500);
    
    const expandedFinal = firstButton.getAttribute('aria-expanded');
    log(`aria-expanded après fermeture: "${expandedFinal}"`);
    
    log('✅ Test terminé!', 'success');
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    console.error(error);
  }
}

// Lancer le test
testDropdownSimple();
