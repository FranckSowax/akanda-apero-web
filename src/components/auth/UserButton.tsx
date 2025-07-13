'use client';

import { useState } from 'react';
import { LogOut, User as UserIcon, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function UserButton() {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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
      <div className="relative user-menu-container">
        {/* Bouton utilisateur */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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

  // Si utilisateur non connecté
  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/auth"
        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
}
