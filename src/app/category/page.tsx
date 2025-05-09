'use client';

import type { FC } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Mock Product Data (Should ideally come from a shared source or API)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dataAiHint: string;
  bgColor?: string;
  currency: string;
  categorySlug: string; // Added category slug for filtering
  isPromo?: boolean;
  rating?: number;
  discount?: number;
}

const allProducts: Product[] = [
  { id: 1, name: 'Pack Tout-en-Un', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae1/300/200', dataAiHint: 'boîtes colorées assortiment', bgColor: 'bg-pink-100', currency: 'XAF', categorySlug: 'promos', isPromo: true, discount: 10 },
  { id: 2, name: 'Fruit de la Passion Goyave', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae2/300/200', dataAiHint: 'canette fruit passion goyave', bgColor: 'bg-yellow-100', currency: 'XAF', categorySlug: 'softs', rating: 4.8 },
  { id: 3, name: 'Gingembre Yuzu', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae3/300/200', dataAiHint: 'canette gingembre yuzu', bgColor: 'bg-orange-100', currency: 'XAF', categorySlug: 'softs' },
  { id: 4, name: 'Hibiscus Fruit du Dragon', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae4/300/200', dataAiHint: 'canette hibiscus fruit dragon', bgColor: 'bg-red-100', currency: 'XAF', categorySlug: 'softs', rating: 4.5 },
  { id: 5, name: 'Bière Locale Blonde', description: 'Pack de 6 Bouteilles 33cl', price: 6.50, imageUrl: 'https://picsum.photos/seed/beer1/300/200', dataAiHint: 'pack bière locale', currency: 'XAF', categorySlug: 'bieres', rating: 4.2 },
  { id: 6, name: 'Vin Rouge Merlot', description: 'Bouteille 75cl', price: 12.00, imageUrl: 'https://picsum.photos/seed/wine1/300/200', dataAiHint: 'bouteille vin rouge', currency: 'XAF', categorySlug: 'alcools' },
  { id: 7, name: 'Chips Sel Marin', description: 'Sachet 150g', price: 2.50, imageUrl: 'https://picsum.photos/seed/snack1/300/200', dataAiHint: 'sachet chips sel', currency: 'XAF', categorySlug: 'snacks' },
  { id: 8, name: 'Jus d\'Orange Pressé', description: 'Bouteille 1L', price: 4.00, imageUrl: 'https://picsum.photos/seed/soft2/300/200', dataAiHint: 'bouteille jus orange', currency: 'XAF', categorySlug: 'softs', isPromo: true, discount: 5 },
  { id: 9, name: 'Amandes Grillées', description: 'Sachet 100g', price: 3.50, imageUrl: 'https://picsum.photos/seed/snack2/300/200', dataAiHint: 'sachet amandes grillées', currency: 'XAF', categorySlug: 'snacks', rating: 4.6 },
  { id: 10, name: 'Whisky Single Malt', description: 'Bouteille 70cl', price: 45.00, imageUrl: 'https://picsum.photos/seed/alcool2/300/200', dataAiHint: 'bouteille whisky', currency: 'XAF', categorySlug: 'alcools' },
  { id: 11, name: 'Bière Artisanale IPA', description: 'Bouteille 33cl', price: 3.50, imageUrl: 'https://picsum.photos/seed/beer2/300/200', dataAiHint: 'bière artisanale ipa', currency: 'XAF', categorySlug: 'bieres' },
   { id: 12, name: 'Assortiment Apéro', description: 'Box Dégustation', price: 15.00, imageUrl: 'https://picsum.photos/seed/snack3/300/200', dataAiHint: 'box apéro assortiment', currency: 'XAF', categorySlug: 'snacks', isPromo: true, discount: 15 },
];

// Map slugs to display names (could also come from data source)
const categoryNames: { [key: string]: string } = {
  alcools: 'Alcools',
  bieres: 'Bières',
  softs: 'Softs',
  snacks: 'Snacks',
  promos: 'Promotions',
};


const CategoryPage: FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = categoryNames[slug] || 'Catégorie';

  // Filter products based on the slug
  const products = allProducts.filter(p => p.categorySlug === slug || (slug === 'promos' && p.isPromo));

  // TODO: Implement actual cart logic and currency formatting
  const formatPrice = (price: number, currency: string = 'XAF', discount?: number) => {
     const finalPrice = discount ? price * (1 - discount / 100) : price;
     const formattedPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(finalPrice);
     if (discount) {
        const originalFormattedPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price);
        return (
            <>
                <span className="text-destructive line-through mr-2 text-sm">{originalFormattedPrice}</span>
                <span className="text-primary font-bold">{formattedPrice}</span>
            </>
        );
     }
    return <span className="text-lg font-bold text-primary">{formattedPrice}</span>;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-primary">{categoryName}</h1>

      {/* Sorting/Filtering Tabs - Mimicking the screenshot style */}
      <Tabs defaultValue="new" className="mb-4 sm:mb-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="new" className="text-xs sm:text-sm px-2 sm:px-4">Nouveautés</TabsTrigger>
          <TabsTrigger value="best-seller" className="text-xs sm:text-sm px-2 sm:px-4">Meilleures Ventes</TabsTrigger>
          <TabsTrigger value="top-rated" className="text-xs sm:text-sm px-2 sm:px-4">Mieux Notés</TabsTrigger>
          <TabsTrigger value="limited" className="text-xs sm:text-sm px-2 sm:px-4">Limité</TabsTrigger> {/* Example tab */}
        </TabsList>
        {/* Add TabsContent for each value if implementing sorting/filtering */}
        <TabsContent value="new">
             {/* Product Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <Card key={product.id} className={`overflow-hidden border rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${product.bgColor || 'bg-white'} relative`}>
                       {product.discount && (
                            <Badge variant="destructive" className="absolute top-2 left-2 z-10 text-xs sm:text-sm">
                                -{product.discount}%
                            </Badge>
                        )}
                         {product.rating && (
                             <Badge variant="secondary" className="absolute top-2 right-2 z-10 flex items-center gap-1 text-xs sm:text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                {product.rating.toFixed(1)}
                            </Badge>
                        )}
                      <CardContent className="p-0">
                        <Link href={`/product/${product.id}`}>
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={300}
                            height={200}
                            className="h-40 sm:h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                            data-ai-hint={product.dataAiHint}
                          />
                        </Link>
                      </CardContent>
                      <CardHeader className="p-3 sm:p-4">
                        <Link href={`/product/${product.id}`} className="hover:underline">
                          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</CardTitle>
                        </Link>
                        <CardDescription className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 border-t gap-3 sm:gap-0">
                        <div className="text-right">
                          {formatPrice(product.price, product.currency, product.discount)}
                        </div>
                        <div className="flex w-full sm:w-auto space-x-2 justify-end">
                          <Link href={`/product/${product.id}`} className="flex-1 sm:flex-initial">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
                              <Eye className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Voir
                            </Button>
                          </Link>
                          <Button size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
                            <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Ajouter
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
                )}
              </div>
        </TabsContent>
         {/* Add other TabsContent sections here */}
         <TabsContent value="best-seller">
             <p className="text-center text-muted-foreground">Filtre "Meilleures Ventes" non implémenté.</p>
             {/* Render sorted/filtered products here */}
         </TabsContent>
         <TabsContent value="top-rated">
              <p className="text-center text-muted-foreground">Filtre "Mieux Notés" non implémenté.</p>
              {/* Render sorted/filtered products here */}
         </TabsContent>
         <TabsContent value="limited">
             <p className="text-center text-muted-foreground">Filtre "Limité" non implémenté.</p>
             {/* Render sorted/filtered products here */}
         </TabsContent>
      </Tabs>


    </div>
  );
};

export default CategoryPage;
