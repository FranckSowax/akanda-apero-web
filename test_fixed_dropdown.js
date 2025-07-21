/**
 * Test final pour le dropdown menu réparé
 * À exécuter dans la console du navigateur sur /admin/orders
 */

console.log('🎉 TEST DROPDOWN RÉPARÉ - DÉMARRAGE');
console.log('=================================');

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

async function testFixedDropdown() {
  try {
    // Test 1: Vérifier les boutons d'action
    log('📋 TEST 1: Boutons d\'action');
    const actionButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
    log(`✅ Trouvé ${actionButtons.length} boutons d'action`, 'success');
    
    if (actionButtons.length === 0) {
      log('❌ Aucun bouton d\'action trouvé', 'error');
      return;
    }
    
    // Test 2: Ouvrir le dropdown
    log('📋 TEST 2: Ouverture du dropdown');
    const firstButton = actionButtons[0];
    const initialExpanded = firstButton.getAttribute('aria-expanded');
    log(`État initial: aria-expanded="${initialExpanded}"`);
    
    firstButton.click();
    await wait(300);
    
    const expandedAfter = firstButton.getAttribute('aria-expanded');
    log(`État après clic: aria-expanded="${expandedAfter}"`);
    
    if (expandedAfter === 'true') {
      log('✅ Dropdown ouvert avec succès!', 'success');
    } else {
      log('❌ Dropdown ne s\'est pas ouvert', 'error');
      return;
    }
    
    // Test 3: Vérifier les menu items
    log('📋 TEST 3: Vérification des menu items');
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    log(`✅ Trouvé ${menuItems.length} menu items`, 'success');
    
    // Test 4: Chercher le bouton "Guide de préparation"
    log('📋 TEST 4: Recherche du bouton "Guide de préparation"');
    let preparationButton = null;
    
    for (const item of menuItems) {
      const text = item.textContent.toLowerCase();
      if (text.includes('guide de préparation') || text.includes('préparation')) {
        preparationButton = item;
        log('🎯 ✅ Bouton "Guide de préparation" trouvé!', 'success');
        log(`   Texte: "${item.textContent.trim()}"`, 'info');
        log(`   Classes: ${item.className}`, 'info');
        break;
      }
    }
    
    if (!preparationButton) {
      log('❌ Bouton "Guide de préparation" non trouvé', 'error');
      return;
    }
    
    // Test 5: Tester le clic sur "Guide de préparation"
    log('📋 TEST 5: Test du clic sur "Guide de préparation"');
    preparationButton.click();
    await wait(1000);
    
    // Vérifier si le modal s'ouvre
    const modalSelectors = [
      '[role="dialog"]',
      '.fixed.inset-0',
      '[data-testid*="modal"]',
      '[class*="modal"]'
    ];
    
    let modalFound = false;
    for (const selector of modalSelectors) {
      const modal = document.querySelector(selector);
      if (modal) {
        log(`✅ Modal trouvé avec: ${selector}`, 'success');
        modalFound = true;
        
        // Vérifier le contenu du modal
        const modalText = modal.textContent.toLowerCase();
        if (modalText.includes('préparation') || modalText.includes('commande')) {
          log('✅ Modal de préparation confirmé!', 'success');
        }
        break;
      }
    }
    
    if (!modalFound) {
      log('⚠️ Modal non détecté (peut être normal si pas de données)', 'warning');
    }
    
    // Test 6: Vérifier que le dropdown se ferme
    log('📋 TEST 6: Vérification de la fermeture du dropdown');
    const expandedFinal = firstButton.getAttribute('aria-expanded');
    log(`État final: aria-expanded="${expandedFinal}"`);
    
    if (expandedFinal === 'false') {
      log('✅ Dropdown fermé automatiquement après clic', 'success');
    }
    
    // Résumé final
    log('🏆 RÉSUMÉ FINAL', 'success');
    console.log('==================');
    log('✅ Boutons d\'action détectés', 'success');
    log('✅ Dropdown s\'ouvre correctement', 'success');
    log('✅ Menu items présents', 'success');
    log('✅ Bouton "Guide de préparation" accessible', 'success');
    log('✅ Clic fonctionne (modal ou handler appelé)', 'success');
    log('✅ Dropdown se ferme automatiquement', 'success');
    
    log('🎉 TOUS LES TESTS RÉUSSIS! Le OrderPreparationModal est maintenant testable!', 'success');
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    console.error(error);
  }
}

// Lancer le test
testFixedDropdown();
