/**
 * Script de diagnostic pour les menus dropdown des commandes
 * À exécuter dans la console du navigateur sur /admin/orders
 */

console.log('🔍 DIAGNOSTIC MENU DROPDOWN - DÉMARRAGE');
console.log('=====================================');

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

async function diagnoseDropdownMenus() {
  try {
    // Étape 1: Trouver tous les boutons d'action
    log('🔍 Étape 1: Recherche des boutons d\'action');
    const actionButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
    log(`Trouvé ${actionButtons.length} boutons avec aria-haspopup="menu"`);
    
    if (actionButtons.length === 0) {
      // Chercher d'autres types de boutons
      const allButtons = document.querySelectorAll('button');
      log(`Trouvé ${allButtons.length} boutons au total`);
      
      // Chercher des boutons avec des icônes (trois points, etc.)
      const iconButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent.trim();
        return text === '⋮' || text === '...' || text === '•••' || btn.querySelector('svg');
      });
      log(`Trouvé ${iconButtons.length} boutons avec icônes`);
      return;
    }
    
    // Étape 2: Analyser le premier bouton d'action
    log('🔍 Étape 2: Analyse du premier bouton d\'action');
    const firstButton = actionButtons[0];
    log(`Bouton: ${firstButton.outerHTML.substring(0, 200)}...`);
    
    // Étape 3: Cliquer et analyser le menu
    log('🔍 Étape 3: Ouverture du menu et analyse');
    firstButton.click();
    
    // Attendre plusieurs durées pour voir quand le menu apparaît
    for (let delay of [100, 300, 500, 1000]) {
      await wait(delay);
      
      // Chercher avec différents sélecteurs
      const selectors = [
        '[role="menu"]',
        '[role="menuitem"]',
        '.dropdown-menu',
        '[data-radix-popper-content-wrapper]',
        '[data-side]',
        '[class*="menu"]',
        '[class*="dropdown"]',
        'div[style*="position: absolute"]',
        'div[style*="z-index"]'
      ];
      
      log(`--- Après ${delay}ms ---`);
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          log(`✅ ${selector}: ${elements.length} élément(s)`, 'success');
          
          // Analyser le contenu de chaque élément
          elements.forEach((el, index) => {
            const text = el.textContent.trim();
            const classes = el.className;
            log(`  [${index}] Classes: ${classes}`);
            log(`  [${index}] Texte: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
            
            // Chercher spécifiquement "préparation"
            if (text.toLowerCase().includes('préparation')) {
              log(`  🎯 TROUVÉ "préparation" dans l'élément ${index}!`, 'success');
            }
          });
        } else {
          log(`❌ ${selector}: 0 élément`);
        }
      }
    }
    
    // Étape 4: Chercher tous les éléments récemment ajoutés au DOM
    log('🔍 Étape 4: Recherche d\'éléments récemment ajoutés');
    const allElements = document.querySelectorAll('*');
    const recentElements = Array.from(allElements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'absolute' || style.position === 'fixed' || 
             parseInt(style.zIndex) > 10 || 
             el.getAttribute('data-radix-popper-content-wrapper') !== null;
    });
    
    log(`Trouvé ${recentElements.length} éléments avec position absolute/fixed ou z-index élevé`);
    
    recentElements.forEach((el, index) => {
      if (index < 5) { // Limiter à 5 pour éviter le spam
        const text = el.textContent.trim();
        log(`[${index}] ${el.tagName}.${el.className}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      }
    });
    
    // Étape 5: Fermer le menu
    log('🔍 Étape 5: Fermeture du menu');
    document.body.click();
    await wait(300);
    
    log('🏁 Diagnostic terminé!', 'success');
    
  } catch (error) {
    log(`❌ Erreur durant le diagnostic: ${error.message}`, 'error');
    console.error(error);
  }
}

// Lancer le diagnostic
diagnoseDropdownMenus();
