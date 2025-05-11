'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/supabase/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Extraire le paramètre de redirection de l'URL
  const [redirectTo, setRedirectTo] = React.useState('/');
  
  React.useEffect(() => {
    // Récupérer le paramètre de redirection s'il existe
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect_to');
      if (redirect) {
        setRedirectTo(redirect);
      }
    }
  }, []);
  
  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      router.push(redirectTo);
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signUp(email, password);
      toast({
        title: "Inscription réussie",
        description: "Un e-mail de confirmation a été envoyé. Veuillez confirmer votre adresse e-mail.",
      });
      // L'utilisateur est automatiquement connecté après inscription dans certains cas
      // S'il est connecté, le redirige via l'effet useEffect
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Bienvenue chez Akanda Apéro</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous ou créez un compte pour profiter de nos services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            {/* TabsList optimisé pour les appareils tactiles */}
            <TabsList className="grid w-full grid-cols-2 mb-4 touch-manipulation">
              <TabsTrigger 
                value="signin" 
                className="py-3 px-4 text-base active:opacity-80 focus:outline-none touch-manipulation"
                role="tab"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="py-3 px-4 text-base active:opacity-80 focus:outline-none touch-manipulation"
                role="tab"
              >
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Bouton optimisé pour les appareils tactiles avec plus de surface cliquable et meilleure réponse */}
                <Button 
                  type="submit" 
                  className="w-full bg-[#f5a623] hover:bg-[#e09000] py-3 text-base rounded-md touch-manipulation active:opacity-80 focus:outline-none"
                  disabled={loading}
                  onClick={(e) => {
                    if (loading) e.preventDefault(); // Éviter les soumissions multiples
                  }}
                  role="button"
                  aria-label="Se connecter"
                >
                  {loading ? "Chargement..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#f5a623] hover:bg-[#e09000] py-3 text-base rounded-md touch-manipulation active:opacity-80 focus:outline-none"
                  disabled={loading}
                  onClick={(e) => {
                    if (loading) e.preventDefault(); // Éviter les soumissions multiples
                  }}
                  role="button"
                  aria-label="S'inscrire"
                >
                  {loading ? "Chargement..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-gray-500 text-center mt-2">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
