'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { MapPin, Phone, Clock, Package, Bell, BellOff, Navigation, LogOut, CheckCircle, XCircle, User, Truck, Zap, TrendingUp, Calendar, Activity, Euro, X, Check } from 'lucide-react';
import { useChauffeurAuth } from '../../../contexts/ChauffeurAuthContext';

interface Livraison {
  id: string;
  commande_id: string;
  chauffeur_id: string | null;
  adresse_livraison: string;
  telephone_client: string;
  statut: string;
  frais_livraison: number;
  montant_livraison?: number;
  created_at: string;
  updated_at: string;
  commande?: {
    client_nom: string;
    client_telephone: string;
    total: number;
  };
}

interface Notification {
  id: string;
  chauffeur_id: string;
  message: string;
  titre?: string;
  type: string;
  read: boolean;
  created_at: string;
  livraison_id?: string;
  order_id?: string;
  order_number?: string;
  delivery_address?: string;
  customer_name?: string;
  total_amount?: number;
}

export default function DashboardChauffeur() {
  const router = useRouter();
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [currentOrderNotification, setCurrentOrderNotification] = useState<Notification | null>(null);
  const [disponible, setDisponible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [chauffeur, setChauffeur] = useState<any>(null);

  // Utiliser le contexte d'authentification chauffeur
  const { chauffeurId, chauffeurNom, isAuthenticated, loading: authLoading, clearChauffeurAuth } = useChauffeurAuth();

  useEffect(() => {
    if (chauffeurId) {
      checkAuth();
      loadData();
      const cleanupLocation = startLocationTracking();
      
      // Immédiatement marquer comme "en ligne" à la connexion
      updateHeartbeat();
      
      // Polling pour notifications temps réel ET mise à jour activité
      const notificationInterval = setInterval(() => {
        loadData();
        // Mettre à jour l'activité pour rester "en ligne"
        updateHeartbeat();
      }, 10000); // Vérifier toutes les 10 secondes (réduit la fréquence)
      
      return () => {
        clearInterval(notificationInterval);
        if (cleanupLocation) cleanupLocation();
      };
    }
  }, [chauffeurId]);

  // Fonction pour maintenir le chauffeur "en ligne"
  const updateHeartbeat = async () => {
    try {
      if (typeof window === 'undefined' || !chauffeurId) return;
      
      console.log('💓 Heartbeat - Mise à jour statut pour:', chauffeurId);

      // Validation UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(chauffeurId)) {
        console.error('ID chauffeur invalide (pas un UUID):', chauffeurId);
        clearChauffeurAuth();
        router.push('/chauffeur/connexion');
        return;
      }
      
      const response = await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: chauffeurId,
          disponible: true // Forcer à true car connecté = disponible
        })
      });

      if (response.ok) {
        console.log('✅ Heartbeat - Statut mis à jour: en_ligne');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur mise à jour heartbeat:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Erreur heartbeat:', error);
    }
  };


  const checkAuth = async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('chauffeur_token');
    if (!token) {
      router.push('/chauffeur/connexion');
      return;
    }

    try {
      const response = await fetch('/api/chauffeurs/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token })
      });

      const data = await response.json();
      if (data.success) {
        setChauffeur(data.chauffeur);
        setDisponible(data.chauffeur.disponible);
      } else {
        localStorage.clear();
        router.push('/chauffeur/connexion');
      }
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/chauffeur/connexion');
    }
  };

  const loadData = async () => {
    try {
      if (!chauffeurId) return;
      
      // Charger les livraisons assignées
      const livraisonsResponse = await fetch(`/api/chauffeurs/livraisons?chauffeur_id=${chauffeurId}`);
      if (livraisonsResponse.ok) {
        const livraisonsData = await livraisonsResponse.json();
        setLivraisons(livraisonsData.livraisons || []);
      }

      // Charger les notifications
      try {
        const notificationsResponse = await fetch(`/api/notifications?chauffeur_id=${chauffeurId}`);
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData.notifications || []);
          
          // Afficher overlay si nouvelles notifications de commande
          const unreadNotifications = notificationsData.notifications?.filter((n: any) => !n.read) || [];
          const orderNotifications = unreadNotifications.filter((n: any) => n.type === 'nouvelle_commande');
          
          if (orderNotifications.length > 0 && !currentOrderNotification) {
            setCurrentOrderNotification(orderNotifications[0]);
          }
          
          if (unreadNotifications.length > 0) {
            setShowNotificationOverlay(true);
          }
        } else {
          console.warn('⚠️ Erreur chargement notifications:', notificationsResponse.status);
          setNotifications([]);
        }
      } catch (notificationError) {
        console.error('❌ Erreur notifications:', notificationError);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non supportée par ce navigateur');
      return;
    }

    const handleLocationSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      console.log('Position mise à jour:', { latitude, longitude });
      
      setPosition({ lat: latitude, lng: longitude });
      updateLocation(latitude, longitude);
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      // Réduire le niveau de log pour éviter le spam
      console.warn('Géolocalisation indisponible:', {
        code: error.code,
        message: error.message
      });
      
      // Continuer sans géolocalisation - ne pas bloquer l'app
      // Le chauffeur peut toujours recevoir des notifications
    };

    const locationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    // Position initiale
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      locationOptions
    );

    // Mise à jour périodique de la position
    const locationInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        locationOptions
      );
    }, 30000); // Toutes les 30 secondes

    // Nettoyer l'interval au démontage du composant
    return () => clearInterval(locationInterval);
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      if (typeof window === 'undefined' || !chauffeurId) return;
      
      // Mettre à jour la position GPS
      await fetch('/api/chauffeurs/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: chauffeurId,
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString()
        })
      });

      // Mettre à jour l'état local
      setPosition({ lat, lng });
      
      // Mettre à jour le heartbeat avec la position
      await fetch('/api/chauffeurs/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: chauffeurId,
          disponible: true // Connecté = disponible
        })
      });
    } catch (error) {
      console.error('Erreur mise à jour position:', error);
    }
  };

  const setupNotificationListener = () => {
    let errorCount = 0;
    const maxErrors = 3;
    
    // Simulation d'écoute des notifications en temps réel
    const interval = setInterval(async () => {
      const chauffeurId = localStorage.getItem('chauffeur_id');
      
      // Arrêter le polling si trop d'erreurs consécutives
      if (errorCount >= maxErrors) {
        console.warn('⚠️ Arrêt du polling notifications après', maxErrors, 'erreurs consécutives');
        clearInterval(interval);
        return;
      }
      
      try {
        const response = await fetch(`/api/notifications?chauffeur_id=${chauffeurId}`);
        if (response.ok) {
          const data = await response.json();
          const allNotifications = data.notifications || [];
          const newNotifications = allNotifications.filter((n: any) => !n.read);
          
          if (newNotifications.length > 0) {
            setNotifications(prev => {
              // Éviter les doublons
              const existingIds = prev.map(n => n.id);
              const uniqueNew = newNotifications.filter((n: any) => !existingIds.includes(n.id));
              return [...uniqueNew, ...prev];
            });
            setShowNotificationOverlay(true);
            
            // Vibration et son si supportés
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            playNotificationSound();
          }
          
          // Reset error count on success
          errorCount = 0;
        } else {
          errorCount++;
          console.warn(`⚠️ Erreur polling notifications (${errorCount}/${maxErrors}):`, response.status);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur écoute notifications (${errorCount}/${maxErrors}):`, error);
      }
    }, 10000); // Vérifier toutes les 10 secondes (moins agressif)

    return () => clearInterval(interval);
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.log('Son non joué:', e));
    } catch (error) {
      console.error('Erreur son:', error);
    }
  };

  const toggleDisponibilite = async () => {
    try {
      if (typeof window === 'undefined') return;
      const currentChauffeurId = localStorage.getItem('chauffeur_id');
      
      if (!currentChauffeurId) {
        console.warn('Pas de chauffeur_id pour changer disponibilité');
        return;
      }

      // Validation UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(currentChauffeurId)) {
        console.error('ID chauffeur invalide pour changement disponibilité:', currentChauffeurId);
        window.location.href = '/chauffeur/connexion';
        return;
      }
      
      const newStatus = !disponible;
      
      const response = await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: currentChauffeurId,
          disponible: newStatus
        })
      });

      if (response.ok) {
        setDisponible(newStatus);
      } else {
        const errorText = await response.text();
        console.error('Erreur changement disponibilité:', response.status, errorText);
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  // Générer un code de livraison unique (5 caractères alphanumériques)
  const generateDeliveryCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const accepterCommande = async (notification: Notification) => {
    try {
      const deliveryCode = generateDeliveryCode();
      
      // Mettre à jour la commande avec le chauffeur assigné et le code
      const response = await fetch('/api/mcp/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          resource: 'orders',
          params: { id: notification.order_id },
          data: {
            assigned_driver_id: chauffeurId,
            assigned_driver_name: chauffeur?.nom,
            delivery_code: deliveryCode
          }
        })
      });

      if (response.ok) {
        console.log('✅ Commande acceptée avec code:', deliveryCode);
        setCurrentOrderNotification(null);
        await loadData();
      }
    } catch (error) {
      console.error('Erreur acceptation commande:', error);
    }
  };

  const refuserCommande = async (notification: Notification) => {
    try {
      // Marquer la notification comme lue
      await marquerNotificationLue(notification.id);
      setCurrentOrderNotification(null);
    } catch (error) {
      console.error('Erreur refus commande:', error);
    }
  };

  const marquerNotificationLue = async (notificationId: string) => {
    try {
      const response = await fetch('/api/chauffeurs/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
          read: true
        })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      } else {
        console.warn('⚠️ Erreur marquage notification lue:', response.status);
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const logout = async () => {
    console.log('🚪 Déconnexion chauffeur en cours...');
    
    // Mettre le statut à hors_ligne avant de se déconnecter
    try {
      if (chauffeurId) {
        console.log('🔄 Mise à jour statut hors_ligne pour:', chauffeurId);
        
        // Essayer d'abord l'API status
        const statusResponse = await fetch('/api/chauffeurs/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chauffeur_id: chauffeurId,
            disponible: false
          })
        });

        if (!statusResponse.ok) {
          console.warn('⚠️ API status failed, trying direct Supabase...');
          
          // Fallback vers Supabase direct
          const directResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${chauffeurId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              disponible: false,
              statut: 'hors_ligne',
              derniere_activite: new Date().toISOString()
            })
          });

          if (directResponse.ok) {
            console.log('✅ Statut mis à jour via Supabase direct');
          } else {
            console.error('❌ Échec mise à jour statut via Supabase direct');
          }
        } else {
          console.log('✅ Statut mis à jour via API');
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour statut logout:', error);
    }
    
    // Utiliser le contexte pour nettoyer l'authentification
    clearChauffeurAuth();
    router.push('/chauffeur/connexion');
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'acceptee': { color: 'bg-blue-100 text-blue-800', label: 'Acceptée' },
      'en_cours': { color: 'bg-orange-100 text-orange-800', label: 'En cours' },
      'livree': { color: 'bg-green-100 text-green-800', label: 'Livrée' },
      'annulee': { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_attente;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Calculs des statistiques financières
  const livraisonsCompletes = livraisons.filter(l => l.statut === 'livree');
  const totalGains = livraisonsCompletes.reduce((sum, l) => sum + (l.frais_livraison || 5), 0);
  const moyenneParLivraison = livraisonsCompletes.length > 0 ? totalGains / livraisonsCompletes.length : 0;
  const livraisonsAujourdhui = livraisons.filter(l => 
    new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header moderne avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Salut {chauffeur?.nom}! 👋</h1>
              <p className="text-blue-100 text-sm flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Chauffeur Akanda Apéro
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNotificationOverlay(true)}
              className="relative p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => {
                // Test overlay - simuler une nouvelle commande
                const testNotification = {
                  id: 'test-' + Date.now(),
                  type: 'nouvelle_commande',
                  order_number: 'TEST-001',
                  customer_name: 'Client Test',
                  delivery_address: '123 Rue Test, Libreville',
                  total_amount: 25000,
                  message: 'Nouvelle commande prête pour livraison',
                  created_at: new Date().toISOString()
                };
                setCurrentOrderNotification(testNotification);
                setShowNotificationOverlay(true);
              }}
              className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              title="Test Overlay"
            >
              <Bell className="w-5 h-5" />
            </button>
            
            <button
              onClick={logout}
              className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statut disponibilité moderne */}
      <div className="p-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full ${disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-lg`}></div>
                <div>
                  <span className="font-bold text-lg">
                    {disponible ? '🟢 En ligne' : '🔴 Hors ligne'}
                  </span>
                  <p className="text-sm text-gray-600">
                    {disponible ? 'Prêt à recevoir des livraisons' : 'Connectez-vous pour recevoir des missions'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={toggleDisponibilite}
                className={`${disponible 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
                } text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                {disponible ? '🛑 Se déconnecter' : '🚀 Se connecter'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques modernes avec icônes */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">{livraisons.length}</span>
              </div>
              <p className="text-blue-100 font-medium">Total livraisons</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">{livraisonsCompletes.length}</span>
              </div>
              <p className="text-green-100 font-medium">Complétées</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gains et performance */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold">{(totalGains * 656).toFixed(0)} <span className="text-lg">FCFA</span></span>
              </div>
              <p className="text-purple-100 font-medium">Gains totaux</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">{(moyenneParLivraison * 656).toFixed(0)} <span className="text-lg">FCFA</span></span>
              </div>
              <p className="text-orange-100 font-medium">Moy. / livraison</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance du jour */}
      <div className="px-4 pb-4">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Nouvelle livraison</h4>
                  <p className="text-indigo-100">{livraisonsAujourdhui} livraison(s) assignée(s)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{(livraisonsAujourdhui * 5 * 656).toFixed(0)} <span className="text-base">FCFA</span></p>
                <p className="text-indigo-100 text-sm">Potentiel gains</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position actuelle moderne */}
      {position && (
        <div className="px-4 pb-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">📍 Ma position</p>
                  <p className="text-sm text-gray-600">
                    {position?.lat?.toFixed(4) || 'N/A'}, {position?.lng?.toFixed(4) || 'N/A'}
                  </p>
                  <p className="text-xs text-green-600 font-medium">✅ Géolocalisation active</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des livraisons moderne */}
      <div className="px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Mes missions
          </h2>
          <Badge className="bg-blue-100 text-blue-800 font-bold">
            {livraisons.filter(l => l.statut !== 'livree' && l.statut !== 'annulee').length} actives
          </Badge>
        </div>
        
        {livraisons.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune mission active</h3>
              <p className="text-gray-600 mb-4">
                {disponible ? 'Restez connecté, de nouvelles missions arrivent bientôt! 🚀' : 'Activez votre disponibilité pour recevoir des missions 📱'}
              </p>
              {!disponible && (
                <Button 
                  onClick={toggleDisponibilite}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl"
                >
                  🚀 Me connecter maintenant
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {livraisons.map((livraison) => (
              <Card key={livraison.id} className="border-0 shadow-lg bg-white/90 backdrop-blur border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-gray-600">Client: {livraison.commande?.client_nom || 'N/A'}</p>
                      </div>
                      <div className="flex items-start space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <p className="text-gray-700">{livraison.adresse_livraison}</p>
                      </div>
                      {livraison.montant_livraison && (
                        <div className="flex items-center space-x-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <p className="text-green-700 font-bold">
                            {(livraison.montant_livraison * 656).toFixed(0)} <span className="text-sm">FCFA</span> 
                            <span className="text-sm text-gray-500">+ {livraison.frais_livraison || 5} FCFA livraison</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {getStatusBadge(livraison.statut)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                        <Phone className="w-4 h-4" />
                        <span className="font-semibold">{livraison.commande?.total || 0} FCFA</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(livraison.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      GPS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Overlay de notification pour nouvelle commande */}
      {currentOrderNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-pulse-slow">
            {/* Header avec icône */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                <Truck className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Nouvelle Commande</h3>
              <p className="text-orange-100 text-sm">Une commande vous attend !</p>
            </div>

            {/* Contenu de la commande */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  #{currentOrderNotification.order_number || 'N/A'}
                </p>
                <p className="text-gray-600">
                  {currentOrderNotification.customer_name || 'Client'}
                </p>
              </div>

              {currentOrderNotification.delivery_address && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700 font-medium">
                      {currentOrderNotification.delivery_address}
                    </p>
                  </div>
                </div>
              )}

              {currentOrderNotification.total_amount && (
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {currentOrderNotification.total_amount.toFixed(2)} €
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  {currentOrderNotification.message}
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="p-4 bg-gray-50 flex space-x-3">
              <button
                onClick={() => refuserCommande(currentOrderNotification)}
                className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Refuser</span>
              </button>
              <button
                onClick={() => accepterCommande(currentOrderNotification)}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Accepter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de notification général */}
      {showNotificationOverlay && !currentOrderNotification && notifications.filter(n => !n.read).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Nouvelles notifications</h3>
            <div className="space-y-3">
              {notifications.filter(n => !n.read && n.type !== 'nouvelle_commande').map((notification) => (
                <div key={notification.id} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {notification.titre && (
                        <h4 className="font-medium text-gray-800 mb-1">{notification.titre}</h4>
                      )}
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowNotificationOverlay(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
