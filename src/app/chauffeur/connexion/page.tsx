'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle, Car, Phone, EyeOff, Eye, LogIn } from 'lucide-react';
import { useChauffeurAuth } from '../../../context/ChauffeurAuthContext';

export default function ConnexionChauffeur() {
  const router = useRouter();
  const { setChauffeurAuth } = useChauffeurAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    telephone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Connexion - Données:', { telephone: formData.telephone, password: '***' });

    try {
      const response = await fetch('/api/chauffeurs/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          telephone: formData.telephone,
          password: formData.password
        })
      });

      console.log('🔐 Connexion - Réponse:', response.status, response.statusText);

      const data = await response.json();

      if (response.ok && data.success) {
        // Utiliser le contexte d'authentification chauffeur
        setChauffeurAuth(data.token, data.chauffeur.id, data.chauffeur.nom);
        
        // Rediriger vers le dashboard
        router.push('/chauffeur/dashboard');
      } else {
        setError(data.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Connexion Chauffeur
            </CardTitle>
            <p className="text-gray-600">Akanda Apéro</p>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="telephone" className="text-base font-medium">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="h-12 text-base pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-base font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Votre mot de passe"
                      className="h-12 text-base pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-5 h-5" />
                    <span>Se connecter</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => alert('Contactez l\'administrateur pour réinitialiser votre mot de passe')}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Pas encore inscrit ?{' '}
            <button
              onClick={() => router.push('/chauffeur/inscription')}
              className="text-blue-600 font-medium hover:underline"
            >
              S'inscrire
            </button>
          </p>
        </div>

        {/* Version info */}
        <div className="text-center mt-8 text-xs text-gray-400">
          Akanda Apéro v1.0 - Interface Chauffeur
        </div>
      </div>
    </div>
  );
}
