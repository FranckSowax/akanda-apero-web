// Script de diagnostic simplifié pour le problème de synchronisation des promotions
// À copier-coller dans la console du navigateur sur les deux instances

console.log('🔍 DIAGNOSTIC PROMOTIONS - VERSION SIMPLIFIÉE');
console.log('==============================================');

// 1. Informations de base
console.log('\n1. Informations de base:');
console.log('URL:', window.location.href);
console.log('Origin:', window.location.origin);
console.log('Timestamp:', new Date().toISOString());

// 2. Vérifier si on peut accéder aux données React
console.log('\n2. Vérification des données React:');

// Fonction pour trouver les données de promotions dans le DOM
function findPromotionsInDOM() {
  // Chercher les éléments qui contiennent des informations sur les promotions
  const promotionElements = document.querySelectorAll('[data-component-name*="promotion"], .promotion, [class*="promotion"]');
  console.log('Éléments promotion trouvés dans le DOM:', promotionElements.length);
  
  // Chercher les badges de statut
  const statusBadges = document.querySelectorAll('.bg-blue-100, .bg-green-100, .bg-red-100, .bg-gray-100');
  console.log('Badges de statut trouvés:', statusBadges.length);
  
  // Chercher les onglets de filtrage
  const tabTriggers = document.querySelectorAll('[role="tab"]');
  console.log('Onglets de filtrage trouvés:', tabTriggers.length);
  
  // Extraire le texte des onglets pour voir les compteurs
  const tabTexts = Array.from(tabTriggers).map(tab => tab.textContent?.trim());
  console.log('Texte des onglets:', tabTexts);
  
  return {
    promotionElements: promotionElements.length,
    statusBadges: statusBadges.length,
    tabTriggers: tabTriggers.length,
    tabTexts
  };
}

const domData = findPromotionsInDOM();

// 3. Vérifier le localStorage et sessionStorage
console.log('\n3. Vérification du cache:');
const localStorageKeys = Object.keys(localStorage);
const sessionStorageKeys = Object.keys(sessionStorage);

console.log('localStorage keys:', localStorageKeys.length);
console.log('sessionStorage keys:', sessionStorageKeys.length);

// Chercher les clés liées à Supabase ou aux promotions
const relevantLocalKeys = localStorageKeys.filter(key => 
  key.toLowerCase().includes('supabase') || 
  key.toLowerCase().includes('promotion') ||
  key.toLowerCase().includes('auth')
);

const relevantSessionKeys = sessionStorageKeys.filter(key => 
  key.toLowerCase().includes('supabase') || 
  key.toLowerCase().includes('promotion') ||
  key.toLowerCase().includes('auth')
);

console.log('Clés localStorage pertinentes:', relevantLocalKeys);
console.log('Clés sessionStorage pertinentes:', relevantSessionKeys);

// 4. Vérifier les cookies
console.log('\n4. Vérification des cookies:');
const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
const supabaseCookies = cookies.filter(c => c.toLowerCase().includes('supabase'));
console.log('Total cookies:', cookies.length);
console.log('Cookies Supabase:', supabaseCookies.length);

// 5. Essayer d'accéder aux données via window
console.log('\n5. Vérification des données globales:');
console.log('window.supabase existe:', typeof window.supabase !== 'undefined');
console.log('window.__NEXT_DATA__ existe:', typeof window.__NEXT_DATA__ !== 'undefined');

// 6. Résumé du diagnostic
const diagnosticResult = {
  url: window.location.href,
  origin: window.location.origin,
  timestamp: new Date().toISOString(),
  dom: domData,
  cache: {
    localStorage: relevantLocalKeys.length,
    sessionStorage: relevantSessionKeys.length,
    cookies: supabaseCookies.length
  }
};

console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC:');
console.log(JSON.stringify(diagnosticResult, null, 2));

// Sauvegarder pour comparaison
window.promotionsDiagnostic = diagnosticResult;

console.log('\n✅ Diagnostic terminé!');
console.log('💾 Résultats sauvegardés dans window.promotionsDiagnostic');
console.log('\n🔄 Pour nettoyer le cache, exécutez:');
console.log('localStorage.clear(); sessionStorage.clear(); location.reload();');
