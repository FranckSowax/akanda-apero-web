'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  MoreHorizontal,
  ArrowUpDown,
  Star,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  DialogClose,
} from "../../../components/ui/dialog";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import ProductService from "../../../services/product-service";
import CategoryService from "../../../services/category-service";
import { Product, Category } from "../../../lib/types";

// Type local pour la page
interface DisplayProduct extends Omit<Product, 'category'> {
  category: string;
  status: 'En stock' | 'Stock faible' | 'Épuisé';
}

// Composant pour afficher un produit dans la liste
const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: DisplayProduct; 
  onEdit: (product: DisplayProduct) => void; 
  onDelete: (id: string) => void 
}) => {
  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 rounded-full hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product.id)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {product.oldPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{Math.round((1 - product.price / (product.oldPrice || 0)) * 100)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-bold">{product.price.toLocaleString()} XAF</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">{product.oldPrice.toLocaleString()} XAF</span>
            )}
          </div>
          <Badge variant={product.stock > 10 ? "outline" : product.stock > 0 ? "secondary" : "destructive"}>
            {product.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Composant principal de la page
export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<DisplayProduct | null>(null);
  
  // États du formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    oldPrice: 0,
    stock: 0,
    category: '',
    imageUrl: '',
    featured: false
  });

  // Charger les produits depuis l'API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.getProducts();
      if (response.success) {
        // Conversion du type pour la compatibilité
        const formattedProducts = response.data?.map(p => {
          // Détermination du statut en fonction du stock
          const status: 'En stock' | 'Stock faible' | 'Épuisé' = 
            p.stock > 10 ? 'En stock' : p.stock > 0 ? 'Stock faible' : 'Épuisé';
            
          return {
            ...p,
            // Assurer que la catégorie est une chaîne
            category: typeof p.category === 'string' ? p.category : `Catégorie ${p.category}`,
            status
          };
        }) || [];
        setProducts(formattedProducts);
      } else {
        setError(response.error || 'Erreur lors du chargement des produits');
      }
    } catch (err) {
      setError('Erreur de serveur lors du chargement des produits');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      if (response.success) {
        setCategoryOptions(response.data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  // Charger les données au chargement de la page
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filtrer les produits en fonction de la catégorie et du terme de recherche
  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gestionnaires d'événements
  const handleEditProduct = (product: DisplayProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
      featured: product.featured || false
    });
    setIsAddEditDialogOpen(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      oldPrice: 0,
      stock: 0,
      category: categoryOptions.length > 0 ? categoryOptions[0].name : '',
      imageUrl: 'https://picsum.photos/seed/product/600/600',
      featured: false
    });
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        const response = await ProductService.deleteProduct(productToDelete);
        if (response.success) {
          setSuccessMessage('Produit supprimé avec succès');
          loadProducts(); // Recharger la liste des produits
        } else {
          setError(response.error || 'Erreur lors de la suppression du produit');
        }
      } catch (err) {
        setError('Erreur de serveur lors de la suppression du produit');
        console.error(err);
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Création ou mise à jour du produit
      let response;
      
      if (editingProduct) {
        // Mise à jour d'un produit existant
        response = await ProductService.updateProduct(editingProduct.id, {
          ...formData,
          oldPrice: formData.oldPrice > 0 ? formData.oldPrice : undefined
        });
      } else {
        // Création d'un nouveau produit
        response = await ProductService.createProduct({
          ...formData,
          oldPrice: formData.oldPrice > 0 ? formData.oldPrice : undefined,
          // Déterminer le statut en fonction du stock
          status: formData.stock > 10 ? 'En stock' : formData.stock > 0 ? 'Stock faible' : 'Épuisé'
        });
      }

      if (response.success) {
        setSuccessMessage(`Produit ${editingProduct ? 'mis à jour' : 'ajouté'} avec succès`);
        loadProducts(); // Recharger la liste des produits
        setIsAddEditDialogOpen(false);
      } else {
        setError(response.error || `Erreur lors de ${editingProduct ? 'la mise à jour' : 'l\'ajout'} du produit`);
      }
    } catch (err) {
      setError(`Erreur de serveur lors de ${editingProduct ? 'la mise à jour' : 'l\'ajout'} du produit`);
      console.error(err);
    }
  };

  // Masquer les notifications après un délai
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Produits</h1>
        <Button 
          className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2"
          onClick={handleAddNewProduct}
        >
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSuccessMessage(null)}
            className="text-green-800 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Produits</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">En Stock</p>
          <p className="text-2xl font-bold">{products.filter(p => p.status === 'En stock').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Stock Faible</p>
          <p className="text-2xl font-bold">{products.filter(p => p.status === 'Stock faible').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Épuisés</p>
          <p className="text-2xl font-bold">{products.filter(p => p.status === 'Épuisé').length}</p>
        </div>
      </div>

      {/* Filtres et barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? "bg-[#f5a623] hover:bg-[#e09000] text-white" : ""}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === 'table' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? "bg-[#f5a623] hover:bg-[#e09000] text-white" : ""}
          >
            Tableau
          </Button>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Array.from(new Set(products.map(product => product.category))).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full sm:w-auto">
          <div className="relative flex-grow sm:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Affichage du chargement */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
          <span className="ml-2 text-lg">Chargement des produits...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Aucun produit trouvé</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || filterCategory !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche' 
              : 'Commencez par ajouter un nouveau produit'}
          </p>
          {(searchTerm || filterCategory !== 'all') && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEditProduct} 
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout/modification de produit */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Modifiez les détails du produit ci-dessous.' 
                : 'Remplissez les informations pour créer un nouveau produit.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Whisky Premium"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du produit"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Prix (XAF)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="oldPrice">Ancien prix (optionnel)</Label>
                <Input
                  id="oldPrice"
                  name="oldPrice"
                  type="number"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
                  name="category"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(category => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  name="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, featured: checked === true }))
                  }
                />
                <Label htmlFor="featured">Mettre en avant ce produit</Label>
              </div>
              
              {formData.imageUrl && (
                <div className="col-span-2 flex justify-center">
                  <div className="relative w-48 h-48 border rounded overflow-hidden">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Aperçu du produit" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
