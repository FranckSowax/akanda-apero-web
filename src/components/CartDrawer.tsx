'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose 
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';

const CartDrawer: React.FC = () => {
  const { 
    state, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotal,
    clearCart,
    getCartItemsCount
  } = useAppContext();
  
  const { items: cart } = state.cart;
  const { subtotal, deliveryCost, discount, total } = getCartTotal();
  const itemCount = getCartItemsCount();
  
  // État pour contrôler le rendu client uniquement
  const [isClient, setIsClient] = React.useState(false);
  
  // Effet pour marquer quand le composant est monté côté client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const cartVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  // Fonction pour formater les prix
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`;
  };

  if (cart.length === 0 || !cart.length) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="relative p-0 h-auto">
            <ShoppingBag className="h-6 w-6 text-gray-700 hover:text-gray-900" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">Votre Panier</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="border-2 border-dashed border-gray-200 rounded-full p-6 bg-gray-50 mb-4">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Votre panier est vide</h3>
            <p className="text-gray-500 text-center mb-6">Ajoutez des produits pour les voir apparaître ici</p>
            <SheetClose asChild>
              <Link href="/" className="bg-[#f5a623] hover:bg-[#e09000] text-white px-4 py-2 rounded-lg font-medium">
                Parcourir les produits
              </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative p-0 h-auto">
          <ShoppingBag className="h-6 w-6 text-gray-700 hover:text-gray-900" />
          {isClient && itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl font-bold">Votre Panier ({itemCount})</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-xs"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4" />
              Vider
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
          <AnimatePresence>
            {cart.map((item: any) => (
              <motion.div
                key={item.product.id}
                variants={cartVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex gap-3 py-4 border-b border-gray-100"
              >
                <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/product/${item.product.id}`} className="font-medium text-gray-900 hover:text-[#f5a623] line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-md font-semibold">{formatPrice(item.product.price * item.quantity)}</div>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateCartItemQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-2 text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Livraison</span>
            <span className="font-medium">{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Gratuit'}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        
        <SheetFooter className="mt-6 mb-4 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <SheetClose asChild>
            <Link href="/checkout" className="w-full block">
              <Button className="w-full bg-black hover:bg-gray-800 text-white font-medium py-6 text-lg shadow-lg">
                Passer la commande
              </Button>
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
