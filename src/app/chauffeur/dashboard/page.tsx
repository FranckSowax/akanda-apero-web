'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChauffeurAuth } from '../../../context/ChauffeurAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  Package, 
  Bell, 
  LogOut,
  Check,
  Navigation,
  Phone 
} from 'lucide-react';

interface Delivery {
  id: string;
  order_id: string;
  client_name: string;
  client_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  notes?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string | any;
  read: boolean;
  created_at: string;
}

interface Stats {
  totalDeliveries: number;
  completedDeliveries: number;
  totalGains: number;
  averageGain: number;
  todayDeliveries: number;
  todayGains: number;
  upcomingOrders: number;
}

export default function DashboardChauffeur() {
  const { chauffeur, logout } = useChauffeurAuth();
  const router = useRouter();
  
  // États principaux
  const [isOnline, setIsOnline] = useState(false);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalGains: 0,
    averageGain: 0,
    todayDeliveries: 0,
    todayGains: 0,
    upcomingOrders: 0
  });
  
  // États pour les notifications
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [currentOrderNotification, setCurrentOrderNotification] = useState<Notification | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Vérification de l'authentification
  useEffect(() => {
    if (!chauffeur) {
      router.push('/chauffeur/connexion');
      return;
    }
  }, [chauffeur, router]);

  // Initialisation de la géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (error) => {
          console.error('❌ Erreur géolocalisation:', error);
        }
      );
    }
  }, []);

  // Heartbeat et mise à jour de position
  useEffect(() => {
    if (!chauffeur || !position || !isOnline) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch('/api/chauffeurs/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chauffeurId: chauffeur.id,
            latitude: position.latitude,
            longitude: position.longitude
          })
        });

        await fetch('/api/chauffeurs/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chauffeur_id: chauffeur.id,
            latitude: position.latitude,
            longitude: position.longitude
          })
        });
      } catch (error) {
        console.error('❌ Erreur heartbeat:', error);
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(heartbeatInterval);
  }, [chauffeur, position, isOnline]);

  // Polling des notifications
  useEffect(() => {
    if (!chauffeur?.id) return;

    const pollNotifications = async () => {
      try {
        console.log(`🔍 Polling notifications pour chauffeur ${chauffeur.id}...`);
        const response = await fetch(`/api/notifications?chauffeur_id=${chauffeur.id}&read=false`);
        console.log(`📡 Réponse polling: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const newNotifications = await response.json();
          console.log(`📋 Notifications récupérées:`, {
            count: newNotifications?.length || 0,
            notifications: newNotifications?.slice(0, 2) // Log des 2 premières pour debug
          });
          setNotifications(newNotifications);
          
          if (newNotifications?.length > 0) {
            console.log(`🔔 ${newNotifications.length} nouvelles notifications trouvées!`);
            
            // Prendre la première notification non lue
            const newNotification = newNotifications[0];
            if (newNotification && (!currentOrderNotification || newNotification.id !== currentOrderNotification.id)) {
              console.log('🚨 AFFICHAGE OVERLAY - Notification:', newNotification);
              
              // Extract order data from message if it exists
              if (newNotification.message && newNotification.message.includes('|DATA:')) {
                const [originalMessage, dataString] = newNotification.message.split('|DATA:');
                try {
                  const orderData = JSON.parse(dataString);
                  newNotification.data = orderData;
                  newNotification.message = originalMessage;
                } catch (e) {
                  console.error('❌ Erreur parsing order data:', e);
                }
              }
              
              setCurrentOrderNotification(newNotification);
              setShowNotificationOverlay(true);
              
              // Son de notification
              try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(e => console.log('Son non disponible:', e));
              } catch (e) {
                console.log('Son non disponible:', e);
              }
            }
          } else {
            console.log(`📭 Aucune nouvelle notification`);
          }
        }
      } catch (error) {
        console.error('❌ Erreur polling notifications:', error);
      }
    };

    const interval = setInterval(pollNotifications, 5000);
    pollNotifications(); // Premier appel immédiat

    return () => clearInterval(interval);
  }, [chauffeur, currentOrderNotification]);

  // Chargement des données
  const loadData = async () => {
    if (!chauffeur) return;

    try {
      setLoading(true);

      // Charger les livraisons actives
      console.log('📡 Chargement livraisons actives pour chauffeur:', chauffeur.id);
      const deliveriesResponse = await fetch(`/api/chauffeurs/active-deliveries?chauffeur_id=${chauffeur.id}`);
      console.log('📊 Réponse API livraisons:', deliveriesResponse.status);
      
      if (deliveriesResponse.ok) {
        const deliveriesData = await deliveriesResponse.json();
        console.log('📋 Données livraisons reçues:', deliveriesData);
        const deliveriesArray = Array.isArray(deliveriesData) ? deliveriesData : [];
        console.log('🚚 Livraisons actives définies:', deliveriesArray.length);
        setActiveDeliveries(deliveriesArray);
      } else {
        console.error('❌ Erreur API livraisons:', deliveriesResponse.status);
      }

      // Charger les statistiques
      const statsResponse = await fetch(`/api/chauffeurs/livraisons?chauffeur_id=${chauffeur.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const statsArray = Array.isArray(statsData) ? statsData : [];
        
        const totalGains = statsArray.reduce((sum: number, delivery: any) => sum + (delivery.total_amount || 0), 0);
        const completedCount = statsArray.filter((d: any) => d.status === 'delivered').length;
        
        // Statistiques du jour
        const today = new Date().toISOString().split('T')[0];
        const todayDeliveries = statsArray.filter((d: any) => d.created_at?.startsWith(today));
        const todayGains = todayDeliveries.reduce((sum: number, delivery: any) => sum + (delivery.total_amount || 0), 0);

        // Charger les commandes confirmées (à venir) - toutes les commandes confirmées disponibles
        const upcomingResponse = await fetch(`/api/orders?status=Confirmée`);
        let upcomingCount = 0;
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          upcomingCount = Array.isArray(upcomingData.orders) ? upcomingData.orders.length : 
                         Array.isArray(upcomingData) ? upcomingData.length : 0;
          console.log('📋 Commandes confirmées récupérées:', upcomingCount);
        } else {
          console.error('❌ Erreur récupération commandes confirmées:', upcomingResponse.status);
        }

        setStats({
          totalDeliveries: statsArray.length,
          completedDeliveries: completedCount,
          totalGains,
          averageGain: statsArray.length > 0 ? totalGains / statsArray.length : 0,
          todayDeliveries: todayDeliveries.length,
          todayGains,
          upcomingOrders: upcomingCount
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [chauffeur]);

  // Basculer le statut en ligne/hors ligne
  const toggleOnlineStatus = async () => {
    if (!chauffeur) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: chauffeur.id,
          disponible: !isOnline
        })
      });

      if (response.ok) {
        setIsOnline(!isOnline);
      } else {
        console.error('❌ Erreur mise à jour statut');
      }
    } catch (error) {
      console.error('❌ Erreur toggle status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Accepter une commande (compétition GPS)
  const accepterCommande = async (notification: Notification) => {
    if (!chauffeur || !position) {
      alert('❌ Position GPS requise pour accepter une commande');
      return;
    }

    try {
      // Parse data if it's a string
      const orderData = typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : notification.data;
      
      // Ensure GPS coordinates are numbers
      const latitude = typeof position.latitude === 'number' ? position.latitude : parseFloat(position.latitude);
      const longitude = typeof position.longitude === 'number' ? position.longitude : parseFloat(position.longitude);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        alert('❌ Coordonnées GPS invalides. Veuillez réactiver votre géolocalisation.');
        return;
      }
      
      const competeResponse = await fetch('/api/orders/compete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData.order_id,
          chauffeur_id: chauffeur.id,
          chauffeur_name: chauffeur.nom || 'Chauffeur',
          chauffeur_phone: chauffeur.telephone || '',
          latitude: latitude,
          longitude: longitude
        })
      });

      if (!competeResponse.ok) {
        throw new Error('Erreur lors de la participation à la compétition');
      }

      const competeResult = await competeResponse.json();
      console.log('🏁 Résultat compétition:', competeResult);

      // Marquer la notification comme lue
      if (notification.id) {
        await marquerNotificationLue(notification.id);
      }

      setCurrentOrderNotification(null);
      setShowNotificationOverlay(false);
      
      console.log('🔄 Rafraîchissement des livraisons actives...');
      await loadData();
      console.log('✅ Livraisons actives rafraîchies');

      // Utiliser setTimeout pour ne pas bloquer l'exécution
      setTimeout(() => {
        alert('✅ Participation enregistrée ! Le chauffeur le plus proche sera sélectionné dans 10 secondes.');
      }, 100);
    } catch (error) {
      console.error('❌ Erreur acceptation commande:', error);
      alert('❌ Erreur lors de l\'acceptation de la commande');
    }
  };

  // Ouvrir Waze pour navigation
  const ouvrirWaze = (orderData: any) => {
    if (orderData.gps_latitude && orderData.gps_longitude) {
      const wazeUrl = `https://waze.com/ul?ll=${orderData.gps_latitude},${orderData.gps_longitude}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    } else if (orderData.delivery_address) {
      const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(orderData.delivery_address)}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    } else {
      alert('❌ Adresse de livraison non disponible');
    }
  };

  // Refuser une commande
  const refuserCommande = async (notification: Notification) => {
    if (notification.id) {
      await marquerNotificationLue(notification.id);
    }
    setCurrentOrderNotification(null);
    setShowNotificationOverlay(false);
  };

  // Marquer une notification comme lue
  const marquerNotificationLue = async (notificationId: string) => {
    try {
      await fetch('/api/chauffeurs/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
          read: true
        })
      });
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  };

  // Démarrer une livraison (passer de "Prête" à "En livraison")
  const startDelivery = async (orderId: string) => {
    if (!chauffeur?.id) return;

    try {
      const response = await fetch('/api/chauffeurs/start-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          chauffeur_id: chauffeur.id
        })
      });

      if (response.ok) {
        await loadData();
        alert('✅ Livraison démarrée ! Le client a été notifié.');
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur démarrage livraison:', error);
      alert('❌ Erreur lors du démarrage de la livraison');
    }
  };

  // Marquer une livraison comme terminée
  const markAsDelivered = async (deliveryId: string) => {
    try {
      const response = await fetch('/api/chauffeurs/active-deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_id: deliveryId,
          status: 'delivered'
        })
      });

      if (response.ok) {
        await loadData();
        alert('✅ Livraison marquée comme terminée !');
      } else {
        alert('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur marquage livraison:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    if (!chauffeur) return;

    try {
      // Mettre le chauffeur hors ligne avant de se déconnecter
      await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: chauffeur.id,
          disponible: false,
          statut: 'hors_ligne'
        })
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour statut déconnexion:', error);
    }

    logout();
    router.push('/chauffeur/connexion');
  };

  if (!chauffeur) {
    return <div>Redirection...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-3 py-4 max-w-md mx-auto lg:max-w-6xl lg:px-8">
        {/* Header ultra-moderne mobile-first */}
        <div className="mb-6">
          {/* Greeting Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Salut {chauffeur?.nom?.split(' ')[0] || 'Chauffeur'} ! 👋
                  </h1>
                  <p className="text-sm text-gray-600">
                    {isOnline ? 'Tu es en ligne' : 'Tu es hors ligne'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 p-2"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Status Toggle - Mobile Optimized */}
          <div className="flex gap-3 mb-4">
            <Button
              onClick={toggleOnlineStatus}
              disabled={updatingStatus}
              className={`flex-1 h-14 rounded-xl font-semibold text-base transition-all duration-300 ${
                isOnline 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 shadow-lg shadow-gray-400/25'
              } text-white`}
            >
              {updatingStatus ? (
                <Clock className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
                  {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
                </div>
              )}
            </Button>
            
            {position && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">GPS</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Mobile-First Design */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Livraisons Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium">Livraisons</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg px-2 py-1">
              <p className="text-xs text-blue-700 font-medium">✅ {stats.completedDeliveries} terminées</p>
            </div>
          </div>

          {/* Gains Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium">Gains</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGains.toFixed(0)} FCFA</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg px-2 py-1">
              <p className="text-xs text-green-700 font-medium">📊 Moy: {stats.averageGain.toFixed(0)} FCFA</p>
            </div>
          </div>

          {/* Today Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg px-2 py-1">
              <p className="text-xs text-purple-700 font-medium">💰 {stats.todayGains.toFixed(0)} FCFA</p>
            </div>
          </div>

          {/* Upcoming Orders Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium">À venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingOrders || 0}</p>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg px-2 py-1">
              <p className="text-xs text-orange-700 font-medium">📋 Confirmées</p>
            </div>
          </div>
        </div>

        {/* Active Deliveries - Ultra Modern Mobile */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Livraisons Actives</h2>
            {activeDeliveries.length > 0 && (
              <div className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                {activeDeliveries.length}
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
              <Clock className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune livraison active</h3>
              <p className="text-gray-600 text-sm">Les nouvelles commandes apparaîtront ici 📦</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((delivery: any) => (
                <div key={delivery.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{delivery.order_number || delivery.order_id}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{delivery.customer_name || 'Client'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            delivery.status === 'pending' ? 'bg-orange-500 animate-pulse' :
                            delivery.status === 'ready' ? 'bg-blue-500 animate-pulse' :
                            delivery.status === 'en_cours' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <span className="text-xs text-gray-600 font-medium">
                            {delivery.status === 'pending' ? 'En préparation' :
                             delivery.status === 'ready' ? 'Prête' :
                             delivery.status === 'en_cours' ? 'En livraison' : delivery.status}
                          </span>
                          {delivery.delivery_code && (
                            <Badge variant="outline" className="text-xs">
                              Code: {delivery.delivery_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{delivery.total_amount?.toFixed(0) || '0'} FCFA</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Adresse de livraison</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {delivery.delivery_address || 'Adresse non disponible'}
                    </p>
                  </div>

                  {delivery.status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700">Commande en préparation</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">Attendez que la commande soit prête avant de partir</p>
                    </div>
                  )}

                  {delivery.status === 'ready' && (
                    <Button
                      onClick={() => startDelivery(delivery.order_id)}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 mb-3"
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      Marquer en Livraison 🚚
                    </Button>
                  )}

                  {delivery.status === 'en_cours' && (
                    <Button
                      onClick={() => markAsDelivered(delivery.id)}
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Marquer comme Livrée ✅
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Overlay - Ultra Modern Mobile */}
        {showNotificationOverlay && currentOrderNotification && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Nouvelle Commande ! 🎉</h2>
                <p className="text-sm text-gray-600">Une commande vous attend</p>
              </div>

              {/* Order Details */}
              {(() => {
                const orderData = typeof currentOrderNotification.data === 'string' 
                  ? JSON.parse(currentOrderNotification.data) 
                  : currentOrderNotification.data;
                
                return (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Commande</span>
                        <span className="text-lg font-bold text-blue-600">#{orderData?.order_number}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{orderData?.client_name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{orderData?.client_phone}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Quartier : {orderData?.delivery_district || 'Pessac'}</span>
                      </div>
                      
                      {/* Waze Button */}
                      <Button
                        onClick={() => ouvrirWaze(orderData)}
                        className="w-full mt-3 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        {orderData?.waze_text || 'Waze'} 🗺️
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                        <div className="text-xl font-bold text-green-600 mb-1">
                          {orderData?.total_amount || 12000} FCFA
                        </div>
                        <p className="text-xs text-gray-600">Montant total</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-2xl p-4 text-center">
                        <div className="text-xl font-bold text-purple-600 mb-1">
                          {orderData?.delivery_cost || 2000} FCFA
                        </div>
                        <p className="text-xs text-gray-600">Frais de livraison</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Type de livraison</span>
                      </div>
                      <p className="text-sm text-gray-800 capitalize">
                        {orderData?.delivery_option === 'standard' ? 'Standard' : 
                         orderData?.delivery_option === 'express' ? 'Express' : 
                         orderData?.delivery_option || 'Standard'}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4 border-l-4 border-orange-400">
                      <p className="text-sm text-orange-800">
                        <span className="font-semibold">🏁 Compétition GPS:</span><br />
                        Le chauffeur le plus proche sera sélectionné automatiquement !
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => accepterCommande(currentOrderNotification)}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25"
                >
                  ✅ Accepter
                </Button>
                <Button
                  onClick={() => refuserCommande(currentOrderNotification)}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                >
                  ❌ Refuser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
