// Script pour supprimer spécifiquement le kit "test"
const { createClient } = require('@supabase/supabase-js');

// Informations de connexion Supabase 
const SUPABASE_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID du kit "test" à supprimer
const KIT_ID_TO_DELETE = '41811ea6-7601-4ff5-8bf1-334ecf0b293a';

async function deleteSpecificKit() {
  console.log(`Suppression du kit avec l'ID : ${KIT_ID_TO_DELETE}...`);
  
  try {
    // Supprimer le kit
    const { data, error } = await supabase
      .from('cocktail_kits')
      .delete()
      .eq('id', KIT_ID_TO_DELETE)
      .select();
    
    if (error) {
      console.error('Erreur lors de la suppression du kit:', error);
    } else if (data && data.length > 0) {
      console.log(`Kit "${data[0].name}" (ID: ${data[0].id}) supprimé avec succès.`);
    } else {
      console.log(`Kit avec l'ID ${KIT_ID_TO_DELETE} non trouvé ou déjà supprimé.`);
    }
  } catch (error) {
    console.error('Erreur non gérée:', error);
  }
}

// Exécuter la fonction
deleteSpecificKit().then(() => {
  console.log('Script terminé.');
}).catch(err => {
  console.error('Erreur lors de l\'exécution du script:', err);
});
