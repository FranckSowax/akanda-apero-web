'use client';

import { motion } from 'framer-motion';
import { Baby, Heart, Sparkles, Clock, Users } from 'lucide-react';

interface Mocktail {
  id: string;
  nom: string;
  description: string;
  ingredients: string[];
  recette: string[];
  emoji: string;
  couleur: string;
  tempsPrep: number;
}

const mocktailsData: Mocktail[] = [
  {
    id: 'virgin_planteur',
    nom: 'Virgin Planteur',
    description: 'Version sans alcool du Planteur d\'Akanda, parfait pour toute la famille',
    ingredients: [
      'Jus d\'ananas - 100ml',
      'Jus d\'orange - 60ml',
      'Sirop de grenadine - 20ml',
      'Jus de citron vert - 15ml',
      'Glaçons',
      'Tranche d\'ananas pour décorer'
    ],
    recette: [
      'Remplir un verre de glaçons',
      'Verser le jus d\'ananas et d\'orange',
      'Ajouter le jus de citron vert',
      'Verser délicatement la grenadine',
      'Mélanger légèrement',
      'Décorer avec la tranche d\'ananas'
    ],
    emoji: '🍹',
    couleur: 'from-orange-400 to-red-400',
    tempsPrep: 2
  },
  {
    id: 'limonade_tropicale',
    nom: 'Limonade Tropicale',
    description: 'Rafraîchissant mélange de fruits tropicaux pétillant',
    ingredients: [
      'Jus de mangue - 80ml',
      'Jus de citron - 30ml',
      'Eau gazeuse - 120ml',
      'Sirop de canne - 15ml',
      'Menthe fraîche - 4 feuilles',
      'Glaçons'
    ],
    recette: [
      'Placer la menthe dans le verre',
      'Ajouter le sirop de canne',
      'Presser légèrement la menthe',
      'Verser le jus de mangue et citron',
      'Ajouter les glaçons',
      'Compléter avec l\'eau gazeuse',
      'Mélanger délicatement'
    ],
    emoji: '🥭',
    couleur: 'from-yellow-400 to-green-400',
    tempsPrep: 3
  },
  {
    id: 'smoothie_cocktail_enfants',
    nom: 'Smoothie Cocktail Enfants',
    description: 'Délicieux smoothie coloré qui ressemble à un vrai cocktail',
    ingredients: [
      'Banane - 1/2',
      'Lait de coco - 100ml',
      'Jus d\'ananas - 60ml',
      'Miel - 1 cuillère',
      'Glaçons - 4 cubes',
      'Noix de coco râpée'
    ],
    recette: [
      'Mixer la banane avec le lait de coco',
      'Ajouter le jus d\'ananas et le miel',
      'Mixer avec les glaçons',
      'Verser dans un verre à cocktail',
      'Saupoudrer de noix de coco',
      'Servir avec une paille colorée'
    ],
    emoji: '🥥',
    couleur: 'from-blue-400 to-purple-400',
    tempsPrep: 4
  }
];

interface MocktailsSectionProps {
  nbPersonnes: number;
  onAddToCart: (mocktailId: string) => void;
  selectedMocktails: string[];
}

export default function MocktailsSection({ 
  nbPersonnes, 
  onAddToCart, 
  selectedMocktails 
}: MocktailsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Baby className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold text-gray-900">Mocktails Famille</h2>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-gray-600">
          Des cocktails sans alcool pour que toute la famille puisse participer ! 👨‍👩‍👧‍👦
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {mocktailsData.map((mocktail, index) => (
          <motion.div
            key={mocktail.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Header coloré */}
            <div className={`h-32 bg-gradient-to-br ${mocktail.couleur} flex items-center justify-center`}>
              <span className="text-5xl">{mocktail.emoji}</span>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{mocktail.nom}</h3>
              <p className="text-sm text-gray-600 mb-3">{mocktail.description}</p>

              {/* Infos */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {mocktail.tempsPrep} min
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {nbPersonnes} portions
                </div>
                <div className="flex items-center">
                  <Heart className="w-3 h-3 mr-1 text-pink-500" />
                  Sans alcool
                </div>
              </div>

              {/* Prix */}
              <div className="text-lg font-bold text-green-600 mb-4">
                {(1500 * nbPersonnes).toLocaleString()} FCFA
                <span className="text-sm text-gray-500 ml-2">(1,500 FCFA/portion)</span>
              </div>

              {/* Ingrédients */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2 text-sm">Ingrédients:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {mocktail.ingredients.slice(0, 3).map((ingredient, i) => (
                    <li key={i}>• {ingredient}</li>
                  ))}
                  {mocktail.ingredients.length > 3 && (
                    <li className="text-gray-400">+ {mocktail.ingredients.length - 3} autres...</li>
                  )}
                </ul>
              </div>

              {/* Bouton d'ajout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddToCart(mocktail.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                  selectedMocktails.includes(mocktail.id)
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedMocktails.includes(mocktail.id) ? '✓ Ajouté' : 'Ajouter au panier'}
              </motion.button>

              {/* Recette rapide */}
              <details className="mt-3">
                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                  Voir la recette rapide
                </summary>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <ol className="space-y-1 text-blue-700">
                    {mocktail.recette.slice(0, 3).map((etape, i) => (
                      <li key={i}>{i + 1}. {etape}</li>
                    ))}
                  </ol>
                </div>
              </details>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-6">
        <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Parfait pour les enfants et les non-buveurs</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
