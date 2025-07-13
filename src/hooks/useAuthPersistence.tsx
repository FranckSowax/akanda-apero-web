'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase/client';

// Hook ultra-robuste pour forcer la persistance auth
export function useAuthPersistence() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSessionRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('🚀 useAuthPersistence - Initialisation...');

    // Fonction de sauvegarde forcée
    const forceSaveSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.access_token) {
          const sessionString = JSON.stringify(session);
          const currentToken = session.access_token;
          
          // Sauvegarder seulement si différent
          if (currentToken !== lastSessionRef.current) {
            console.log('💾 useAuthPersistence - Sauvegarde session:', session.user.email);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('akanda-supabase-auth', sessionString);
            
            // Sauvegarder aussi dans sessionStorage comme backup
            sessionStorage.setItem('akanda-supabase-auth-backup', sessionString);
            
            // Sauvegarder dans une clé alternative
            localStorage.setItem('akanda-auth-backup', sessionString);
            
            lastSessionRef.current = currentToken;
            
            // Déclencher événement pour synchroniser
            window.dispatchEvent(new CustomEvent('auth-session-saved', {
              detail: { session }
            }));
          }
        }
      } catch (error) {
        console.error('❌ useAuthPersistence - Erreur:', error);
      }
    };

    // Fonction de récupération forcée
    const forceRecoverSession = async () => {
      try {
        // Vérifier localStorage principal
        let storedSession = localStorage.getItem('akanda-supabase-auth');
        
        // Si pas trouvé, vérifier les backups
        if (!storedSession) {
          storedSession = sessionStorage.getItem('akanda-supabase-auth-backup') ||
                          localStorage.getItem('akanda-auth-backup');
        }
        
        if (storedSession) {
          console.log('🔄 useAuthPersistence - Récupération session...');
          
          const session = JSON.parse(storedSession);
          
          // Vérifier si la session est encore valide
          if (session.expires_at && session.expires_at > Date.now() / 1000) {
            console.log('✅ useAuthPersistence - Session valide, restauration...');
            
            // Forcer Supabase à utiliser cette session
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            
            // Sauvegarder dans toutes les clés
            localStorage.setItem('akanda-supabase-auth', storedSession);
            sessionStorage.setItem('akanda-supabase-auth-backup', storedSession);
            localStorage.setItem('akanda-auth-backup', storedSession);
            
            lastSessionRef.current = session.access_token;
            
            console.log('🎉 useAuthPersistence - Session restaurée avec succès!');
            
            // Déclencher événement
            window.dispatchEvent(new CustomEvent('auth-session-recovered', {
              detail: { session }
            }));
            
            return true;
          } else {
            console.log('⚠️ useAuthPersistence - Session expirée, nettoyage...');
            localStorage.removeItem('akanda-supabase-auth');
            sessionStorage.removeItem('akanda-supabase-auth-backup');
            localStorage.removeItem('akanda-auth-backup');
          }
        }
        
        return false;
      } catch (error) {
        console.error('❌ useAuthPersistence - Erreur récupération:', error);
        return false;
      }
    };

    // Récupération initiale
    forceRecoverSession();

    // Sauvegarde initiale
    forceSaveSession();

    // Écouter les changements d'auth Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 useAuthPersistence - Auth change:', event, session?.user?.email);
      
      if (session) {
        const sessionString = JSON.stringify(session);
        localStorage.setItem('akanda-supabase-auth', sessionString);
        sessionStorage.setItem('akanda-supabase-auth-backup', sessionString);
        localStorage.setItem('akanda-auth-backup', sessionString);
        lastSessionRef.current = session.access_token;
        
        console.log('💾 useAuthPersistence - Session sauvée via listener');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('akanda-supabase-auth');
        sessionStorage.removeItem('akanda-supabase-auth-backup');
        localStorage.removeItem('akanda-auth-backup');
        lastSessionRef.current = null;
        
        console.log('🚪 useAuthPersistence - Session nettoyée');
      }
    });

    // Vérification périodique ultra-fréquente
    intervalRef.current = setInterval(() => {
      forceSaveSession();
    }, 1000); // Toutes les secondes !

    // Écouter les changements de page
    const handleBeforeUnload = () => {
      console.log('🔄 useAuthPersistence - Page change, sauvegarde...');
      forceSaveSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 useAuthPersistence - Page visible, récupération...');
        forceRecoverSession();
      } else {
        console.log('🔄 useAuthPersistence - Page cachée, sauvegarde...');
        forceSaveSession();
      }
    };

    // Écouter les événements de navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
