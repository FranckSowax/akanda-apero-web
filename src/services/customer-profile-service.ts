import { supabase } from '../lib/supabase';

export interface CustomerProfile {
  id: string;
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
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil client:', error);
      return { data: null, error };
    }
  }

  /**
   * Crée un nouveau profil client
   */
  static async createCustomerProfile(profileData: CreateCustomerProfileData): Promise<{ data: CustomerProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création du profil client:', error);
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
        .eq('id', userId)
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
        .eq('id', userId);

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
        .eq('id', userId)
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
