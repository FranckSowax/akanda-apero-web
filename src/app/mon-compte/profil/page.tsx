'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Edit3, 
  Save, 
  Package,
  Star,
  Crown
} from 'lucide-react';

interface UserProfile {
  full_name: string;
  phone: string;
  whatsapp: string;
  address: string;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items_count: number;
}

export default function UserProfilePage() {
  console.log('🚀 UserProfilePage - Composant initialisé');
  
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    whatsapp: '',
    address: ''
  });
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('📊 UserProfilePage - État initial:', { 
    hasCurrentUser: !!currentUser,
    currentUserEmail: currentUser?.email,
    ordersCount: recentOrders.length,
    loadingOrders
  });

  // Récupérer l'utilisateur actuel depuis Supabase
  useEffect(() => {
    console.log('🔄 UserProfilePage - useEffect getCurrentUser déclenché');
    
    const getCurrentUser = async () => {
      try {
        console.log('🔍 UserProfilePage - Récupération de la session Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('📊 UserProfilePage - Session récupérée:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        
        if (session && session.user) {
          console.log('✅ UserProfilePage - Utilisateur défini:', session.user.email);
          setCurrentUser(session.user);
        } else {
          console.log('❌ UserProfilePage - Aucune session utilisateur trouvée');
          router.push('/auth?redirect_to=/mon-compte/profil');
        }
      } catch (error) {
        console.error('❌ UserProfilePage - Erreur lors de la récupération de l\'utilisateur:', error);
        router.push('/auth?redirect_to=/mon-compte/profil');
      } finally {
        setIsLoading(false);
      }
    };
    
    getCurrentUser();
  }, [router]);

  // Chargement du profil utilisateur et des commandes
  useEffect(() => {
    if (currentUser) {
      console.log('🔄 UserProfilePage - Chargement des données pour:', currentUser.email);
      loadUserProfile();
      loadRecentOrders();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', currentUser.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement du profil:', error);
        return;
      }

      if (data) {
        // Reconstituer le nom complet à partir de first_name et last_name
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
        
        console.log('📝 Profil chargé:', {
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: fullName,
          phone: data.phone
        });
        
        setProfile({
          full_name: fullName,
          phone: data.phone || '',
          whatsapp: '', // Champ non disponible dans la DB
          address: ''  // Champ non disponible dans la DB
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadRecentOrders = async () => {
    console.log('🔄 UserProfilePage - loadRecentOrders appelé, currentUser:', !!currentUser, currentUser?.email);
    
    if (!currentUser) {
      console.log('⏳ UserProfilePage - Pas d\'utilisateur, arrêt du chargement');
      return;
    }
    
    try {
      setLoadingOrders(true);
      console.log('🔍 UserProfilePage - Recherche du customer_id pour:', currentUser.email);
      
      // D'abord récupérer le customer_id
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (customerError) {
        // Si l'utilisateur n'existe pas encore dans la table customers (PGRST116 = no rows returned)
        if (customerError.code === 'PGRST116') {
          console.log('📄 UserProfilePage - Utilisateur pas encore dans la table customers, aucune commande à afficher');
          setRecentOrders([]);
          return;
        }
        console.error('❌ UserProfilePage - Erreur lors de la récupération du customer_id:', customerError);
        return;
      }
      
      if (!customerData) {
        console.log('📄 UserProfilePage - Aucun customer trouvé, aucune commande à afficher');
        setRecentOrders([]);
        return;
      }
      
      console.log('👤 UserProfilePage - Customer ID trouvé:', customerData.id);

      // Ensuite récupérer les commandes avec les items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items(id)
        `)
        .eq('customer_id', customerData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('📦 UserProfilePage - Commandes récupérées:', data ? data.length : 0);
      console.log('📊 UserProfilePage - Données brutes des commandes:', data);

      if (error) {
        console.error('❌ UserProfilePage - Erreur lors du chargement des commandes:', error);
        return;
      }

      // Transformer les données pour inclure items_count
      const transformedData = data?.map(order => ({
        id: order.id,
        created_at: order.created_at,
        total_amount: order.total_amount,
        status: order.status,
        items_count: Array.isArray(order.order_items) ? order.order_items.length : 0
      })) || [];

      console.log('✅ UserProfilePage - Commandes transformées:', transformedData.length);
      console.log('📋 UserProfilePage - Détail des commandes transformées:', transformedData);
      setRecentOrders(transformedData);
    } catch (error) {
      console.error('❌ UserProfilePage - Erreur:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      // Séparer le nom complet en prénom et nom
      const nameParts = profile.full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('💾 Sauvegarde profil:', {
        email: currentUser.email,
        first_name: firstName,
        last_name: lastName,
        phone: profile.phone
      });
      
      const { error } = await supabase
        .from('customers')
        .upsert({
          email: currentUser.email,
          first_name: firstName,
          last_name: lastName,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (profile.whatsapp) {
      const message = encodeURIComponent("Bonjour, j'ai besoin d'aide concernant ma commande sur Akanda Apéro.");
      window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const formatOrderStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Nouvelle': 'Nouvelle',
      'Confirmée': 'Confirmée',
      'En préparation': 'En préparation',
      'Prête': 'Prête',
      'En livraison': 'En livraison',
      'Livrée': 'Livrée',
      'Annulée': 'Annulée'
    };
    return statusMap[status] || status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' XAF';
  };

  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <UserAccountLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </UserAccountLayout>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <UserAccountLayout>
      <div className="space-y-8">
        {/* En-tête du profil */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile.full_name || 'Utilisateur'}
              </h1>
              <p className="text-green-100">{currentUser.email}</p>
              <div className="flex items-center mt-2">
                <Crown className="h-4 w-4 mr-1" />
                <span className="text-sm">Membre depuis {new Date(currentUser.created_at || '').toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Gérez vos informations de profil et de contact
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+241 XX XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <Input
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+241 XX XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Votre adresse de livraison"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Commandes récentes
            </CardTitle>
            <CardDescription>
              Vos 5 dernières commandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des commandes...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aucune commande trouvée</p>
                <Button onClick={() => router.push('/products')}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Commencer mes achats
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Commande #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Livrée' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'En livraison'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/mon-compte/commandes')}
                  >
                    Voir toutes mes commandes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push('/products')}>
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
                {profile.whatsapp ? 'Contactez-nous' : 'Ajoutez votre WhatsApp'}
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
