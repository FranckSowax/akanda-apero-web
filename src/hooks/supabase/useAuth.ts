import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Erreur récupération session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
      } catch (error) {
        console.error('Erreur récupération session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Erreur connexion:', error);
        throw error;
      }
      
      setUser(data.user);
      setSession(data.session);
      return data;
    } catch (err) {
      console.error('Erreur dans signIn:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        console.error('Erreur inscription:', error);
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error('Erreur dans signUp:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur déconnexion:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Erreur dans signOut:', err);
      throw err;
    }
  };

  return { user, session, loading, signIn, signUp, signOut };
}
