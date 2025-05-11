'use client';

import type { FC } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { PlusCircle, Edit, Trash2, ListPlus } from 'lucide-react';
import Image from 'next/image';


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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSaveProduct = (formData: FormData) => {
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `p${Date.now()}`,
      name: formData.get('name') as string || 'Nouveau Produit',
      description: formData.get('description') as string || '',
      price: parseFloat(formData.get('price') as string) || 0,
      stock: parseInt(formData.get('stock') as string) || 0,
      category: formData.get('category') as string || '',
      imageUrl: 'https://picsum.photos/seed/newprod/50/50',
      isPromo: formData.get('isPromo') === 'on',
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `c${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (products.some(p => p.category === categories.find(c => c.id === id)?.name.toLowerCase())) {
      alert("Impossible de supprimer une catégorie utilisée par des produits.");
      return;
        alert("Impossible de supprimer une catégorie utilisée par des produits.");
        return;
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-4 sm:py-10 px-2 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-8 text-primary">Tableau de bord</h1>
      
      {/* Statistiques en haut - optimisées pour mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Commandes aujourd'hui</span>
              <div className="mt-1 flex items-center">
                <div className="bg-blue-500 p-2 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Revenus aujourd'hui</span>
              <div className="mt-1 flex items-center">
                <div className="bg-green-500 p-2 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">258.5k</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Nouveaux clients</span>
              <div className="mt-1 flex items-center">
                <div className="bg-purple-500 p-2 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">18</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Livraisons en cours</span>
              <div className="mt-1 flex items-center">
                <div className="bg-amber-500 p-2 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h2.7l1.3 3H14V7z" />
                    <path fillRule="evenodd" d="M14 3a1 1 0 00-1 1v9h-3.05a2.5 2.5 0 00-4.9 0H4a1 1 0 01-1-1v-1h4V4a1 1 0 01.3-.7l1-1A1 1 0 0115 3h-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4 sm:mb-6 w-full">
          <TabsTrigger className="text-xs sm:text-sm flex-1 py-1.5 xs:py-2" value="products">Gestion des Produits</TabsTrigger>
          <TabsTrigger className="text-xs sm:text-sm flex-1 py-1.5 xs:py-2" value="categories">Gestion des Catégories</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-primary">Produits</CardTitle>
                  <CardDescription>Gérez vos produits, stocks et promotions.</CardDescription>
                </div>
                 <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Produit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                        <DialogTitle className="text-primary">{editingProduct ? 'Modifier Produit' : 'Ajouter Produit'}</DialogTitle>
                        </DialogHeader>
                        <form action={handleSaveProduct} className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nom</Label>
                                <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3" required/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Textarea id="description" name="description" defaultValue={editingProduct?.description} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Prix (XAF)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="col-span-3" required/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">Stock</Label>
                                <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} className="col-span-3" required/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Catégorie</Label>
                                <Select name="category" defaultValue={editingProduct?.category}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Basic Image Upload - Needs backend integration */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="image" className="text-right">Image</Label>
                                <Input id="image" name="image" type="file" accept="image/*" className="col-span-3" />
                            </div>
                             {editingProduct?.imageUrl && (
                                 <div className="grid grid-cols-4 items-center gap-4">
                                     <div className="col-start-2 col-span-3">
                                        <Image src={editingProduct.imageUrl} alt={editingProduct.name} width={50} height={50} className="rounded" data-ai-hint="product image small"/>
                                     </div>
                                 </div>
                             )}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="isPromo" className="text-right">Promotion</Label>
                                <Checkbox id="isPromo" name="isPromo" defaultChecked={editingProduct?.isPromo} className="col-span-3 justify-self-start" />
                             </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button type="submit">Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table pour écrans moyens et grands */}
              <div className="hidden md:block overflow-x-auto">
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
                          <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded" data-ai-hint="product image small"/>
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

              {/* Version carte pour mobile et petits écrans */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg shadow-sm p-3 hover:border-primary transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint="product image small"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{categories.find(c => c.name.toLowerCase() === product.category)?.name || product.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2 border-t pt-2">
                      <div>
                        <span className="block text-gray-500 text-xs">Prix</span>
                        <span className="font-medium">{product.price.toLocaleString()} XAF</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Stock</span>
                        <span className="font-medium">{product.stock}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Promo</span>
                        <span className="font-medium">{product.isPromo ? 'Oui' : 'Non'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-1 mt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} className="h-8 px-2 text-xs">
                        <Edit className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Suppr.
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
          <Card>
            <CardHeader>
               <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-primary">Catégories</CardTitle>
                      <CardDescription>Gérez les catégories de produits.</CardDescription>
                    </div>
                     <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline">
                                <ListPlus className="mr-2 h-4 w-4" /> Ajouter Catégorie
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle className="text-primary">Ajouter une Catégorie</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="categoryName" className="text-right">Nom</Label>
                                    <Input
                                        id="categoryName"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button type="button" onClick={handleAddCategory}>Ajouter</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
               </div>
            </CardHeader>
            <CardContent>
               {/* Table pour écrans moyens et grands */}
               <div className="hidden md:block overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Nom</TableHead>
                       <TableHead className="w-[100px] text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {categories.map((category) => (
                       <TableRow key={category.id}>
                         <TableCell className="font-medium">{category.name}</TableCell>
                         <TableCell className="text-right">
  
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>

               {/* Version carte pour mobile et petits écrans */}
               <div className="grid grid-cols-1 gap-2 md:hidden">
                 {categories.map((category) => (
                   <div key={category.id} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                     <span className="font-medium">{category.name}</span>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


