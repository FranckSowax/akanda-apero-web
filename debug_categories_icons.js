// Script de débogage pour vérifier et corriger les icônes des catégories
// À exécuter dans la console du navigateur

console.log('🔍 Débogage des icônes de catégories...');

// Vérifier si Supabase est disponible
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase client non trouvé');
  console.log('Essayez de recharger la page et réexécuter ce script');
} else {
  console.log('✅ Supabase client trouvé');
  
  // Fonction pour mettre à jour les icônes
  async function updateCategoryIcons() {
    console.log('🔄 Mise à jour des icônes...');
    
    const iconMapping = {
      'Formules': '🎁',
      'Vins': '🍷',
      'Liqueurs': '🍸',
      'Spiritueux': '🍸',
      'Bières': '🍺',
      'Champagnes': '🥂',
      'Apéritifs & sucreries': '🍫',
      'Apéritifs': '🍫',
      'Sodas & jus': '🥤',
      'Sodas': '🥤',
      'Boissons': '🥤',
      'Dépannage': '🛒',
      'Glaçons': '🧊',
      'Sans Alcool': '🥤',
      'Cocktails': '🍹',
      'Digestifs': '🥃'
    };
    
    try {
      // Récupérer toutes les catégories
      const { data: categories, error: fetchError } = await window.supabase
        .from('categories')
        .select('*');
        
      if (fetchError) {
        console.error('❌ Erreur lors de la récupération des catégories:', fetchError);
        return;
      }
      
      console.log('📋 Catégories actuelles:', categories);
      
      // Mettre à jour chaque catégorie
      for (const category of categories) {
        const newIcon = iconMapping[category.name];
        if (newIcon && newIcon !== category.emoji) {
          console.log(`🔄 Mise à jour ${category.name}: ${category.emoji} → ${newIcon}`);
          
          const { error: updateError } = await window.supabase
            .from('categories')
            .update({ emoji: newIcon })
            .eq('id', category.id);
            
          if (updateError) {
            console.error(`❌ Erreur mise à jour ${category.name}:`, updateError);
          } else {
            console.log(`✅ ${category.name} mis à jour`);
          }
        }
      }
      
      console.log('🎉 Mise à jour terminée!');
      console.log('🔄 Rechargement de la page dans 2 secondes...');
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (error) {
      console.error('❌ Erreur générale:', error);
    }
  }
  
  // Fonction pour vérifier les icônes actuelles
  async function checkCurrentIcons() {
    try {
      const { data: categories, error } = await window.supabase
        .from('categories')
        .select('name, emoji')
        .order('name');
        
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      
      console.log('📊 Icônes actuelles:');
      categories.forEach(cat => {
        console.log(`${cat.emoji} ${cat.name}`);
      });
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  }
  
  // Exécuter les fonctions
  console.log('1️⃣ Vérification des icônes actuelles...');
  checkCurrentIcons().then(() => {
    console.log('\n2️⃣ Mise à jour des icônes...');
    updateCategoryIcons();
  });
}
