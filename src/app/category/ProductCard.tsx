import { motion } from 'framer-motion';
import { Star, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import AddToCartButton from '../../components/AddToCartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  sale_price?: number;
  image_url?: string;
  emoji?: string;
  rating?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onProductClick: () => void;
}

export function ProductCard({ product, viewMode, onProductClick }: ProductCardProps) {
  const price = product.sale_price || product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
              {hasDiscount && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-600">
                        {price.toLocaleString()} XAF
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.base_price.toLocaleString()} XAF
                        </span>
                      )}
                    </div>
                    
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    )}
                    
                    <Badge variant={product.stock_quantity > 0 ? 'default' : 'secondary'}>
                      {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/product/${product.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onProductClick}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: price,
                      imageUrl: product.image_url || '/placeholder-product.jpg',
                      description: product.description,
                      categorySlug: product.categories?.name?.toLowerCase() || 'produit',
                      currency: 'XAF',
                      stock: product.stock_quantity,
                      rating: product.rating
                    }}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden">
            <Image
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              width={300}
              height={240}
              className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && (
                <Badge className="bg-red-500 hover:bg-red-600 shadow-lg">
                  -{discountPercent}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-blue-500 hover:bg-blue-600 shadow-lg">
                  Vedette
                </Badge>
              )}
            </div>
            
            {product.rating && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{product.rating}</span>
              </div>
            )}
            
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Link href={`/product/${product.id}`}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="shadow-lg"
                  onClick={onProductClick}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-orange-600">
                {price.toLocaleString()} XAF
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {product.base_price.toLocaleString()} XAF
                </span>
              )}
            </div>
            
            <Badge variant={product.stock_quantity > 0 ? 'default' : 'secondary'}>
              {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
            </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Link href={`/product/${product.id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onProductClick}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Button>
            </Link>
            <div className="flex-1">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: price,
                  imageUrl: product.image_url || '/placeholder-product.jpg',
                  description: product.description,
                  categorySlug: product.categories?.name?.toLowerCase() || 'produit',
                  currency: 'XAF',
                  stock: product.stock_quantity,
                  rating: product.rating
                }}
                className="w-full"
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
