'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, ShoppingBag, Award, CreditCard, Settings, 
  LogOut, Home 
} from 'lucide-react';
import { useAuth } from '../../hooks/supabase/useAuth';

interface UserAccountLayoutProps {
  children: React.ReactNode;
}

const UserAccountLayout: React.FC<UserAccountLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  
  const menuItems = [
    { icon: User, label: 'Profil', href: '/mon-compte/profil' },
    { icon: ShoppingBag, label: 'Mes commandes', href: '/mon-compte/commandes' },
    { icon: Award, label: 'Programme fidélité', href: '/mon-compte/fidelite' },
    { icon: CreditCard, label: 'Moyens de paiement', href: '/mon-compte/paiement' },
    { icon: Settings, label: 'Paramètres', href: '/mon-compte/parametres' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
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
        
        <main className="flex-1 bg-white rounded-lg shadow p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserAccountLayout;
