// Script pour lister tous les kits et supprimer celui de test
const { createClient } = require('@supabase/supabase-js');

// Informations de connexion Supabase 
const SUPABASE_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAndDeleteKits() {
  console.log('Récupération de tous les kits de cocktail...');
  
  try {
    // Récupérer tous les kits
    const { data: kits, error: listError } = await supabase
      .from('cocktail_kits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.error('Erreur lors de la récupération des kits:', listError);
      return;
    }
    
    if (!kits || kits.length === 0) {
      console.log('Aucun kit trouvé dans la base de données.');
      return;
    }
    
    console.log(`${kits.length} kit(s) trouvé(s) :`);
    kits.forEach((kit, index) => console.log(`${index + 1}. ID: ${kit.id}, Nom: ${kit.name}, Créé le: ${new Date(kit.created_at).toLocaleString()}`));
    
    // Supprimer le premier kit (qui devrait être le plus récent)
    if (kits.length > 0) {
      const kitToDelete = kits[0];
      console.log(`\nSuppression du kit le plus récent : ${kitToDelete.name} (ID: ${kitToDelete.id})...`);
      
      // 1. Supprimer les ingrédients associés
      const { error: deleteIngredientsError } = await supabase
        .from('cocktail_kit_ingredients')
        .delete()
        .eq('cocktail_kit_id', kitToDelete.id);
      
      if (deleteIngredientsError) {
        console.error(`Erreur lors de la suppression des ingrédients pour le kit ${kitToDelete.id}:`, deleteIngredientsError);
      } else {
        console.log(`Ingrédients supprimés pour le kit ${kitToDelete.id}.`);
      }
      
      // 2. Supprimer le kit
      const { error: deleteKitError } = await supabase
        .from('cocktail_kits')
        .delete()
        .eq('id', kitToDelete.id);
      
      if (deleteKitError) {
        console.error('Erreur lors de la suppression du kit:', deleteKitError);
      } else {
        console.log(`Kit "${kitToDelete.name}" (ID: ${kitToDelete.id}) supprimé avec succès.`);
      }
    }
  } catch (error) {
    console.error('Erreur non gérée:', error);
  }
}

// Exécuter la fonction
listAndDeleteKits().then(() => {
  console.log('Script terminé.');
}).catch(err => {
  console.error('Erreur lors de l\'exécution du script:', err);
});
