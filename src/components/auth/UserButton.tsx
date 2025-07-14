'use client';

import { useState, useEffect, useRef } from 'react';
import { LogOut, User as UserIcon, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function UserButton() {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Debug simple
  console.log('🎨 UserButton - État:', {
    loading,
    hasUser: !!user,
    userEmail: user?.email
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  // Si utilisateur connecté
  if (user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur';
    const initials = displayName.charAt(0).toUpperCase();

    return (
      <div className="relative user-menu-container" ref={menuRef}>
        {/* Bouton utilisateur */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
        >
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {displayName}
          </span>
        </button>

        {/* Menu déroulant */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999] min-w-max">
            {/* Overlay pour mobile */}
            <div className="fixed inset-0 bg-black bg-opacity-25 z-[-1] md:hidden" onClick={() => setIsMenuOpen(false)} />
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Mon Profil
            </Link>
            
            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Mes Commandes
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
            
            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si utilisateur non connecté - Bouton moderne et responsive
  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/auth"
        className="group relative inline-flex items-center justify-center px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out overflow-hidden min-w-[100px] sm:min-w-[140px]"
      >
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        
        {/* Icône utilisateur - masquée sur très petit écran */}
        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 relative z-10 hidden xs:block" />
        
        {/* Texte responsive */}
        <span className="relative z-10 whitespace-nowrap">
          <span className="sm:hidden">Connexion</span>
          <span className="hidden sm:inline">Se connecter</span>
        </span>
        
        {/* Effet de bordure lumineuse */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200" />
      </Link>
    </div>
  );
}
