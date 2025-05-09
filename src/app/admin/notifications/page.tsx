'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ClientOnly } from '../../../components/ui/client-only';
import { useNotifications, NotificationItem, NotificationType } from '../../../context/NotificationsContext';

// Types d'alertes pour les onglets
type AlertTab = 'all' | 'unread' | NotificationType;

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<AlertTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les notifications selon l'onglet actif et la recherche
  const filteredNotifications = notifications
    .filter(notification => {
      // Filtrer par type
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !notification.read;
      return notification.type === activeTab;
    })
    .filter(notification => {
      // Filtrer par recherche
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    });

  // Obtenir les compteurs pour chaque type
  const getCounts = () => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      order: notifications.filter(n => n.type === 'order').length,
      stock: notifications.filter(n => n.type === 'stock').length,
      payment: notifications.filter(n => n.type === 'payment').length,
      delivery: notifications.filter(n => n.type === 'delivery').length,
      system: notifications.filter(n => n.type === 'system').length,
      other: notifications.filter(n => n.type === 'other').length,
    };
  };
  
  const counts = getCounts();

  // Obtenir la couleur de la notification selon sa priorité
  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-amber-500';
      case 'low':
        return 'border-l-4 border-blue-500';
    }
  };

  // Obtenir l'icône selon le type de notification
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'stock':
        return <Package className="h-5 w-5 text-amber-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'delivery':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'order': return 'Commande';
      case 'stock': return 'Stock';
      case 'payment': return 'Paiement';
      case 'delivery': return 'Livraison';
      case 'system': return 'Système';
      case 'other': return 'Autre';
    }
  };

  return (
    <ClientOnly>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Centre de notifications</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={markAllAsRead} 
              disabled={!counts.unread}
              className="text-sm"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
            <Button 
              variant="outline" 
              className="text-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
              onClick={clearAll}
              disabled={!notifications.length}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Tout effacer
            </Button>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              type="text" 
              placeholder="Rechercher des notifications..." 
              className="pl-10 pr-4 py-2" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Onglets pour filtrer les types de notifications */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as AlertTab)}>
          <TabsList className="bg-white p-1 rounded-lg">
            <TabsTrigger value="all" className="flex gap-2 items-center">
              <Bell className="h-4 w-4" />
              <span>Tout</span>
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex gap-2 items-center">
              <AlertCircle className="h-4 w-4" />
              <span>Non lus</span>
              <Badge variant="secondary" className="ml-1">{counts.unread}</Badge>
            </TabsTrigger>
            <TabsTrigger value="order" className="flex gap-2 items-center">
              <ShoppingCart className="h-4 w-4" />
              <span>Commandes</span>
              <Badge variant="secondary" className="ml-1">{counts.order}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex gap-2 items-center">
              <Package className="h-4 w-4" />
              <span>Stock</span>
              <Badge variant="secondary" className="ml-1">{counts.stock}</Badge>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex gap-2 items-center">
              <CreditCard className="h-4 w-4" />
              <span>Paiements</span>
              <Badge variant="secondary" className="ml-1">{counts.payment}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet actif */}
          <TabsContent value={activeTab} className="mt-6">
            {filteredNotifications.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune notification trouvée</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Essayez de modifier vos critères de recherche.' 
                    : 'Vous n\'avez pas de notifications dans cette catégorie.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`bg-white rounded-lg shadow-sm overflow-hidden group ${!notification.read ? 'bg-blue-50' : ''} ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              {!notification.read && (
                                <Badge className="bg-blue-500 text-white text-xs">Nouveau</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: fr })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 p-0 w-8"
                              onClick={() => markAsRead(notification.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 p-0 w-8"
                            onClick={() => deleteNotification(notification.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {notification.link && (
                        <div className="mt-3 text-right">
                          <Link 
                            href={notification.link} 
                            onClick={() => !notification.read && markAsRead(notification.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Voir les détails
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientOnly>
  );
};

export default NotificationsPage;
