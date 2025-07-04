import { AppState, AppAction } from './types';

export const initialState: AppState = {
  cart: {
    items: [],
    promoCode: '',
    promoDiscount: 0,
    deliveryOption: 'standard',
  },
  user: {
    isLoggedIn: false,
  },
  orders: [],
  ui: {
    isCartOpen: false,
    isMenuOpen: false,
    isLoading: false,
    toast: {
      message: '',
      type: null,
    },
  },
};

export const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.cart.items.findIndex(
        item => item.product.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Le produit existe déjà dans le panier, mettre à jour la quantité
        const updatedItems = [...state.cart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };

        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
          },
        };
      } else {
        // Ajouter un nouveau produit au panier
        return {
          ...state,
          cart: {
            ...state.cart,
            items: [...state.cart.items, { product, quantity }],
          },
        };
      }
    }

    case 'REMOVE_FROM_CART': {
      const { productId } = action.payload;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(item => item.product.id !== productId),
        },
      };
    }

    case 'UPDATE_CART_ITEM_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la quantité est 0 ou moins, supprimer l'article du panier
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.filter(item => item.product.id !== productId),
          },
        };
      }

      // Mettre à jour la quantité
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        },
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          promoCode: '',
          promoDiscount: 0,
        },
      };

    case 'APPLY_PROMO_CODE': {
      const { code, discount } = action.payload;
      return {
        ...state,
        cart: {
          ...state.cart,
          promoCode: code,
          promoDiscount: discount,
        },
      };
    }

    case 'REMOVE_PROMO_CODE':
      return {
        ...state,
        cart: {
          ...state.cart,
          promoCode: '',
          promoDiscount: 0,
        },
      };

    case 'SET_DELIVERY_OPTION':
      return {
        ...state,
        cart: {
          ...state.cart,
          deliveryOption: action.payload,
        },
      };

    case 'SET_USER_INFO':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case 'LOGIN_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          isLoggedIn: true,
        },
      };

    case 'LOGOUT_USER':
      return {
        ...state,
        user: {
          isLoggedIn: false,
        },
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };

    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status } = action.payload;
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === orderId
            ? { ...order, status }
            : order
        ),
      };
    }

    case 'TOGGLE_CART':
      return {
        ...state,
        ui: {
          ...state.ui,
          isCartOpen: !state.ui.isCartOpen,
        },
      };

    case 'TOGGLE_MENU':
      return {
        ...state,
        ui: {
          ...state.ui,
          isMenuOpen: !state.ui.isMenuOpen,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case 'SHOW_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          toast: {
            message: action.payload.message,
            type: action.payload.type,
          },
        },
      };

    case 'HIDE_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          toast: {
            message: '',
            type: null,
          },
        },
      };

    default:
      return state;
  }
};
