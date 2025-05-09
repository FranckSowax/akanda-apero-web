'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, ShoppingCart, Package, CreditCard, Truck, AlertCircle, X } from 'lucide-react';
import { useNotifications, NotificationItem, NotificationType } from '../../context/NotificationsContext';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';

// Obtenir l'icône appropriée basée sur le type de notification
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case 'stock':
      return <Package className="h-4 w-4 text-amber-500" />;
    case 'payment':
      return <CreditCard className="h-4 w-4 text-green-500" />;
    case 'delivery':
      return <Truck className="h-4 w-4 text-purple-500" />;
    case 'system':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

// Obtenir la couleur de bordure basée sur la priorité
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

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <Badge variant="destructive" className="text-xs h-5 w-5 flex items-center justify-center rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div className="text-lg font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-blue-600"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>Vous n'avez pas de notifications</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`p-0 focus:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div 
                    className={`w-full p-3 ${getPriorityColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.link ? (
                      <Link 
                        href={notification.link} 
                        className="block w-full"
                        onClick={(e) => {
                          // Empêcher le double déclenchement avec l'événement parent
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <NotificationContent notification={notification} />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuGroup>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-center py-2 text-sm text-gray-500 focus:text-gray-700"
              asChild
            >
              <Link href="/admin/notifications">Voir toutes les notifications</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Composant pour le contenu de chaque notification
const NotificationContent: React.FC<{ notification: NotificationItem }> = ({ notification }) => {
  const { deleteNotification } = useNotifications();
  
  return (
    <div className="flex justify-between gap-2">
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div>
          <div className="font-medium text-sm">{notification.title}</div>
          <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: fr })}
          </div>
        </div>
      </div>
      <button 
        className="group hover:bg-gray-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notification.id);
        }}
      >
        <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>
  );
};

export default NotificationsDropdown;
