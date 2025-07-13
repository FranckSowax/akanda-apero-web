'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UserButton() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
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
    
    // Avatar prêt à afficher

    return (
      <div className={`relative user-menu-container ${className}`}>
        {/* Bouton utilisateur */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          
          {/* Nom/Email */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-32">
              {user.email}
            </p>
          </div>

          {/* Indicateur de menu */}
          <div className={`transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Menu déroulant */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Info utilisateur */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Options du menu */}
            <div className="py-1">
              <Link
                href="/mon-compte/profil"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4 mr-3 text-gray-400" />
                Mon Profil
              </Link>

              <Link
                href="/mon-compte/commandes"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400" />
                Mes Commandes
              </Link>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si utilisateur non connecté
  return (
    <Link href="/auth" className={className}>
      <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">Se connecter</span>
      </button>
    </Link>
  );
}
