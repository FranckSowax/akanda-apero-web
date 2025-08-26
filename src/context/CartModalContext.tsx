'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCartModal } from '../hooks/useCartModal';
import CartModal from '../components/CartModal';

interface CartModalContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export const CartModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cartModal = useCartModal();

  return (
    <CartModalContext.Provider value={cartModal}>
      {children}
      <CartModal isOpen={cartModal.isOpen} onClose={cartModal.closeCart} />
    </CartModalContext.Provider>
  );
};

export const useCartModalContext = () => {
  const context = useContext(CartModalContext);
  if (context === undefined) {
    throw new Error('useCartModalContext must be used within a CartModalProvider');
  }
  return context;
};
