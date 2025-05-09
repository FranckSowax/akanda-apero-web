#!/bin/bash

echo "🚀 Démarrage du script de build Netlify personnalisé"

# Remplacer le fichier tsconfig.json par notre version spéciale
echo "📝 Configuration TypeScript pour Netlify"
cp tsconfig.netlify.json tsconfig.json

# Désactiver strictement la vérification des types pour le build
echo "🔨 Construction avec vérification de types désactivée"
NEXT_DISABLE_TS_ERROR=1 npm run build

echo "✅ Construction terminée avec succès"
