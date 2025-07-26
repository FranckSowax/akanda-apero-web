// Script pour corriger l'emoji de la catégorie Whisky
// À exécuter dans la console du navigateur sur la page admin/categories

console.log('🥃 CORRECTION CATÉGORIE WHISKY');
console.log('==============================');

// Fonction pour trouver et corriger la catégorie Whisky
const fixWhiskyCategory = async () => {
  console.log('🔍 Recherche de la catégorie Whisky...');
  
  try {
    // Simuler une requête pour récupérer les catégories
    // (En réalité, cela devrait être fait via l'API Supabase)
    console.log('📡 Vérification des données en base...');
    
    // Instructions pour l'utilisateur
    console.log('\n📋 ÉTAPES À SUIVRE MANUELLEMENT:');
    console.log('1. Recherchez la catégorie "Whisky" dans la liste');
    console.log('2. Cliquez sur le bouton "Modifier" (icône crayon) pour cette catégorie');
    console.log('3. Dans le formulaire d\'édition, sélectionnez l\'emoji 🥃');
    console.log('4. Cliquez sur "Sauvegarder"');
    console.log('5. Vérifiez que l\'emoji s\'affiche correctement');
    
    // Vérification automatique des éléments DOM
    const categoryRows = document.querySelectorAll('tbody tr');
    let whiskyFound = false;
    
    categoryRows.forEach((row, index) => {
      const nameCell = row.querySelector('td:nth-child(2)');
      const emojiCell = row.querySelector('td:nth-child(1) span');
      
      if (nameCell && emojiCell) {
        const name = nameCell.textContent.trim();
        const emoji = emojiCell.textContent.trim();
        
        if (name.toLowerCase().includes('whisky')) {
          whiskyFound = true;
          console.log(`\n🎯 CATÉGORIE WHISKY TROUVÉE:`);
          console.log(`   Nom: ${name}`);
          console.log(`   Emoji actuel: ${emoji}`);
          console.log(`   Statut: ${emoji === '📦' ? '❌ Incorrect (emoji par défaut)' : '✅ Correct'}`);
          
          // Mettre en évidence la ligne dans l'interface
          row.style.backgroundColor = '#fef3c7';
          row.style.border = '2px solid #f59e0b';
          
          // Trouver le bouton d'édition
          const editButton = row.querySelector('button[title="Modifier"], button svg.lucide-edit');
          if (editButton) {
            editButton.style.backgroundColor = '#10b981';
            editButton.style.color = 'white';
            console.log('   👆 Bouton d\'édition mis en évidence en vert');
          }
        }
      }
    });
    
    if (!whiskyFound) {
      console.log('❌ Aucune catégorie "Whisky" trouvée');
      console.log('💡 La catégorie doit d\'abord être créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
};

// Fonction pour vérifier les options d'emoji disponibles
const checkEmojiOptions = () => {
  console.log('\n🎭 VÉRIFICATION DES OPTIONS D\'EMOJI:');
  
  // Simuler l'ouverture du modal pour voir les options
  console.log('Les emojis suivants devraient être disponibles:');
  console.log('🎁 Formules');
  console.log('🍷 Vins');
  console.log('🍸 Liqueurs');
  console.log('🍺 Bières');
  console.log('🥂 Champagnes');
  console.log('🍫 Apéritifs & sucreries');
  console.log('🥤 Sodas & jus');
  console.log('🛒 Dépannage');
  console.log('🧊 Glaçons');
  console.log('🥃 Whisky ← NOUVEAU');
  console.log('🍹 Cocktails ← NOUVEAU');
  console.log('🥛 Sans Alcool ← CORRIGÉ');
  console.log('🍾 Spiritueux ← NOUVEAU');
  console.log('🍯 Liqueurs douces ← NOUVEAU');
  console.log('🌿 Apéritifs naturels ← NOUVEAU');
};

// Fonction pour créer une nouvelle catégorie Whisky si elle n'existe pas
const createWhiskyCategory = () => {
  console.log('\n➕ CRÉATION D\'UNE NOUVELLE CATÉGORIE WHISKY:');
  console.log('1. Cliquez sur le bouton "Nouvelle catégorie"');
  console.log('2. Remplissez les champs:');
  console.log('   - Nom: "Whisky"');
  console.log('   - Slug: "whisky" (généré automatiquement)');
  console.log('   - Description: "Whiskies et spiritueux vieillis"');
  console.log('   - Emoji: Sélectionnez 🥃');
  console.log('   - Couleur: #D97706 (orange pour le whisky)');
  console.log('3. Cliquez sur "Sauvegarder"');
};

// Fonction de test après correction
const testAfterFix = () => {
  console.log('\n🧪 TEST APRÈS CORRECTION:');
  console.log('1. Rechargez la page (Ctrl+F5 ou Cmd+R)');
  console.log('2. Vérifiez que l\'emoji 🥃 s\'affiche pour la catégorie Whisky');
  console.log('3. Testez l\'édition de la catégorie');
  console.log('4. Vérifiez l\'affichage sur la page publique des produits');
};

// Exécuter le diagnostic
console.log('🚀 Lancement du diagnostic...');
fixWhiskyCategory();
checkEmojiOptions();
createWhiskyCategory();
testAfterFix();

// Fonction utilitaire pour recharger les données
window.reloadCategoriesData = () => {
  console.log('🔄 Rechargement des données...');
  location.reload();
};

// Fonction utilitaire pour mettre en évidence le bouton "Nouvelle catégorie"
window.highlightNewCategoryButton = () => {
  const newButton = document.querySelector('button:contains("Nouvelle catégorie"), button[onclick*="openModal"]');
  if (newButton) {
    newButton.style.backgroundColor = '#10b981';
    newButton.style.transform = 'scale(1.05)';
    newButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
    console.log('✅ Bouton "Nouvelle catégorie" mis en évidence');
  } else {
    console.log('❌ Bouton "Nouvelle catégorie" non trouvé');
  }
};

console.log('\n🛠️ COMMANDES UTILES:');
console.log('- reloadCategoriesData() : Recharger la page');
console.log('- highlightNewCategoryButton() : Mettre en évidence le bouton de création');
console.log('- fixWhiskyCategory() : Relancer le diagnostic');

console.log('\n✅ DIAGNOSTIC TERMINÉ - Suivez les instructions ci-dessus');
