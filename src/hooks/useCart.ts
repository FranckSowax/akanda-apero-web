'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  base_price: number;
  sale_price?: number;
  image_url?: string;
  emoji?: string;
  quantity: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('akanda-cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
        }
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('akanda-cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si le produit existe déjà, modifier la quantité
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity <= 0) {
          // Si la quantité devient 0 ou négative, supprimer l'item
          return prevCart.filter(item => item.id !== product.id);
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (quantity > 0) {
        // Sinon, ajouter le nouveau produit seulement si quantité positive
        return [...prevCart, {
          id: product.id,
          name: product.name,
          base_price: product.base_price,
          sale_price: product.sale_price,
          image_url: product.image_url,
          emoji: product.emoji,
          quantity
        }];
      }
      
      return prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.sale_price || item.base_price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getItemQuantity
  };
};
