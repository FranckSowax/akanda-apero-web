'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppAction, CartItem, Product } from './types';
import { reducer, initialState } from './reducer';

// Créer le contexte
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Fonctions utilitaires
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => void;
  getCartTotal: () => { subtotal: number; deliveryCost: number; discount: number; total: number };
  getCartItemsCount: () => number;
  getItemQuantity: (productId: number) => number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Fournisseur du contexte
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Récupérer l'état du panier depuis le localStorage si disponible
  const loadInitialState = (): AppState => {
    const initialState: AppState = {
      cart: [],
      user: null,
      isLoading: true,
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedCart = localStorage.getItem('akandaCart');
        const savedUser = localStorage.getItem('akandaUser');
        
        if (savedCart) {
          initialState.cart = JSON.parse(savedCart);
        }
        
        if (savedUser) {
          initialState.user = JSON.parse(savedUser);
        }
      }
      
      initialState.isLoading = false;
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }

    return initialState;
  };

  const [state, dispatch] = useReducer(reducer, loadInitialState());

  // Sauvegarder l'état du panier dans le localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('akandaCart', JSON.stringify(state.cart));
      localStorage.setItem('akandaUser', JSON.stringify(state.user));
    }
  }, [state.cart, state.user]);

  // Fonctions utilitaires
  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    
    // Afficher un toast de confirmation
    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        message: `${product.name} ajouté au panier`,
        type: 'success',
      },
    });
    
    // Masquer le toast après 3 secondes
    setTimeout(() => {
      dispatch({ type: 'HIDE_TOAST' });
    }, 3000);
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyPromoCode = (code: string) => {
    // Simuler la vérification d'un code promo
    // Dans une application réelle, cela serait vérifié par une API
    if (code.toLowerCase() === 'akanda10') {
      dispatch({
        type: 'APPLY_PROMO_CODE',
        payload: { code, discount: 10 },
      });
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: 'Code promo appliqué avec succès',
          type: 'success',
        },
      });
    } else {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: 'Code promo invalide',
          type: 'error',
        },
      });
    }
    
    // Masquer le toast après 3 secondes
    setTimeout(() => {
      dispatch({ type: 'HIDE_TOAST' });
    }, 3000);
  };

  // Calculer le total du panier
  const getCartTotal = () => {
    const subtotal = state.cart.items.reduce((total, item) => {
      const itemPrice = item.product.isPromo && item.product.discount
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + itemPrice * item.quantity;
    }, 0);

    // Plus de coût de livraison - la livraison sera gérée au checkout
    const deliveryCost = 0;

    // Réduction du code promo
    const discount = state.cart.promoDiscount > 0
      ? (subtotal * state.cart.promoDiscount) / 100
      : 0;

    const total = subtotal - discount;

    return { subtotal, deliveryCost, discount, total };
  };

  // Obtenir le nombre total d'articles dans le panier
  const getCartItemsCount = () => {
    return state.cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Obtenir la quantité d'un produit spécifique dans le panier
  const getItemQuantity = (productId: number) => {
    const item = state.cart.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        applyPromoCode,
        getCartTotal,
        getCartItemsCount,
        getItemQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
};
