'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../hooks/supabase/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import { AlertCircle, Key, User, Mail, EyeOff, Eye } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  
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
      console.log('Tentative de connexion avec:', { email, redirectTo });
      const result = await signIn(email, password);
      console.log('Résultat de connexion:', result);
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      
      // Forcer un délai court avant la redirection pour s'assurer que les états sont correctement mis à jour
      setTimeout(() => {
        console.log('Redirection vers:', redirectTo);
        router.push(redirectTo);
      }, 300);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!email) {
        throw new Error("Veuillez entrer votre adresse e-mail.");
      }
      
      await resetPassword(email);
      toast({
        title: "Email envoyé",
        description: "Si un compte existe avec cette adresse, vous recevrez un e-mail avec les instructions pour réinitialiser votre mot de passe.",
      });
      setForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi de l'e-mail.",
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
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Arrière-plan avec effet fondu */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/60 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url('https://i.imgur.com/mLt5IU3.jpeg')`,
            filter: 'blur(2px) saturate(110%) brightness(60%)',
          }}
        />
      </div>
      
      <div className="container mx-auto max-w-md relative z-10">
      <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://i.imgur.com/qIBlF8u.png"
              alt="Akanda Apéro Logo"
              width={120}
              height={120}
              className="rounded-md"
              priority
            />
          </div>
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
                className="py-3 px-4 text-base active:opacity-80 focus:outline-none touch-manipulation data-[state=active]:bg-[#f5a623] data-[state=active]:text-white"
                role="tab"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="py-3 px-4 text-base active:opacity-80 focus:outline-none touch-manipulation data-[state=active]:bg-[#f5a623] data-[state=active]:text-white"
                role="tab"
              >
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!forgotPassword ? (
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Adresse e-mail"
                        value={email}
                        className="pl-10"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={password}
                        className="pl-10 pr-10"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 touch-manipulation"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => setForgotPassword(true)}
                        className="text-sm text-[#f5a623] hover:text-[#e09000] touch-manipulation"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </div>
                  {/* Bouton optimisé pour les appareils tactiles avec plus de surface cliquable et meilleure réponse */}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#f5a623] hover:bg-[#e09000] py-3 text-base rounded-md touch-manipulation active:opacity-80 focus:outline-none"
                    disabled={loading}
                    onClick={(e) => {
                      e.preventDefault(); // Empêcher le comportement par défaut du formulaire
                      if (!loading) {
                        // Appel direct à la fonction de connexion
                        handleSignIn(e);
                      }
                    }}
                    role="button"
                    aria-label="Se connecter"
                  >
                    {loading ? "Chargement..." : "Se connecter"}
                  </Button>
                </form>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center bg-blue-50 p-4 rounded-md mb-4">
                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <p className="text-sm text-blue-600">Nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          placeholder="Adresse e-mail"
                          value={email}
                          className="pl-10"
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="flex-1 py-3 touch-manipulation"
                        onClick={() => setForgotPassword(false)}
                      >
                        Retour
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-[#f5a623] hover:bg-[#e09000] py-3 text-base rounded-md touch-manipulation active:opacity-80 focus:outline-none"
                        disabled={loading}
                      >
                        {loading ? "Envoi..." : "Envoyer le lien"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      placeholder="Adresse e-mail"
                      value={email}
                      className="pl-10"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe (min. 6 caractères)"
                      value={password}
                      className="pl-10 pr-10"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 touch-manipulation"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#f5a623] hover:bg-[#e09000] py-3 text-base rounded-md touch-manipulation active:opacity-80 focus:outline-none"
                    disabled={loading}
                    onClick={(e) => {
                      if (loading) e.preventDefault();
                    }}
                    role="button"
                    aria-label="S'inscrire"
                  >
                    {loading ? "Chargement..." : "S'inscrire"}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 text-center pt-2">
                  En vous inscrivant, vous acceptez nos <a href="/conditions" className="text-[#f5a623] hover:text-[#e09000] underline">Conditions d'utilisation</a> et notre <a href="/confidentialite" className="text-[#f5a623] hover:text-[#e09000] underline">Politique de confidentialité</a>.
                </div>
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
    </div>
  );
}
