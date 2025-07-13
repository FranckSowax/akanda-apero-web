// Script de test pour vérifier le flux de checkout amélioré
// À exécuter dans la console du navigateur sur la page panier

console.log('🧪 TEST DU FLUX DE CHECKOUT AMÉLIORÉ');

// Fonction pour simuler le clic sur le bouton checkout
function testCheckoutButton() {
  console.log('🔘 Test du bouton checkout...');
  
  // Chercher les boutons de checkout
  const desktopButton = document.querySelector('a[href*="/checkout"] button, a[href*="/auth"] button');
  const mobileButton = document.querySelector('.md\\:hidden a[href*="/checkout"] button, .md\\:hidden a[href*="/auth"] button');
  
  console.log('🖥️ Bouton desktop trouvé:', !!desktopButton);
  console.log('📱 Bouton mobile trouvé:', !!mobileButton);
  
  if (desktopButton) {
    console.log('🖥️ Texte du bouton desktop:', desktopButton.textContent.trim());
    console.log('🖥️ Bouton desktop désactivé:', desktopButton.disabled);
  }
  
  if (mobileButton) {
    console.log('📱 Texte du bouton mobile:', mobileButton.textContent.trim());
    console.log('📱 Bouton mobile désactivé:', mobileButton.disabled);
  }
}

// Fonction pour vérifier l'état d'authentification
function checkAuthState() {
  console.log('🔐 Vérification de l\'état d\'authentification...');
  
  // Vérifier si les logs de debug sont présents
  const originalLog = console.log;
  let authLogs = [];
  
  console.log = function(...args) {
    if (args[0] && args[0].includes('Cart - État auth')) {
      authLogs.push(args);
    }
    originalLog.apply(console, args);
  };
  
  // Attendre un peu pour capturer les logs
  setTimeout(() => {
    console.log = originalLog;
    console.log('📊 Logs d\'authentification capturés:', authLogs.length);
    authLogs.forEach(log => console.log('📝', ...log));
  }, 1000);
}

// Fonction pour tester la navigation
function testNavigation() {
  console.log('🧭 Test de navigation...');
  
  // Intercepter les clics sur les liens
  const links = document.querySelectorAll('a[href*="/checkout"], a[href*="/auth"]');
  
  links.forEach((link, index) => {
    const originalHref = link.href;
    console.log(`🔗 Lien ${index + 1}: ${originalHref}`);
    
    // Ajouter un listener temporaire pour capturer les clics
    link.addEventListener('click', function(e) {
      console.log(`🖱️ Clic sur le lien ${index + 1}:`, {
        href: this.href,
        target: e.target.textContent.trim(),
        timestamp: new Date().toISOString()
      });
    }, { once: true });
  });
}

// Fonction pour vérifier les états de chargement
function checkLoadingStates() {
  console.log('⏳ Vérification des états de chargement...');
  
  // Chercher les indicateurs de chargement
  const loadingButtons = document.querySelectorAll('button:disabled');
  const spinners = document.querySelectorAll('.animate-spin');
  
  console.log('🔄 Boutons en chargement:', loadingButtons.length);
  console.log('🌀 Spinners trouvés:', spinners.length);
  
  loadingButtons.forEach((button, index) => {
    console.log(`⏳ Bouton ${index + 1} en chargement:`, button.textContent.trim());
  });
}

// Fonction pour surveiller les changements d'état
function monitorStateChanges() {
  console.log('👀 Surveillance des changements d\'état...');
  
  // Observer les changements dans le DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        // Vérifier si c'est lié aux boutons de checkout
        const target = mutation.target;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          console.log('🔄 Changement détecté sur un bouton:', {
            type: mutation.type,
            target: target.textContent?.trim() || 'N/A',
            disabled: target.disabled,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  });
  
  // Observer les boutons de checkout
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (button.textContent.includes('checkout') || 
        button.textContent.includes('paiement') || 
        button.textContent.includes('connecter') ||
        button.textContent.includes('Chargement')) {
      observer.observe(button, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
    }
  });
  
  // Arrêter l'observation après 30 secondes
  setTimeout(() => {
    observer.disconnect();
    console.log('🛑 Surveillance arrêtée après 30 secondes');
  }, 30000);
}

// Exécution automatique des tests
console.log('🚀 Démarrage des tests...');
testCheckoutButton();
checkAuthState();
testNavigation();
checkLoadingStates();
monitorStateChanges();

// Fonctions disponibles dans la console
window.testCheckout = {
  button: testCheckoutButton,
  auth: checkAuthState,
  navigation: testNavigation,
  loading: checkLoadingStates,
  monitor: monitorStateChanges
};

console.log('🛠️ Fonctions de test disponibles:');
console.log('- testCheckout.button() - Tester les boutons');
console.log('- testCheckout.auth() - Vérifier l\'authentification');
console.log('- testCheckout.navigation() - Tester la navigation');
console.log('- testCheckout.loading() - Vérifier les états de chargement');
console.log('- testCheckout.monitor() - Surveiller les changements');

console.log('✅ Tests initialisés avec succès!');
