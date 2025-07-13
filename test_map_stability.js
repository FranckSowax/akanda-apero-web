// Script de test pour vérifier la stabilité de la carte de géolocalisation
// À exécuter dans la console du navigateur sur la page checkout

console.log('🗺️ TEST DE STABILITÉ DE LA CARTE DE GÉOLOCALISATION');

// Fonction pour surveiller les re-rendus du composant carte
function monitorMapReRenders() {
  console.log('👀 Surveillance des re-rendus de la carte...');
  
  // Trouver l'élément de la carte
  const mapContainer = document.querySelector('[class*="rounded-xl"][class*="overflow-hidden"]');
  const mapElement = document.querySelector('div[style*="position: relative"]'); // Google Maps container
  
  if (!mapContainer) {
    console.log('❌ Conteneur de carte non trouvé');
    return;
  }
  
  console.log('✅ Conteneur de carte trouvé:', mapContainer);
  
  let renderCount = 0;
  let lastRenderTime = Date.now();
  
  // Observer les changements dans le DOM de la carte
  const observer = new MutationObserver((mutations) => {
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        renderCount++;
        console.log(`🔄 Re-rendu détecté #${renderCount}:`, {
          type: mutation.type,
          target: mutation.target.tagName || 'Unknown',
          timeSinceLastRender: `${timeSinceLastRender}ms`,
          timestamp: new Date().toISOString()
        });
        
        // Alerte si les re-rendus sont trop fréquents (< 100ms)
        if (timeSinceLastRender < 100) {
          console.warn('⚠️ Re-rendu très fréquent détecté! Possible clignotement.');
        }
        
        lastRenderTime = currentTime;
      }
    });
  });
  
  // Observer le conteneur de la carte
  observer.observe(mapContainer, {
    attributes: true,
    childList: true,
    subtree: true
  });
  
  // Observer aussi l'élément Google Maps s'il existe
  if (mapElement) {
    observer.observe(mapElement, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
  
  // Arrêter l'observation après 30 secondes
  setTimeout(() => {
    observer.disconnect();
    console.log(`📊 Surveillance terminée. Total re-rendus: ${renderCount}`);
    
    if (renderCount === 0) {
      console.log('✅ Aucun re-rendu détecté - Carte stable!');
    } else if (renderCount < 5) {
      console.log('✅ Peu de re-rendus - Carte relativement stable');
    } else {
      console.log('⚠️ Nombreux re-rendus détectés - Possible problème de performance');
    }
  }, 30000);
  
  return observer;
}

// Fonction pour tester les interactions avec la carte
function testMapInteractions() {
  console.log('🖱️ Test des interactions avec la carte...');
  
  // Simuler un clic sur la carte après un délai
  setTimeout(() => {
    const mapElement = document.querySelector('div[style*="position: relative"]');
    if (mapElement) {
      console.log('🖱️ Simulation d\'un clic sur la carte...');
      
      // Créer un événement de clic
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: mapElement.offsetLeft + 100,
        clientY: mapElement.offsetTop + 100
      });
      
      mapElement.dispatchEvent(clickEvent);
      console.log('✅ Clic simulé sur la carte');
    } else {
      console.log('❌ Élément de carte non trouvé pour le test de clic');
    }
  }, 2000);
}

// Fonction pour vérifier les logs de géolocalisation
function checkLocationLogs() {
  console.log('📍 Vérification des logs de géolocalisation...');
  
  // Intercepter les logs console
  const originalLog = console.log;
  let locationLogs = [];
  
  console.log = function(...args) {
    if (args[0] && args[0].includes('Location selected')) {
      locationLogs.push({
        args: args,
        timestamp: new Date().toISOString()
      });
    }
    originalLog.apply(console, args);
  };
  
  // Restaurer après 10 secondes et afficher les résultats
  setTimeout(() => {
    console.log = originalLog;
    console.log('📊 Logs de géolocalisation capturés:', locationLogs.length);
    locationLogs.forEach((log, index) => {
      console.log(`📝 Log ${index + 1}:`, ...log.args, `(${log.timestamp})`);
    });
  }, 10000);
}

// Fonction pour vérifier la performance de la carte
function checkMapPerformance() {
  console.log('⚡ Vérification des performances de la carte...');
  
  // Mesurer le temps de chargement initial
  const startTime = performance.now();
  
  const checkMapLoaded = () => {
    const mapElement = document.querySelector('div[style*="position: relative"]');
    if (mapElement && window.google?.maps) {
      const loadTime = performance.now() - startTime;
      console.log(`✅ Carte chargée en ${loadTime.toFixed(2)}ms`);
      
      // Vérifier la mémoire utilisée (si disponible)
      if (performance.memory) {
        console.log('💾 Utilisation mémoire:', {
          used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
      
      return true;
    }
    return false;
  };
  
  // Vérifier toutes les 100ms pendant 10 secondes max
  const interval = setInterval(() => {
    if (checkMapLoaded()) {
      clearInterval(interval);
    }
  }, 100);
  
  setTimeout(() => {
    clearInterval(interval);
    if (!checkMapLoaded()) {
      console.log('⚠️ Carte non chargée après 10 secondes');
    }
  }, 10000);
}

// Exécution automatique des tests
console.log('🚀 Démarrage des tests de stabilité...');
const observer = monitorMapReRenders();
testMapInteractions();
checkLocationLogs();
checkMapPerformance();

// Fonctions disponibles dans la console
window.testMapStability = {
  monitor: monitorMapReRenders,
  interactions: testMapInteractions,
  logs: checkLocationLogs,
  performance: checkMapPerformance
};

console.log('🛠️ Fonctions de test disponibles:');
console.log('- testMapStability.monitor() - Surveiller les re-rendus');
console.log('- testMapStability.interactions() - Tester les interactions');
console.log('- testMapStability.logs() - Vérifier les logs');
console.log('- testMapStability.performance() - Vérifier les performances');

console.log('✅ Tests de stabilité initialisés!');
