// Script pour ajouter la colonne is_available à la table cocktail_kits
const { createClient } = require('@supabase/supabase-js');

// Informations de connexion Supabase (récupérées du fichier client.ts)
const SUPABASE_URL = 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addMissingColumns() {
  console.log('Ajout des colonnes manquantes à Supabase...');
  
  try {
    // Exécuter directement la requête SQL pour ajouter la colonne
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE cocktail_kits ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true NOT NULL;'
      });
    
    if (error) {
      console.error('Erreur SQL:', error);
      return;
    }
    
    console.log('Colonne is_available ajoutée avec succès à la table cocktail_kits!');
    
    // Vérifier si la colonne a bien été ajoutée
    const { data: columns, error: columnsError } = await supabase
      .from('cocktail_kits')
      .select('is_available')
      .limit(1);
    
    if (columnsError) {
      console.error('Erreur lors de la vérification:', columnsError);
    } else {
      console.log('Vérification réussie, la colonne is_available existe maintenant.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  }
}

// Exécuter la fonction
addMissingColumns().then(() => {
  console.log('Script terminé.');
}).catch(err => {
  console.error('Erreur non gérée:', err);
});
