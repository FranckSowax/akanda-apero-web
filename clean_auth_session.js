// Script de nettoyage complet des sessions d'authentification
// À exécuter dans la console du navigateur

console.log('🧹 Nettoyage complet des sessions Supabase...');

// 1. Nettoyer localStorage
console.log('1️⃣ Nettoyage localStorage...');
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log('   Suppression:', key);
    localStorage.removeItem(key);
  }
});

// 2. Nettoyer sessionStorage
console.log('2️⃣ Nettoyage sessionStorage...');
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log('   Suppression:', key);
    sessionStorage.removeItem(key);
  }
});

// 3. Nettoyer tous les cookies
console.log('3️⃣ Nettoyage cookies...');
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Nettoyage terminé !');
console.log('🔄 Rechargement de la page...');

// 4. Recharger la page
setTimeout(() => {
  window.location.reload();
}, 1000);
