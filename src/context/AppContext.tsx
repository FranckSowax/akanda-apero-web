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
      cart: {
        items: [] as CartItem[],
        promoCode: '',
        promoDiscount: 0,
        deliveryOption: 'standard'
      },
      user: {
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        isLoggedIn: false
      },
      orders: [],
      ui: {
        isCartOpen: false,
        isMenuOpen: false,
        isLoading: false,
        toast: {
          message: '',
          type: null
        }
      }
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
      
      initialState.ui.isLoading = false;
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

  // Valider le panier et retourner les articles valides
  const validateCart = () => {
    const validItems = state.cart.items.filter(item => {
      const hasValidProduct = item.product && item.product.id != null;
      const hasValidName = item.product?.name && String(item.product.name).trim().length > 0;
      const hasValidPrice = item.product?.price != null && !isNaN(Number(item.product.price));
      const hasValidQuantity = item.quantity > 0;
      
      return hasValidProduct && hasValidName && hasValidPrice && hasValidQuantity;
    });
    
    if (validItems.length !== state.cart.items.length) {
      console.warn('📊 Validation du panier:', {
        totalItems: state.cart.items.length,
        validItems: validItems.length,
        invalidItems: state.cart.items.length - validItems.length,
        invalidDetails: state.cart.items.filter(item => !(
          item.product &&
          item.product.id != null &&
          item.product.name &&
          String(item.product.name).trim().length > 0 &&
          item.product.price != null &&
          !isNaN(Number(item.product.price)) &&
          item.quantity > 0
        ))
      });
    }
    
    return validItems;
  };

  // Calculer le total du panier avec validation
  const getCartTotal = () => {
    const validItems = validateCart();
    const { promoDiscount, deliveryOption } = state.cart;
    
    const subtotal = validItems.reduce((total, item) => {
      const price = Number(item.product?.price) || 0;
      return total + (price * item.quantity);
    }, 0);
    
    const discount = subtotal * (promoDiscount / 100);
    
    const deliveryOptions = {
      pickup: 0,
      standard: 2000,
      express: 3000,
      night: 3500,
    };
    
    const deliveryCost = deliveryOptions[deliveryOption as keyof typeof deliveryOptions] || 2000;
    
    return {
      subtotal,
      deliveryCost,
      discount,
      total: subtotal - discount + deliveryCost,
    };
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
