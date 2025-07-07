'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, User, LogIn, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/supabase/useAuth';
import CartDrawer from '../CartDrawer';
import MobileCartButton from '../MobileCartButton';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isMenuOpen } = state.ui;
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    dispatch({ type: 'TOGGLE_MENU' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-3 sm:mr-8">
            <Image 
              src="https://i.imgur.com/qIBlF8u.png" 
              alt="Akanda Apéro Logo" 
              width={150} 
              height={60} 
              style={{ height: 'auto', width: '100px', maxWidth: '100px' }}
              className="object-contain w-[100px] sm:w-[120px] md:w-[150px]"
              priority
            />
          </Link>
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            <Link href="/produits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Produits</Link>
            <Link href="/cocktails-maison" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">🍹 Cocktails Maison</Link>
            <Link href="/cocktail-kits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Kits Cocktails</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Admin</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/produits" className="hidden md:block">
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 transition-colors duration-200">
              COMMANDER
            </Button>
          </Link>
          
          {/* Ajouter le menu utilisateur ou bouton de connexion */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <User className="h-5 w-5 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mon-compte/profil" className="w-full">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-compte/commandes" className="w-full">Mes commandes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-compte/fidelite" className="w-full">Programme fidélité</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="p-2 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
          )}
          
          {/* CartDrawer sur desktop, MobileCartButton sur mobile */}
          <div className="hidden md:block">
            <CartDrawer />
          </div>
          <div className="block md:hidden">
            <MobileCartButton />
          </div>
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 touch-manipulation"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="flex flex-col space-y-4 py-4 px-3 sm:px-4">
          <Link 
            href="/produits" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Produits
          </Link>
          <Link 
            href="/cocktails-maison" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            🍹 Cocktails Maison
          </Link>
          <Link 
            href="/cocktail-kits" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Kits Cocktails
          </Link>
          <Link 
            href="/contact" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Contact
          </Link>
          <Link 
            href="/admin/dashboard" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Admin
          </Link>
          <div className="py-2"></div>
          <Link 
            href="/produits" 
            className="w-full"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            <Button className="w-full bg-[#f5a623] hover:bg-[#e09000] text-white text-base py-3 font-medium transition-colors duration-200 touch-manipulation">
              COMMANDER
            </Button>
          </Link>

          {/* Bouton Panier dans le menu mobile */}
          <div className="flex w-full mt-2">
            <Button 
              className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-3 font-medium"
              onClick={() => {
                // Fermer le menu mobile
                dispatch({ type: 'TOGGLE_MENU' });
                
                // Ouvrir le tiroir du panier en ciblant le bouton par son ID
                const cartButton = document.getElementById('cart-drawer-trigger');
                if (cartButton) {
                  // Simuler un clic sur le bouton du panier
                  cartButton.click();
                }
              }}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Voir le panier</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};


