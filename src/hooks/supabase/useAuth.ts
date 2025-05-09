import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session active
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
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
    console.log('useAuth: Tentative de connexion avec:', email);
    
    try {
      // Tentative de connexion avec l'email et le mot de passe
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('useAuth: Réponse de Supabase:', { 
        user: data?.user ? 'User exists' : 'No user', 
        error: error ? error.message : 'No error' 
      });
      
      if (error) {
        console.error('useAuth: Erreur d\'authentification:', error);
        throw error;
      }
      
      // Vérifier explicitement la session après la connexion
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('useAuth: Session après connexion:', 
        sessionData?.session ? 'Session active' : 'Pas de session');
      
      return data;
    } catch (err) {
      console.error('useAuth: Exception lors de la connexion:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (error) throw error;
    return data;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp
  };
}