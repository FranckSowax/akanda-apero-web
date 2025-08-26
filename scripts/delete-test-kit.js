// Script pour supprimer le kit de test
const { createClient } = require('@supabase/supabase-js');

// Informations de connexion Supabase 
const SUPABASE_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deleteTestKit() {
  console.log('Recherche et suppression du kit "test"...');
  
  try {
    // 1. Trouver le kit par son nom
    const { data: kits, error: searchError } = await supabase
      .from('cocktail_kits')
      .select('id, name')
      .eq('name', 'test');
    
    if (searchError) {
      console.error('Erreur lors de la recherche du kit:', searchError);
      return;
    }
    
    if (!kits || kits.length === 0) {
      console.log('Aucun kit avec le nom "test" n\'a été trouvé.');
      return;
    }
    
    console.log(`${kits.length} kit(s) trouvé(s) avec le nom "test":`);
    kits.forEach(kit => console.log(`- ID: ${kit.id}, Nom: ${kit.name}`));
    
    // 2. Supprimer les ingrédients associés à chaque kit
    for (const kit of kits) {
      console.log(`Suppression des ingrédients pour le kit ${kit.id}...`);
      
      const { error: deleteIngredientsError } = await supabase
        .from('cocktail_kit_ingredients')
        .delete()
        .eq('cocktail_kit_id', kit.id);
      
      if (deleteIngredientsError) {
        console.error(`Erreur lors de la suppression des ingrédients pour le kit ${kit.id}:`, deleteIngredientsError);
      } else {
        console.log(`Ingrédients supprimés pour le kit ${kit.id}.`);
      }
    }
    
    // 3. Supprimer les kits
    const kitIds = kits.map(kit => kit.id);
    console.log(`Suppression des kits avec les IDs: ${kitIds.join(', ')}...`);
    
    const { error: deleteKitsError } = await supabase
      .from('cocktail_kits')
      .delete()
      .in('id', kitIds);
    
    if (deleteKitsError) {
      console.error('Erreur lors de la suppression des kits:', deleteKitsError);
    } else {
      console.log(`${kits.length} kit(s) "test" supprimé(s) avec succès.`);
    }
  } catch (error) {
    console.error('Erreur non gérée:', error);
  }
}

// Exécuter la fonction
deleteTestKit().then(() => {
  console.log('Script terminé.');
}).catch(err => {
  console.error('Erreur lors de l\'exécution du script:', err);
});
