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
      console.log('🔍 Vérification existence utilisateur:', user.email);
      
      // Vérifier d'abord si l'utilisateur existe (sans .single() pour éviter les erreurs)
      const { data: existingUsers, error: checkError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', user.email);

      if (checkError) {
        console.error('❌ Erreur lors de la vérification:', checkError);
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        console.log('✅ Utilisateur existant trouvé, mise à jour...');
        // Utilisateur existe, faire un UPDATE
        const { data: updateData, error: updateError } = await supabase
          .from('customers')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Erreur lors de l\'UPDATE:', updateError);
          throw updateError;
        }
        
        console.log('✅ UPDATE réussi!');
        setProfile(updateData);
        return updateData;
      }

      // Utilisateur n'existe pas, le créer
      console.log('➕ Utilisateur inexistant, création...');
      const { data: insertData, error: insertError } = await supabase
        .from('customers')
        .insert({
          email: user.email,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erreur lors de l\'INSERT:', insertError);
        throw insertError;
      }
      
      console.log('✅ INSERT réussi!');
      setProfile(insertData);
      return insertData;
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
