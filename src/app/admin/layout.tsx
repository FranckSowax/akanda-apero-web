'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageOpen, 
  Tags, 
  Percent, 
  Users, 
  ShoppingCart, 
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wine,
  GlassWater,
  Home,
  ExternalLink
} from 'lucide-react';
import { NotificationsProvider } from '../../context/NotificationsContext';
import NotificationsDropdown from '../../components/admin/NotificationsDropdown';
import { useNotificationSimulator } from '../../hooks/useNotificationSimulator';
import { useAuth } from '../../hooks/supabase/useAuth';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut, user } = useAuth();
  
  // Utiliser le hook de simulation de notifications
  useNotificationSimulator();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const sidebarItems = [
    { 
      title: 'Tableau de bord', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      href: '/admin/dashboard',
      count: null
    },
    { 
      title: 'Commandes', 
      icon: <ShoppingCart className="h-5 w-5" />, 
      href: '/admin/orders',
      count: null
    },
    { 
      title: 'Catégories', 
      icon: <Tags className="h-5 w-5" />, 
      href: '/admin/categories',
      count: null
    },
    { 
      title: 'Produits', 
      icon: <PackageOpen className="h-5 w-5" />, 
      href: '/admin/products',
      count: null
    },
    { 
      title: 'Kits Cocktails', 
      icon: <Wine className="h-5 w-5" />, 
      href: '/admin/cocktail-kits',
      count: null
    },
    { 
      title: 'Promotions', 
      icon: <Percent className="h-5 w-5" />, 
      href: '/admin/promotions',
      count: null
    },
    { 
      title: 'Livraison', 
      icon: <Truck className="h-5 w-5" />, 
      href: '/admin/delivery',
      count: null
    },
    { 
      title: 'Clients', 
      icon: <Users className="h-5 w-5" />, 
      href: '/admin/customers',
      count: null
    },
    { 
      title: 'Paramètres', 
      icon: <Settings className="h-5 w-5" />, 
      href: '/admin/settings',
      count: null
    },
  ];

  return (
      <div className="min-h-screen bg-gray-100">
      {/* Sidebar Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-sm p-3 flex justify-between items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="ml-1.5 font-medium text-sm">Menu</span>
        </button>
        <div className="flex items-center space-x-3">
          <NotificationsDropdown />
          <div className="w-7 h-7 rounded-full bg-[#f5a623] text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </div>
      
      {/* Dark overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-[85vw] max-w-[280px] sm:max-w-[320px] bg-gray-900 text-white transition-transform duration-300 lg:w-64 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-800">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <Image
                src="https://i.imgur.com/qIBlF8u.png"
                alt="Akanda Apéro Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="text-xl font-bold text-white">Akanda Apéro</span>
            </Link>
          </div>

          {/* Containers regroupés pour assurer une bonne disposition sur mobile */}
          <div className="flex flex-col h-[calc(100%-80px)] justify-between">
            {/* Menu items with overflow scroll */}
            <div className="overflow-y-auto py-3 px-2">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      onClick={() => isSidebarOpen && window.innerWidth < 1024 ? setIsSidebarOpen(false) : null}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-[#f5a623] text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-2.5">{item.title}</span>
                      </div>
                      {item.count !== null && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-700 text-xs font-medium text-white">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer buttons always visible */}
            <div className="p-3 border-t border-gray-800 mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  href="/"
                  target="_blank"
                  className="flex items-center justify-center p-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-[#f5a623] hover:bg-[#f39c12] transition-colors"
                >
                  <Home className="h-4 w-4 mr-1.5" />
                  <span>Accueil</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center p-2 text-xs sm:text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 transition-all duration-300 min-h-screen ml-0">
        {/* Header */}
        <header className="hidden lg:block bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Administration Akanda Apéro</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <NotificationsDropdown />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#f5a623] text-white flex items-center justify-center font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-gray-700 font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NotificationsProvider>
  );
}
