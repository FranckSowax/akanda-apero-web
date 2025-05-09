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
  GlassWater
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
      count: 12 // Exemple de commandes en attente
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
      count: 2 // Exemple de promotions actives
    },
    { 
      title: 'Livraison', 
      icon: <Truck className="h-5 w-5" />, 
      href: '/admin/delivery',
      count: 5 // Exemple de livraisons en cours
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
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="flex items-center space-x-4">
          <NotificationsDropdown />
          <div className="w-8 h-8 rounded-full bg-[#f5a623] text-white flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 bg-gray-900 text-white transition-transform lg:translate-x-0 ${
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

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-[#f5a623] text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
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

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full p-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`lg:ml-64 transition-all duration-300 min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
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
