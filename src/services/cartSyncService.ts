import { supabase } from '../lib/supabase/client';
import { CartItem } from '../context/types';

export interface UserCart {
  id: string;
  user_id: string;
  items: CartItem[];
  promo_code?: string;
  promo_discount?: number;
  delivery_option: string;
  created_at: string;
  updated_at: string;
}

export const cartSyncService = {
  // Sauvegarder le panier dans Supabase
  async saveCartToSupabase(userId: string, cartData: {
    items: CartItem[];
    promoCode?: string;
    promoDiscount?: number;
    deliveryOption: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: 'ID utilisateur requis' };
      }

      // Vérifier si un panier existe déjà pour cet utilisateur
      const { data: existingCart } = await supabase
        .from('user_carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      const cartPayload = {
        user_id: userId,
        items: cartData.items,
        promo_code: cartData.promoCode || null,
        promo_discount: cartData.promoDiscount || 0,
        delivery_option: cartData.deliveryOption,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingCart) {
        // Mettre à jour le panier existant
        result = await supabase
          .from('user_carts')
          .update(cartPayload)
          .eq('user_id', userId);
      } else {
        // Créer un nouveau panier
        result = await supabase
          .from('user_carts')
          .insert([{
            ...cartPayload,
            created_at: new Date().toISOString()
          }]);
      }

      if (result.error) {
        console.error('Erreur sauvegarde panier:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur service cartSync:', error);
      return { success: false, error: 'Erreur lors de la sauvegarde du panier' };
    }
  },

  // Récupérer le panier depuis Supabase
  async loadCartFromSupabase(userId: string): Promise<{
    success: boolean;
    cart?: {
      items: CartItem[];
      promoCode?: string;
      promoDiscount?: number;
      deliveryOption: string;
    };
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: 'ID utilisateur requis' };
      }

      const { data: userCart, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun panier trouvé - c'est normal pour un nouvel utilisateur
          return {
            success: true,
            cart: {
              items: [],
              promoCode: '',
              promoDiscount: 0,
              deliveryOption: 'standard'
            }
          };
        }
        console.error('Erreur chargement panier:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        cart: {
          items: userCart.items || [],
          promoCode: userCart.promo_code || '',
          promoDiscount: userCart.promo_discount || 0,
          deliveryOption: userCart.delivery_option || 'standard'
        }
      };
    } catch (error) {
      console.error('Erreur service loadCart:', error);
      return { success: false, error: 'Erreur lors du chargement du panier' };
    }
  },

  // Supprimer le panier de Supabase
  async clearCartFromSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: 'ID utilisateur requis' };
      }

      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur suppression panier:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur service clearCart:', error);
      return { success: false, error: 'Erreur lors de la suppression du panier' };
    }
  },

  // Synchroniser le panier local avec Supabase
  async syncCart(userId: string, localCart: {
    items: CartItem[];
    promoCode?: string;
    promoDiscount?: number;
    deliveryOption: string;
  }): Promise<{
    success: boolean;
    mergedCart?: {
      items: CartItem[];
      promoCode?: string;
      promoDiscount?: number;
      deliveryOption: string;
    };
    error?: string;
  }> {
    try {
      // Charger le panier distant
      const remoteResult = await this.loadCartFromSupabase(userId);
      
      if (!remoteResult.success) {
        return { success: false, error: remoteResult.error };
      }

      const remoteCart = remoteResult.cart!;

      // Fusionner les paniers (priorité au panier local s'il n'est pas vide)
      let mergedCart;
      if (localCart.items.length > 0) {
        // Le panier local a des articles, on le garde et on sauvegarde
        mergedCart = localCart;
        await this.saveCartToSupabase(userId, localCart);
      } else if (remoteCart.items.length > 0) {
        // Le panier local est vide, on utilise le panier distant
        mergedCart = remoteCart;
      } else {
        // Les deux paniers sont vides
        mergedCart = {
          items: [],
          promoCode: '',
          promoDiscount: 0,
          deliveryOption: 'standard'
        };
      }

      return { success: true, mergedCart };
    } catch (error) {
      console.error('Erreur synchronisation panier:', error);
      return { success: false, error: 'Erreur lors de la synchronisation du panier' };
    }
  }
};
