'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, ShoppingBag, Award, CreditCard, Settings, 
  LogOut, Home, Menu, X, Loader2 
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface UserAccountLayoutProps {
  children: React.ReactNode;
}

const UserAccountLayout: React.FC<UserAccountLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // S'assurer que nous sommes côté client pour éviter les erreurs d'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Vérification d'authentification directe avec Supabase (côté client uniquement)
  useEffect(() => {
    if (!isClient) return;
    
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('🔍 UserAccountLayout - Vérification directe de l\'authentification...');
        
        // Attendre un peu pour éviter les problèmes de timing
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!isMounted) return;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('📊 UserAccountLayout - Résultat de la vérification:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          email: session?.user?.email,
          error: error
        });
        
        if (error) {
          console.error('❌ UserAccountLayout - Erreur lors de la vérification:', error);
          if (isMounted) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsLoading(false);
          }
        } else if (session && session.user) {
          console.log('✅ UserAccountLayout - Utilisateur authentifié:', session.user.email);
          if (isMounted) {
            setIsAuthenticated(true);
            setCurrentUser(session.user);
            setIsLoading(false);
          }
        } else {
          console.log('❌ UserAccountLayout - Aucune session active');
          if (isMounted) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsLoading(false);
          }
        }
        
      } catch (err) {
        console.error('❌ UserAccountLayout - Erreur dans checkAuth:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log('🔄 UserAccountLayout - Changement d\'état d\'authentification:', event, !!session);
      
      if (session && session.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isClient]);
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      console.log('🔄 UserAccountLayout - Redirection vers la page de connexion');
      const currentPath = pathname;
      router.push(`/auth?redirect_to=${encodeURIComponent(currentPath)}`);
    }
  }, [isClient, isLoading, isAuthenticated, pathname, router]);
  
  // Fonction de déconnexion
  const handleSignOut = async () => {
    try {
      console.log('🚪 UserAccountLayout - Début de la déconnexion...');
      await supabase.auth.signOut();
      console.log('✅ UserAccountLayout - Déconnexion réussie');
      router.push('/auth');
    } catch (error) {
      console.error('❌ UserAccountLayout - Erreur lors de la déconnexion:', error);
    }
  };
  
  // Pendant l'hydratation, afficher un contenu statique pour éviter les erreurs SSR
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <aside className="hidden md:block md:w-64 shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          <main className="flex-1 bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
                <p className="text-gray-600">Chargement de votre compte...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Pendant le chargement côté client, afficher un loader
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
            <p className="text-gray-600">Chargement de votre compte...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Ne pas afficher le contenu si l'utilisateur n'est pas connecté (après vérification)
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
            <p className="text-gray-600">Redirection vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const menuItems = [
    { icon: User, label: 'Profil', href: '/mon-compte/profil' },
    { icon: ShoppingBag, label: 'Mes commandes', href: '/mon-compte/commandes' },
    { icon: Award, label: 'Points Fidélité', href: '/mon-compte/fidelite' },
    { icon: Settings, label: 'Paramètres', href: '/mon-compte/parametres' },
  ];
  
  // Trouver l'élément de menu actuel pour l'affichage mobile
  const currentMenuItem = menuItems.find(item => item.href === pathname);
  const CurrentIcon = currentMenuItem?.icon || User;
  const currentLabel = currentMenuItem?.label || 'Mon compte';

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Menu mobile */}
      <div className="md:hidden mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home className="h-4 w-4" />
              <span className="text-sm">Accueil</span>
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-[#f5a623] text-white rounded-md"
            >
              <CurrentIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{currentLabel}</span>
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Menu déroulant mobile */}
          {isMobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-[#f5a623] text-white' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Menu desktop */}
        <aside className="hidden md:block md:w-64 shrink-0">
          <div className="sticky top-20">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                <Home className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Link>
              
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-[#f5a623] text-white' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 bg-white rounded-lg shadow p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserAccountLayout;
