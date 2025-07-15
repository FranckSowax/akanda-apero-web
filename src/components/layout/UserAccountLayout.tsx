'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, ShoppingBag, Award, CreditCard, Settings, 
  LogOut, Home, Menu, X 
} from 'lucide-react';
import { useAuth } from '../../hooks/supabase/useAuth';

interface UserAccountLayoutProps {
  children: React.ReactNode;
}

const UserAccountLayout: React.FC<UserAccountLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: User, label: 'Profil', href: '/mon-compte/profil' },
    { icon: ShoppingBag, label: 'Mes commandes', href: '/mon-compte/commandes' },
    { icon: Award, label: 'Programme fidélité', href: '/mon-compte/fidelite' },
    { icon: CreditCard, label: 'Moyens de paiement', href: '/mon-compte/paiement' },
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
                    signOut();
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
                  onClick={() => signOut()}
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
