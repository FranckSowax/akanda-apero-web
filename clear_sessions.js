// Script pour vider toutes les sessions et le cache
// À exécuter dans la console du navigateur (F12)

console.log('🧹 Nettoyage des sessions et du cache...');

// 1. Vider le localStorage (sessions Supabase)
localStorage.clear();
console.log('✅ localStorage vidé');

// 2. Vider le sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage vidé');

// 3. Vider les cookies du domaine
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies supprimés');

// 4. Vider le cache si possible (nécessite HTTPS en production)
if ('caches' in window) {
    caches.keys().then(function(names) {
        names.forEach(function(name) {
            caches.delete(name);
        });
    });
    console.log('✅ Cache vidé');
}

console.log('🎉 Nettoyage terminé ! Rechargez la page.');

// 5. Recharger la page automatiquement
setTimeout(() => {
    window.location.reload();
}, 1000);
