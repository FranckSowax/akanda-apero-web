'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PlusCircle, Edit, Trash2, ListPlus } from 'lucide-react';
import Image from 'next/image';

// Import des composants client séparés pour éviter les erreurs d'hydratation
import { ProductDialog } from './components/product-dialog';
import { CategoryDialog } from './components/category-dialog';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isPromo: boolean;
}

interface Category {
  id: string;
  name: string;
}

const initialProducts: Product[] = [
  { id: 'p1', name: 'Pack Tout-en-Un', description: '1 Boîte (12 Canettes)', price: 24.99, stock: 100, category: 'alcools', imageUrl: 'https://picsum.photos/seed/alldae1/50/50', isPromo: false },
  { id: 'p2', name: 'Fruit de la Passion Goyave', description: '1 Boîte (12 Canettes)', price: 24.99, stock: 50, category: 'softs', imageUrl: 'https://picsum.photos/seed/alldae2/50/50', isPromo: true },
  { id: 'p3', name: 'Gingembre Yuzu', description: '1 Boîte (12 Canettes)', price: 24.99, stock: 75, category: 'softs', imageUrl: 'https://picsum.photos/seed/alldae3/50/50', isPromo: false },
];

const initialCategories: Category[] = [
  { id: 'c1', name: 'Alcools' },
  { id: 'c2', name: 'Bières' },
  { id: 'c3', name: 'Softs' },
  { id: 'c4', name: 'Snacks' },
  { id: 'c5', name: 'Promotions' },
];

export default function DashboardPage() {
  // États pour gérer les produits et catégories
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // États pour les dialogues
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Gestion des produits
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Mise à jour d'un produit existant
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      // Ajout d'un nouveau produit
      setProducts([...products, product]);
    }
    setIsProductDialogOpen(false);
  };

  // Gestion des catégories
  const handleSaveCategory = (category: Category) => {
    setCategories([...categories, category]);
    setIsCategoryDialogOpen(false);
  };

  // Suppression d'un produit
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Suppression d'une catégorie
  const handleDeleteCategory = (id: string) => {
    if (products.some(p => p.category === categories.find(c => c.id === id)?.name.toLowerCase())) {
      alert("Impossible de supprimer une catégorie utilisée par des produits.");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  // Ouvrir le dialogue d'édition d'un produit
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  // Ouvrir le dialogue d'ajout d'un produit
  const openAddDialog = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-2 xs:py-4 sm:py-6 lg:py-10 px-2 xs:px-3 sm:px-4">
        <div className="mb-4 xs:mb-6 sm:mb-8">
          <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Tableau de bord</h1>
          <p className="text-xs xs:text-sm text-gray-600 mt-1">Gérez vos produits et catégories</p>
        </div>

        {/* Statistiques en haut - ultra-optimisées pour mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-2 xs:p-3 sm:p-4">
            <div className="flex flex-col space-y-1 xs:space-y-2">
              <span className="text-xs xs:text-sm text-gray-600 font-medium">Commandes</span>
              <div className="flex items-center justify-between">
                <div className="bg-blue-500 p-1 xs:p-1.5 sm:p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <span className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-700">24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-2 xs:p-3 sm:p-4">
            <div className="flex flex-col space-y-1 xs:space-y-2">
              <span className="text-xs xs:text-sm text-gray-600 font-medium">Revenus</span>
              <div className="flex items-center justify-between">
                <div className="bg-green-500 p-1 xs:p-1.5 sm:p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg xs:text-xl sm:text-2xl font-bold text-green-700">258k</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
          <CardContent className="p-2 xs:p-3 sm:p-4">
            <div className="flex flex-col space-y-1 xs:space-y-2">
              <span className="text-xs xs:text-sm text-gray-600 font-medium">Clients</span>
              <div className="flex items-center justify-between">
                <div className="bg-purple-500 p-1 xs:p-1.5 sm:p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-700">18</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow">
          <CardContent className="p-2 xs:p-3 sm:p-4">
            <div className="flex flex-col space-y-1 xs:space-y-2">
              <span className="text-xs xs:text-sm text-gray-600 font-medium">Livraisons</span>
              <div className="flex items-center justify-between">
                <div className="bg-amber-500 p-1 xs:p-1.5 sm:p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h2.7l1.3 3H14V7z" />
                    <path fillRule="evenodd" d="M14 3a1 1 0 00-1 1v9h-3.05a2.5 2.5 0 00-4.9 0H4a1 1 0 01-1-1v-1h4V4a1 1 0 01.3-.7l1-1A1 1 0 0115 3h-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg xs:text-xl sm:text-2xl font-bold text-amber-700">7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-3 xs:mb-4 sm:mb-6 w-full grid grid-cols-2 h-auto p-1">
          <TabsTrigger className="text-xs xs:text-sm sm:text-base flex-1 py-2 xs:py-2.5 sm:py-3 px-1 xs:px-2" value="products">
            <span className="hidden xs:inline">Gestion des Produits</span>
            <span className="xs:hidden">Produits</span>
          </TabsTrigger>
          <TabsTrigger className="text-xs xs:text-sm sm:text-base flex-1 py-2 xs:py-2.5 sm:py-3 px-1 xs:px-2" value="categories">
            <span className="hidden xs:inline">Gestion des Catégories</span>
            <span className="xs:hidden">Catégories</span>
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="border-0 xs:border shadow-sm">
            <CardHeader className="p-3 xs:p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-4">
                <div className="flex-1">
                  <CardTitle className="text-primary text-base xs:text-lg sm:text-xl">Produits</CardTitle>
                  <CardDescription className="text-xs xs:text-sm mt-1">Gérez vos produits, stocks et promotions.</CardDescription>
                </div>
                <Button onClick={openAddDialog} className="w-full xs:w-auto text-xs xs:text-sm py-2 xs:py-2.5 px-3 xs:px-4">
                  <PlusCircle className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" /> 
                  <span className="hidden xs:inline">Ajouter un produit</span>
                  <span className="xs:hidden">Ajouter</span>
                </Button>
              </div>

              {/* Utilisation du composant client séparé pour éviter les erreurs d'hydratation */}
              <ProductDialog
                isOpen={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
                onSave={handleSaveProduct}
                editingProduct={editingProduct}
                categories={categories}
              />
            </CardHeader>
            <CardContent className="p-3 xs:p-4 sm:p-6 pt-0">
              {/* Table pour écrans moyens et grands */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-center">Promo</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded" data-ai-hint="product image small" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{categories.find(c => c.name.toLowerCase() === product.category)?.name || product.category}</TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString()} XAF</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-center">{product.isPromo ? 'Oui' : 'Non'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Version carte pour mobile et petits écrans - Ultra responsive */}
              <div className="grid grid-cols-1 gap-2 xs:gap-3 lg:hidden">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg shadow-sm p-2 xs:p-3 hover:border-primary transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start space-x-2 xs:space-x-3 mb-2 xs:mb-3">
                      <div className="relative h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint="product image small" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs xs:text-sm sm:text-base truncate leading-tight">{product.name}</h3>
                        <p className="text-xs xs:text-sm text-gray-500 truncate mt-0.5">{categories.find(c => c.name.toLowerCase() === product.category)?.name || product.category}</p>
                        {product.isPromo && (
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full mt-1">
                            Promo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 xs:gap-3 text-xs xs:text-sm mt-2 xs:mt-3 border-t pt-2 xs:pt-3">
                      <div className="text-center xs:text-left">
                        <span className="block text-gray-500 text-xs font-medium mb-1">Prix</span>
                        <span className="font-semibold text-primary whitespace-nowrap">{product.price.toLocaleString()} XAF</span>
                      </div>
                      <div className="text-center xs:text-left">
                        <span className="block text-gray-500 text-xs font-medium mb-1">Stock</span>
                        <span className={`font-semibold whitespace-nowrap ${
                          product.stock > 50 ? 'text-green-600' : 
                          product.stock > 10 ? 'text-orange-600' : 'text-red-600'
                        }`}>{product.stock}</span>
                      </div>
                      <div className="text-center xs:text-left col-span-2 xs:col-span-1">
                        <span className="block text-gray-500 text-xs font-medium mb-1">Statut</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? 'Disponible' : 'Rupture'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row justify-end gap-1 xs:gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(product)} 
                        className="h-8 xs:h-9 px-2 xs:px-3 text-xs xs:text-sm w-full xs:w-auto"
                      >
                        <Edit className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2 flex-shrink-0" /> 
                        <span className="truncate">Modifier</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 xs:h-9 px-2 xs:px-3 text-xs xs:text-sm text-destructive hover:text-destructive w-full xs:w-auto" 
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2 flex-shrink-0" /> 
                        <span className="truncate">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="border-0 xs:border shadow-sm">
            <CardHeader className="p-3 xs:p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-4">
                <div className="flex-1">
                  <CardTitle className="text-primary text-base xs:text-lg sm:text-xl">Catégories</CardTitle>
                  <CardDescription className="text-xs xs:text-sm mt-1">Gérez les catégories de produits.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)} className="w-full xs:w-auto text-xs xs:text-sm py-2 xs:py-2.5 px-3 xs:px-4">
                  <ListPlus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" /> 
                  <span className="hidden xs:inline">Ajouter une catégorie</span>
                  <span className="xs:hidden">Ajouter</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 xs:p-4 sm:p-6 pt-0">
              {/* Utilisation du composant client séparé pour éviter les erreurs d'hydratation */}
              <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                onSave={handleSaveCategory}
              />
              
              {/* Table pour écrans larges */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm font-semibold">Nom de la catégorie</TableHead>
                      <TableHead className="w-[120px] text-right text-sm font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Version carte pour mobile et tablettes - Ultra responsive */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 lg:hidden">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 xs:p-3 bg-white border rounded-lg shadow-sm hover:border-primary hover:shadow-md transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-xs xs:text-sm sm:text-base truncate block">{category.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5 block">
                        {products.filter(p => p.category === category.name.toLowerCase()).length} produit(s)
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-red-50 ml-2 flex-shrink-0 h-8 w-8 xs:h-9 xs:w-9" 
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-3 w-3 xs:h-4 xs:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
