'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/supabase/useAuth';

interface AuthDebugProps {
  showOnMobile?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function AuthDebug({ 
  showOnMobile = true, 
  position = 'bottom-right' 
}: AuthDebugProps) {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        hasUser: !!user,
        userId: user?.id || 'null',
        userEmail: user?.email || 'null',
        loading: loading,
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        localStorage: {
          hasSupabaseAuth: !!localStorage.getItem('sb-akanda-supabase-auth-token'),
          authKeys: Object.keys(localStorage).filter(key => key.includes('auth'))
        },
        sessionStorage: {
          authKeys: Object.keys(sessionStorage).filter(key => key.includes('auth'))
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, [user, loading]);

  // Ne pas afficher sur mobile sauf si explicitement demandé
  if (!showOnMobile && debugInfo.isMobile) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono hover:bg-blue-600 transition-colors"
      >
        🔍 Auth Debug
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-black/90 text-green-400 p-3 rounded-lg text-xs font-mono max-w-xs overflow-auto max-h-96 border border-green-500">
          <div className="mb-2 text-green-300 font-bold">🔐 Auth State Debug</div>
          
          <div className="space-y-1">
            <div>⏰ {debugInfo.timestamp}</div>
            <div className={debugInfo.hasUser ? 'text-green-400' : 'text-red-400'}>
              👤 User: {debugInfo.hasUser ? '✅' : '❌'}
            </div>
            <div>🆔 ID: {debugInfo.userId}</div>
            <div>📧 Email: {debugInfo.userEmail}</div>
            <div className={debugInfo.loading ? 'text-yellow-400' : 'text-green-400'}>
              ⏳ Loading: {debugInfo.loading ? '🔄' : '✅'}
            </div>
            <div className={debugInfo.isMobile ? 'text-blue-400' : 'text-gray-400'}>
              📱 Mobile: {debugInfo.isMobile ? '✅' : '❌'}
            </div>
            
            <div className="mt-2 pt-2 border-t border-green-700">
              <div className="text-green-300 font-bold">💾 Storage</div>
              <div>🗄️ LS Auth: {debugInfo.localStorage?.hasSupabaseAuth ? '✅' : '❌'}</div>
              <div>🔑 LS Keys: {debugInfo.localStorage?.authKeys?.length || 0}</div>
              <div>🔑 SS Keys: {debugInfo.sessionStorage?.authKeys?.length || 0}</div>
            </div>
            
            {debugInfo.localStorage?.authKeys?.length > 0 && (
              <div className="mt-1">
                <div className="text-xs text-gray-400">Auth Keys:</div>
                {debugInfo.localStorage.authKeys.map((key: string, i: number) => (
                  <div key={i} className="text-xs text-gray-300 truncate">• {key}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
