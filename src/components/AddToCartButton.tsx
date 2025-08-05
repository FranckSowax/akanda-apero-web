'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '../context/AppContext';
import { useCartModalContext } from '../context/CartModalContext';
import { Product } from '../context/types';
import { getProductImageUrl } from '../utils/imageUtils';
import { useEcommerceTracking } from './MonitoringProvider';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showQuantity?: boolean;
  autoOpenModal?: boolean;
  children?: React.ReactNode;
  inline?: boolean; // Nouvelle prop pour le mode inline
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = true,
  showQuantity = false,
  autoOpenModal = true,
  children,
  inline = false
}) => {
  const { addToCart, getItemQuantity } = useAppContext();
  const { openCart } = useCartModalContext();
  const { trackAddToCart } = useEcommerceTracking();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const currentQuantity = getItemQuantity ? getItemQuantity(product.id) : 0;

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);
    
    try {
      // Convertir le produit avec la bonne imageUrl
      const productWithCorrectImage = {
        ...product,
        imageUrl: getProductImageUrl(product)
      };
      
      // Ajouter au panier
      addToCart(productWithCorrectImage, quantity);
      
      // Tracker l'événement e-commerce
      trackAddToCart(
        product.id,
        product.name,
        product.price
      );
      
      // Animation de confirmation
      setJustAdded(true);
      
      // Ouvrir le modal automatiquement si demandé
      if (autoOpenModal) {
        setTimeout(() => {
          openCart();
        }, 500);
      }
      
      // Reset de l'état après animation
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    if (justAdded) {
      return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    }
    
    switch (variant) {
      case 'outline':
        return 'border-2 border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-white bg-transparent';
      case 'ghost':
        return 'text-[#f5a623] hover:bg-[#f5a623]/10 bg-transparent';
      default:
        return 'bg-[#f5a623] hover:bg-[#e09000] text-white';
    }
  };

  return (
    <motion.button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock <= 0}
      className={`
        ${inline 
          ? 'relative w-8 h-8 rounded-md' 
          : 'absolute bottom-2 right-2 z-10 w-10 h-10 rounded-lg'
        }
        ${justAdded ? 'bg-green-500 hover:bg-green-600' : 'bg-[#e09000] hover:bg-[#cc7a00]'}
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isAdding ? { scale: 0.9 } : { scale: 1 }}
    >
      <motion.div
        animate={justAdded ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        {justAdded ? (
          <Check className={inline ? "h-4 w-4" : "h-5 w-5"} />
        ) : isAdding ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Plus className={inline ? "h-4 w-4" : "h-5 w-5"} />
          </motion.div>
        ) : (
          <Plus className={inline ? "h-4 w-4" : "h-5 w-5"} />
        )}
      </motion.div>
      
      {/* Badge de quantité */}
      {currentQuantity > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white"
        >
          {currentQuantity}
        </motion.span>
      )}
      
      {/* Animation de succès */}
      {justAdded && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 bg-green-500 rounded-lg flex items-center justify-center"
        >
          <Check className="h-5 w-5 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
};

export default AddToCartButton;
