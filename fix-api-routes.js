#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const API_DIR = path.join(__dirname, 'src', 'app', 'api');

// Fonction pour trouver tous les fichiers route.ts dans un répertoire (récursivement)
async function findRouteFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? findRouteFiles(res) : res;
  }));
  
  return Array.prototype.concat(...files)
    .filter(file => file.endsWith('route.ts'))
    .filter(file => file.includes('[') && file.includes(']')); // Ne s'intéresser qu'aux routes dynamiques
}

// Fonction pour corriger un fichier route.ts
async function fixRouteFile(filePath) {
  try {
    console.log(`Correction du fichier ${filePath}`);
    let content = await readFile(filePath, 'utf8');
    
    // Remplacer le destructuring des params par un objet context
    content = content.replace(
      /export async function (GET|PUT|DELETE|PATCH|POST)\(\s*request: NextRequest,\s*\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([^}]+)\}\s*\}\s*\)/g,
      'export async function $1(\n  request: NextRequest,\n  context: { params: { $2 } }\n)'
    );
    
    // Remplacer les références à params.X par context.params.X
    content = content.replace(
      /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_\.]+)\(params\.([a-zA-Z0-9_]+)\);/g,
      'const $1 = $2(context.params.$3);'
    );
    
    // Autres remplacements pour params.id, etc.
    content = content.replace(/params\.([a-zA-Z0-9_]+)/g, 'context.params.$1');
    
    await writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur lors de la correction du fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction principale
async function main() {
  try {
    const routeFiles = await findRouteFiles(API_DIR);
    console.log(`Trouvé ${routeFiles.length} fichiers de route à corriger`);
    
    const results = await Promise.all(routeFiles.map(fixRouteFile));
    const successCount = results.filter(Boolean).length;
    
    console.log(`Terminé: ${successCount}/${routeFiles.length} fichiers corrigés avec succès`);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

main();
