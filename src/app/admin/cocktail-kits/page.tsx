'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Wine,
  GlassWater,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { ClientOnly } from '../../../components/ui/client-only';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

// Type pour les kits cocktails
interface CocktailKit {
  id: number;
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  basePrice: number; // Prix pour 2 personnes
  perPersonPrice: number; // Prix supplémentaire par personne
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
  status: 'En stock' | 'Stock faible' | 'Épuisé';
}

// Données d'exemple pour les kits cocktails
const mockCocktailKits: CocktailKit[] = [
  {
    id: 1,
    name: "Kit Mojito Royal",
    image: "https://i.imgur.com/7cOi9S4.jpg",
    description: "Un cocktail rafraîchissant à base de rhum blanc, menthe fraîche, citron vert et sucre de canne, avec une touche de champagne pour l'élégance.",
    ingredients: ["Rhum blanc", "Menthe fraîche", "Citron vert", "Sucre de canne", "Champagne"],
    difficulty: "Facile",
    basePrice: 9800,
    perPersonPrice: 4500,
    category: "Rhum",
    isPopular: true,
    status: "En stock"
  },
  {
    id: 2,
    name: "Kit Old Fashioned",
    image: "https://i.imgur.com/4KAYU2f.jpg",
    description: "Ce cocktail classique combine whisky bourbon, sucre, angostura bitters et zeste d'orange pour une expérience riche et complexe.",
    ingredients: ["Bourbon", "Sucre", "Angostura bitters", "Zeste d'orange"],
    difficulty: "Moyen",
    basePrice: 12500,
    perPersonPrice: 5800,
    category: "Whisky",
    isPopular: true,
    status: "Stock faible"
  },
  {
    id: 3,
    name: "Kit Gin Tonic Deluxe",
    image: "https://i.imgur.com/DmkfqHC.jpg",
    description: "Une version élaborée du Gin Tonic classique avec des botaniques premium, baies de genévrier, zestes d'agrumes et tonic artisanal.",
    ingredients: ["Gin premium", "Tonic artisanal", "Baies de genévrier", "Zestes d'agrumes", "Concombre"],
    difficulty: "Facile",
    basePrice: 10500,
    perPersonPrice: 4800,
    category: "Gin",
    isNew: true,
    status: "En stock"
  },
  {
    id: 4,
    name: "Kit Margarita Passion",
    image: "https://i.imgur.com/nLqbdNf.jpg",
    description: "Une version exotique de la Margarita classique, enrichie de fruits de la passion pour une expérience gustative unique.",
    ingredients: ["Tequila silver", "Triple sec", "Fruits de la passion", "Citron vert", "Sel fin"],
    difficulty: "Moyen",
    basePrice: 11800,
    perPersonPrice: 5200,
    category: "Tequila",
    status: "En stock"
  }
];

// Composant principal pour la page d'administration des kits cocktails
export default function CocktailKitsPage() {
  const [cocktailKits, setCocktailKits] = useState<CocktailKit[]>(mockCocktailKits);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredKits = cocktailKits.filter(kit => 
    kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClientOnly>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Kits Cocktails</h1>
        <Button className="bg-[#f5a623] hover:bg-[#e09000]">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un kit
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            type="text" 
            placeholder="Rechercher un kit cocktail..." 
            className="pl-10 pr-4 py-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des kits */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Wine className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun kit cocktail trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos critères de recherche ou créez un nouveau kit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredKits.map(kit => (
            <div key={kit.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image 
                  src={kit.image} 
                  alt={kit.name}
                  fill
                  className="object-cover"
                />
                {kit.isNew && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Nouveau</span>
                )}
                {kit.isPopular && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Populaire</span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{kit.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${kit.status === 'En stock' ? 'bg-green-100 text-green-800' : kit.status === 'Stock faible' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {kit.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{kit.description}</p>
                
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-500">Catégorie: </span>
                  <span className="text-sm font-semibold">{kit.category}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-[#f5a623] font-bold">{kit.basePrice.toLocaleString()} XAF</div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="p-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-1 text-red-500 hover:text-red-700">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </ClientOnly>
  );
}
