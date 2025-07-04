#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Liste des fichiers à corriger basée sur les résultats de notre recherche
const filesToFix = [
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/delivery/[id]/route.ts',
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/delivery/persons/[id]/route.ts',
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/products/[id]/route.ts',
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/promotions/[id]/route.ts',
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/customers/[id]/route.ts',
  '/Users/sowax/Desktop/Akanda Apero web /src/app/api/orders/[id]/route.ts'
];

// Fonction pour corriger un fichier route.ts
async function fixContextInFile(filePath) {
  try {
    console.log(`Correction du fichier ${filePath}`);
    let content = await readFile(filePath, 'utf8');
    
    // Remplacer 'context.context.params.id' par 'context.params.id'
    const fixedContent = content.replace(/context\.context\.params/g, 'context.params');
    
    await writeFile(filePath, fixedContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur lors de la correction du fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction principale
async function main() {
  try {
    const results = await Promise.all(filesToFix.map(fixContextInFile));
    const successCount = results.filter(Boolean).length;
    
    console.log(`Terminé: ${successCount}/${filesToFix.length} fichiers corrigés avec succès`);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

main();
