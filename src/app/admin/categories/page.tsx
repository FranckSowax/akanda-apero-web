'use client';

import React, { useState, useEffect } from 'react';
import { ClientOnly } from '../../../components/ui/client-only';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  PackageOpen,
  Wine,
  Beer,
  GlassWater,
  Sparkles,
  Package,
  AlertCircle,
  Loader2,
  Box,
  Star,
  Coffee,
  Beaker,
  Utensils,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from "../../../components/ui/label";
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useCategories } from "../../../hooks/supabase/useCategories";
import { Category } from "../../../types/supabase";

// Type étendu pour l'affichage des catégories
interface DisplayCategory extends Omit<Category, 'icon'> {
  icon: React.ReactNode; // Remplace le string icon par ReactNode pour l'affichage
  formattedColor: string;
}

export default function CategoriesPage() {
  const { getCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { data: categoriesData, isLoading, error: categoriesError } = getCategories();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DisplayCategory | null>(null);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Valeurs du formulaire
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#f5a623');
  const [formIcon, setFormIcon] = useState('Package');

  // Fonction pour attribuer une icône en fonction du nom de la catégorie
  const getIconForCategory = (category: Category): React.ReactNode => {
    const iconProps = { className: "h-10 w-10" };
    
    if (category.icon) {
      // Si une icône est déjà définie dans la catégorie, l'utiliser
      switch(category.icon) {
        case 'Star': return <Star {...iconProps} />;
        case 'Package': return <Package {...iconProps} />;
        case 'Wine': return <Wine {...iconProps} />;
        case 'Beer': return <Beer {...iconProps} />;
        case 'GlassWater': return <GlassWater {...iconProps} />;
        case 'Sparkles': return <Sparkles {...iconProps} />;
        case 'Coffee': return <Coffee {...iconProps} />;
        case 'Beaker': return <Beaker {...iconProps} />;
        case 'Utensils': return <Utensils {...iconProps} />;
        case 'Lightbulb': return <Lightbulb {...iconProps} />;
        default: return <Box {...iconProps} />;
      }
    }
    
    // Sinon, essayer de déterminer une icône basée sur le nom
    const name = category.name.toLowerCase();
    if (name.includes('pack')) return <Package {...iconProps} />;
    if (name.includes('spirit') || name.includes('spiritueux')) return <GlassWater {...iconProps} />;
    if (name.includes('vin')) return <Wine {...iconProps} />;
    if (name.includes('bière')) return <Beer {...iconProps} />;
    if (name.includes('cocktail')) return <Sparkles {...iconProps} />;
    if (name.includes('accessoire')) return <PackageOpen {...iconProps} />;
    
    return <Box {...iconProps} />; // Icône par défaut
  };

  // Convertir les catégories Supabase en DisplayCategory
  useEffect(() => {
    if (categoriesData) {
      const displayCategories = categoriesData.map((category: Category) => {
        const iconComponent = getIconForCategory(category);
        
        return {
          ...category,
          icon: iconComponent,
          formattedColor: category.color || '#f5a623' // Couleur par défaut si non définie
        };
      });
      
      setCategories(displayCategories);
    }
  }, [categoriesData]);

  // Gestion des erreurs
  useEffect(() => {
    if (categoriesError) {
      console.error("Erreur lors du chargement des catégories:", categoriesError);
      setError("Impossible de charger les catégories. Veuillez réessayer plus tard.");
    }
  }, [categoriesError]);

  // Filtrer les catégories selon le terme de recherche
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Générer un slug à partir du nom
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]+/g, '-')     // Remplacer les caractères non alphanumériques par des tirets
      .replace(/^-+|-+$/g, '')         // Enlever les tirets au début et à la fin
      .trim();
  };

  // Préparer le formulaire d'ajout
  const handleAddCategory = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormColor('#f5a623');
    setFormIcon('Package');
    setEditingCategory(null);
    setIsAddEditDialogOpen(true);
  };

  // Préparer le formulaire d'édition
  const handleEditCategory = (category: DisplayCategory) => {
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
    setFormColor(category.color || '#f5a623');
    setFormIcon(category.icon ? (typeof category.icon === 'string' ? category.icon : 'Package') : 'Package');
    setEditingCategory(category);
    setIsAddEditDialogOpen(true);
  };

  // Gérer le changement de nom et générer automatiquement le slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    if (!editingCategory || formSlug === '') {
      setFormSlug(generateSlug(name));
    }
  };

  // Enregistrer une catégorie (création ou mise à jour)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName || !formSlug) {
      setError("Le nom et le slug sont obligatoires.");
      return;
    }
    
    try {
      // Préparer les données de la catégorie
      const categoryData = {
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: formDescription,
        color: formColor,
        icon: formIcon,
        image_url: formIcon, // Utiliser l'icône comme image_url
        parent_id: null // Catégorie de premier niveau par défaut
      };
      
      if (editingCategory) {
        // Mise à jour d'une catégorie existante
        await updateCategory.mutateAsync({ id: editingCategory.id, category: categoryData });
        setActionSuccess(`La catégorie "${formName}" a été mise à jour avec succès.`);
      } else {
        // Création d'une nouvelle catégorie
        await createCategory.mutateAsync(categoryData);
        setActionSuccess(`La catégorie "${formName}" a été créée avec succès.`);
      }
      
      setIsAddEditDialogOpen(false);
      
      // Effacer les messages après quelques secondes
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erreur: ${errorMessage}`);
      
      // Effacer les messages d'erreur après quelques secondes
      setTimeout(() => setError(null), 5000);
    }
  };

  // Confirmer et exécuter la suppression d'une catégorie
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      // Mettre à jour l'état local immédiatement avant l'opération sur la base de données
      // pour éviter les problèmes d'interface figée
      setCategories(currentCategories => 
        currentCategories.filter(cat => cat.id !== categoryToDelete)
      );
      
      // Utiliser la méthode mutateAsync de l'objet de mutation
      await deleteCategory.mutateAsync(categoryToDelete);
      
      // Fermer le dialogue et réinitialiser l'état
      setActionSuccess("La catégorie a été supprimée avec succès.");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      
      // Effacer les messages après quelques secondes
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erreur: ${errorMessage}`);
      
      // Effacer les messages d'erreur après quelques secondes
      setTimeout(() => setError(null), 5000);
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* En-tête avec titre et recherche */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des catégories</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-64"
              />
            </div>
            <Button
              onClick={handleAddCategory}
              className="bg-[#f5a623] hover:bg-[#e09000] text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter une catégorie
            </Button>
          </div>
        </div>

        {/* Messages de statut */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {actionSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
            <Star className="h-5 w-5 mr-2" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Lien vers l'initialisation des catégories */}
        <div className="border rounded-lg p-3">
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 text-base py-3 border-dashed border-gray-400"
              asChild
            >
              <a href="/init-categories" target="_blank">
                <Star className="h-5 w-5 text-[#f5a623]" />
                Initialiser toutes les catégories prédéfinies
              </a>
            </Button>
          </div>
          
          {/* Statut de chargement */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-lg">Chargement des catégories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Box className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Aucune catégorie trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Aucun résultat ne correspond à votre recherche." : "Commencez par ajouter une catégorie."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm('')}
                  className="mt-3"
                  variant="outline"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                <Card key={category.id} className="overflow-hidden border-t-4" style={{ borderTopColor: category.color || '#f5a623' }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-md">
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>
                            {category.product_count || 0} produits
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {category.description || "Aucune description disponible"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.slug}
                      </Badge>
                      <div 
                        className="h-4 w-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: category.color || '#f5a623' }} 
                        title={category.color}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dialogue d'ajout/modification de catégorie */}
        <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? "Modifiez les détails de cette catégorie et cliquez sur Enregistrer."
                  : "Saisissez les détails de la nouvelle catégorie."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    placeholder="Nom de la catégorie"
                    value={formName}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="slug-de-la-categorie"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Le slug est utilisé dans les URLs et doit être unique.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description de la catégorie"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="color">Couleur</Label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        id="color"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        placeholder="#HEX"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icône</Label>
                    <Select defaultValue={formIcon} onValueChange={(value) => setFormIcon(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une icône" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Package">📦 Paquet</SelectItem>
                        <SelectItem value="Star">⭐ Étoile</SelectItem>
                        <SelectItem value="Wine">🍷 Vin</SelectItem>
                        <SelectItem value="Beer">🍺 Bière</SelectItem>
                        <SelectItem value="GlassWater">🥃 Spiritueux</SelectItem>
                        <SelectItem value="Sparkles">✨ Luxe</SelectItem>
                        <SelectItem value="Coffee">☕ Café</SelectItem>
                        <SelectItem value="Beaker">🧪 Liqueur</SelectItem>
                        <SelectItem value="Utensils">🍴 Nourriture</SelectItem>
                        <SelectItem value="Lightbulb">💡 Idée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#f5a623] hover:bg-[#e09000] text-white"
                >
                  {editingCategory ? "Enregistrer" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialogue de confirmation de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ClientOnly>
  );
}
