/**
 * Test complet et simplifié pour OrderPreparationModal
 * À copier-coller dans la console du navigateur sur /admin/orders
 */

console.log('🧪 TEST ORDERPREPARATIONMODAL - DÉMARRAGE');
console.log('==========================================');

// Fonction utilitaire pour attendre
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour logger avec couleurs
const log = (message, type = 'info') => {
  const colors = {
    info: 'color: #2196F3',
    success: 'color: #4CAF50; font-weight: bold',
    error: 'color: #F44336; font-weight: bold',
    warning: 'color: #FF9800; font-weight: bold'
  };
  console.log(`%c${message}`, colors[type]);
};

// Tests principaux
async function runAllTests() {
  const results = [];
  
  try {
    // TEST 1: Vérifier la présence des boutons d'action
    log('📋 TEST 1: Recherche des boutons d\'action dans les commandes');
    const actionButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
    log(`Trouvé ${actionButtons.length} boutons d'action`, actionButtons.length > 0 ? 'success' : 'error');
    results.push({ test: 'Boutons d\'action', success: actionButtons.length > 0 });
    
    if (actionButtons.length === 0) {
      log('❌ Aucun bouton d\'action trouvé. Vérifiez que des commandes sont affichées.', 'error');
      return results;
    }
    
    // TEST 2: Ouvrir le premier menu d'actions
    log('📋 TEST 2: Ouverture du menu d\'actions');
    const firstButton = actionButtons[0];
    firstButton.click();
    await wait(500);
    
    // Chercher l'item "Guide de préparation"
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    log(`Trouvé ${menuItems.length} items de menu`);
    
    let preparationButton = null;
    for (const item of menuItems) {
      const text = item.textContent.toLowerCase();
      if (text.includes('préparation') || text.includes('guide')) {
        preparationButton = item;
        log('✅ Bouton "Guide de préparation" trouvé', 'success');
        break;
      }
    }
    
    results.push({ test: 'Bouton Guide de préparation', success: !!preparationButton });
    
    if (!preparationButton) {
      log('❌ Bouton "Guide de préparation" non trouvé dans le menu', 'error');
      // Fermer le menu
      document.body.click();
      return results;
    }
    
    // TEST 3: Ouvrir le modal de préparation
    log('📋 TEST 3: Ouverture du modal de préparation');
    preparationButton.click();
    await wait(1500); // Attendre le chargement du modal
    
    // Chercher le modal avec différents sélecteurs
    const modalSelectors = [
      '[role="dialog"]',
      '.fixed.inset-0',
      '[data-testid*="modal"]',
      '[class*="modal"]',
      '.z-50'
    ];
    
    let modal = null;
    for (const selector of modalSelectors) {
      modal = document.querySelector(selector);
      if (modal) {
        log(`✅ Modal trouvé avec: ${selector}`, 'success');
        break;
      }
    }
    
    results.push({ test: 'Ouverture du modal', success: !!modal });
    
    if (!modal) {
      log('❌ Modal non trouvé après clic', 'error');
      return results;
    }
    
    // TEST 4: Vérifier le contenu du modal
    log('📋 TEST 4: Vérification du contenu du modal');
    
    const contentChecks = [
      { selector: 'h1, h2, h3', name: 'Titre' },
      { selector: 'button', name: 'Boutons' },
      { selector: 'input[type="checkbox"], [role="checkbox"]', name: 'Checkboxes' },
      { selector: 'ul, ol, [class*="list"]', name: 'Listes' },
      { selector: '[class*="progress"], [class*="time"]', name: 'Indicateurs de progression' }
    ];
    
    for (const check of contentChecks) {
      const elements = modal.querySelectorAll(check.selector);
      const found = elements.length > 0;
      log(`${found ? '✅' : '⚠️'} ${check.name}: ${elements.length} trouvé(s)`, found ? 'success' : 'warning');
      results.push({ test: `Contenu - ${check.name}`, success: found, count: elements.length });
    }
    
    // TEST 5: Tester les checkboxes
    log('📋 TEST 5: Test des checkboxes de tâches');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
    
    if (checkboxes.length > 0) {
      log(`Trouvé ${checkboxes.length} checkboxes`);
      
      // Tester le premier checkbox
      const firstCheckbox = checkboxes[0];
      const initialState = firstCheckbox.checked || firstCheckbox.getAttribute('aria-checked') === 'true';
      
      // Cliquer sur le checkbox
      firstCheckbox.click();
      await wait(300);
      
      const newState = firstCheckbox.checked || firstCheckbox.getAttribute('aria-checked') === 'true';
      const stateChanged = initialState !== newState;
      
      log(`${stateChanged ? '✅' : '❌'} Checkbox interactif: ${initialState} → ${newState}`, stateChanged ? 'success' : 'error');
      results.push({ test: 'Checkboxes interactifs', success: stateChanged });
    } else {
      log('⚠️ Aucun checkbox trouvé', 'warning');
      results.push({ test: 'Checkboxes interactifs', success: false });
    }
    
    // TEST 6: Tester les boutons d'action
    log('📋 TEST 6: Test des boutons d\'action du modal');
    const modalButtons = modal.querySelectorAll('button');
    
    let actionButtonsFound = 0;
    const buttonTexts = [];
    
    for (const button of modalButtons) {
      const text = button.textContent.trim().toLowerCase();
      buttonTexts.push(text);
      
      if (text.includes('commencer') || text.includes('terminer') || text.includes('valider') || text.includes('fermer')) {
        actionButtonsFound++;
      }
    }
    
    log(`✅ ${actionButtonsFound} boutons d'action trouvés sur ${modalButtons.length} total`, 'success');
    log(`Boutons: ${buttonTexts.join(', ')}`, 'info');
    results.push({ test: 'Boutons d\'action du modal', success: actionButtonsFound > 0, count: actionButtonsFound });
    
    // TEST 7: Fermer le modal
    log('📋 TEST 7: Fermeture du modal');
    
    // Chercher le bouton de fermeture
    let closeButton = modal.querySelector('button[aria-label*="fermer"], button[aria-label*="close"], [data-testid*="close"]');
    
    if (!closeButton) {
      // Chercher par texte
      for (const button of modalButtons) {
        const text = button.textContent.toLowerCase();
        if (text.includes('fermer') || text.includes('annuler') || text === '×') {
          closeButton = button;
          break;
        }
      }
    }
    
    if (closeButton) {
      closeButton.click();
      await wait(500);
      
      // Vérifier si le modal est fermé
      const modalStillVisible = document.querySelector('[role="dialog"], .fixed.inset-0');
      const modalClosed = !modalStillVisible;
      
      log(`${modalClosed ? '✅' : '❌'} Modal fermé`, modalClosed ? 'success' : 'error');
      results.push({ test: 'Fermeture du modal', success: modalClosed });
    } else {
      log('⚠️ Bouton de fermeture non trouvé', 'warning');
      results.push({ test: 'Fermeture du modal', success: false });
      
      // Essayer de fermer en cliquant sur l'overlay
      document.body.click();
      await wait(500);
    }
    
  } catch (error) {
    log(`❌ Erreur durant les tests: ${error.message}`, 'error');
    results.push({ test: 'Erreur générale', success: false, error: error.message });
  }
  
  // RÉSUMÉ FINAL
  log('📊 RÉSUMÉ DES TESTS', 'info');
  console.log('==================');
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  log(`Total: ${totalTests} tests`, 'info');
  log(`✅ Réussis: ${successfulTests}`, 'success');
  log(`❌ Échoués: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
  
  // Détail des résultats
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const count = result.count ? ` (${result.count})` : '';
    log(`${status} ${result.test}${count}`, result.success ? 'success' : 'error');
  });
  
  return results;
}

// Lancer les tests
log('🚀 Lancement des tests automatiques...', 'info');
runAllTests().then(results => {
  log('🏁 Tests terminés!', 'success');
}).catch(error => {
  log(`💥 Erreur fatale: ${error.message}`, 'error');
});
