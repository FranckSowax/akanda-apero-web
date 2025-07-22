import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Fonction pour forcer la récupération de la session
  const forceRefreshAuth = async () => {
    console.log('🔄 useAuth - Forçage de la récupération de session...');
    setLoading(true);
    
    try {
      // Attendre un peu pour éviter les appels trop rapides
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ useAuth - Erreur lors du forçage:', error);
        // Retry si erreur et moins de 3 tentatives
        if (retryCount < 3) {
          console.log(`🔄 useAuth - Tentative ${retryCount + 1}/3...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => forceRefreshAuth(), 1000);
          return;
        }
      }
      
      console.log('📊 useAuth - Session forçée récupérée:', {
        session: session,
        user: session?.user,
        email: session?.user?.email,
        expires_at: session?.expires_at,
        retryCount: retryCount
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error('❌ useAuth - Erreur dans forceRefreshAuth:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const getSession = async () => {
      try {
        console.log('🔍 useAuth - Récupération initiale de la session...');
        
        // Attendre un peu pour éviter les problèmes de timing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ useAuth - Erreur lors de la récupération de la session:', error);
          // Essayer de forcer la récupération
          if (retryCount < 3) {
            console.log(`🔄 useAuth - Tentative ${retryCount + 1}/3...`);
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, 1000);
          } else {
            setLoading(false);
          }
          return;
        }
        
        console.log('📊 useAuth - Session initiale récupérée:', {
          hasSession: !!session,
          user: session?.user,
          email: session?.user?.email,
          expires_at: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
          isExpired: session?.expires_at ? (session.expires_at * 1000 < Date.now()) : null
        });
        
        // Vérifier si la session n'est pas expirée
        if (session && session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('⚠️ useAuth - Session expirée, tentative de refresh...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshedSession) {
              console.log('✅ useAuth - Session rafraîchie avec succès');
              setSession(refreshedSession);
              setUser(refreshedSession.user);
            } else {
              console.log('❌ useAuth - Impossible de rafraîchir la session');
              setSession(null);
              setUser(null);
            }
          } catch (refreshErr) {
            console.error('❌ useAuth - Erreur lors du refresh:', refreshErr);
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
        setRetryCount(0);
        
      } catch (err) {
        console.error('❌ useAuth - Erreur dans getSession:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 useAuth - Changement d\'état d\'authentification:', {
          event: event,
          hasSession: !!session,
          user: session?.user,
          email: session?.user?.email
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setRetryCount(0);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [retryCount]);

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
      console.log('🚪 Début de la déconnexion...');
      
      // 1. Effectuer la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erreur Supabase lors de la déconnexion:', error);
        throw translateAuthError(error);
      }
      
      console.log('✅ Déconnexion Supabase réussie');
      
      // 2. Forcer la mise à jour de l'état local immédiatement
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('🔄 État local mis à jour');
      
      // 3. Attendre un peu pour s'assurer que tout est propagé
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. Vérifier que la session est bien supprimée
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Vérification session après déconnexion:', session);
      
      // 5. Rediriger vers la page d'authentification
      console.log('🔄 Redirection vers /auth');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      
    } catch (err) {
      console.error("❌ Erreur lors de la déconnexion:", err);
      // En cas d'erreur, forcer quand même la mise à jour de l'état
      setUser(null);
      setSession(null);
      setLoading(false);
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
    checkAuth,
    forceRefreshAuth
  };
}