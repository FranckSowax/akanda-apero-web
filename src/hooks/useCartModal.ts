'use client';

import { useState, useCallback } from 'react';

export const useCartModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openCart,
    closeCart,
    toggleCart
  };
};
