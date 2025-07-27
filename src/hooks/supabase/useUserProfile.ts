import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  loyalty_points?: number;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le profil utilisateur
  const fetchProfile = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération du profil:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil utilisateur
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.email) {
      throw new Error('Utilisateur non connecté');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert({
          email: user.email,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour du profil:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil au montage du composant
  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};
