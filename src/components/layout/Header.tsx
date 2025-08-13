'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu, 
  User, 
  LogIn, 
  ShoppingBag, 
  Settings, 
  Package, 
  Heart, 
  LogOut, 
  Crown,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useCartModalContext } from '../../context/CartModalContext';
import { Button } from '../ui/button';
import UserButton from '../auth/UserButton';
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
  const { openCart } = useCartModalContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const toggleMenu = () => {
    dispatch({ type: 'TOGGLE_MENU' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="w-full max-w-none px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <Link href="/" className="mr-3 sm:mr-8 flex-shrink-0">
              <Image 
                src="https://i.imgur.com/qIBlF8u.png" 
                alt="Akanda Apéro Logo" 
                width={150} 
                height={60} 
                style={{ height: 'auto', width: '100px', maxWidth: '100px' }}
                className="object-contain w-[80px] sm:w-[100px] md:w-[120px] lg:w-[150px]"
                priority
              />
            </Link>
            <nav className="hidden md:flex space-x-2 lg:space-x-4 xl:space-x-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Accueil</Link>
              <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Apéros</Link>
              <Link href="/cocktails" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Cocktails</Link>
              <Link href="/cocktails-maison" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Kits Cocktails</Link>
              <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Contact</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Gros bouton orange PANIER */}
            <Button
              onClick={openCart}
              className="bg-[#e09000] hover:bg-[#cc7a00] text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base lg:text-lg relative"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">PANIER</span>
              <span className="sm:hidden">🛒</span>
              {mounted && getCartItemsCount() > 0 && (
                <span className="bg-white text-[#e09000] text-xs rounded-full px-1.5 sm:px-2 py-0.5 font-bold ml-1">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
            
            {/* Bouton utilisateur moderne */}
            <UserButton />
            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 touch-manipulation"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
          
          {/* Menu panel */}
          <div 
            className="absolute top-0 left-0 right-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du menu mobile */}
            <div className="flex items-center justify-between p-4 border-b">
              <Image 
                src="https://i.imgur.com/qIBlF8u.png" 
                alt="Akanda Apéro Logo" 
                width={120} 
                height={48} 
                className="object-contain"
              />
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <nav className="flex flex-col py-4">
              <Link 
                href="/" 
                className="text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-4 transition-colors duration-200 touch-manipulation"
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
              >
                🏠 Accueil
              </Link>
              <Link 
                href="/products" 
                className="text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-4 transition-colors duration-200 touch-manipulation"
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
              >
                🍷 Apéros
              </Link>
              <Link 
                href="/cocktails" 
                className="text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-4 transition-colors duration-200 touch-manipulation"
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
              >
                🍸 Cocktails
              </Link>
              <Link 
                href="/cocktails-maison" 
                className="text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-4 transition-colors duration-200 touch-manipulation"
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
              >
                🧪 Kits Cocktails
              </Link>
              <Link 
                href="/contact" 
                className="text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-4 transition-colors duration-200 touch-manipulation"
                onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
              >
                📞 Contact
              </Link>
              
              {/* Bouton Panier dans le menu mobile */}
              <div className="px-6 py-4 border-t mt-4">
                <Button 
                  className="w-full flex items-center justify-center gap-2 bg-[#e09000] hover:bg-[#cc7a00] text-white py-4 text-lg font-medium transition-colors duration-200 touch-manipulation rounded-lg"
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_MENU' });
                    openCart();
                  }}
                >
                  <ShoppingBag className="w-6 h-6" />
                  PANIER {mounted && getCartItemsCount() > 0 && `(${getCartItemsCount()})`}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};


