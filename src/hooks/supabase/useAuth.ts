import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec Supabase:', email);
      
      // Vérifier d'abord la connexion à Supabase
      try {
        const { data: healthCheck } = await supabase.from('categories').select('count').limit(1).single();
        console.log('Connexion Supabase OK:', healthCheck);
      } catch (healthErr) {
        console.error('Erreur lors de la vérification de la connexion Supabase:', healthErr);
      }
      
      // Effectuer la connexion
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Erreur Supabase lors de la connexion:', error);
        throw translateAuthError(error);
      }
      
      console.log('Connexion réussie:', data);
      
      // Récupérer la session mise à jour
      const sessionResult = await supabase.auth.getSession();
      console.log('Session après connexion:', sessionResult);
      
      return data;
    } catch (err) {
      console.error('Erreur dans signIn:', err);
      if (err instanceof AuthError) {
        throw translateAuthError(err);
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw translateAuthError(error);
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw translateAuthError(error);
      return data;
    } catch (err) {
      if (err instanceof AuthError) {
        throw translateAuthError(err);
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw translateAuthError(error);
      return true;
    } catch (err) {
      if (err instanceof AuthError) {
        throw translateAuthError(err);
      }
      throw err;
    }
  };
  
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw translateAuthError(error);
      return true;
    } catch (err) {
      if (err instanceof AuthError) {
        throw translateAuthError(err);
      }
      throw err;
    }
  };
  
  // Fonction pour traduire les erreurs d'authentification en français
  const translateAuthError = (error: AuthError): Error => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Identifiants de connexion invalides.',
      'Email not confirmed': 'Email non confirmé. Veuillez vérifier votre boîte de réception.',
      'Invalid email or password': 'Email ou mot de passe invalide.',
      'User already registered': 'Cet email est déjà utilisé.',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
      'Email rate limit exceeded': 'Trop de tentatives, veuillez réessayer plus tard.',
      'For security purposes, you can only request this once every 60 seconds': 'Pour des raisons de sécurité, vous ne pouvez faire cette demande qu\'une fois toutes les 60 secondes.',
    };
    
    const translatedMessage = errorMap[error.message] || error.message;
    return new Error(translatedMessage);
  };

  // Fonction pour vérifier si l'utilisateur est toujours connecté
  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session !== null;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      return false;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
    checkAuth
  };
}