// Types pour notre système de gestion d'état

export interface Product {
  id: string; // UUID string pour compatibilité Supabase
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dataAiHint?: string;
  bgColor?: string;
  currency: string;
  categorySlug: string;
  isPromo?: boolean;
  rating?: number;
  discount?: number;
  details?: string;
  ingredients?: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  additionalInfo: string;
  deliveryOption: string;
}

export interface PaymentInfo {
  method: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  mobileNumber: string;
}

export interface UserInfo {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isLoggedIn: boolean;
  addresses?: {
    id: string;
    name: string;
    address: string;
    city: string;
    isDefault: boolean;
  }[];
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  createdAt: Date;
}

export interface AppState {
  cart: {
    items: CartItem[];
    promoCode: string;
    promoDiscount: number;
    deliveryOption: string;
  };
  user: UserInfo;
  orders: Order[];
  ui: {
    isCartOpen: boolean;
    isMenuOpen: boolean;
    isLoading: boolean;
    toast: {
      message: string;
      type: 'success' | 'error' | 'info' | 'warning' | null;
    };
  };
}

export type AppAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_CART_ITEM_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: { items: CartItem[]; promoCode?: string; promoDiscount?: number; deliveryOption: string } }
  | { type: 'APPLY_PROMO_CODE'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'SET_DELIVERY_OPTION'; payload: string }
  | { type: 'SET_USER_INFO'; payload: Partial<UserInfo> }
  | { type: 'LOGIN_USER'; payload: Partial<UserInfo> }
  | { type: 'LOGOUT_USER' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'TOGGLE_CART' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: AppState['ui']['toast']['type'] } }
  | { type: 'HIDE_TOAST' };
