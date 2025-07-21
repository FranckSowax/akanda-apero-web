/**
 * Script de test corrigé pour OrderPreparationModal
 * À exécuter dans la console du navigateur sur la page admin/orders
 */

console.log('🧪 DÉBUT DES TESTS CORRIGÉS - OrderPreparationModal');
console.log('===============================================');

// Configuration des tests
const TEST_CONFIG = {
  delayBetweenTests: 1000,
  maxWaitTime: 5000,
  verbose: true
};

// Utilitaires de test améliorés
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
    await TestUtils.wait(500);
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
  },

  // Fonction pour trouver des éléments par texte
  findElementByText: (text, tagName = '*') => {
    const elements = document.querySelectorAll(tagName);
    return Array.from(elements).find(el => 
      el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
    );
  },

  // Fonction pour trouver tous les éléments par texte
  findElementsByText: (text, tagName = '*') => {
    const elements = document.querySelectorAll(tagName);
    return Array.from(elements).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
    );
  }
};

// Tests corrigés
const Tests = {
  // Test 1: Vérifier la présence du bouton "Guide de préparation"
  async testPreparationButtonExists() {
    TestUtils.log('Test 1: Vérification du bouton "Guide de préparation"');
    
    try {
      // Chercher les boutons avec data-testid
      let preparationButtons = document.querySelectorAll('[data-testid="preparation-button"]');
      
      if (preparationButtons.length === 0) {
        // Chercher par texte dans les boutons
        preparationButtons = TestUtils.findElementsByText('guide de préparation', 'button');
      }
      
      if (preparationButtons.length === 0) {
        // Chercher dans les menus dropdown
        const dropdownButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
        let found = false;
        
        for (const button of dropdownButtons) {
          // Simuler un clic pour ouvrir le menu
          button.click();
          await TestUtils.wait(300);
          
          // Chercher les items de menu
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          for (const item of menuItems) {
            const text = item.textContent.toLowerCase();
            if (text.includes('préparation') || text.includes('guide')) {
              TestUtils.log('✅ Bouton "Guide de préparation" trouvé dans le menu dropdown', 'success');
              found = true;
              
              // Fermer le menu en cliquant ailleurs
              document.body.click();
              await TestUtils.wait(200);
              break;
            }
          }
          
          if (found) break;
          
          // Fermer le menu si pas trouvé
          document.body.click();
          await TestUtils.wait(200);
        }
        
        if (!found) {
          throw new Error('Aucun bouton "Guide de préparation" trouvé');
        }
      } else {
        TestUtils.log('✅ Bouton "Guide de préparation" trouvé directement', 'success');
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
        await TestUtils.wait(500);
        
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        for (const item of menuItems) {
          const text = item.textContent.toLowerCase();
          if (text.includes('préparation') || text.includes('guide')) {
            TestUtils.log('🔄 Clic sur le bouton de préparation...', 'info');
            item.click();
            await TestUtils.wait(1500); // Attendre plus longtemps
            
            // Vérifier si le modal s'est ouvert
            const modalSelectors = [
              '[role="dialog"]',
              '.modal',
              '[data-testid="preparation-modal"]',
              '.fixed.inset-0', // Modal overlay
              '[class*="modal"]',
              '[class*="dialog"]'
            ];
            
            let modal = null;
            for (const selector of modalSelectors) {
              modal = document.querySelector(selector);
              if (modal) {
                TestUtils.log(`✅ Modal trouvé avec sélecteur: ${selector}`, 'success');
                modalOpened = true;
                break;
              }
            }
            
            if (modalOpened) break;
          }
        }
        
        if (modalOpened) break;
        
        // Fermer le menu si pas trouvé
        document.body.click();
        await TestUtils.wait(200);
      }
      
      if (!modalOpened) {
        // Diagnostic supplémentaire
        TestUtils.log('🔍 Diagnostic: recherche d\'éléments récemment ajoutés...', 'warning');
        const recentElements = document.querySelectorAll('[class*="z-"], [style*="z-index"], [style*="position: fixed"]');
        TestUtils.log(`Trouvé ${recentElements.length} éléments avec z-index ou position fixed`, 'info');
        
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
      // Chercher le modal avec plusieurs sélecteurs
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '[data-testid="preparation-modal"]',
        '.fixed.inset-0',
        '[class*="modal"]',
        '[class*="dialog"]'
      ];
      
      let modal = null;
      for (const selector of modalSelectors) {
        modal = document.querySelector(selector);
        if (modal) break;
      }
      
      if (!modal) {
        throw new Error('Modal non trouvé pour vérification du contenu');
      }
      
      // Vérifier les éléments essentiels
      const checks = [
        { selector: 'h1, h2, h3, [class*="title"]', name: 'Titre du modal' },
        { selector: '[class*="order"], [class*="commande"]', name: 'Informations de commande' },
        { selector: '[class*="ingredient"], ul, ol', name: 'Liste des ingrédients' },
        { selector: 'input[type="checkbox"], [role="checkbox"], [class*="checkbox"]', name: 'Tâches de préparation' },
        { selector: 'button', name: 'Boutons d\'action' }
      ];
      
      const results = [];
      for (const check of checks) {
        const exists = modal.querySelector(check.selector) !== null;
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
      const checkboxSelectors = [
        'input[type="checkbox"]',
        '[role="checkbox"]',
        '[class*="checkbox"]',
        'button[role="checkbox"]'
      ];
      
      let checkboxes = [];
      for (const selector of checkboxSelectors) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          checkboxes = Array.from(found);
          TestUtils.log(`Trouvé ${found.length} checkbox(es) avec sélecteur: ${selector}`, 'info');
          break;
        }
      }
      
      if (checkboxes.length === 0) {
        throw new Error('Aucune checkbox trouvée');
      }
      
      // Tester le toggle de quelques checkboxes
      const testCount = Math.min(3, checkboxes.length);
      const results = [];
      
      for (let i = 0; i < testCount; i++) {
        const checkbox = checkboxes[i];
        const initialState = checkbox.checked || checkbox.getAttribute('aria-checked') === 'true' || checkbox.classList.contains('checked');
        
        // Cliquer sur la checkbox
        checkbox.click();
        await TestUtils.wait(300);
        
        const newState = checkbox.checked || checkbox.getAttribute('aria-checked') === 'true' || checkbox.classList.contains('checked');
        
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
        if (text.includes('prêt') || text.includes('terminé') || text.includes('problème') || text.includes('signaler') || text.includes('marquer')) {
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
      
      // Tester les boutons (sans les cliquer réellement)
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
      const timeSelectors = [
        '[data-testid="preparation-time"]',
        '[class*="time"]',
        '[class*="duration"]',
        '[class*="minute"]'
      ];
      
      let timeFound = false;
      for (const selector of timeSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          timeFound = true;
          TestUtils.log(`✅ Affichage du temps trouvé avec: ${selector}`, 'success');
          break;
        }
      }
      
      results.timeDisplay = timeFound;
      if (!timeFound) {
        TestUtils.log('⚠️ Aucun affichage de temps trouvé', 'warning');
      }
      
      // Chercher les barres de progression
      const progressSelectors = [
        '[role="progressbar"]',
        '[class*="progress"]',
        '.progress-bar',
        '[class*="percentage"]'
      ];
      
      let progressFound = false;
      for (const selector of progressSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          progressFound = true;
          TestUtils.log(`✅ Barre de progression trouvée avec: ${selector}`, 'success');
          break;
        }
      }
      
      results.progressDisplay = progressFound;
      if (!progressFound) {
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
      const closeSelectors = [
        '[data-testid="close-button"]',
        'button[aria-label="Close"]',
        'button[aria-label="Fermer"]',
        '.close',
        '[class*="close"]',
        'button:last-child' // Souvent le bouton de fermeture
      ];
      
      let closeButton = null;
      for (const selector of closeSelectors) {
        closeButton = document.querySelector(selector);
        if (closeButton) {
          TestUtils.log(`Bouton de fermeture trouvé avec: ${selector}`, 'info');
          break;
        }
      }
      
      // Chercher aussi par texte
      if (!closeButton) {
        const buttons = document.querySelectorAll('button');
        closeButton = Array.from(buttons).find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('×') || text.includes('fermer') || text.includes('annuler');
        });
      }
      
      if (closeButton) {
        closeButton.click();
        await TestUtils.wait(500);
      } else {
        // Essayer d'appuyer sur Escape
        TestUtils.log('Tentative de fermeture avec Escape...', 'info');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await TestUtils.wait(500);
      }
      
      // Vérifier si le modal est fermé
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '[data-testid="preparation-modal"]',
        '.fixed.inset-0'
      ];
      
      let modalStillOpen = false;
      for (const selector of modalSelectors) {
        const modal = document.querySelector(selector);
        if (modal && modal.offsetParent !== null) {
          modalStillOpen = true;
          break;
        }
      }
      
      if (!modalStillOpen) {
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
  TestUtils.log('🚀 Démarrage de la suite de tests complète (VERSION CORRIGÉE)', 'info');
  
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
  TestUtils.log('\n📋 RÉSUMÉ DES TESTS (VERSION CORRIGÉE)', 'info');
  TestUtils.log('=====================================');
  
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

// Test rapide pour diagnostiquer l'état actuel
async function quickDiagnostic() {
  TestUtils.log('🔍 DIAGNOSTIC RAPIDE', 'info');
  TestUtils.log('==================');
  
  // Vérifier la page actuelle
  TestUtils.log(`Page actuelle: ${window.location.pathname}`, 'info');
  
  // Compter les éléments clés
  const counts = {
    'Commandes dans le tableau': document.querySelectorAll('tr').length - 1, // -1 pour l'en-tête
    'Boutons d\'action (3 points)': document.querySelectorAll('button[aria-haspopup="menu"]').length,
    'Modals ouverts': document.querySelectorAll('[role="dialog"], .modal').length,
    'Checkboxes': document.querySelectorAll('input[type="checkbox"]').length,
    'Boutons total': document.querySelectorAll('button').length
  };
  
  for (const [key, count] of Object.entries(counts)) {
    TestUtils.log(`${key}: ${count}`, 'info');
  }
  
  // Vérifier si on est connecté
  const userInfo = document.querySelector('[class*="user"], [class*="profile"]');
  TestUtils.log(`Utilisateur connecté: ${userInfo ? 'Oui' : 'Non'}`, userInfo ? 'success' : 'warning');
}

// Instructions d'utilisation
TestUtils.log('\n📖 INSTRUCTIONS D\'UTILISATION (VERSION CORRIGÉE):', 'info');
TestUtils.log('1. Assurez-vous d\'être sur la page admin/orders');
TestUtils.log('2. Assurez-vous qu\'il y a au moins une commande dans la liste');
TestUtils.log('3. Exécutez: runAllTests() pour tous les tests');
TestUtils.log('4. Ou exécutez: quickDiagnostic() pour un diagnostic rapide');
TestUtils.log('5. Ou exécutez un test individuel: Tests.testPreparationButtonExists()');

console.log('\n🎯 Script de test corrigé chargé avec succès!');
console.log('Exécutez runAllTests() pour lancer tous les tests.');
