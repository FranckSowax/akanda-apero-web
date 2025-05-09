'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/supabase/useAuth';
import { supabase } from '../../lib/supabase/client';
import Image from 'next/image';

export default function LoginClient() {
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
        setLoading(false);
        return;
      }
      
      if (data?.user) {
        // La connexion a déjà été effectuée directement avec supabase.auth.signInWithPassword
        // Nous n'avons pas besoin d'appeler signIn ici car nous avons déjà authentifié l'utilisateur
        
        // Rediriger vers la page demandée
        router.push(redirectTo);
      } else {
        setError('Aucun utilisateur trouvé.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Exception lors de la connexion:', err);
      setError('Une erreur est survenue lors de la tentative de connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image 
            src="/images/logo.png" 
            alt="Akanda Apéro Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à l'administration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
