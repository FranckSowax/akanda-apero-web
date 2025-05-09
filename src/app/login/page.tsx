'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/supabase/useAuth';
import { supabase } from '../../lib/supabase/client';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('Tentative de connexion avec:', email);

    try {
      // Méthode directe de connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Réponse directe de Supabase:', {
        user: data?.user ? 'User exists' : 'No user',
        session: data?.session ? 'Session exists' : 'No session',
        error: error ? error.message : 'No error'
      });
      
      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        setError(error.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        return;
      }
      
      if (data?.user) {
        console.log('Connexion réussie, redirection vers la page intermédiaire');
        setLoading(true); // Garder l'indicateur de chargement
        
        // Utiliser notre page de redirection intermédiaire
        // Cette page vérifiera la session et redirigera correctement
        window.location.href = '/login/redirect';
        
        // Le reste de la redirection est géré par la page /login/redirect
      } else {
        console.warn('Connexion réussie mais aucun utilisateur retourné');
        setError('Connexion réussie mais aucun utilisateur retourné');
      }
    } catch (error: any) {
      console.error('Exception lors de la connexion:', error);
      setError(error.message || 'Erreur technique lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="https://i.imgur.com/qIBlF8u.png"
            alt="Akanda Apéro Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Administration Akanda Apéro</h1>
          <p className="text-gray-600">Connectez-vous pour accéder au tableau de bord</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#f5a623] focus:border-[#f5a623]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#f5a623] focus:border-[#f5a623]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f5a623] hover:bg-[#e09000] text-white py-2 px-4 rounded-md font-medium"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
