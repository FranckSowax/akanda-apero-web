import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { CustomerProfile, CustomerProfileService, UpdateCustomerProfileData } from '../services/customer-profile-service';
import { supabase } from '../lib/supabase/client';

interface UseCustomerProfileReturn {
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: UpdateCustomerProfileData) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  syncProfile: () => Promise<boolean>;
}

export function useCustomerProfile(user: User | null): UseCustomerProfileReturn {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log hook call
  console.log('🔍 useCustomerProfile - Hook called with user:', {
    user: user ? { id: user.id, email: user.email } : null,
    hasUser: !!user
  });

  // Migrer un profil existant en ajoutant l'auth_user_id
  const migrateExistingProfile = async (email: string, authUserId: string) => {
    try {
      console.log('🔄 Migration profil existant pour email:', email, 'vers userId:', authUserId);
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('customers')
        .update({ auth_user_id: authUserId })
        .eq('email', email)
        .is('auth_user_id', null)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur migration profil:', updateError);
        setError(`Erreur migration profil: ${updateError?.message || 'Erreur inconnue'}`);
        return;
      }

      console.log('✅ Profil migré avec succès:', updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('💥 Erreur lors de la migration du profil:', err);
      setError(`Erreur migration: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Créer le profil à partir des données auth
  const createProfileFromAuthUser = async (userId: string) => {
    try {
      console.log('🔧 Tentative de création de profil pour userId:', userId);
      
      // Récupérer les informations de l'utilisateur auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        console.error('❌ Impossible de récupérer l\'utilisateur auth:', authError);
        return;
      }

      const metadata = authUser.user.user_metadata || {};
      const email = authUser.user.email || '';
      
      // Créer le profil avec les données disponibles
      const profileData = {
        id: userId,
        email: email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || ''
      };
      
      console.log('📝 Création profil avec données:', profileData);
      
      const { data: newProfile, error: createError } = await CustomerProfileService.createCustomerProfile(profileData);
      
      if (createError) {
        console.error('❌ Erreur création profil:', {
          error: createError,
          errorMessage: createError?.message,
          errorCode: createError?.code,
          errorDetails: createError?.details,
          errorHint: createError?.hint,
          fullError: JSON.stringify(createError, null, 2),
          profileData
        });
        
        // Si erreur de duplication d'email, essayer de migrer le profil existant
        if (createError?.code === '23505' && createError?.message?.includes('customers_email_key')) {
          console.log('🔄 Tentative de migration du profil existant...');
          await migrateExistingProfile(email, userId);
          return;
        }
        
        setError(`Erreur création profil: ${createError?.message || createError?.code || 'Erreur inconnue'}`);
        return;
      }
      
      console.log('✅ Profil créé avec succès:', newProfile);
      setProfile(newProfile);
    } catch (err) {
      console.error('💥 Erreur lors de la création automatique du profil:', err);
      setError(`Erreur création profil: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Charger le profil client
  const loadProfile = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Chargement profil pour userId:', userId);
      const { data, error: profileError } = await CustomerProfileService.getCustomerProfile(userId);
      
      if (profileError) {
        console.error('❌ Erreur chargement profil:', {
          error: profileError,
          userId,
          errorMessage: profileError?.message,
          errorCode: profileError?.code,
          errorDetails: profileError?.details,
          errorHint: profileError?.hint,
          fullError: JSON.stringify(profileError, null, 2)
        });
        
        // Si l'utilisateur n'existe pas, essayer de créer le profil automatiquement
        if (profileError?.code === 'PGRST116') {
          console.log('ℹ️ Profil client non trouvé, tentative de création automatique...');
          await createProfileFromAuthUser(userId);
          return;
        }
        
        setError(`Erreur lors du chargement du profil: ${profileError?.message || 'Erreur inconnue'}`);
        return;
      }

      console.log('✅ Profil chargé avec succès:', data);
      setProfile(data);
    } catch (err) {
      console.error('💥 Erreur inattendue:', err);
      setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (updates: UpdateCustomerProfileData): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await CustomerProfileService.updateCustomerProfile(user.id, updates);
      
      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        setError('Erreur lors de la mise à jour du profil');
        return false;
      }

      setProfile(data);
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur inattendue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  // Synchroniser avec les métadonnées auth
  const syncProfile = async (): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: syncError } = await CustomerProfileService.syncWithAuthUser(user.id);
      
      if (syncError) {
        console.error('Erreur synchronisation profil:', syncError);
        setError('Erreur lors de la synchronisation du profil');
        return false;
      }

      setProfile(data);
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur inattendue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil quand l'utilisateur change
  useEffect(() => {
    console.log('🔄 useCustomerProfile - useEffect triggered:', {
      user: user ? { id: user.id, email: user.email } : null,
      hasUser: !!user
    });

    if (user) {
      console.log('🚀 useCustomerProfile - Loading profile for user:', user.id);
      loadProfile(user.id);
    } else {
      console.log('🚫 useCustomerProfile - No user, clearing profile');
      setProfile(null);
      setError(null);
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    syncProfile
  };
}
