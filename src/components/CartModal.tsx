'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, LogIn, CreditCard, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/supabase/useAuth';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getProductImageUrl } from '../utils/imageUtils';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { 
    state, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotal,
    clearCart,
    getCartItemsCount
  } = useAppContext();
  
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  const { items: cart } = state.cart;
  const { subtotal, deliveryCost, discount, total } = getCartTotal();
  const itemCount = getCartItemsCount();
  
  // État pour gérer les erreurs d'images
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // État pour la notification de restauration du panier
  const [cartRestored, setCartRestored] = useState(false);

  // Écouter l'événement de restauration du panier
  React.useEffect(() => {
    const handleCartRestored = (event: CustomEvent) => {
      console.log('🛒 Panier restauré détecté dans CartModal:', event.detail.cart.length, 'articles');
      setCartRestored(true);
      
      // Masquer la notification après 5 secondes
      setTimeout(() => {
        setCartRestored(false);
      }, 5000);
    };

    window.addEventListener('cart-restored', handleCartRestored as EventListener);
    
    return () => {
      window.removeEventListener('cart-restored', handleCartRestored as EventListener);
    };
  }, []);

  // Fermer le modal avec Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg h-[95vh] sm:h-[90vh] max-h-[95vh] flex flex-col mx-0 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f5a623]/10 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-[#f5a623]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-900">Mon Panier</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {itemCount} {itemCount <= 1 ? 'article' : 'articles'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Notification de restauration du panier */}
            <AnimatePresence>
              {cartRestored && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mx-3 sm:mx-6 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-100 rounded-full">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Panier restauré !
                      </p>
                      <p className="text-xs text-green-600">
                        Vos articles ont été restaurés après votre connexion.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Découvrez nos produits et ajoutez-les à votre panier
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-[#f5a623] hover:bg-[#e09000] text-white"
                  >
                    Continuer mes achats
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="px-3 sm:px-6 py-3 sm:py-4 pb-6 sm:pb-8">
                    {/* Items List */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          {/* Image */}
                          <div className="relative w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={imageErrors.has(String(item.product.id)) 
                                ? '/images/placeholder-product.svg' 
                                : getProductImageUrl(item.product)}
                              alt={item.product.name}
                              fill
                              className="object-cover"
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

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 break-words line-clamp-2 mb-1">
                              {item.product.name}
                            </h4>
                            <div className="text-xs sm:text-sm text-gray-500 mb-2">
                              {item.product.discount && item.product.discount > 0 ? (
                                <div className="flex flex-col xs:flex-row xs:items-center xs:gap-2">
                                  <span className="font-semibold text-[#f5a623] whitespace-nowrap">
                                    {Math.round(item.product.price * (1 - item.product.discount / 100)).toLocaleString()} F CFA
                                  </span>
                                  <span className="line-through text-gray-400 whitespace-nowrap">
                                    {Math.round(item.product.price).toLocaleString()} F CFA
                                  </span>
                                </div>
                              ) : (
                                <span className="font-semibold text-gray-900 whitespace-nowrap">
                                  {Math.round(item.product.price).toLocaleString()} F CFA
                                </span>
                              )}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateCartItemQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Remove */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.product.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-100 pt-3 sm:pt-4 mb-4 sm:mb-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Sous-total</span>
                          <span className="font-medium whitespace-nowrap">{Math.round(subtotal).toLocaleString()} F CFA</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-xs sm:text-sm text-green-600">
                            <span>Réduction</span>
                            <span className="whitespace-nowrap">-{Math.round(discount).toLocaleString()} F CFA</span>
                          </div>
                        )}
                        <div className="bg-blue-50 p-2 sm:p-3 rounded text-xs sm:text-sm border border-blue-200">
                          <div className="flex items-center gap-1 sm:gap-2 text-blue-700">
                            <svg className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium leading-tight">Options de livraison disponibles à l'étape suivante</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2">
                          <span>Total</span>
                          <span className="text-[#f5a623] whitespace-nowrap">{Math.round(total).toLocaleString()} F CFA</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 mb-6">
                      {/* Alert de connexion */}
                      {!isLoggedIn && (
                        <Alert className="border-[#f5a623]/20 bg-[#f5a623]/5">
                          <LogIn className="h-4 w-4 text-[#f5a623]" />
                          <AlertDescription className="text-sm">
                            <Link 
                              href="/auth" 
                              className="text-[#f5a623] hover:underline font-semibold"
                              onClick={onClose}
                            >
                              Connectez-vous
                            </Link> pour finaliser votre commande
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Boutons principaux */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          variant="outline"
                          onClick={onClose}
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium border-gray-300 hover:border-[#f5a623] hover:text-[#f5a623]"
                        >
                          <span className="truncate">Continuer mes achats</span>
                        </Button>
                        <Link href="/checkout" className="flex-1">
                          <Button
                            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-[#f5a623] hover:bg-[#e09000] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={!isLoggedIn}
                            onClick={onClose}
                          >
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">Commander maintenant</span>
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Bouton vider panier */}
                      {cart.length > 0 && (
                        <Button
                          variant="ghost"
                          onClick={clearCart}
                          className="w-full h-9 sm:h-10 text-xs sm:text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 mb-2 sm:mb-4"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="truncate">Vider le panier</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
