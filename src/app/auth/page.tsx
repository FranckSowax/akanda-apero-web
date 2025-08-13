'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { Label } from '../../components/ui/label';
import { normalizeGabonPhone, isValidGabonPhone } from '../../utils/phoneUtils';
import Image from 'next/image';
import { Header } from '../../components/layout/Header';
import { 
  AlertCircle, 
  ArrowRight,
  CheckCircle,
  Crown,
  Eye,
  EyeOff,
  Key,
  Loader2,
  LogIn,
  Mail,
  Phone,
  Settings,
  Shield,
  Sparkles,
  Star,
  User,
  UserPlus,
  Zap
} from 'lucide-react';

// Types pour la gestion des utilisateurs
interface UserProfile {
  id: string;
  email: string;
  role?: 'customer' | 'admin' | 'staff' | 'delivery';
  isAdmin?: boolean;
}

// Interface pour les messages
interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

// Interface pour les profils admin
interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

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
  // États pour le formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<Message>({ text: '', type: 'info', show: false });
  const [redirectTo, setRedirectTo] = useState('/');
  
  // Vérification de session au chargement - TEMPORAIREMENT DÉSACTIVÉE
  useEffect(() => {
    console.log('🚨 REDIRECTION AUTOMATIQUE DÉSACTIVÉE - Mode debug');
    
    if (typeof window !== 'undefined') {
      // Récupérer le paramètre de redirection
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect_to');
      if (redirect) {
        setRedirectTo(redirect);
      }
      
      // Vérifier la session sans rediriger
      const checkSessionDebug = async () => {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          console.log('📊 État de la session:', {
            hasSession: !!sessionData.session,
            user: sessionData.session?.user?.email,
            error: sessionError?.message
          });
        } catch (error) {
          console.log('❌ Erreur session:', error);
        }
      };
      
      setTimeout(checkSessionDebug, 1000);
    }
  }, []);
  
  // Vérifier le rôle de l'utilisateur
  const checkUserRole = async (userId: string): Promise<'admin' | 'customer'> => {
    try {
      console.log('Vérification du rôle pour userId:', userId);
      
      const { data: adminProfile, error } = await supabase
        .from('admin_profiles')
        .select('role, is_active')
        .eq('user_id', userId)  // Correction: utiliser 'user_id' au lieu de 'id'
        .eq('is_active', true)
        .single();
      
      console.log('Profil admin trouvé:', adminProfile);
      console.log('Erreur éventuelle:', error);
      
      // Vérifier si l'utilisateur a un rôle admin actif
      if (adminProfile && adminProfile.role && adminProfile.is_active) {
        console.log('Utilisateur identifié comme admin avec rôle:', adminProfile.role);
        return 'admin';
      }
      
      console.log('Utilisateur identifié comme customer');
      return 'customer';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      return 'customer';
    }
  };
  
  // Afficher un message à l'utilisateur
  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type, show: true });
    setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 5000);
  };

  // Fonction de réinitialisation de mot de passe
  const handleResetPassword = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    
    if (!email) {
      showMessage("Veuillez entrer votre adresse e-mail.", 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?redirect_to=${encodeURIComponent(redirectTo)}`,
      });
      
      if (error) throw error;
      
      showMessage("Un e-mail de réinitialisation a été envoyé à votre adresse.", 'success');
      setForgotPassword(false);
    } catch (error: any) {
      console.error('Erreur de réinitialisation:', error);
      showMessage(error.message || "Une erreur s'est produite lors de la réinitialisation.", 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction d'inscription
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName || !phone) {
      showMessage("Veuillez remplir tous les champs.", 'error');
      return;
    }
    
    if (password.length < 6) {
      showMessage("Le mot de passe doit contenir au moins 6 caractères.", 'error');
      return;
    }

    // Valider et normaliser le numéro de téléphone gabonais
    if (!isValidGabonPhone(phone)) {
      showMessage("Veuillez entrer un numéro de téléphone gabonais valide (ex: 077889988 ou +24177889988).", 'error');
      return;
    }

    const normalizedPhone = normalizeGabonPhone(phone);
    
    setLoading(true);
    
    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?redirect_to=${encodeURIComponent(redirectTo)}`,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone
          }
        }
      });
      
      if (authError) throw authError;
      
      // Si l'utilisateur est créé et confirmé, créer le profil client
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('customers')
            .insert([
              {
                id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: normalizedPhone,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
          
          if (profileError) {
            console.error('Erreur création profil client:', profileError);
            // Ne pas bloquer l'inscription si le profil ne peut pas être créé
          }
        } catch (profileError) {
          console.error('Erreur profil:', profileError);
        }
      }
      
      showMessage("Inscription réussie! 📧 Un email de confirmation a été envoyé à votre adresse. Veuillez cliquer sur le lien dans l'email pour activer votre compte et pouvoir vous connecter.", 'success');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      showMessage(error.message || "Une erreur s'est produite lors de l'inscription.", 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      showMessage("Veuillez remplir tous les champs.", 'error');
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
      console.log('✅ Connexion réussie, session:', data.session);
      showMessage("Connexion réussie!", 'success');
      
      // Attendre que la session soit sauvegardée
      if (data.user && data.session) {
        console.log('💾 Attente de la sauvegarde de session...');
        
        // 🚀 FONCTION DE REDIRECTION ULTRA-ROBUSTE
        const waitForSession = async () => {
          // ÉTAPE 1: Forcer la sauvegarde dans TOUS les storages
          const sessionString = JSON.stringify(data.session);
          localStorage.setItem('akanda-supabase-auth', sessionString);
          sessionStorage.setItem('akanda-supabase-auth-backup', sessionString);
          localStorage.setItem('akanda-auth-backup', sessionString);
          
          console.log('💾 Session sauvée dans 3 emplacements');
          
          // ÉTAPE 2: Forcer Supabase à utiliser cette session
          try {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
            console.log('✅ Session forcée dans Supabase');
          } catch (error) {
            console.error('⚠️ Erreur setSession:', error);
          }
          
          // ÉTAPE 3: Restaurer le panier si nécessaire
          try {
            const savedCart = localStorage.getItem('cart_before_auth');
            if (savedCart) {
              console.log('🛒 Panier sauvegardé trouvé, restauration...');
              
              // Récupérer le panier actuel
              const currentCart = localStorage.getItem('akanda-cart');
              let cartToRestore = JSON.parse(savedCart);
              
              if (currentCart) {
                // Fusionner les paniers si il y en a un actuel
                const currentCartData = JSON.parse(currentCart);
                const mergedCart = [...currentCartData];
                
                // Ajouter les articles du panier sauvegardé
                cartToRestore.forEach((savedItem: any) => {
                  const existingIndex = mergedCart.findIndex((item: any) => item.id === savedItem.id);
                  if (existingIndex >= 0) {
                    // Additionner les quantités si l'article existe déjà
                    mergedCart[existingIndex].quantity += savedItem.quantity;
                  } else {
                    // Ajouter le nouvel article
                    mergedCart.push(savedItem);
                  }
                });
                
                cartToRestore = mergedCart;
              }
              
              // Sauvegarder le panier fusionné
              localStorage.setItem('akanda-cart', JSON.stringify(cartToRestore));
              
              // Supprimer le panier temporaire
              localStorage.removeItem('cart_before_auth');
              
              console.log('✅ Panier restauré avec succès:', cartToRestore.length, 'articles');
              
              // Déclencher un événement pour notifier les composants
              window.dispatchEvent(new CustomEvent('cart-restored', {
                detail: { cart: cartToRestore }
              }));
            }
          } catch (error) {
            console.error('⚠️ Erreur lors de la restauration du panier:', error);
            // Supprimer le panier corrompu pour éviter les problèmes futurs
            localStorage.removeItem('cart_before_auth');
          }
          
          // ÉTAPE 4: Déterminer la destination
          const userRole = await checkUserRole(data.user.id);
          const destination = userRole === 'admin' ? '/admin/dashboard' : redirectTo;
          
          // ÉTAPE 5: Vérification et redirection ultra-robuste
          let attempts = 0;
          const maxAttempts = 15;
          
          const verifyAndRedirect = async () => {
            // Vérifier que la session est bien là
            const stored1 = localStorage.getItem('akanda-supabase-auth');
            const stored2 = sessionStorage.getItem('akanda-supabase-auth-backup');
            const stored3 = localStorage.getItem('akanda-auth-backup');
            
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if ((stored1 || stored2 || stored3) && currentSession && attempts < maxAttempts) {
              console.log('✅ Triple vérification OK - Redirection sécurisée vers:', destination);
              
              // Déclencher événement personnalisé avant redirection
              window.dispatchEvent(new CustomEvent('auth-before-redirect', {
                detail: { session: currentSession, redirectTo: destination }
              }));
              
              // Redirection avec délai pour laisser le temps à la persistance
              setTimeout(() => {
                console.log('🚀 Redirection vers:', destination);
                window.location.replace(destination);
              }, 1000);
              
            } else if (attempts < maxAttempts) {
              attempts++;
              console.log(`⏳ Vérification ${attempts}/${maxAttempts} - Session:`, !!currentSession, 'Storage:', !!(stored1 || stored2 || stored3));
              setTimeout(verifyAndRedirect, 300);
            } else {
              console.log('⚠️ Timeout - Redirection forcée malgré tout vers:', destination);
              window.location.replace(destination);
            }
          };
          
          // Attendre un peu puis commencer la vérification
          setTimeout(verifyAndRedirect, 500);
        };
        
        // Commencer la vérification après un petit délai
        setTimeout(waitForSession, 500);
      }
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      showMessage(error.message || "Une erreur s'est produite lors de la connexion.", 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Header />
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-8 px-4">
        {/* Arrière-plan moderne avec gradient animé */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url('https://i.imgur.com/mLt5IU3.jpeg')`,
              filter: 'blur(3px) saturate(120%)',
            }}
          />
          {/* Particules flottantes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-300/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-blue-300/25 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      
        <div className="container mx-auto max-w-md relative z-10">
          {/* Message d'alerte animé */}
          {message.show && (
            <div className={`mb-4 p-4 rounded-lg border-l-4 backdrop-blur-sm transition-all duration-300 ${
              message.type === 'success' 
                ? 'bg-green-50/90 border-green-400 text-green-700' 
                : message.type === 'error'
                ? 'bg-red-50/90 border-red-400 text-red-700'
                : 'bg-blue-50/90 border-blue-400 text-blue-700'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                {message.type === 'info' && <Sparkles className="h-5 w-5 mr-2" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}
          
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm hover:bg-white/98 transition-all duration-300">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <Image 
                    src="https://i.imgur.com/qIBlF8u.png"
                    alt="Akanda Apéro Logo"
                    width={100}
                    height={100}
                    className="rounded-xl shadow-lg"
                    priority
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenue chez Akanda Apéro
              </CardTitle>
              <CardDescription className="text-gray-600">
                Connectez-vous ou créez un compte pour profiter de nos services premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'signin'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Connexion
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'signup'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Inscription
                </button>
              </div>
              
              {/* Formulaire de connexion */}
              {activeTab === 'signin' && (
                <div className="space-y-6">
                  {!forgotPassword ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            type="email"
                            placeholder="Adresse e-mail"
                            value={email}
                            className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Key className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe"
                            value={password}
                            className="pl-10 pr-12 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setForgotPassword(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connexion...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Se connecter
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
                        <p className="text-sm text-blue-700">Nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
                      </div>
                      
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            type="email"
                            placeholder="Adresse e-mail"
                            value={email}
                            className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => setForgotPassword(false)}
                          >
                            Retour
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Envoi...
                              </>
                            ) : (
                              "Envoyer le lien"
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
              
              {/* Formulaire d'inscription */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                    {/* Champs Prénom et Nom */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Prénom"
                          value={firstName}
                          className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Nom"
                          value={lastName}
                          className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Champ Téléphone */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="tel"
                        placeholder="Numéro de téléphone"
                        value={phone}
                        className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Champ Email */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Adresse e-mail"
                        value={email}
                        className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe (min. 6 caractères)"
                        value={password}
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Indicateur de force du mot de passe */}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded ${
                                password.length > i * 2 + 2
                                  ? password.length > 8
                                    ? 'bg-green-500'
                                    : password.length > 6
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Force du mot de passe: {password.length < 6 ? 'Faible' : password.length < 8 ? 'Moyenne' : 'Forte'}
                        </p>
                      </div>
                    )}
                   </div>

                  {/* Notice de validation d'email */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium mb-1">
                          📧 Validation d'email requise
                        </p>
                        <p className="text-blue-700">
                          Après votre inscription, vous recevrez un email de confirmation. 
                          <strong className="font-medium"> Vous devez cliquer sur le lien dans cet email pour activer votre compte</strong> et pouvoir vous connecter.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center space-y-2">
                    <p>
                      En vous inscrivant, vous acceptez nos{' '}
                      <a href="/conditions" className="text-indigo-600 hover:text-indigo-800 underline">
                        Conditions d'utilisation
                      </a>{' '}
                      et notre{' '}
                      <a href="/confidentialite" className="text-indigo-600 hover:text-indigo-800 underline">
                        Politique de confidentialité
                      </a>
                      .
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Sécurisé</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Premium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Qualité</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                En utilisant nos services, vous acceptez nos{' '}
                <a href="/conditions" className="text-indigo-600 hover:text-indigo-800 underline">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="/confidentialite" className="text-indigo-600 hover:text-indigo-800 underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
