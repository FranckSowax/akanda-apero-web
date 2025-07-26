// Types TypeScript pour le système de promotions dynamiques

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  image_url: string | null;
  background_color: string;
  text_color: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  product_ids: string[];
  promo_code: string | null;
  max_uses: number | null;
  current_uses: number;
  min_order_amount: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionFormData {
  title: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  image_url: string;
  background_color: string;
  text_color: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  product_ids: string[];
  promo_code: string;
  max_uses: number | null;
  min_order_amount: number | null;
  sort_order: number;
}

export interface PromotionCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface PromotionStats {
  total_promotions: number;
  active_promotions: number;
  featured_promotions: number;
  expired_promotions: number;
  total_uses: number;
  conversion_rate: number;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  user_id: string | null;
  order_id: string | null;
  used_at: string;
  discount_applied: number;
}

// Types pour l'upload d'images
export interface PromotionImageUpload {
  file: File;
  preview: string;
  uploading: boolean;
  error: string | null;
}

// Types pour les filtres admin
export interface PromotionFilters {
  status: 'all' | 'active' | 'inactive' | 'expired' | 'featured';
  category_id: string | null;
  date_range: {
    start: string | null;
    end: string | null;
  };
  search: string;
}

// Types pour l'API
export interface PromotionApiResponse {
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_featured?: boolean;
  category_id?: string;
  product_ids?: string[];
  promo_code?: string;
  max_uses?: number;
  min_order_amount?: number;
  sort_order?: number;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  id: string;
}

// Types pour les erreurs
export interface PromotionError {
  field: string;
  message: string;
}

export interface PromotionValidationResult {
  isValid: boolean;
  errors: PromotionError[];
}

// Types pour les hooks React
export interface UsePromotionsResult {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPromotion: (data: CreatePromotionRequest) => Promise<Promotion>;
  updatePromotion: (data: UpdatePromotionRequest) => Promise<Promotion>;
  deletePromotion: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export interface UsePromotionCountdownResult {
  countdown: PromotionCountdown;
  isExpired: boolean;
  timeLeft: string;
}

// Types pour les composants
export interface PromotionCardProps {
  promotion: Promotion;
  showCountdown?: boolean;
  showActions?: boolean;
  onEdit?: (promotion: Promotion) => void;
  onDelete?: (promotion: Promotion) => void;
  onToggleActive?: (promotion: Promotion) => void;
}

export interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: Promotion;
  onSave: (data: PromotionFormData) => Promise<void>;
}

export interface PromotionCountdownProps {
  endDate: string;
  onExpired?: () => void;
  className?: string;
}

// Constantes
export const PROMOTION_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  SCHEDULED: 'scheduled'
} as const;

export const DEFAULT_PROMOTION_COLORS = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  BLUE: '#3b82f6',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899'
} as const;

export type PromotionStatus = typeof PROMOTION_STATUSES[keyof typeof PROMOTION_STATUSES];
