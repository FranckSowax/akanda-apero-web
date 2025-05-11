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

// Mock Data (Replace with actual data fetching and state management)
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

  // TODO: Implement actual form handling, data saving, and deletion
  const handleSaveProduct = (formData: FormData) => {
    // Simulate saving product
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `p${Date.now()}`,
      name: formData.get('name') as string || 'Nouveau Produit',
      description: formData.get('description') as string || '',
      price: parseFloat(formData.get('price') as string) || 0,
      stock: parseInt(formData.get('stock') as string) || 0,
      category: formData.get('category') as string || '',
      imageUrl: 'https://picsum.photos/seed/newprod/50/50', // Placeholder for image upload
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
    setProducts(products.filter(p => p.id !== id));
    // TODO: Add confirmation dialog
  };

   const handleDeleteCategory = (id: string) => {
    // Prevent deleting category if products use it (simple check)
    if (products.some(p => p.category === categories.find(c => c.id === id)?.name.toLowerCase())) {
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
    <div className="container mx-auto py-6 sm:py-10 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-primary">Tableau de Bord</h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-4 sm:mb-6 w-full">
          <TabsTrigger className="text-xs sm:text-sm flex-1" value="products">Gestion des Produits</TabsTrigger>
          <TabsTrigger className="text-xs sm:text-sm flex-1" value="categories">Gestion des Catégories</TabsTrigger>
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
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg shadow-sm p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded" data-ai-hint="product image small"/>
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-xs text-gray-500">{categories.find(c => c.name.toLowerCase() === product.category)?.name || product.category}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs">Prix</span>
                        <span>{product.price.toLocaleString()} XAF</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Stock</span>
                        <span>{product.stock}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Promo</span>
                        <span>{product.isPromo ? 'Oui' : 'Non'}</span>
                      </div>
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
                           {/* Add Edit Category button if needed */}
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


