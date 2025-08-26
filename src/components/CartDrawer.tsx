'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, LogIn, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/supabase/useAuth';
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
import { Alert, AlertDescription } from '../components/ui/alert';

const CartDrawer: React.FC = () => {
  const { 
    state, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotal,
    clearCart,
    getCartItemsCount
  } = useAppContext();
  
  // Obtenir l'état d'authentification de l'utilisateur
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  const { items: cart } = state.cart;
  const { subtotal, deliveryCost, discount, total } = getCartTotal();
  const itemCount = getCartItemsCount();
  
  const [isClient, setIsClient] = React.useState(false);
  // État pour gérer les erreurs d'images
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const cartVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`;
  };

  // Composant interne pour le bouton du panier - uniformisé pour éviter les erreurs d'hydratation
  const CartButton = () => {
    return (
      <Button 
        variant="ghost" 
        className="relative p-2 h-auto cursor-pointer transition-colors duration-200 border-none outline-none focus:ring-0 focus:ring-offset-0" 
        aria-label="Open cart" 
        id="cart-drawer-trigger"
        type="button"
      >
        <ShoppingBag className="h-6 w-6 text-gray-700 hover:text-gray-900" />
        {isClient && itemCount > 0 && (
          <span 
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-white animate-pulse"
            suppressHydrationWarning
          >
            {itemCount}
          </span>
        )}
      </Button>
    );
  };

  if (cart.length === 0 || !cart.length) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <div className="block cursor-pointer">
            <CartButton />
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-3 sm:p-6">
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
              <Link href="/products" className="bg-[#f5a623] hover:bg-[#e09000] text-white px-4 py-2 rounded-lg font-medium">
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
        <div className="block cursor-pointer">
          <CartButton />
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4 sticky top-0 bg-white pb-2 z-10">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl font-bold">Votre Panier ({itemCount})</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-xs p-2"
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
                className="flex gap-4 py-4 border-b border-gray-100 group hover:bg-gray-50 transition-colors duration-200 rounded-lg p-2"
              >
                <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-200 group-hover:border-gray-300 transition-all duration-200">
                  <Image
                    src={imageErrors.has(String(item.product.id)) || !item.product.imageUrl || item.product.imageUrl.trim() === '' 
                      ? '/images/placeholder-product.svg' 
                      : item.product.imageUrl}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    onError={() => {
                      setImageErrors(prev => new Set([...prev, String(item.product.id)]));
                    }}
                    onLoad={() => {
                      setImageErrors(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(String(item.product.id));
                        return newSet;
                      });
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/product/${item.product.id}`} className="font-medium text-gray-900 hover:text-[#f5a623] line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-md font-semibold">{formatPrice(item.product.price * item.quantity)}</div>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-none"
                        style={{ touchAction: 'manipulation' }}
                        onClick={() => updateCartItemQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-3 text-sm font-medium min-w-[30px] text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-none"
                        style={{ touchAction: 'manipulation' }}
                        onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs p-0 h-10 w-10"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
        
        <div className="bg-gray-50 p-4 space-y-4 rounded-lg mt-4">
          <div className="flex justify-between">
            <span className="text-gray-600 text-base">Sous-total</span>
            <span className="font-medium text-base">{formatPrice(subtotal)}</span>
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
          {!isLoggedIn && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center text-sm">
                <LogIn className="h-4 w-4 mr-2 text-blue-500" />
                Vous devez vous connecter pour finaliser votre commande
              </AlertDescription>
            </Alert>
          )}
          
          <SheetClose asChild>
            <Link href="/cart" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-lg font-medium text-sm w-full flex justify-center items-center transition-colors duration-200">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Voir le panier
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href={isLoggedIn ? "/checkout" : "/auth"} className="bg-[#f5a623] hover:bg-[#e09000] text-white px-4 py-2 rounded-lg font-medium text-sm w-full flex justify-center items-center transition-colors duration-200 shadow-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoggedIn ? "Procéder au paiement" : "Se connecter pour commander"}
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
