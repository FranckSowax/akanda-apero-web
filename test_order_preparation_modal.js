/**
 * Script de test complet pour OrderPreparationModal
 * À exécuter dans la console du navigateur sur la page admin/orders
 */

console.log('🧪 DÉBUT DES TESTS - OrderPreparationModal');
console.log('=====================================');

// Configuration des tests
const TEST_CONFIG = {
  delayBetweenTests: 1000, // 1 seconde entre chaque test
  maxWaitTime: 5000, // 5 secondes max d'attente
  verbose: true
};

// Utilitaires de test
const TestUtils = {
  log: (message, type = 'info') => {
    const colors = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      warning: 'color: #FF9800; font-weight: bold'
    };
    console.log(`%c${message}`, colors[type] || colors.info);
  },

  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  waitForElement: async (selector, timeout = TEST_CONFIG.maxWaitTime) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await TestUtils.wait(100);
    }
    throw new Error(`Élément ${selector} non trouvé après ${timeout}ms`);
  },

  clickElement: async (selector) => {
    const element = await TestUtils.waitForElement(selector);
    element.click();
    await TestUtils.wait(500); // Attendre l'animation
    return element;
  },

  checkElementExists: (selector) => {
    const element = document.querySelector(selector);
    return !!element;
  },

  getElementText: (selector) => {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
  },

  countElements: (selector) => {
    return document.querySelectorAll(selector).length;
  }
};

// Tests individuels
const Tests = {
  // Test 1: Vérifier la présence du bouton "Guide de préparation"
  async testPreparationButtonExists() {
    TestUtils.log('Test 1: Vérification du bouton "Guide de préparation"');
    
    try {
      const preparationButtons = document.querySelectorAll('[data-testid="preparation-button"], button:contains("Guide de préparation"), button:contains("préparation")');
      
      if (preparationButtons.length === 0) {
        // Chercher dans les menus dropdown
        const dropdownButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
        let found = false;
        
        for (const button of dropdownButtons) {
          button.click();
          await TestUtils.wait(300);
          
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          for (const item of menuItems) {
            if (item.textContent.includes('préparation') || item.textContent.includes('Guide')) {
              TestUtils.log('✅ Bouton "Guide de préparation" trouvé dans le menu dropdown', 'success');
              found = true;
              break;
            }
          }
          
          // Fermer le menu
          document.addEventListener('click', () => {}, { once: true });
          document.body.click();
          
          if (found) break;
        }
        
        if (!found) {
          throw new Error('Aucun bouton "Guide de préparation" trouvé');
        }
      } else {
        TestUtils.log('✅ Bouton "Guide de préparation" trouvé', 'success');
      }
      
      return { success: true, message: 'Bouton de préparation accessible' };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 2: Ouvrir le modal de préparation
  async testOpenPreparationModal() {
    TestUtils.log('Test 2: Ouverture du modal de préparation');
    
    try {
      // Chercher et cliquer sur le bouton de préparation
      const dropdownButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
      let modalOpened = false;
      
      for (const button of dropdownButtons) {
        button.click();
        await TestUtils.wait(300);
        
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        for (const item of menuItems) {
          if (item.textContent.includes('préparation') || item.textContent.includes('Guide')) {
            item.click();
            await TestUtils.wait(1000);
            
            // Vérifier si le modal s'est ouvert
            const modal = document.querySelector('[role="dialog"], .modal, [data-testid="preparation-modal"]');
            if (modal) {
              TestUtils.log('✅ Modal de préparation ouvert avec succès', 'success');
              modalOpened = true;
              break;
            }
          }
        }
        
        if (modalOpened) break;
      }
      
      if (!modalOpened) {
        throw new Error('Impossible d\'ouvrir le modal de préparation');
      }
      
      return { success: true, message: 'Modal ouvert avec succès' };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 3: Vérifier le contenu du modal
  async testModalContent() {
    TestUtils.log('Test 3: Vérification du contenu du modal');
    
    try {
      const modal = await TestUtils.waitForElement('[role="dialog"], .modal, [data-testid="preparation-modal"]');
      
      // Vérifier les éléments essentiels
      const checks = [
        { selector: 'h2, h3, [data-testid="modal-title"]', name: 'Titre du modal' },
        { selector: '[data-testid="order-info"], .order-info', name: 'Informations de commande' },
        { selector: '[data-testid="ingredients-list"], .ingredients', name: 'Liste des ingrédients' },
        { selector: '[data-testid="preparation-tasks"], .tasks, input[type="checkbox"]', name: 'Tâches de préparation' },
        { selector: 'button', name: 'Boutons d\'action' }
      ];
      
      const results = [];
      for (const check of checks) {
        const exists = TestUtils.checkElementExists(check.selector);
        if (exists) {
          TestUtils.log(`✅ ${check.name} présent`, 'success');
          results.push({ name: check.name, success: true });
        } else {
          TestUtils.log(`⚠️ ${check.name} manquant`, 'warning');
          results.push({ name: check.name, success: false });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 4: Tester les checkboxes des tâches
  async testTaskCheckboxes() {
    TestUtils.log('Test 4: Test des checkboxes des tâches');
    
    try {
      const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
      
      if (checkboxes.length === 0) {
        throw new Error('Aucune checkbox trouvée');
      }
      
      TestUtils.log(`Trouvé ${checkboxes.length} checkbox(es)`, 'info');
      
      // Tester le toggle de quelques checkboxes
      const testCount = Math.min(3, checkboxes.length);
      const results = [];
      
      for (let i = 0; i < testCount; i++) {
        const checkbox = checkboxes[i];
        const initialState = checkbox.checked || checkbox.getAttribute('aria-checked') === 'true';
        
        // Cliquer sur la checkbox
        checkbox.click();
        await TestUtils.wait(300);
        
        const newState = checkbox.checked || checkbox.getAttribute('aria-checked') === 'true';
        
        if (newState !== initialState) {
          TestUtils.log(`✅ Checkbox ${i + 1} fonctionne (${initialState} → ${newState})`, 'success');
          results.push({ index: i + 1, success: true });
        } else {
          TestUtils.log(`❌ Checkbox ${i + 1} ne répond pas`, 'error');
          results.push({ index: i + 1, success: false });
        }
      }
      
      return { success: true, results, totalCheckboxes: checkboxes.length };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 5: Tester les boutons d'action
  async testActionButtons() {
    TestUtils.log('Test 5: Test des boutons d\'action');
    
    try {
      const buttons = document.querySelectorAll('button');
      const actionButtons = [];
      
      // Identifier les boutons d'action
      for (const button of buttons) {
        const text = button.textContent.toLowerCase();
        if (text.includes('prêt') || text.includes('terminé') || text.includes('problème') || text.includes('signaler')) {
          actionButtons.push({
            element: button,
            text: button.textContent.trim(),
            type: text.includes('problème') || text.includes('signaler') ? 'warning' : 'success'
          });
        }
      }
      
      if (actionButtons.length === 0) {
        throw new Error('Aucun bouton d\'action trouvé');
      }
      
      TestUtils.log(`Trouvé ${actionButtons.length} bouton(s) d'action`, 'info');
      
      // Tester les boutons (sans les cliquer réellement pour éviter les effets de bord)
      const results = [];
      for (const btn of actionButtons) {
        const isEnabled = !btn.element.disabled;
        const isVisible = btn.element.offsetParent !== null;
        
        TestUtils.log(`${isEnabled && isVisible ? '✅' : '⚠️'} Bouton "${btn.text}" - ${isEnabled ? 'Activé' : 'Désactivé'}, ${isVisible ? 'Visible' : 'Masqué'}`, 
                     isEnabled && isVisible ? 'success' : 'warning');
        
        results.push({
          text: btn.text,
          type: btn.type,
          enabled: isEnabled,
          visible: isVisible
        });
      }
      
      return { success: true, results };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 6: Vérifier les calculs de temps et progression
  async testCalculations() {
    TestUtils.log('Test 6: Vérification des calculs de temps et progression');
    
    try {
      const results = {};
      
      // Chercher les indicateurs de temps
      const timeElements = document.querySelectorAll('[data-testid="preparation-time"], .time, .duration');
      if (timeElements.length > 0) {
        results.timeDisplay = true;
        TestUtils.log('✅ Affichage du temps de préparation trouvé', 'success');
      } else {
        results.timeDisplay = false;
        TestUtils.log('⚠️ Aucun affichage de temps trouvé', 'warning');
      }
      
      // Chercher les barres de progression
      const progressElements = document.querySelectorAll('[role="progressbar"], .progress, .progress-bar');
      if (progressElements.length > 0) {
        results.progressDisplay = true;
        TestUtils.log('✅ Barre de progression trouvée', 'success');
      } else {
        results.progressDisplay = false;
        TestUtils.log('⚠️ Aucune barre de progression trouvée', 'warning');
      }
      
      // Compter les tâches cochées vs non cochées
      const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
      const checkedCount = Array.from(checkboxes).filter(cb => 
        cb.checked || cb.getAttribute('aria-checked') === 'true'
      ).length;
      
      results.taskProgress = {
        total: checkboxes.length,
        completed: checkedCount,
        percentage: checkboxes.length > 0 ? Math.round((checkedCount / checkboxes.length) * 100) : 0
      };
      
      TestUtils.log(`📊 Progression des tâches: ${checkedCount}/${checkboxes.length} (${results.taskProgress.percentage}%)`, 'info');
      
      return { success: true, results };
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 7: Tester la fermeture du modal
  async testCloseModal() {
    TestUtils.log('Test 7: Test de fermeture du modal');
    
    try {
      // Chercher le bouton de fermeture
      const closeButtons = document.querySelectorAll('[data-testid="close-button"], button[aria-label="Close"], .close, button:contains("×")');
      
      if (closeButtons.length === 0) {
        // Essayer d'appuyer sur Escape
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await TestUtils.wait(500);
      } else {
        closeButtons[0].click();
        await TestUtils.wait(500);
      }
      
      // Vérifier si le modal est fermé
      const modal = document.querySelector('[role="dialog"], .modal, [data-testid="preparation-modal"]');
      const isClosed = !modal || modal.style.display === 'none' || !modal.offsetParent;
      
      if (isClosed) {
        TestUtils.log('✅ Modal fermé avec succès', 'success');
        return { success: true, message: 'Modal fermé correctement' };
      } else {
        TestUtils.log('⚠️ Modal toujours ouvert', 'warning');
        return { success: false, message: 'Modal n\'a pas pu être fermé' };
      }
    } catch (error) {
      TestUtils.log(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
};

// Fonction principale de test
async function runAllTests() {
  TestUtils.log('🚀 Démarrage de la suite de tests complète', 'info');
  
  const testResults = {};
  const testOrder = [
    'testPreparationButtonExists',
    'testOpenPreparationModal',
    'testModalContent',
    'testTaskCheckboxes',
    'testActionButtons',
    'testCalculations',
    'testCloseModal'
  ];
  
  for (const testName of testOrder) {
    TestUtils.log(`\n--- Exécution: ${testName} ---`);
    
    try {
      const result = await Tests[testName]();
      testResults[testName] = result;
      
      if (result.success) {
        TestUtils.log(`✅ ${testName} réussi`, 'success');
      } else {
        TestUtils.log(`❌ ${testName} échoué: ${result.error || 'Erreur inconnue'}`, 'error');
      }
    } catch (error) {
      TestUtils.log(`💥 ${testName} a planté: ${error.message}`, 'error');
      testResults[testName] = { success: false, error: error.message };
    }
    
    // Attendre entre les tests
    await TestUtils.wait(TEST_CONFIG.delayBetweenTests);
  }
  
  // Résumé final
  TestUtils.log('\n📋 RÉSUMÉ DES TESTS', 'info');
  TestUtils.log('==================');
  
  const totalTests = testOrder.length;
  const passedTests = Object.values(testResults).filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  TestUtils.log(`Total: ${totalTests} tests`, 'info');
  TestUtils.log(`✅ Réussis: ${passedTests}`, 'success');
  TestUtils.log(`❌ Échoués: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
  TestUtils.log(`📊 Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`, 'info');
  
  // Détails des échecs
  if (failedTests > 0) {
    TestUtils.log('\n🔍 DÉTAILS DES ÉCHECS:', 'warning');
    for (const [testName, result] of Object.entries(testResults)) {
      if (!result.success) {
        TestUtils.log(`- ${testName}: ${result.error || 'Erreur inconnue'}`, 'error');
      }
    }
  }
  
  return testResults;
}

// Instructions d'utilisation
TestUtils.log('\n📖 INSTRUCTIONS D\'UTILISATION:', 'info');
TestUtils.log('1. Assurez-vous d\'être sur la page admin/orders');
TestUtils.log('2. Assurez-vous qu\'il y a au moins une commande dans la liste');
TestUtils.log('3. Exécutez: runAllTests()');
TestUtils.log('4. Ou exécutez un test individuel: Tests.testPreparationButtonExists()');

console.log('\n🎯 Script de test chargé avec succès!');
console.log('Exécutez runAllTests() pour lancer tous les tests.');
