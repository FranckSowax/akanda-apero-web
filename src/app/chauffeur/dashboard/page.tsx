'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  LogOut,
  MapPin, 
  Navigation, 
  Package, 
  Phone, 
  Truck, 
  User, 
  CheckCircle, 
  Clock,
  Euro,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  Star,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

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
}

export default function DashboardChauffeur() {
  const router = useRouter();
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [disponible, setDisponible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [chauffeurId, setChauffeurId] = useState<string | null>(null);
  const [chauffeur, setChauffeur] = useState<any>(null);

  // Initialiser chauffeurId côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setChauffeurId(localStorage.getItem('chauffeur_id'));
    }
  }, []);

  useEffect(() => {
    if (chauffeurId) {
      checkAuth();
      loadData();
      const cleanupLocation = startLocationTracking();
      
      // Polling pour notifications temps réel ET mise à jour activité
      const notificationInterval = setInterval(() => {
        loadData();
        // Mettre à jour l'activité pour rester "en ligne"
        updateHeartbeat();
      }, 3000); // Vérifier toutes les 3 secondes
      
      return () => {
        clearInterval(notificationInterval);
        if (cleanupLocation) cleanupLocation();
      };
    }
  }, [chauffeurId]);

  // Fonction pour maintenir le chauffeur "en ligne"
  const updateHeartbeat = async () => {
    try {
      if (typeof window === 'undefined') return;
      const currentChauffeurId = localStorage.getItem('chauffeur_id');
      
      await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: currentChauffeurId,
          disponible: disponible
        })
      });
    } catch (error) {
      console.error('Erreur heartbeat:', error);
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
      const chauffeurId = localStorage.getItem('chauffeur_id');
      
      // Charger les livraisons assignées
      const livraisonsResponse = await fetch(`/api/chauffeurs/livraisons?chauffeur_id=${chauffeurId}`);
      if (livraisonsResponse.ok) {
        const livraisonsData = await livraisonsResponse.json();
        setLivraisons(livraisonsData.livraisons || []);
      }

      // Charger les notifications
      const notificationsResponse = await fetch(`/api/notifications?chauffeur_id=${chauffeurId}`);
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
        
        // Afficher overlay si nouvelles notifications non lues
        const unreadNotifications = notificationsData.notifications?.filter((n: any) => !n.read) || [];
        if (unreadNotifications.length > 0) {
          setShowNotificationOverlay(true);
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      const handleLocationSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setPosition({ lat: latitude, lng: longitude });
        updateLocation(latitude, longitude);
      };

      const handleLocationError = (error: GeolocationPositionError) => {
        console.error('Erreur géolocalisation:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        // Gestion des erreurs de géolocalisation
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('Permission de géolocalisation refusée');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Position non disponible');
            break;
          case error.TIMEOUT:
            console.warn('Timeout de géolocalisation');
            break;
          default:
            console.warn('Erreur géolocalisation inconnue');
        }
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
    } else {
      console.error('Géolocalisation non supportée par ce navigateur');
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      if (typeof window === 'undefined') return;
      const currentChauffeurId = localStorage.getItem('chauffeur_id');
      
      // Mettre à jour la position GPS
      await fetch('/api/chauffeurs/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: currentChauffeurId,
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString()
        })
      });

      // Mettre à jour la dernière activité pour le statut en ligne
      await fetch('/api/chauffeurs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chauffeur_id: currentChauffeurId,
          disponible: disponible // Garder le statut actuel
        })
      });
    } catch (error) {
      console.error('Erreur mise à jour position:', error);
    }
  };

  const setupNotificationListener = () => {
    // Simulation d'écoute des notifications en temps réel
    const interval = setInterval(async () => {
      const chauffeurId = localStorage.getItem('chauffeur_id');
      try {
        const response = await fetch(`/api/chauffeurs/notifications?chauffeur_id=${chauffeurId}&unread_only=true`);
        if (response.ok) {
          const data = await response.json();
          const newNotifications = data.notifications || [];
          
          if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev]);
            setShowNotificationOverlay(true);
            
            // Vibration et son si supportés
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            playNotificationSound();
          }
        }
      } catch (error) {
        console.error('Erreur écoute notifications:', error);
      }
    }, 5000); // Vérifier toutes les 5 secondes

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
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const accepterLivraison = async (livraisonId: string) => {
    try {
      const response = await fetch('/api/chauffeurs/livraisons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livraison_id: livraisonId,
          action: 'accepter'
        })
      });

      if (response.ok) {
        await loadData();
        setShowNotificationOverlay(false);
      }
    } catch (error) {
      console.error('Erreur acceptation livraison:', error);
    }
  };

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

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
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
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
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

      {/* Overlay de notifications moderne */}
      {showNotificationOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl w-full max-w-md max-h-96 overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {notifications.filter(n => !n.read).length} non lues
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationOverlay(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Tout est calme! 🔕</h4>
                  <p className="text-gray-600">Aucune notification pour le moment</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-all duration-200 ${
                        !notification.read 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                            <p className={`font-bold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.titre}
                            </p>
                          </div>
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date().toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {notification.type === 'nouvelle_livraison' && notification.livraison_id && (
                            <div className="flex space-x-2 mt-3">
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => accepterLivraison(notification.livraison_id!)}
                              >
                                Accepter
                              </Button>
                              <Button size="sm" variant="outline">
                                Refuser
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                          <span className="text-xs text-blue-600 font-bold">NOUVEAU</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                  onClick={() => {
                    // Marquer toutes comme lues
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                >
                  ✅ Tout marquer comme lu
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
