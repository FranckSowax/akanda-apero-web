// Script de diagnostic pour l'emoji de la catégorie Whisky
// À exécuter dans la console du navigateur sur la page admin/categories

console.log('🔍 DIAGNOSTIC EMOJI CATÉGORIE WHISKY');
console.log('=====================================');

// 1. Vérifier les données des catégories chargées
const checkCategoriesData = () => {
  console.log('\n📊 1. VÉRIFICATION DES DONNÉES CATÉGORIES:');
  
  // Chercher les éléments DOM qui contiennent les données des catégories
  const categoryRows = document.querySelectorAll('tbody tr');
  console.log(`Nombre de catégories trouvées: ${categoryRows.length}`);
  
  categoryRows.forEach((row, index) => {
    const nameCell = row.querySelector('td:nth-child(2)');
    const emojiCell = row.querySelector('td:nth-child(1) span');
    
    if (nameCell && emojiCell) {
      const name = nameCell.textContent.trim();
      const emoji = emojiCell.textContent.trim();
      
      console.log(`${index + 1}. ${name}: ${emoji}`);
      
      // Focus sur Whisky
      if (name.toLowerCase().includes('whisky')) {
        console.log(`🥃 CATÉGORIE WHISKY TROUVÉE:`);
        console.log(`   - Nom: ${name}`);
        console.log(`   - Emoji affiché: ${emoji}`);
        console.log(`   - Emoji attendu: 🥃`);
        console.log(`   - Problème: ${emoji === '📦' ? 'OUI - Emoji par défaut' : 'NON - Emoji correct'}`);
      }
    }
  });
};

// 2. Vérifier les données React (si accessible)
const checkReactData = () => {
  console.log('\n⚛️ 2. VÉRIFICATION DES DONNÉES REACT:');
  
  // Essayer d'accéder aux données React via les props des composants
  const reactRoot = document.querySelector('#__next');
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log('React Fiber détecté, tentative d\'accès aux données...');
    // Cette partie nécessiterait une inspection plus approfondie des composants React
  } else {
    console.log('Impossible d\'accéder directement aux données React');
  }
};

// 3. Vérifier les requêtes réseau
const checkNetworkRequests = () => {
  console.log('\n🌐 3. VÉRIFICATION DES REQUÊTES RÉSEAU:');
  console.log('Surveillez l\'onglet Network pour voir les requêtes vers Supabase');
  console.log('Recherchez les requêtes vers /rest/v1/categories');
};

// 4. Tester la création d'une nouvelle catégorie
const testCategoryCreation = () => {
  console.log('\n🧪 4. TEST DE CRÉATION DE CATÉGORIE:');
  console.log('Pour tester:');
  console.log('1. Cliquez sur "Nouvelle catégorie"');
  console.log('2. Sélectionnez l\'emoji 🥃');
  console.log('3. Vérifiez que formData.emoji est bien mis à jour');
  console.log('4. Surveillez la requête de sauvegarde');
};

// 5. Vérifier les options d'emoji disponibles
const checkEmojiOptions = () => {
  console.log('\n🎭 5. VÉRIFICATION DES OPTIONS D\'EMOJI:');
  
  const emojiButtons = document.querySelectorAll('button[type="button"]');
  const emojiOptions = [];
  
  emojiButtons.forEach(button => {
    const emoji = button.textContent.trim();
    if (emoji && emoji.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(emoji)) {
      emojiOptions.push(emoji);
    }
  });
  
  console.log('Emojis disponibles dans le formulaire:', emojiOptions);
  console.log('🥃 présent dans les options:', emojiOptions.includes('🥃') ? 'OUI' : 'NON');
};

// 6. Proposer des solutions
const proposeSolutions = () => {
  console.log('\n💡 6. SOLUTIONS PROPOSÉES:');
  console.log('Si l\'emoji ne s\'affiche pas correctement:');
  console.log('1. Vérifier que l\'emoji est bien sauvegardé en base (requête POST/PUT)');
  console.log('2. Vérifier que l\'emoji est bien récupéré lors du chargement (requête GET)');
  console.log('3. Vérifier que l\'emoji est bien affiché dans le DOM');
  console.log('4. Ajouter 🥃 aux iconOptions si manquant');
  console.log('5. Forcer le rechargement des données après création');
};

// Exécuter tous les diagnostics
const runFullDiagnostic = () => {
  checkCategoriesData();
  checkReactData();
  checkNetworkRequests();
  testCategoryCreation();
  checkEmojiOptions();
  proposeSolutions();
  
  console.log('\n✅ DIAGNOSTIC TERMINÉ');
  console.log('Vérifiez les résultats ci-dessus pour identifier le problème');
};

// Lancer le diagnostic
runFullDiagnostic();

// Fonction utilitaire pour forcer le rechargement des catégories
window.forceReloadCategories = () => {
  console.log('🔄 Tentative de rechargement des catégories...');
  location.reload();
};

console.log('\n🛠️ COMMANDES UTILES:');
console.log('- forceReloadCategories() : Recharger la page');
console.log('- runFullDiagnostic() : Relancer le diagnostic complet');
