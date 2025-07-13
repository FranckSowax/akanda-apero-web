'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/supabase/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/use-toast';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { supabase } from '../../../lib/supabase/client';
import { 
  User, 
  Phone, 
  MapPin, 
  MessageCircle, 
  ShoppingBag, 
  LogOut, 
  Edit3, 
  Save, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
  Crown,
  Shield
} from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items_count: number;
}

interface UserProfile {
  full_name: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export default function ModernUserProfile() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // États pour le profil
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    whatsapp: '',
    address: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors du chargement du profil:', error);
        }
        
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || data.phone || '',
            address: data.address || ''
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Charger l'historique des commandes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoadingOrders(true);
        
        const { data, error } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, status, items_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Erreur lors du chargement des commandes:', error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          address: profile.address,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setIsEditing(false);
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 À bientôt !",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir WhatsApp
  const handleWhatsApp = () => {
    if (profile.whatsapp) {
      const cleanNumber = profile.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  // Obtenir l'icône de statut de commande
  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'preparing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'shipping':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  // Formater le statut de commande
  const formatOrderStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'processing': 'En préparation',
      'preparing': 'En préparation',
      'shipping': 'En livraison',
      'out_for_delivery': 'En cours de livraison',
      'delivered': 'Livrée',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading || isLoading) {
    return (
      <UserAccountLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement de votre profil...</span>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* En-tête avec informations utilisateur */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.full_name || 'Utilisateur'}
                </h1>
                <p className="text-indigo-100 flex items-center mt-1">
                  <Crown className="h-4 w-4 mr-2" />
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
        {/* Grille des sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Informations Personnelles */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Informations personnelles</CardTitle>
                    <CardDescription>Gérez vos informations de contact</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={isSaving}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email (non modifiable) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Adresse email
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 border-gray-200"
                />
                <p className="text-xs text-gray-500">Votre email est protégé et ne peut pas être modifié</p>
              </div>

              {/* Nom complet */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2 text-indigo-500" />
                  Nom complet
                </label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Votre nom complet"
                  className={isEditing ? "border-indigo-300 focus:border-indigo-500" : "bg-gray-50"}
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" />
                  Numéro de téléphone
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+33 6 12 34 56 78"
                  className={isEditing ? "border-indigo-300 focus:border-indigo-500" : "bg-gray-50"}
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                  WhatsApp
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={profile.whatsapp}
                    onChange={(e) => setProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="+33 6 12 34 56 78"
                    className={isEditing ? "border-indigo-300 focus:border-indigo-500" : "bg-gray-50"}
                  />
                  {profile.whatsapp && !isEditing && (
                    <Button
                      onClick={handleWhatsApp}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white px-3"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {profile.whatsapp ? "Cliquez sur l'icône pour ouvrir WhatsApp" : "Ajoutez votre numéro WhatsApp"}
                </p>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  Adresse de livraison
                </label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Votre adresse complète"
                  className={isEditing ? "border-indigo-300 focus:border-indigo-500" : "bg-gray-50"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section Statistiques */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Vos statistiques</CardTitle>
                  <CardDescription>Aperçu de votre activité</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-blue-600">Commandes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(0)}€
                  </div>
                  <div className="text-sm text-green-600">Total dépensé</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'completed' || o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-purple-600">Livrées</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.length > 0 ? (orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length).toFixed(0) : 0}€
                  </div>
                  <div className="text-sm text-orange-600">Panier moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Section Historique des Commandes */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Historique des commandes</CardTitle>
                  <CardDescription>Vos {orders.length} dernières commandes</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => router.push('/mon-compte/commandes')}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Chargement des commandes...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
                <Button
                  onClick={() => router.push('/produits')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Découvrir nos produits
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/mon-compte/commandes/${order.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                        {getOrderStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Commande #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {order.items_count || 1} article{(order.items_count || 1) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {order.total_amount?.toFixed(2) || '0.00'}€
                      </div>
                      <div className={`text-sm px-2 py-1 rounded-full inline-flex items-center ${
                        order.status === 'completed' || order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing' || order.status === 'preparing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'shipping'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getOrderStatusIcon(order.status)}
                        <span className="ml-1">{formatOrderStatus(order.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => router.push('/mon-compte/commandes')}
                      variant="outline"
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      Voir les {orders.length - 5} autres commandes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push('/produits')}>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Continuer mes achats</h3>
              <p className="text-blue-100 text-sm">Découvrez nos nouveaux produits</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 text-white hover:shadow-xl transition-shadow cursor-pointer"
                onClick={profile.whatsapp ? handleWhatsApp : undefined}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Support WhatsApp</h3>
              <p className="text-green-100 text-sm">
                {profile.whatsapp ? 'Contactez-nous rapidement' : 'Ajoutez votre numéro'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push('/mon-compte/commandes')}>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Mes commandes</h3>
              <p className="text-purple-100 text-sm">Suivez vos livraisons</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserAccountLayout>
  );
}
