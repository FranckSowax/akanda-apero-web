import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { CustomerProfile, CustomerProfileService, UpdateCustomerProfileData } from '../services/customer-profile-service';

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

  // Charger le profil client
  const loadProfile = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: profileError } = await CustomerProfileService.getCustomerProfile(userId);
      
      if (profileError) {
        console.error('Erreur chargement profil:', profileError);
        setError('Erreur lors du chargement du profil');
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur inattendue');
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
    if (user) {
      loadProfile(user.id);
    } else {
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
