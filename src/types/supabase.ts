export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  emoji: string | null;
  base_price: number;
  sale_price: number | null;
  product_type: 'simple' | 'bundle' | 'cocktail_kit';
  sku: string | null;
  stock_quantity: number;
  min_stock_level: number | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  rating_count: number;
  weight_grams: number | null;
  alcohol_percentage: number | null;
  volume_ml: number | null;
  origin_country: string | null;
  brand: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  product_options?: ProductOption[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
};

export type ProductOption = {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  price_modifier: number;
  stock_quantity: number;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
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
  status: 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Prête' | 'En livraison' | 'Livrée' | 'Annulée';
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  // Informations de livraison
  delivery_address: string | null;
  delivery_district: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  // Coordonnées GPS pour navigation
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  delivery_location_address: string | null;
  delivery_location_accuracy: number | null;
  // Paiement
  payment_method: string | null;
  payment_status: 'En attente' | 'Payé' | 'Échoué' | 'Remboursé' | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customers?: Customer;
};

// Type pour les liens de navigation
export type NavigationLinks = {
  waze: string;
  google_maps: string;
  apple_maps: string;
  coordinates: {
    latitude: number;
    longitude: number;
    address: string;
  };
};

// Type pour les commandes avec liens de navigation
export type OrderWithNavigation = Order & {
  navigation_links?: NavigationLinks | null;
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

// =====================================================
// TYPES COCKTAILS MAISON
// =====================================================

export type CocktailMaison = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  difficulty_level: number;
  preparation_time_minutes: number;
  base_price: number;
  category: string;
  alcohol_percentage: number | null;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  recipe?: string;
  video_url?: string;
  video_type?: string;
  cocktail_ingredients?: CocktailIngredient[];
  cocktail_instructions?: CocktailInstruction[];
};

export type CocktailIngredient = {
  id: string;
  cocktail_id: string;
  name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  sort_order: number;
  created_at: string;
};

export type CocktailInstruction = {
  id: string;
  cocktail_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
};

export type Mocktail = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  base_price: number;
  preparation_time_minutes: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  alcohol_percentage?: number;
  category?: string;
  difficulty_level?: number;
  is_featured?: boolean;
  recipe?: string;
  video_url?: string;
  video_type?: string;
  mocktail_ingredients?: MocktailIngredient[];
};

export type MocktailIngredient = {
  id: string;
  mocktail_id: string;
  name: string;
  quantity: string;
  unit: string;
  sort_order: number;
  created_at: string;
};

export type CocktailOption = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// =====================================================
// TYPES COCKTAILS PRÊTS À BOIRE
// =====================================================

export type CocktailContainer = {
  id: string;
  name: string;
  volume_ml: number;
  base_price: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AlcoholDosage = {
  id: string;
  name: string;
  percentage: number;
  price_modifier: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ReadyCocktail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  image_url: string | null;
  emoji: string;
  color_theme: string | null;
  category: string | null; // Maintenu pour compatibilité
  categories: string[] | null; // Nouveau: support des catégories multiples
  flavor_profile: string | null;
  main_ingredients: string[] | null;
  default_alcohol_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  stock_status: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ReadyCocktailVariant = {
  id: string;
  cocktail_id: string;
  container_id: string;
  dosage_id: string;
  final_price: number;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  cocktail?: ReadyCocktail;
  container?: CocktailContainer;
  dosage?: AlcoholDosage;
};

// Type pour l'affichage complet d'un cocktail avec ses options
export type ReadyCocktailWithOptions = ReadyCocktail & {
  containers: CocktailContainer[];
  dosages: AlcoholDosage[];
  variants: ReadyCocktailVariant[];
};

// =====================================================
// TYPES BANNIÈRES
// =====================================================

export type Banner = {
  id: string;
  type: 'hero_slide' | 'cocktail_kit_bg' | 'parallax_section';
  title: string | null;
  subtitle: string | null;
  price: string | null;
  rating: string | null;
  year: string | null;
  gradient: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BannerInsert = Omit<Banner, 'id' | 'created_at' | 'updated_at'>;
export type BannerUpdate = Partial<BannerInsert>;

// =====================================================
// TYPES PROMOTIONS
// =====================================================

export type Promotion = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  min_purchase: number | null;
  max_discount: number | null;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  usage_count: number;
  usage_limit: number | null;
  start_date: string;
  end_date: string;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  is_stackable: boolean;
  is_first_order_only: boolean;
  created_at: string;
  updated_at: string;
};

// Ajoutez d'autres types selon vos besoins