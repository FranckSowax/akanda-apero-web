'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Wine,
  GlassWater,
  X,
  Upload,
  Loader2 
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useCocktailKits } from '../../../hooks/supabase/useCocktailKits';
import { CocktailKit, CocktailKitIngredient } from '../../../types/supabase';
import { toast } from '../../../components/ui/use-toast';
import { formatPrice, slugify } from '../../../lib/utils/formatters';
import { ClientOnly } from '../../../components/ui/client-only';

// Types pour la gestion du formulaire
interface CocktailKitFormData {
  kit: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    price: number;
    is_available: boolean;
    additional_person_price: number;
    stock_status: string;
    is_new: boolean;
    is_popular: boolean;
    category_id: string;
  };
  ingredients: {
    id?: string;
    name: string;
    quantity: string;
    unit: string;
  }[];
}

// Fonction utilitaire pour obtenir une URL d'image fiable
const getKitImageUrl = (kit: any): string => {
  if (kit?.image_url && typeof kit.image_url === 'string') {
    // Gérer les liens blob (temporaires)
    if (kit.image_url.startsWith('blob:')) {
      return `https://source.unsplash.com/random/800x600?cocktail&sig=${kit.id}`;
    }
    
    // Convertir les liens Imgur standards en liens directs d'image
    if (kit.image_url.match(/https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)) {
      const imgurId = kit.image_url.match(/https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)[1];
      return `https://i.imgur.com/${imgurId}.jpg`;
    }
    
    // Pour les autres URL, les utiliser telles quelles
    return kit.image_url;
  }
  
  // Image par défaut si aucune image n'est disponible
  return 'https://picsum.photos/seed/cocktail/600/600';
};

// Composant principal de la page de gestion des kits de cocktails
export default function CocktailKitsAdminPage() {
  // Hook pour accéder aux fonctions de gestion des kits de cocktails
  const { 
    getCocktailKits,
    getCocktailKitById, 
    createCocktailKit,
    updateCocktailKit,
    deleteCocktailKit 
  } = useCocktailKits();
  
  // Requêtes pour les données de kits
  const { data: cocktailKits, isLoading, isError, error } = getCocktailKits();
  
  // Log de débogage pour voir l'erreur spécifique
  useEffect(() => {
    if (isError && error) {
      console.error('Erreur lors du chargement des kits de cocktails:', error);
    }
  }, [isError, error]);
  
  // États pour la gestion du formulaire et des actions
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentKitId, setCurrentKitId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState<CocktailKitFormData>({
    kit: {
      name: '',
      slug: '',
      description: '',
      image_url: '',
      price: 0,
      is_available: true,
      additional_person_price: 0,
      stock_status: 'En stock',
      is_new: false,
      is_popular: false,
      category_id: ''
    },
    ingredients: []
  });

  // Filtrer les kits par recherche
  const filteredKits = cocktailKits?.filter(kit => {
    if (!searchQuery) return true;
    return kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.description.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];
  
  // Gestionnaire de changement pour les champs du kit
  const handleKitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        kit: {
          ...prev.kit,
          [name]: target.checked
        }
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        kit: {
          ...prev.kit,
          [name]: Number(value)
        }
      }));
    } else if (name === 'name' && !isEditMode) {
      // Générer automatiquement le slug à partir du nom
      setFormData(prev => ({
        ...prev,
        kit: {
          ...prev.kit,
          [name]: value,
          slug: slugify(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kit: {
          ...prev.kit,
          [name]: value
        }
      }));
    }
  };
  
  // Gestionnaire pour l'ajout d'ingrédients
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: '', quantity: '', unit: 'cl' }
      ]
    }));
  };
  
  // Gestionnaire de modification d'ingrédient
  const handleIngredientChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      return { ...prev, ingredients: newIngredients };
    });
  };
  
  // Gestionnaire de suppression d'ingrédient
  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients.splice(index, 1);
      return { ...prev, ingredients: newIngredients };
    });
  };
  
  // Gestionnaire d'ajout/modification d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Libérer l'ancienne URL si elle existe
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Créer une URL pour la prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    setFormData(prev => ({
      ...prev,
      kit: {
        ...prev.kit,
        image_url: previewUrl
      }
    }));
  };
  
  // Fonction pour configurer le formulaire en mode édition
  const handleEditKit = async (kit: CocktailKit) => {
    // Afficher un indicateur de chargement
    toast.loading("Chargement des détails du kit...");
    
    try {
      // Récupérer les ingrédients existants du kit
      const result = await getCocktailKitById(kit.id);
      // Masquer l'indicateur de chargement
      toast.dismiss();
      
      // Trouver le kit complet avec ses ingrédients
      const kitWithIngredients = result.data?.find((k: any) => k.id === kit.id);
      
      if (kitWithIngredients) {
        // Préparer les ingrédients pour le formulaire
        const ingredientsData = kitWithIngredients.ingredients?.map((ing: CocktailKitIngredient) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity || '',
          unit: ing.unit || 'cl'
        })) || [];
        
        // Mettre à jour le formulaire avec les données du kit et ses ingrédients
        setFormData({
          kit: {
            id: kit.id,
            name: kit.name,
            slug: kit.slug,
            description: kit.description || '',
            image_url: kit.image_url || '',
            price: kit.price || 0,
            is_available: kit.is_available,
            additional_person_price: 0,
            stock_status: kit.stock_status || 'en_stock',
            is_new: false,
            is_popular: false,
            category_id: kit.category_id || 'rhum'
          },
          ingredients: ingredientsData.length > 0 ? ingredientsData : [{ name: '', quantity: '', unit: 'cl' }]
        });
        
        // Mettre le formulaire en mode édition et l'afficher
        setIsEditMode(true);
        setShowForm(true);
        
        // S'assurer que la page défile vers le haut pour afficher le formulaire sur mobile
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        
        toast.success("Kit chargé pour modification");
      } else {
        // Gestion du cas où le kit n'est pas trouvé
        toast.error("Impossible de charger les détails du kit de cocktail");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error("Erreur lors du chargement: " + (error?.message || "Erreur inconnue"));
    }
  };
  
  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      kit: {
        name: '',
        slug: '',
        description: '',
        image_url: '',
        price: 0,
        is_available: true,
        additional_person_price: 0,
        stock_status: 'En stock',
        is_new: false,
        is_popular: false,
        category_id: ''
      },
      ingredients: []
    });
    
    // Libérer l'URL de prévisualisation
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    setCurrentKitId(null);
    setIsEditMode(false);
  };
  
  // Gestionnaire d'annulation de modification
  const handleCancelEdit = () => {
    resetForm();
    setShowForm(false);
  };
  
  // Soumission du formulaire (création ou mise à jour)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Vérification des données obligatoires
      if (!formData.kit.name || !formData.kit.description || formData.kit.price <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Vérifier qu'il y a au moins un ingrédient
      if (formData.ingredients.length === 0) {
        toast.error('Veuillez ajouter au moins un ingrédient au kit');
        return;
      }

      // Vérifier que tous les ingrédients ont un nom et une quantité
      const invalidIngredient = formData.ingredients.find(
        (ing) => !ing.name || !ing.quantity
      );
      if (invalidIngredient) {
        toast.error('Tous les ingrédients doivent avoir un nom et une quantité');
        return;
      }
      
      if (isEditMode && currentKitId) {
        // Mode mise à jour
        await updateCocktailKit.mutate({
          id: currentKitId,
          formData
        });
        toast.success('Kit de cocktail mis à jour avec succès');
      } else {
        // Mode création
        try {
          // Définir correctement les champs obligatoires pour éviter les erreurs
          const kitData = {
            ...formData.kit,
            is_available: formData.kit.is_available !== undefined ? formData.kit.is_available : true
          };
          
          // Créer le kit avec les données correctement formatées
          await createCocktailKit.mutate({
            kit: kitData,
            ingredients: formData.ingredients
          });
          
          toast.success('Kit de cocktail créé avec succès');
        } catch (createError) {
          console.error('Erreur détaillée lors de la création:', createError);
          throw createError; // Relancer l'erreur pour la gestion globale
        }
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'} du kit:`, error);
      toast.error(`Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'} du kit`);
    }
  };
  
  // Fonction pour supprimer un kit
  const handleDeleteKit = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce kit de cocktail ?')) {
      try {
        await deleteCocktailKit.mutate(id);
        toast.success('Kit de cocktail supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du kit:', error);
        toast.error('Erreur lors de la suppression du kit');
      }
    }
  };

  return (
    <ClientOnly>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des kits de cocktails</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un kit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64"
              />
            </div>
            <Button
              onClick={() => {
                if (showForm) {
                  handleCancelEdit();
                } else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="bg-[#f5a623] hover:bg-[#e09000] text-white"
            >
              {showForm ? 'Annuler' : <><Plus className="h-4 w-4 mr-2" /> Ajouter un kit</>}
            </Button>
          </div>
        </div>
        
        {/* Formulaire d'ajout ou de modification */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? 'Modifier le kit de cocktail' : 'Ajouter un kit de cocktail'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du kit</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.kit.name}
                      onChange={handleKitChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Catégorie</Label>
                    <Select
                      name="category_id"
                      value={formData.kit.category_id}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          kit: {
                            ...prev.kit,
                            category_id: value
                          }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rhum">Rhum</SelectItem>
                        <SelectItem value="vodka">Vodka</SelectItem>
                        <SelectItem value="gin">Gin</SelectItem>
                        <SelectItem value="whisky">Whisky</SelectItem>
                        <SelectItem value="tequila">Tequila</SelectItem>
                        <SelectItem value="sans-alcool">Sans alcool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.kit.slug}
                      onChange={handleKitChange}
                      disabled={!isEditMode}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {isEditMode 
                        ? "Le slug est utilisé dans l'URL du kit" 
                        : "Le slug est généré automatiquement à partir du nom"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.kit.description}
                      onChange={handleKitChange}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL de l'image</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="image_url"
                        name="image_url"
                        value={formData.kit.image_url.startsWith('blob:') ? '' : formData.kit.image_url}
                        onChange={handleKitChange}
                        placeholder="https://exemple.com/image.jpg"
                      />
                      <label htmlFor="image_upload" className="cursor-pointer">
                        <div className="flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                          <Upload className="w-4 h-4 mr-2" />
                          <span>Parcourir</span>
                        </div>
                        <input
                          type="file"
                          id="image_upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix de base (pour 2 personnes) (FCFA)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.kit.price}
                        onChange={handleKitChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additional_person_price">Prix par personne supplémentaire</Label>
                      <Input
                        id="additional_person_price"
                        name="additional_person_price"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.kit.additional_person_price}
                        onChange={handleKitChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_status">Statut du stock</Label>
                      <Select
                        name="stock_status"
                        value={formData.kit.stock_status}
                        onValueChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            kit: {
                              ...prev.kit,
                              stock_status: value
                            }
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="En stock">En stock</SelectItem>
                          <SelectItem value="Stock limité">Stock limité</SelectItem>
                          <SelectItem value="En rupture">En rupture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_new"
                        name="is_new"
                        checked={formData.kit.is_new}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            kit: {
                              ...prev.kit,
                              is_new: checked === true
                            }
                          }));
                        }}
                      />
                      <label
                        htmlFor="is_new"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Nouveau
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_popular"
                        name="is_popular"
                        checked={formData.kit.is_popular}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            kit: {
                              ...prev.kit,
                              is_popular: checked === true
                            }
                          }));
                        }}
                      />
                      <label
                        htmlFor="is_popular"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Populaire
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_available"
                        name="is_available"
                        checked={formData.kit.is_available}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            kit: {
                              ...prev.kit,
                              is_available: checked === true
                            }
                          }));
                        }}
                      />
                      <label
                        htmlFor="is_available"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Disponible à la vente
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.kit.description}
                      onChange={handleKitChange}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 relative border rounded overflow-hidden">
                        {(formData.kit.image_url || imagePreview) && (
                          <Image
                            src={imagePreview || formData.kit.image_url}
                            alt={formData.kit.name || "Aperçu du kit"}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gestion des ingrédients */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Ingrédients</h3>
                  <Button 
                    type="button" 
                    onClick={handleAddIngredient}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter un ingrédient
                  </Button>
                </div>
                
                {formData.ingredients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <GlassWater className="h-8 w-8 mx-auto mb-2" />
                    <p>Aucun ingrédient ajouté</p>
                    <p className="text-sm">Ajoutez des ingrédients pour composer votre kit de cocktail</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                        <div className="flex-1">
                          <Input
                            placeholder="Nom de l'ingrédient"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            placeholder="Quantité"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                        <div className="w-20">
                          <Select 
                            value={ingredient.unit}
                            onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cl">cl</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="pièce">pièce</SelectItem>
                              <SelectItem value="cuillère">cuillère</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                  {isEditMode ? 'Mettre à jour' : 'Créer le kit'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Liste des kits de cocktails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
              <span className="ml-2">Chargement des kits de cocktails...</span>
            </div>
          ) : isError ? (
            <div className="col-span-full text-center py-12 text-red-500">
              <p>Une erreur est survenue lors du chargement des kits de cocktails.</p>
              <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Essayer à nouveau
              </Button>
            </div>
          ) : filteredKits.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Wine className="h-12 w-12 mx-auto mb-2" />
              {searchQuery ? (
                <>
                  <p>Aucun kit de cocktail ne correspond à votre recherche</p>
                  <Button 
                    variant="link" 
                    onClick={() => setSearchQuery('')}
                    className="text-[#f5a623]"
                  >
                    Réinitialiser la recherche
                  </Button>
                </>
              ) : (
                <>
                  <p>Aucun kit de cocktail disponible</p>
                  <p className="text-sm">Créez votre premier kit en cliquant sur "Ajouter un kit"</p>
                </>
              )}
            </div>
          ) : (
            filteredKits.map((kit) => (
              <Card key={kit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={getKitImageUrl(kit)}
                    alt={kit.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!kit.is_available && (
                      <Badge variant="secondary" className="bg-gray-200">
                        Indisponible
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{kit.name}</h3>
                    <div className="text-lg font-medium text-[#f5a623]">
                      {formatPrice(kit.price)} FCFA
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {kit.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      {kit.ingredients?.length || 0} ingrédient(s)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Force scroll to top before editing to ensure form is visible on mobile
                          window.scrollTo(0, 0);
                          handleEditKit(kit);
                        }}
                        className="h-8 px-2 whitespace-nowrap"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteKit(kit.id)}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:border-red-200"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
