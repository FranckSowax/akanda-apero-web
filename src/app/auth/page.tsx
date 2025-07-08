'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase/client';
import { Eye, EyeOff, Mail, Key, AlertCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';

// Composants UI simplifiés pour éviter les problèmes d'importation
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>{children}</h3>
);

const CardDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>{children}</p>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center p-6 pt-0 ${className || ''}`}>{children}</div>
);

const Input = ({ type, placeholder, value, className, onChange, required, minLength }: { type: string, placeholder?: string, value?: string, className?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, minLength?: number }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} minLength={minLength} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${className || ''}`} />
);

const Button = ({ type, className, disabled, onClick, children, variant, role, ...rest }: { type?: "button" | "submit" | "reset", className?: string, disabled?: boolean, onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, children: React.ReactNode, variant?: string, role?: string, [key: string]: any }) => (
  <button 
    type={type} 
    disabled={disabled} 
    onClick={onClick} 
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className || ''}`}
    role={role}
    {...rest}
  >
    {children}
  </button>
);

const Tabs = ({ defaultValue, className, children }: { defaultValue: string, className?: string, children: React.ReactNode }) => (
  <div className={`flex flex-col ${className || ''}`} data-tabs-value={defaultValue}>{children}</div>
);

const TabsList = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>{children}</div>
);

const TabsTrigger = ({ value, className, role, children }: { value: string, className?: string, role?: string, children: React.ReactNode }) => (
  <button data-value={value} role={role} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className || ''}`}>{children}</button>
);

const TabsContent = ({ value, children }: { value: string, children: React.ReactNode }) => (
  <div data-value={value} className="mt-2">{children}</div>
);

export default function AuthPage() {
  // États basiques pour le formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Vérifier si un utilisateur est connecté et gérer la redirection
  useEffect(() => {
    // Vérifier si une session existe déjà
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.href = redirectTo;
      }
    };
    
    // Récupérer le paramètre de redirection s'il existe
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect_to');
      if (redirect) {
        setRedirectTo(redirect);
      }
      checkSession();
    }
  }, [redirectTo]);
  
  // Afficher un message à l'utilisateur
  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(''), 5000); // Efface le message après 5 secondes
  };

  // Fonction de connexion simplifiée pour fonctionner sur tous les appareils
  // Fonction de réinitialisation de mot de passe
  const handleResetPassword = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    
    if (!resetEmail) {
      showMessage("Veuillez entrer votre adresse e-mail.", true);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?redirect_to=${encodeURIComponent(redirectTo)}`,
      });
      
      if (error) throw error;
      
      showMessage("Un e-mail de réinitialisation a été envoyé à votre adresse.");
      setForgotPassword(false);
    } catch (error: any) {
      console.error('Erreur de réinitialisation:', error);
      showMessage(error.message || "Une erreur s'est produite lors de la réinitialisation.", true);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction d'inscription simplifiée
  const handleSignUp = async (e: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      showMessage("Veuillez remplir tous les champs.", true);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?redirect_to=${encodeURIComponent(redirectTo)}`
        }
      });
      
      if (error) throw error;
      
      showMessage("Inscription réussie! Veuillez vérifier votre e-mail pour confirmer votre compte.");
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      showMessage(error.message || "Une erreur s'est produite lors de l'inscription.", true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      showMessage("Veuillez remplir tous les champs.", true);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      // Authentification réussie
      showMessage("Connexion réussie");
      
      // Redirection directe - approche universelle
      window.location.href = redirectTo;
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      showMessage(error.message || "Une erreur s'est produite lors de la connexion.", true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Header />
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
                <form 
                  className="space-y-4" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignIn(e);
                  }}
                >
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
                  <form 
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                  >
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
                        onClick={(e) => {
                          e.preventDefault();
                          if (!loading) {
                            handleResetPassword(e);
                          }
                        }}
                      >
                        {loading ? "Envoi..." : "Envoyer le lien"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form 
                className="space-y-4 mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp(e);
                }}
              >
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
                      e.preventDefault();
                      if (!loading) {
                        handleSignUp(e);
                      }
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
    </>
  );
}
