'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, User, LogIn, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/supabase/useAuth';
import { useCartModalContext } from '../../context/CartModalContext';
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
  const { state, dispatch, getCartItemsCount } = useAppContext();
  const { isMenuOpen } = state.ui;
  const { user, signOut } = useAuth();
  const { openCart } = useCartModalContext();

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
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Accueil</Link>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Apéros</Link>
            <Link href="/cocktails-maison" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Cocktails Maison</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Gros bouton orange PANIER */}
          <Button
            onClick={openCart}
            className="bg-[#e09000] hover:bg-[#cc7a00] text-white px-6 py-2 rounded-lg font-semibold text-lg relative"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            PANIER
            {getCartItemsCount() > 0 && (
              <span className="bg-white text-[#e09000] text-xs rounded-full px-2 py-0.5 font-bold">
                {getCartItemsCount()}
              </span>
            )}
          </Button>
          
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
            href="/" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Accueil
          </Link>
          <Link 
            href="/products" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Apéros
          </Link>
          <Link 
            href="/cocktails-maison" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Cocktails Maison
          </Link>
          <Link 
            href="/contact" 
            className="text-base font-medium text-gray-600 hover:text-gray-900 px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Contact
          </Link>
          <div className="py-2"></div>
          
          {/* Bouton Panier dans le menu mobile */}
          <div className="flex w-full mt-2">
            <Button 
              className="w-full flex items-center justify-center gap-2 bg-[#e09000] hover:bg-[#cc7a00] text-white py-3 font-medium transition-colors duration-200 touch-manipulation"
              onClick={() => {
                // Fermer le menu mobile
                dispatch({ type: 'TOGGLE_MENU' });
                // Ouvrir le modal du panier
                openCart();
              }}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>PANIER</span>
              {getCartItemsCount() > 0 && (
                <span className="bg-white text-[#e09000] text-xs rounded-full px-2 py-0.5 font-bold ml-2">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};


