'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import { supabase } from '../../../lib/supabase/client';

// Fonction pour générer un slug à partir d'un nom
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '');        // Enlever les tirets au début et à la fin
};

// Données des cocktails du site de démo
const cocktails = [
  {
    name: "Kit Mojito Royal",
    image: "https://i.imgur.com/7tXcRY2.jpg",
    description: "Un cocktail rafraîchissant à base de rhum blanc, menthe fraîche, citron vert et sucre de canne, avec une touche de champagne pour l'élégance.",
    ingredients: ["Rhum blanc", "Menthe fraîche", "Citron vert", "Sucre de canne", "Champagne"],
    difficulty: "Facile",
    basePrice: 9800,
    perPersonPrice: 4500,
    category: "Rhum",
    isPopular: true
  },
  {
    name: "Kit Old Fashioned",
    image: "https://i.imgur.com/hr8w6tp.jpg",
    description: "Ce cocktail classique combine whisky bourbon, sucre, angostura bitters et zeste d'orange pour une expérience riche et complexe.",
    ingredients: ["Bourbon", "Sucre", "Angostura bitters", "Zeste d'orange"],
    difficulty: "Moyen",
    basePrice: 12500,
    perPersonPrice: 5800,
    category: "Whisky",
    isPopular: true
  },
  {
    name: "Kit Gin Tonic Deluxe",
    image: "https://i.imgur.com/DmkfqHC.jpg",
    description: "Une version élaborée du Gin Tonic classique avec des botaniques premium, baies de genévrier, zestes d'agrumes et tonic artisanal.",
    ingredients: ["Gin premium", "Tonic artisanal", "Baies de genévrier", "Zestes d'agrumes", "Concombre"],
    difficulty: "Facile",
    basePrice: 10500,
    perPersonPrice: 4800,
    category: "Gin",
    isNew: true
  },
  {
    name: "Kit Margarita Passion",
    image: "https://i.imgur.com/nLqbdNf.jpg",
    description: "Une version exotique de la Margarita classique, enrichie de fruits de la passion pour une expérience gustative unique.",
    ingredients: ["Tequila silver", "Triple sec", "Fruits de la passion", "Citron vert", "Sel fin"],
    difficulty: "Moyen",
    basePrice: 11800,
    perPersonPrice: 5200,
    category: "Tequila"
  },
  {
    name: "Kit Moscow Mule Premium",
    image: "https://i.imgur.com/EoM9zRi.jpg",
    description: "Un cocktail vif et épicé qui mélange vodka, ginger beer artisanal et citron vert frais pour une explosion de saveurs.",
    ingredients: ["Vodka premium", "Ginger beer artisanal", "Citron vert", "Menthe fraîche", "Sirop de gingembre"],
    difficulty: "Facile",
    basePrice: 9500,
    perPersonPrice: 4200,
    category: "Vodka"
  },
  {
    name: "Kit Virgin Colada",
    image: "https://i.imgur.com/k7MbdX9.jpg",
    description: "Version sans alcool de la Piña Colada, parfaite pour toute la famille. Goûtez aux saveurs tropicales de l'ananas et de la noix de coco.",
    ingredients: ["Jus d'ananas", "Lait de coco", "Sirop de sucre de canne", "Ananas frais", "Glace pilée"],
    difficulty: "Facile",
    basePrice: 7500,
    perPersonPrice: 3500,
    category: "Sans alcool",
    isNew: true
  }
];

export default function ImportDemoCocktails() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ 
    current: 0, 
    total: cocktails.length, 
    currentKit: '',
    completedKits: [] as string[],
    failedKits: [] as {name: string, error: string}[],
  });
  const [importComplete, setImportComplete] = useState(false);
  const { toast } = useToast();

  // Fonction pour insérer un cocktail kit et ses ingrédients
  const insertCocktailKit = async (cocktail: any) => {
    try {
      setProgress(prev => ({ ...prev, currentKit: cocktail.name }));
      
      // Vérifier si un kit avec le même nom existe déjà
      const { data: existingKits, error: queryError } = await supabase
        .from('cocktail_kits')
        .select('id')
        .eq('name', cocktail.name);
      
      if (queryError) {
        throw new Error(`Erreur lors de la vérification du kit: ${queryError.message}`);
      }
      
      if (existingKits && existingKits.length > 0) {
        setProgress(prev => ({
          ...prev,
          completedKits: [...prev.completedKits, `${cocktail.name} (déjà existant)`]
        }));
        return;
      }
      
      // Insérer le kit de cocktail
      const { data: kitData, error: kitError } = await supabase
        .from('cocktail_kits')
        .insert({
          name: cocktail.name,
          slug: generateSlug(cocktail.name),
          description: cocktail.description,
          image_url: cocktail.image,
          price: cocktail.basePrice,
          is_available: true,
          difficulty: cocktail.difficulty || 'Facile',
          additional_person_price: cocktail.perPersonPrice || 0,
          stock_status: 'En stock',
          is_new: cocktail.isNew || false,
          is_popular: cocktail.isPopular || false,
          category_id: null  // À remplacer par l'ID réel de la catégorie si nécessaire
        })
        .select()
        .single();
      
      if (kitError) {
        throw new Error(`Erreur lors de l'ajout du kit: ${kitError.message}`);
      }
      
      // Ajouter les ingrédients
      if (cocktail.ingredients && cocktail.ingredients.length > 0) {
        const ingredientsToAdd = cocktail.ingredients.map((ingredient: string) => ({
          cocktail_kit_id: kitData.id,
          name: ingredient,
          quantity: 1,
          unit: ''
        }));
        
        const { error: ingError } = await supabase
          .from('cocktail_kit_ingredients')
          .insert(ingredientsToAdd);
        
        if (ingError) {
          throw new Error(`Erreur lors de l'ajout des ingrédients: ${ingError.message}`);
        }
      }
      
      setProgress(prev => ({
        ...prev,
        completedKits: [...prev.completedKits, cocktail.name]
      }));
    } catch (error: any) {
      setProgress(prev => ({
        ...prev,
        failedKits: [...prev.failedKits, { name: cocktail.name, error: error.message }]
      }));
    }
  };

  // Fonction principale pour insérer tous les cocktails
  const handleImport = async () => {
    setIsImporting(true);
    setProgress({ 
      current: 0, 
      total: cocktails.length, 
      currentKit: '',
      completedKits: [],
      failedKits: [],
    });
    setImportComplete(false);
    
    try {
      for (let i = 0; i < cocktails.length; i++) {
        await insertCocktailKit(cocktails[i]);
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      toast({
        title: "Importation terminée",
        description: `${progress.completedKits.length} kits importés, ${progress.failedKits.length} échecs`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: error.message,
      });
    } finally {
      setIsImporting(false);
      setImportComplete(true);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Importer les Cocktails de Démonstration</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Kits de Cocktails à Importer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Cette page vous permet d'importer automatiquement les 6 kits de cocktails
              de démonstration affichés sur la page publique des kits de cocktails.
              Les données seront insérées dans votre base de données Supabase.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cocktails.map((cocktail, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${cocktail.image})` }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{cocktail.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{cocktail.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="bg-[#f5a623] hover:bg-[#f39c12]"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importation en cours...
                  </>
                ) : "Importer les kits de cocktails"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isImporting && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-[#f5a623] h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              
              <p className="text-center">
                Importation de {progress.current} sur {progress.total} kits
              </p>
              
              {progress.currentKit && (
                <p className="font-medium">
                  Traitement en cours: {progress.currentKit}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {importComplete && (
        <div className="space-y-4">
          {progress.completedKits.length > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Kits importés avec succès</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc list-inside text-green-700">
                  {progress.completedKits.map((kit, i) => (
                    <li key={i}>{kit}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {progress.failedKits.length > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Erreurs d'importation</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc list-inside text-red-700">
                  {progress.failedKits.map((kit, i) => (
                    <li key={i}>
                      {kit.name}: {kit.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
