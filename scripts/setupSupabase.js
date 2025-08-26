#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Obtenir les credentials Supabase depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcdpzoisorbnhkjhljaj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA';
const serviceKey = process.env.SUPABASE_SERVICE_KEY; // Nécessite une clé de service avec des privilèges plus élevés

if (!serviceKey) {
  console.error('ERREUR: Clé de service Supabase manquante (SUPABASE_SERVICE_KEY)');
  console.error('Vous devez fournir une clé de service pour créer des tables et des politiques.');
  console.error('Ajoutez-la dans un fichier .env à la racine du projet ou passez-la en argument.');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, serviceKey);

// Chemin vers le fichier SQL de migration
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '20250511_auth_loyalty_system.sql');

// Lire le fichier SQL
async function setup() {
  try {
    console.log('Lecture du fichier SQL de migration...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Diviser le contenu en requêtes individuelles (séparées par ";")
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0); // Filtrer les requêtes vides
    
    console.log(`Exécution de ${queries.length} requêtes SQL...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Exécution de la requête ${i + 1}/${queries.length}`);
      
      // Exécuter la requête avec Supabase
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error(`Erreur lors de l'exécution de la requête ${i + 1}:`, error);
      }
    }
    
    console.log('Configuration de la base de données terminée avec succès!');
    
    // Configurer les options d'authentification
    console.log('Configuration des options d\'authentification...');
    
    // Activer l'authentification par email/mot de passe
    // Note: Cette partie peut nécessiter une API Admin Supabase qui n'est pas disponible via le client standard
    console.log('Pour compléter la configuration de l\'authentification, veuillez:');
    console.log('1. Aller dans votre dashboard Supabase: https://app.supabase.com');
    console.log('2. Sélectionner votre projet');
    console.log('3. Aller dans Authentication > Providers');
    console.log('4. Activer Email et définir vos préférences');
    console.log('5. Dans Email Templates, personnaliser vos emails');
    console.log('6. Dans URL Configuration, configurer les URL de redirection vers:');
    console.log('   - Site URL: https://votre-domaine.com');
    console.log('   - Redirect URLs: https://votre-domaine.com/auth');
    
  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Exécuter le script
setup();
