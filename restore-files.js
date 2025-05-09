const fs = require('fs');
const path = require('path');

// Liste des fichiers à restaurer
const backupFiles = [
  {
    "original": "/Users/sowax/Desktop/Akanda Apero web /src/app/product/[id]/page.tsx",
    "backup": "/Users/sowax/Desktop/Akanda Apero web /src/app/product/[id]/page.tsx.bak"
  },
  {
    "original": "/Users/sowax/Desktop/Akanda Apero web /src/app/admin/products/product-page.temp.tsx",
    "backup": "/Users/sowax/Desktop/Akanda Apero web /src/app/admin/products/product-page.temp.tsx.bak"
  },
  {
    "original": "/Users/sowax/Desktop/Akanda Apero web /src/app/admin/products/page.tsx",
    "backup": "/Users/sowax/Desktop/Akanda Apero web /src/app/admin/products/page.tsx.bak"
  }
];

// Restaurer les fichiers originaux
console.log('Restauration des fichiers originaux...');

backupFiles.forEach(file => {
  if (fs.existsSync(file.backup)) {
    fs.copyFileSync(file.backup, file.original);
    fs.unlinkSync(file.backup);
    console.log(`Fichier restauré: ${file.original}`);
  } else {
    console.error(`Erreur: Fichier de sauvegarde non trouvé: ${file.backup}`);
  }
});

console.log('Tous les fichiers ont été restaurés avec succès!');
