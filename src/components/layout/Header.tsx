'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import CartDrawer from '../CartDrawer';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isMenuOpen } = state.ui;

  const toggleMenu = () => {
    dispatch({ type: 'TOGGLE_MENU' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4 sm:mr-8">
            <Image 
              src="https://i.imgur.com/qIBlF8u.png" 
              alt="Akanda Apéro Logo" 
              width={150} 
              height={60} 
              style={{ height: 'auto', width: '120px', maxWidth: '120px' }}
              className="object-contain w-[120px] sm:w-[150px]"
              priority
            />
          </Link>
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            <Link href="/produits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Produits</Link>
            <Link href="/cocktail-kits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Kits Cocktails</Link>
            <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">Admin</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/produits" className="hidden md:block">
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 transition-colors duration-200">
              COMMANDER
            </Button>
          </Link>
          <CartDrawer />
          <button 
            className="md:hidden p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="flex flex-col space-y-3 sm:space-y-4 py-3 sm:py-4 px-3 sm:px-4">
          <Link 
            href="/produits" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors duration-200"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Produits
          </Link>
          <Link 
            href="/cocktail-kits" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors duration-200"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Kits Cocktails
          </Link>
          <Link 
            href="#contact" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors duration-200"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Contact
          </Link>
          <Link 
            href="/admin/dashboard" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors duration-200"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            Admin
          </Link>
          <Link 
            href="/produits" 
            className="w-full"
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            <Button className="w-full bg-[#f5a623] hover:bg-[#e09000] text-white text-sm transition-colors duration-200">
              COMMANDER
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};


