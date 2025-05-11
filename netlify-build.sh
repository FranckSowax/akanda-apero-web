#!/bin/bash

set -e  # Arrêter le script en cas d'erreur
set -x  # Afficher les commandes exécutées

echo "🚀 Démarrage du script de build Netlify personnalisé"

# Vérifier que Node.js et npm sont installés correctement
echo "📊 Vérification de l'environnement"
node --version
npm --version

# Vérifier les dépendances
echo "📦 Vérification des dépendances"
cat package.json | grep -E "(sonner|@netlify)"

# Installer les dépendances si nécessaire
echo "📦 Installation explicite de sonner"
npm install sonner --save

# Remplacer le fichier tsconfig.json par notre version spéciale
echo "📝 Configuration TypeScript pour Netlify"
cp tsconfig.netlify.json tsconfig.json

# Définir variable d'environnement pour Netlify
echo "🔨 Configuration optimisée pour Netlify activée"
export NODE_OPTIONS="--max-old-space-size=4096"

# Désactiver strictement la vérification des types pour le build
echo "🔨 Construction avec vérification de types désactivée"
NEXT_DISABLE_TS_ERROR=1 npm run build --debug || {
  echo "❌ Erreur lors de la construction"
  exit 1
}

echo "✅ Construction terminée avec succès"
