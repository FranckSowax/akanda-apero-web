// Script pour synchroniser les emojis des catégories existantes
// À exécuter dans la console du navigateur sur la page admin/categories

console.log('🔄 SYNCHRONISATION DES EMOJIS DE CATÉGORIES');
console.log('============================================');

// Mapping des emojis (identique à celui de utils/categoryEmojis.ts)
const emojiMap = {
  'whisky': '🥃',
  'rhum': '🍹',
  'tequila': '🌵',
  'vodka': '🧊',
  'gin': '🍸',
  'cognac': '🥃',
  'armagnac': '🥃',
  'brandy': '🥃',
  'liqueurs': '🍷',
  'vins': '🍷',
  'vin rouge': '🍷',
  'vin blanc': '🍷',
  'vin rosé': '🍷',
  'champagnes': '🥂',
  'champagne': '🥂',
  'bières': '🍺',
  'bière': '🍺',
  'cocktails': '🍹',
  'cocktail': '🍹',
  'spiritueux': '🍾',
  'apéritifs': '🍫',
  'apéritif': '🍫',
  'sodas': '🥤',
  'soda': '🥤',
  'jus': '🥤',
  'sans alcool': '🥛',
  'formules': '🎁',
  'formule': '🎁',
  'dépannage': '🛒',
  'glaçons': '🧊',
  'glaçon': '🧊',
  'liqueurs douces': '🍯',
  'liqueur douce': '🍯',
  'apéritifs naturels': '🌿',
  'apéritif naturel': '🌿',
  'pastis': '🌿',
  'absinthe': '🌿',
  'porto': '🍷',
  'sherry': '🍷',
  'vermouth': '🍸',
  'sake': '🍶',
  'mezcal': '🌵',
  'cachaça': '🍹',
  'bourbon': '🥃',
  'scotch': '🥃',
  'irish': '🥃',
  'rye': '🥃',
  'single malt': '🥃',
  'blended': '🥃'
};

// Fonction pour obtenir l'emoji approprié
const getCategoryEmoji = (categoryName, fallbackIcon) => {
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Recherche exacte d'abord
  if (emojiMap[normalizedName]) {
    return emojiMap[normalizedName];
  }
  
  // Recherche partielle pour les noms composés
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return emoji;
    }
  }
  
  // Fallback vers l'icône existante ou emoji par défaut
  return fallbackIcon || '🏷️';
};

// Fonction pour analyser les catégories actuelles
const analyzeCategoriesEmojis = () => {
  console.log('\n📊 ANALYSE DES CATÉGORIES ACTUELLES:');
  
  const categoryRows = document.querySelectorAll('tbody tr');
  const categoriesToUpdate = [];
  
  categoryRows.forEach((row, index) => {
    const nameCell = row.querySelector('td:nth-child(2) .text-sm.font-medium');
    const emojiCell = row.querySelector('td:nth-child(1) .flex-shrink-0');
    
    if (nameCell && emojiCell) {
      const name = nameCell.textContent.trim();
      const currentEmoji = emojiCell.textContent.trim();
      const recommendedEmoji = getCategoryEmoji(name, currentEmoji);
      
      console.log(`${index + 1}. ${name}:`);
      console.log(`   Emoji actuel: ${currentEmoji}`);
      console.log(`   Emoji recommandé: ${recommendedEmoji}`);
      
      if (currentEmoji !== recommendedEmoji) {
        console.log(`   ⚠️ MISE À JOUR NÉCESSAIRE`);
        categoriesToUpdate.push({
          name,
          currentEmoji,
          recommendedEmoji,
          row
        });
      } else {
        console.log(`   ✅ Correct`);
      }
      console.log('');
    }
  });
  
  return categoriesToUpdate;
};

// Fonction pour mettre en évidence les catégories à corriger
const highlightCategoriesToUpdate = (categoriesToUpdate) => {
  console.log(`\n🎯 ${categoriesToUpdate.length} CATÉGORIES À METTRE À JOUR:`);
  
  categoriesToUpdate.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}: ${category.currentEmoji} → ${category.recommendedEmoji}`);
    
    // Mettre en évidence la ligne
    category.row.style.backgroundColor = '#fef3c7';
    category.row.style.border = '2px solid #f59e0b';
    
    // Mettre en évidence le bouton d'édition
    const editButton = category.row.querySelector('button svg.lucide-edit');
    if (editButton) {
      const button = editButton.closest('button');
      if (button) {
        button.style.backgroundColor = '#10b981';
        button.style.color = 'white';
        button.style.transform = 'scale(1.1)';
      }
    }
  });
};

// Fonction pour générer les instructions de mise à jour
const generateUpdateInstructions = (categoriesToUpdate) => {
  console.log('\n📋 INSTRUCTIONS DE MISE À JOUR:');
  console.log('Pour chaque catégorie mise en évidence:');
  console.log('1. Cliquez sur le bouton "Modifier" (vert, avec icône crayon)');
  console.log('2. Dans le formulaire, sélectionnez le nouvel emoji recommandé');
  console.log('3. Cliquez sur "Sauvegarder"');
  console.log('4. Vérifiez que l\'emoji s\'affiche correctement');
  console.log('');
  
  categoriesToUpdate.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}:`);
    console.log(`   Sélectionner: ${category.recommendedEmoji}`);
  });
};

// Fonction pour tester après mise à jour
const testAfterUpdate = () => {
  console.log('\n🧪 TEST APRÈS MISE À JOUR:');
  console.log('1. Rechargez la page admin (Ctrl+F5 ou Cmd+R)');
  console.log('2. Vérifiez que tous les emojis sont corrects');
  console.log('3. Allez sur /products pour vérifier l\'affichage public');
  console.log('4. Testez les boutons de catégories');
};

// Exécution du script principal
const runSync = () => {
  console.log('🚀 Lancement de la synchronisation...');
  
  const categoriesToUpdate = analyzeCategoriesEmojis();
  
  if (categoriesToUpdate.length === 0) {
    console.log('✅ Toutes les catégories ont déjà les bons emojis !');
    return;
  }
  
  highlightCategoriesToUpdate(categoriesToUpdate);
  generateUpdateInstructions(categoriesToUpdate);
  testAfterUpdate();
  
  console.log('\n✅ SYNCHRONISATION TERMINÉE');
  console.log(`${categoriesToUpdate.length} catégories nécessitent une mise à jour manuelle.`);
};

// Fonction utilitaire pour recharger et relancer
window.rerunSync = () => {
  console.clear();
  location.reload();
  setTimeout(runSync, 2000);
};

// Fonction utilitaire pour nettoyer les mises en évidence
window.clearHighlights = () => {
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach(row => {
    row.style.backgroundColor = '';
    row.style.border = '';
    
    const buttons = row.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.backgroundColor = '';
      button.style.color = '';
      button.style.transform = '';
    });
  });
  console.log('🧹 Mises en évidence supprimées');
};

// Lancer le script
runSync();

console.log('\n🛠️ COMMANDES UTILES:');
console.log('- rerunSync() : Recharger et relancer la synchronisation');
console.log('- clearHighlights() : Supprimer les mises en évidence');
console.log('- runSync() : Relancer l\'analyse sans recharger');
