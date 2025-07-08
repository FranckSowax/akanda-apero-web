'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, LogIn, CreditCard, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/supabase/useAuth';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f5a623]/10 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-[#f5a623]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mon Panier</h2>
                  <p className="text-sm text-gray-500">
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

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
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
                <>
                  {/* Items List */}
                  <ScrollArea className="flex-1 px-6">
                    <div className="space-y-4 py-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-2xl">🍹</span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.product.discount && item.product.discount > 0 ? (
                                <span className="flex items-center gap-2">
                                  <span className="font-semibold text-[#f5a623]">
                                    {Math.round(item.product.price * (1 - item.product.discount / 100)).toLocaleString()} F CFA
                                  </span>
                                  <span className="line-through text-gray-400">
                                    {Math.round(item.product.price).toLocaleString()} F CFA
                                  </span>
                                </span>
                              ) : (
                                <span className="font-semibold text-gray-900">
                                  {Math.round(item.product.price).toLocaleString()} F CFA
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="border-t border-gray-100 p-6 space-y-4">
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="font-medium">{Math.round(subtotal).toLocaleString()} F CFA</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Réduction</span>
                          <span>-{Math.round(discount).toLocaleString()} F CFA</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livraison</span>
                        <span className="font-medium">
                          {deliveryCost === 0 ? 'Gratuite' : `${Math.round(deliveryCost).toLocaleString()} F CFA`}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-[#f5a623]">{Math.round(total).toLocaleString()} F CFA</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {!isLoggedIn && (
                        <Alert>
                          <LogIn className="h-4 w-4" />
                          <AlertDescription>
                            <Link href="/auth" className="text-[#f5a623] hover:underline font-medium">
                              Connectez-vous
                            </Link> pour finaliser votre commande
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={onClose}
                          className="flex-1"
                        >
                          Continuer
                        </Button>
                        <Link href="/checkout" className="flex-1">
                          <Button
                            className="w-full bg-[#f5a623] hover:bg-[#e09000] text-white"
                            disabled={!isLoggedIn}
                            onClick={onClose}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Commander
                          </Button>
                        </Link>
                      </div>
                      
                      {cart.length > 0 && (
                        <Button
                          variant="ghost"
                          onClick={clearCart}
                          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Vider le panier
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
