'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Beaker, Search, Check, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { supabase } from '../../lib/supabase/client';
import CocktailDBService from '../../services/cocktail-api';

interface Cocktail {
  id: string;
  api_id: string;
  title: string;
  image: string;
  difficulty: string;
  ingredients: string[];
  method: string[];
}

export function CocktailDiscovery() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(true);
  const [matchingProducts, setMatchingProducts] = useState<any[]>([]);
  const { toast } = useToast();

  // Charger les cocktails depuis l'API (version simplifiée pour démo)
  useEffect(() => {
    async function loadCocktails() {
      try {
        // Dans une application réelle, vous récupéreriez les données de l'API
        // Pour cette démo, nous utilisons des données statiques
        const mockCocktails = [
          {
            id: '1',
            api_id: '45',
            title: 'Aperol Spritz',
            image: 'https://images.unsplash.com/photo-1578664182390-f26f89445008?q=80&w=600',
            difficulty: 'Facile',
            ingredients: ['Aperol', 'Prosecco', 'Eau gazeuse', 'Slice of orange'],
            method: [
              'Remplir le verre de glaçons', 
              'Verser l\'Aperol', 
              'Ajouter le Prosecco et l\'eau gazeuse', 
              'Remuer et garnir d\'une tranche d\'orange'
            ]
          },
          {
            id: '2',
            api_id: '23',
            title: 'Mojito',
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600',
            difficulty: 'Moyen',
            ingredients: ['Rhum blanc', 'Menthe fraîche', 'Sucre', 'Citron vert', 'Eau gazeuse'],
            method: [
              'Piler la menthe avec le sucre et le jus de citron',
              'Ajouter le rhum et les glaçons',
              'Compléter avec de l\'eau gazeuse',
              'Remuer délicatement et garnir'
            ]
          },
          {
            id: '3',
            api_id: '78',
            title: 'Margarita',
            image: 'https://images.unsplash.com/photo-1632789395770-20e3d1d4e374?q=80&w=600',
            difficulty: 'Moyen',
            ingredients: ['Tequila', 'Triple sec', 'Jus de citron vert', 'Sel'],
            method: [
              'Frotter le bord du verre avec du citron et le tremper dans le sel',
              'Mélanger la tequila, le triple sec et le jus de citron dans un shaker',
              'Ajouter des glaçons et secouer vigoureusement',
              'Filtrer dans le verre préparé'
            ]
          }
        ];
        
        setCocktails(mockCocktails);
      } catch (error) {
        console.error('Erreur lors du chargement des cocktails:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les cocktails. Veuillez réessayer.'
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadCocktails();
  }, [toast]);

  // Ajouter un ingrédient à la liste
  const addIngredient = () => {
    if (currentIngredient.trim() && !userIngredients.includes(currentIngredient.trim())) {
      setUserIngredients([...userIngredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  // Retirer un ingrédient de la liste
  const removeIngredient = (ingredient: string) => {
    setUserIngredients(userIngredients.filter(i => i !== ingredient));
  };

  // Filtrer les cocktails en fonction des ingrédients et/ou du terme de recherche
  const filteredCocktails = cocktails.filter(cocktail => {
    const matchesSearch = !searchTerm || 
      cocktail.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIngredients = userIngredients.length === 0 || 
      userIngredients.some(ing => 
        cocktail.ingredients.some(i => i.toLowerCase().includes(ing.toLowerCase()))
      );
    
    return matchesSearch && matchesIngredients;
  });

  // Sélectionner un cocktail pour voir les détails
  const viewCocktailDetails = async (cocktail: Cocktail) => {
    setSelectedCocktail(cocktail);
    setActiveTab('recipe');
    
    // Simulation de produits correspondants (dans une vraie application, vous récupéreriez ces données depuis Supabase)
    const mockProducts = [
      { id: 'p1', name: 'Aperol 75cl', price: 1995 },
      { id: 'p2', name: 'Prosecco Brut 75cl', price: 1290 },
      { id: 'p3', name: 'Eau gazeuse San Pellegrino 50cl', price: 180 }
    ];
    
    setMatchingProducts(mockProducts);
  };

  // Ajouter le kit au panier (simulation)
  const addKitToCart = () => {
    if (!selectedCocktail) return;
    
    // Dans une vraie application, vous appelleriez votre fonction addToCart
    
    toast({
      title: 'Kit ajouté au panier',
      description: `Le kit ${selectedCocktail.title} a été ajouté à votre panier.`
    });
  };

  return (
    <div className="mt-8 mb-12">
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-amber-800">
          <Beaker className="mr-2 h-6 w-6" />
          Découvrez votre prochain cocktail
        </h2>
        <p className="text-amber-700 mb-6">
          Trouvez la recette parfaite en fonction des ingrédients que vous avez ou achetez tout ce dont vous avez besoin en un clic.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="discover" className="flex-1">Découvrir</TabsTrigger>
            {selectedCocktail && (
              <TabsTrigger value="recipe" className="flex-1">Recette</TabsTrigger>
            )}
            <TabsTrigger value="ingredients" className="flex-1">Par ingrédients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un cocktail..."
                className="pl-10 mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCocktails.map(cocktail => (
                  <Card key={cocktail.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={cocktail.image || '/images/placeholder-cocktail.jpg'}
                        alt={cocktail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{cocktail.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2">
                      <p className="text-sm text-gray-500">
                        {cocktail.ingredients.length} ingrédients
                      </p>
                      <Badge className="mt-2 bg-amber-100 text-amber-800">{cocktail.difficulty}</Badge>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => viewCocktailDetails(cocktail)}
                        className="w-full bg-[#f5a623] hover:bg-[#e09000]"
                      >
                        Voir la recette
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {filteredCocktails.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">Aucun cocktail trouvé. Essayez une autre recherche.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recipe">
            {selectedCocktail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedCocktail.image || '/images/placeholder-cocktail.jpg'}
                      alt={selectedCocktail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{selectedCocktail.title}</h3>
                  <Badge className="mb-4 bg-amber-100 text-amber-800">{selectedCocktail.difficulty}</Badge>
                  
                  <h4 className="font-medium mb-2">Ingrédients:</h4>
                  <ul className="space-y-2 mb-6">
                    {selectedCocktail.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Check className="h-4 w-4 mr-2 text-[#f5a623]" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Préparation:</h4>
                  <ol className="space-y-4 mb-6">
                    {selectedCocktail.method.map((step, idx) => (
                      <li key={idx} className="flex text-sm">
                        <span className="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                  
                  <div className="bg-amber-50 rounded-lg p-4 mt-4 mb-6">
                    <h4 className="font-medium mb-2">Produits suggérés ({matchingProducts.length}):</h4>
                    {matchingProducts.length > 0 ? (
                      <div className="space-y-3">
                        {matchingProducts.map(product => (
                          <div key={product.id} className="flex justify-between items-center">
                            <span>{product.name}</span>
                            <span className="text-amber-700 font-medium">{(product.price / 100).toFixed(2)} €</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total</span>
                          <span className="text-amber-700">
                            {(matchingProducts.reduce((sum, p) => sum + p.price, 0) / 100).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Aucun produit correspondant trouvé dans notre boutique.
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={addKitToCart}
                      disabled={matchingProducts.length === 0}
                      className="bg-[#f5a623] hover:bg-[#e09000]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un kit (-10%)
                    </Button>
                    
                    <Button
                      onClick={addKitToCart}
                      disabled={matchingProducts.length === 0}
                      variant="outline"
                      className="border-[#f5a623] text-[#f5a623] hover:bg-amber-50"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ingredients">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Quels ingrédients avez-vous?</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  placeholder="Ex: vodka, citron, sucre..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient} className="bg-[#f5a623] hover:bg-[#e09000]">
                  Ajouter
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {userIngredients.map(ingredient => (
                  <Badge key={ingredient} className="bg-amber-100 text-amber-800 px-3 py-1">
                    {ingredient}
                    <button 
                      onClick={() => removeIngredient(ingredient)} 
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              {userIngredients.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCocktails.map(cocktail => (
                    <Card key={cocktail.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={cocktail.image || '/images/placeholder-cocktail.jpg'}
                          alt={cocktail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{cocktail.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {userIngredients.map(ing => 
                            cocktail.ingredients.some(i => i.toLowerCase().includes(ing.toLowerCase())) && (
                              <Badge key={ing} className="bg-green-100 text-green-800">
                                {ing} ✓
                              </Badge>
                            )
                          )}
                          {cocktail.ingredients
                            .filter(ing => !userIngredients.some(ui => ing.toLowerCase().includes(ui.toLowerCase())))
                            .slice(0, 3)
                            .map(ing => (
                              <Badge key={ing} className="bg-gray-100 text-gray-800">
                                +{ing}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => viewCocktailDetails(cocktail)}
                          className="w-full bg-[#f5a623] hover:bg-[#e09000]"
                        >
                          Voir la recette
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {filteredCocktails.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        Aucun cocktail trouvé avec ces ingrédients. Essayez d'autres ingrédients.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
