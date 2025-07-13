'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/supabase/useAuth';
import { supabase } from '../../lib/supabase/client';

export const AuthDebug: React.FC = () => {
  const { user, loading, session, forceRefreshAuth } = useAuth();
  const [manualCheck, setManualCheck] = useState<any>(null);
  const [isForcing, setIsForcing] = useState(false);

  const checkManualAuth = async () => {
    console.log('🔍 Vérification manuelle de l\'authentification...');
    
    try {
      // Vérification directe avec Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erreur lors de la vérification manuelle:', error);
        setManualCheck({ error: error.message });
        return;
      }
      
      console.log('📊 Résultat de la vérification manuelle:', {
        session: session,
        user: session?.user,
        email: session?.user?.email
      });
      
      setManualCheck({
        session: session,
        user: session?.user,
        email: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ Erreur dans checkManualAuth:', err);
      setManualCheck({ error: String(err) });
    }
  };

  const handleForceRefresh = async () => {
    setIsForcing(true);
    try {
      console.log('🔄 Forçage de la mise à jour de l\'authentification...');
      await forceRefreshAuth();
      // Attendre un peu puis revérifier
      setTimeout(() => checkManualAuth(), 500);
    } catch (err) {
      console.error('❌ Erreur lors du forçage:', err);
    } finally {
      setIsForcing(false);
    }
  };

  useEffect(() => {
    // Vérification automatique au montage
    checkManualAuth();
  }, []);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
        <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
        
        <div className="space-y-2">
          <div>
            <strong>Hook useAuth:</strong>
            <div>Loading: {loading ? '✅' : '❌'}</div>
            <div>User: {user ? `✅ ${user.email}` : '❌ null'}</div>
            <div>Session: {session ? '✅' : '❌'}</div>
          </div>
          
          <div>
            <strong>Vérification manuelle:</strong>
            <div className="text-xs">
              {manualCheck ? (
                manualCheck.error ? (
                  <span className="text-red-400">❌ {manualCheck.error}</span>
                ) : (
                  <span className="text-green-400">
                    ✅ {manualCheck.email || 'Pas d\'email'}
                  </span>
                )
              ) : (
                'En cours...'
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={checkManualAuth}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              🔄 Revérifier
            </button>
            <button 
              onClick={handleForceRefresh}
              disabled={isForcing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs"
            >
              {isForcing ? '⏳' : '⚡'} Forcer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
