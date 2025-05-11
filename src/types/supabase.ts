export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  product_categories?: { category_id: string }[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null; // Utilisé pour stocker l'icône
  color?: string; // Couleur de la catégorie dans l'interface
  icon?: string; // Nom de l'icône (sera converti en composant React)
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number; // Nombre de produits dans cette catégorie (calculé)
};

export type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address_id: string | null;
  shipping_method: string | null;
  shipping_cost: number;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customers?: Customer;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  cocktail_kit_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
};

export type Customer = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type CocktailKit = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  is_available: boolean;
  stock_status?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
};

export type CocktailKitIngredient = {
  id: string;
  cocktail_kit_id: string;
  name: string;
  quantity: string;
  unit: string;
  is_alcoholic: boolean;
  is_optional: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type CocktailIngredient = {
  id: string;
  cocktail_kit_id: string;
  name: string;
  quantity: string;
  unit: string;
  is_alcoholic: boolean;
  is_optional: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Ajoutez d'autres types selon vos besoins