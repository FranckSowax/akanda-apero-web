// Script de diagnostic pour le problème de synchronisation des promotions
// Exécuter ce script dans la console du navigateur sur les deux instances

console.log('🔍 DIAGNOSTIC DE SYNCHRONISATION DES PROMOTIONS');
console.log('================================================');

// 1. Vérifier la configuration Supabase
console.log('\n1. Configuration Supabase:');
console.log('URL:', window.location.origin);

// Vérifier les variables d'environnement côté client
const checkEnvVars = () => {
  // Tenter de récupérer les variables depuis window ou document
  const scripts = document.querySelectorAll('script');
  let foundConfig = false;
  
  scripts.forEach(script => {
    if (script.textContent && script.textContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      console.log('✅ Configuration Supabase trouvée dans les scripts');
      foundConfig = true;
    }
  });
  
  if (!foundConfig) {
    console.log('⚠️ Configuration Supabase non trouvée dans les scripts');
  }
  
  return foundConfig;
};

checkEnvVars();

// 2. Vérifier les données en direct depuis Supabase
async function checkPromotionsData() {
  try {
    console.log('\n2. Données Supabase en direct:');
    
    // Créer le client Supabase directement avec les valeurs hardcodées
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    
    const supabaseUrl = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Client Supabase créé avec:');
    console.log('  URL:', supabaseUrl);
    console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Récupérer toutes les promotions
    const { data: allPromotions, error: allError } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Erreur lors de la récupération:', allError);
      return;
    }
    
    console.log('📊 Total promotions:', allPromotions?.length || 0);
    
    // Compter par statut
    const statusCounts = {
      active: allPromotions?.filter(p => p.status === 'active').length || 0,
      scheduled: allPromotions?.filter(p => p.status === 'scheduled').length || 0,
      expired: allPromotions?.filter(p => p.status === 'expired').length || 0,
      inactive: allPromotions?.filter(p => p.status === 'inactive').length || 0
    };
    
    console.log('📈 Répartition par statut:');
    console.log('  - Actives:', statusCounts.active);
    console.log('  - Planifiées:', statusCounts.scheduled);
    console.log('  - Expirées:', statusCounts.expired);
    console.log('  - Inactives:', statusCounts.inactive);
    
    // Afficher les promotions planifiées en détail
    const scheduledPromotions = allPromotions?.filter(p => p.status === 'scheduled') || [];
    console.log('\n📅 Promotions planifiées détaillées:');
    scheduledPromotions.forEach((promo, index) => {
      console.log(`  ${index + 1}. ${promo.name} (${promo.code})`);
      console.log(`     Début: ${new Date(promo.start_date).toLocaleDateString('fr-FR')}`);
      console.log(`     Fin: ${new Date(promo.end_date).toLocaleDateString('fr-FR')}`);
    });
    
    // 3. Vérifier le cache localStorage
    console.log('\n3. Cache localStorage:');
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('promotion')
    );
    console.log('Clés de cache trouvées:', cacheKeys);
    
    // 4. Vérifier les cookies de session
    console.log('\n4. Cookies de session:');
    const cookies = document.cookie.split(';').map(c => c.trim());
    const supabaseCookies = cookies.filter(c => c.includes('supabase'));
    console.log('Cookies Supabase:', supabaseCookies.length);
    
    // 5. Informations sur l'environnement
    console.log('\n5. Informations environnement:');
    console.log('User Agent:', navigator.userAgent);
    console.log('URL actuelle:', window.location.href);
    console.log('Timestamp:', new Date().toISOString());
    
    return {
      url: window.location.origin,
      totalPromotions: allPromotions?.length || 0,
      statusCounts,
      scheduledPromotions: scheduledPromotions.map(p => ({
        name: p.name,
        code: p.code,
        start_date: p.start_date,
        end_date: p.end_date
      }))
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return null;
  }
}

// Exécuter le diagnostic
checkPromotionsData().then(result => {
  if (result) {
    console.log('\n✅ Diagnostic terminé. Résultats:', result);
    
    // Sauvegarder les résultats pour comparaison
    window.promotionsDiagnostic = result;
    console.log('\n💾 Résultats sauvegardés dans window.promotionsDiagnostic');
    console.log('Vous pouvez comparer avec l\'autre instance en exécutant:');
    console.log('console.log(window.promotionsDiagnostic);');
  }
});

// Fonction pour nettoyer le cache si nécessaire
window.clearPromotionsCache = function() {
  console.log('🧹 Nettoyage du cache...');
  
  // Nettoyer localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('promotion')) {
      localStorage.removeItem(key);
      console.log('Supprimé:', key);
    }
  });
  
  // Nettoyer sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('promotion')) {
      sessionStorage.removeItem(key);
      console.log('Supprimé:', key);
    }
  });
  
  console.log('✅ Cache nettoyé. Rechargez la page.');
};

console.log('\n🛠️ Fonctions utiles disponibles:');
console.log('- window.clearPromotionsCache() : Nettoyer le cache');
console.log('- window.promotionsDiagnostic : Voir les résultats du diagnostic');
