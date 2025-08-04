'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { useAuthPersistence } from '../hooks/useAuthPersistence';
import { logError, logInfo } from '../utils/error-handler';
import { CustomerProfile } from '../services/customer-profile-service';
import { useCustomerProfile } from '../hooks/useCustomerProfile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  customerProfile: CustomerProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  updateCustomerProfile: (updates: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<string | null>(null);

  // Hook de persistance ultra-robuste
  useAuthPersistence();
  
  // Hook pour le profil client
  // Debug: Log user state
  console.log('🔍 AuthProvider - User state:', {
    user: user ? { id: user.id, email: user.email } : null,
    hasUser: !!user
  });

  const { 
    profile: customerProfile, 
    loading: profileLoading, 
    updateProfile: updateCustomerProfile 
  } = useCustomerProfile(user);

  // 🔧 FONCTION DE SYNCHRONISATION FORCÉE
  const forceSync = async () => {
    try {
      console.log('🔄 AuthProvider - Synchronisation forcée...');
      
      // 1. Vérifier localStorage
      const storedAuth = localStorage.getItem('akanda-supabase-auth');
      
      // 2. Récupérer session Supabase
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('✅ AuthProvider - Session Supabase trouvée:', currentSession.user.email);
        
        // Sauvegarder si pas déjà fait
        if (!storedAuth) {
          localStorage.setItem('akanda-supabase-auth', JSON.stringify(currentSession));
          console.log('💾 AuthProvider - Session sauvée dans localStorage');
        }
        
        setSession(currentSession);
        setUser(currentSession.user);
        lastSyncRef.current = currentSession.access_token;
        
      } else if (storedAuth) {
        console.log('🔄 AuthProvider - Session localStorage trouvée, restauration...');
        
        try {
          const parsedSession = JSON.parse(storedAuth);
          
          // Vérifier si la session est encore valide
          if (parsedSession.expires_at && parsedSession.expires_at > Date.now() / 1000) {
            console.log('✅ AuthProvider - Session localStorage valide, restauration...');
            
            // Forcer Supabase à utiliser cette session
            await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token
            });
            
            setSession(parsedSession);
            setUser(parsedSession.user);
            lastSyncRef.current = parsedSession.access_token;
          } else {
            console.log('⚠️ AuthProvider - Session localStorage expirée, nettoyage...');
            localStorage.removeItem('akanda-supabase-auth');
            setSession(null);
            setUser(null);
            lastSyncRef.current = null;
          }
        } catch (error) {
          console.log('❌ AuthProvider - Session localStorage corrompue, nettoyage...');
          localStorage.removeItem('akanda-supabase-auth');
          setSession(null);
          setUser(null);
          lastSyncRef.current = null;
        }
      } else {
        console.log('ℹ️ AuthProvider - Aucune session trouvée');
        setSession(null);
        setUser(null);
        lastSyncRef.current = null;
      }
      
    } catch (error) {
      console.error('❌ AuthProvider - Erreur de synchronisation:', error);
      setSession(null);
      setUser(null);
      lastSyncRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // 🚀 FONCTION DE REFRESH FORCÉ
  const forceRefresh = async () => {
    console.log('🔄 AuthProvider - Refresh forcé demandé');
    setLoading(true);
    await forceSync();
  };

  // 🚪 FONCTION DE DÉCONNEXION
  const signOut = async () => {
    console.log('🚪 AuthProvider - Déconnexion...');
    
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('akanda-supabase-auth');
      sessionStorage.clear();
      
      setSession(null);
      setUser(null);
      lastSyncRef.current = null;
      
      console.log('✅ AuthProvider - Déconnexion réussie');
    } catch (error) {
      console.error('❌ AuthProvider - Erreur de déconnexion:', error);
    }
  };

  // 🎯 INITIALISATION ET LISTENERS
  useEffect(() => {
    console.log('🚀 AuthProvider - Initialisation...');
    
    // Synchronisation initiale
    forceSync();
    
    // Écouter les changements d'état Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('🔄 AuthProvider - Changement d\'état Supabase:', event, session?.user?.email);
      
      if (session) {
        // Sauvegarder immédiatement
        localStorage.setItem('akanda-supabase-auth', JSON.stringify(session));
        setSession(session);
        setUser(session.user);
        lastSyncRef.current = session.access_token;
        console.log('💾 AuthProvider - Session sauvée via listener');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('akanda-supabase-auth');
        setSession(null);
        setUser(null);
        lastSyncRef.current = null;
        console.log('🚪 AuthProvider - Déconnexion via listener');
      }
      
      setLoading(false);
    });

    // Synchronisation périodique (toutes les 3 secondes)
    syncIntervalRef.current = setInterval(async () => {
      const storedAuth = localStorage.getItem('akanda-supabase-auth');
      const currentToken = storedAuth ? JSON.parse(storedAuth)?.access_token : null;
      
      // Ne synchroniser que si quelque chose a changé
      if (currentToken !== lastSyncRef.current) {
        console.log('🔄 AuthProvider - Changement détecté, synchronisation...');
        await forceSync();
      }
    }, 3000);

    // Écouter les changements de localStorage (autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'akanda-supabase-auth') {
        console.log('🔄 AuthProvider - Changement localStorage détecté');
        forceSync();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    session,
    customerProfile,
    loading,
    profileLoading,
    signOut,
    forceRefresh,
    updateCustomerProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
