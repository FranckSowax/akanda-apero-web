'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';

export default function RedirectPage() {
  const [authStatus, setAuthStatus] = useState('Vérification de l\'authentification...');
  const [debugInfo, setDebugInfo] = useState('Chargement...');

  useEffect(() => {
    // Afficher une ligne de débogage
    const addDebugInfo = (info: string) => {
      setDebugInfo(prev => prev + '\n' + info);
      console.log(info);
    };

    const checkAuthAndRedirect = async () => {
      try {
        addDebugInfo('Vérification de la session...');
        
        // Première méthode: vérifier la session actuelle
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          addDebugInfo(`Erreur lors de la récupération de la session: ${error.message}`);
          setAuthStatus('Erreur de session');
          return;
        }
        
        addDebugInfo(`Session data: ${JSON.stringify(data, null, 2)}`);
        
        if (data.session) {
          addDebugInfo(`Session trouvée pour l'utilisateur: ${data.session.user.email}`);
          addDebugInfo('Tentative de redirection vers le tableau de bord...');
          setAuthStatus('Session trouvée, redirection...');
          
          // Timeout pour permettre l'affichage des logs
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 3000);
        } else {
          // Seconde méthode: vérifier l'utilisateur directement
          const { data: userData } = await supabase.auth.getUser();
          addDebugInfo(`Données utilisateur: ${JSON.stringify(userData, null, 2)}`);
          
          if (userData.user) {
            addDebugInfo(`Utilisateur trouvé sans session: ${userData.user.email}`);
            addDebugInfo('Tentative de redirection vers le tableau de bord malgré l\'absence de session...');
            setAuthStatus('Utilisateur trouvé, tentative de redirection...');
            
            setTimeout(() => {
              window.location.href = '/admin/dashboard';
            }, 3000);
          } else {
            addDebugInfo('Aucune session ni utilisateur trouvé');
            setAuthStatus('Non authentifié, redirection vers login...');
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        }
      } catch (err: any) {
        addDebugInfo(`Exception lors de la vérification d'authentification: ${err.message}`);
        setAuthStatus('Erreur lors de la vérification');
      }
    };

    // Attendre un moment avant de vérifier pour laisser le temps à Supabase de persister la session
    setTimeout(() => {
      checkAuthAndRedirect();
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">{authStatus}</h1>
        <div className="mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5a623] mx-auto mb-4"></div>
          <p>Veuillez patienter...</p>
        </div>
        
        <div className="mt-8 border border-gray-200 rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Informations de débogage</h2>
          <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {debugInfo}
          </pre>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retour à la connexion
          </button>
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="px-4 py-2 bg-[#f5a623] text-white rounded hover:bg-[#e09000]"
          >
            Forcer l'accès au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
