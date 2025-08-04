import { supabase } from '../lib/supabase/client';

export interface CustomerProfile {
  id: string; // UUID généré automatiquement
  auth_user_id: string; // ID de l'utilisateur auth
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  loyalty_points?: number;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface UpdateCustomerProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export class CustomerProfileService {
  /**
   * Récupère le profil client par ID utilisateur
   */
  static async getCustomerProfile(userId: string): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      console.log('🔍 CustomerProfileService - Récupération profil pour:', userId);
      
      if (!userId) {
        console.error('❌ CustomerProfileService - userId manquant');
        return { data: null, error: { message: 'ID utilisateur requis', code: 'MISSING_USER_ID' } };
      }
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.log('📊 CustomerProfileService - Réponse Supabase:', { 
          data, 
          error, 
          userId,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          errorHint: error?.hint,
          fullError: JSON.stringify(error, null, 2)
        });
      } else {
        console.log('✅ CustomerProfileService - Profil récupéré:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('💥 CustomerProfileService - Erreur lors de la récupération du profil client:', error);
      return { data: null, error };
    }
  }

  /**
   * Crée un nouveau profil client
   */
  static async createCustomerProfile(profileData: CreateCustomerProfileData): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      console.log('🔧 CustomerProfileService - Création profil avec données:', profileData);
      
      const { id: authUserId, ...profileDataWithoutId } = profileData;
      
      const insertData = {
        ...profileDataWithoutId,
        auth_user_id: authUserId, // Utiliser auth_user_id au lieu de id
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 CustomerProfileService - Données à insérer:', insertData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ CustomerProfileService - Erreur insertion:', {
          error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          errorHint: error?.hint,
          fullError: JSON.stringify(error, null, 2),
          insertData
        });
      } else {
        console.log('✅ CustomerProfileService - Profil créé avec succès:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('💥 CustomerProfileService - Erreur lors de la création du profil client:', error);
      return { data: null, error };
    }
  }

  /**
   * Met à jour le profil client
   */
  static async updateCustomerProfile(userId: string, updates: UpdateCustomerProfileData): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil client:', error);
      return { data: null, error };
    }
  }

  /**
   * Crée ou met à jour le profil client (upsert)
   */
  static async upsertCustomerProfile(profileData: CreateCustomerProfileData): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert([{
          ...profileData,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de l\'upsert du profil client:', error);
      return { data: null, error };
    }
  }

  /**
   * Supprime le profil client
   */
  static async deleteCustomerProfile(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('auth_user_id', userId);

      return { error };
    } catch (error) {
      console.error('Erreur lors de la suppression du profil client:', error);
      return { error };
    }
  }

  /**
   * Synchronise le profil client avec les métadonnées de l'utilisateur auth
   */
  static async syncWithAuthUser(userId: string): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      // Récupérer les informations de l'utilisateur auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        return { data: null, error: authError || new Error('Utilisateur non trouvé') };
      }

      const metadata = authUser.user.user_metadata || {};
      
      // Créer ou mettre à jour le profil client
      const profileData: CreateCustomerProfileData = {
        id: userId,
        email: authUser.user.email || '',
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || ''
      };

      return await this.upsertCustomerProfile(profileData);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return { data: null, error };
    }
  }

  /**
   * Met à jour les points de fidélité
   */
  static async updateLoyaltyPoints(userId: string, points: number): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: points,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des points:', error);
      return { data: null, error };
    }
  }

  /**
   * Ajoute des points de fidélité
   */
  static async addLoyaltyPoints(userId: string, pointsToAdd: number): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      // Récupérer les points actuels
      const { data: currentProfile, error: fetchError } = await this.getCustomerProfile(userId);
      
      if (fetchError || !currentProfile) {
        return { data: null, error: fetchError || new Error('Profil non trouvé') };
      }

      const newPoints = (currentProfile.loyalty_points || 0) + pointsToAdd;
      
      return await this.updateLoyaltyPoints(userId, newPoints);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de points:', error);
      return { data: null, error };
    }
  }
}
