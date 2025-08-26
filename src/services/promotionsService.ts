// Service pour la gestion des promotions avec Supabase
import { supabase } from '../lib/supabase/client';
import { 
  Promotion, 
  CreatePromotionRequest, 
  UpdatePromotionRequest,
  PromotionFilters,
  PromotionStats,
  PromotionApiResponse 
} from '../types/promotions';
import { logError, logInfo } from '../utils/error-handler';

export class PromotionsService {
  
  /**
   * Récupérer toutes les promotions avec filtres
   */
  static async getPromotions(filters?: PromotionFilters, page = 1, limit = 10): Promise<PromotionApiResponse> {
    try {
      logInfo('Récupération des promotions avec filtres', 'PromotionsService.getPromotions');
      
      let query = supabase
        .from('promotions')
        .select('*', { count: 'exact' });

      // Appliquer les filtres
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          switch (filters.status) {
            case 'active':
              query = query
                .eq('is_active', true)
                .lte('start_date', new Date().toISOString())
                .gte('end_date', new Date().toISOString());
              break;
            case 'inactive':
              query = query.eq('is_active', false);
              break;
            case 'expired':
              query = query.lt('end_date', new Date().toISOString());
              break;
            case 'featured':
              query = query.eq('is_featured', true);
              break;
          }
        }

        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }

        if (filters.date_range.start) {
          query = query.gte('start_date', filters.date_range.start);
        }

        if (filters.date_range.end) {
          query = query.lte('end_date', filters.date_range.end);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
      }

      // Pagination et tri
      const offset = (page - 1) * limit;
      query = query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      logError(error, 'Erreur lors de la récupération des promotions');
      throw error;
    }
  }

  /**
   * Récupérer les promotions actives pour l'affichage public
   */
  static async getActivePromotions(): Promise<Promotion[]> {
    try {
      logInfo('Récupération des promotions actives');
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'Erreur lors de la récupération des promotions actives');
      throw error;
    }
  }

  /**
   * Récupérer les promotions mises en avant
   */
  static async getFeaturedPromotions(): Promise<Promotion[]> {
    try {
      logInfo('Récupération des promotions mises en avant');
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('sort_order', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'Erreur lors de la récupération des promotions mises en avant');
      throw error;
    }
  }

  /**
   * Récupérer une promotion par ID
   */
  static async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      logInfo('Récupération de la promotion par ID', "PromotionsService");
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Pas trouvé
        throw error;
      }

      return data;
    } catch (error) {
      logError(error, 'Erreur lors de la récupération de la promotion');
      throw error;
    }
  }

  /**
   * Créer une nouvelle promotion
   */
  static async createPromotion(promotionData: CreatePromotionRequest): Promise<Promotion> {
    try {
      logInfo('Création d\'une nouvelle promotion', "PromotionsService");
      
      const { data, error } = await supabase
        .from('promotions')
        .insert([{
          ...promotionData,
          current_uses: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      logInfo('Promotion créée avec succès', "PromotionsService");
      return data;
    } catch (error) {
      logError(error, 'Erreur lors de la création de la promotion');
      throw error;
    }
  }

  /**
   * Mettre à jour une promotion
   */
  static async updatePromotion(promotionData: UpdatePromotionRequest): Promise<Promotion> {
    try {
      logInfo('Mise à jour de la promotion', "PromotionsService");
      
      const { id, ...updateData } = promotionData;
      
      const { data, error } = await supabase
        .from('promotions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      logInfo('Promotion mise à jour avec succès', "PromotionsService");
      return data;
    } catch (error) {
      logError(error, 'Erreur lors de la mise à jour de la promotion');
      throw error;
    }
  }

  /**
   * Supprimer une promotion
   */
  static async deletePromotion(id: string): Promise<void> {
    try {
      logInfo('Suppression de la promotion', "PromotionsService");
      
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      logInfo('Promotion supprimée avec succès', "PromotionsService");
    } catch (error) {
      logError(error, 'Erreur lors de la suppression de la promotion');
      throw error;
    }
  }

  /**
   * Basculer le statut actif d'une promotion
   */
  static async togglePromotionActive(id: string): Promise<Promotion> {
    try {
      logInfo('Basculement du statut actif de la promotion', "PromotionsService");
      
      // Récupérer d'abord la promotion actuelle
      const currentPromotion = await this.getPromotionById(id);
      if (!currentPromotion) {
        throw new Error('Promotion non trouvée');
      }

      const { data, error } = await supabase
        .from('promotions')
        .update({
          is_active: !currentPromotion.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      logInfo('Statut de la promotion basculé avec succès', 'PromotionsService.toggleStatus');
      return data;
    } catch (error) {
      logError(error, 'Erreur lors du basculement du statut de la promotion');
      throw error;
    }
  }

  /**
   * Upload d'image pour une promotion
   */
  static async uploadPromotionImage(file: File, promotionId?: string): Promise<string> {
    try {
      logInfo('Upload d\'image pour promotion', 'PromotionsService.uploadImage');

      const fileExt = file.name.split('.').pop();
      const fileName = `${promotionId || 'new'}_${Date.now()}.${fileExt}`;
      const filePath = `promotions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      logInfo('Image uploadée avec succès', "PromotionsService");
      return publicUrl;
    } catch (error) {
      logError('Erreur lors de l\'upload de l\'image', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des promotions
   */
  static async getPromotionStats(): Promise<PromotionStats> {
    try {
      logInfo('Récupération des statistiques des promotions');
      
      const now = new Date().toISOString();
      
      // Requêtes parallèles pour les statistiques
      const [totalResult, activeResult, featuredResult, expiredResult] = await Promise.all([
        supabase.from('promotions').select('id', { count: 'exact', head: true }),
        supabase.from('promotions').select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .lte('start_date', now)
          .gte('end_date', now),
        supabase.from('promotions').select('id', { count: 'exact', head: true })
          .eq('is_featured', true),
        supabase.from('promotions').select('id', { count: 'exact', head: true })
          .lt('end_date', now)
      ]);

      // Calculer les utilisations totales
      const { data: usageData } = await supabase
        .from('promotions')
        .select('current_uses');

      const totalUses = usageData?.reduce((sum, promo) => sum + (promo.current_uses || 0), 0) || 0;

      return {
        total_promotions: totalResult.count || 0,
        active_promotions: activeResult.count || 0,
        featured_promotions: featuredResult.count || 0,
        expired_promotions: expiredResult.count || 0,
        total_uses: totalUses,
        conversion_rate: 0 // À calculer avec les données de commandes
      };
    } catch (error) {
      logError(error, 'Erreur lors de la récupération des statistiques');
      throw error;
    }
  }

  /**
   * Valider un code promo
   */
  static async validatePromoCode(code: string, orderAmount?: number): Promise<Promotion | null> {
    try {
      logInfo('Validation du code promo', "PromotionsService");
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('promo_code', code)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Code non trouvé
        throw error;
      }

      // Vérifier les conditions
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return null; // Limite d'utilisation atteinte
      }

      if (data.min_order_amount && orderAmount && orderAmount < data.min_order_amount) {
        return null; // Montant minimum non atteint
      }

      return data;
    } catch (error) {
      logError(error, 'Erreur lors de la validation du code promo');
      throw error;
    }
  }

  /**
   * Utiliser un code promo (incrémenter le compteur)
   */
  static async usePromoCode(promotionId: string): Promise<void> {
    try {
      logInfo('Utilisation du code promo', "PromotionsService");
      
      const { error } = await supabase.rpc('increment_promo_usage', {
        promo_id: promotionId
      });

      if (error) throw error;
      
      logInfo('Code promo utilisé avec succès', "PromotionsService");
    } catch (error) {
      logError('Erreur lors de l\'utilisation du code promo', error);
      throw error;
    }
  }
}

export default PromotionsService;
