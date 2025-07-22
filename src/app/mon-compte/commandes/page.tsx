'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { supabase } from '../../../lib/supabase/client';
import { formatPrice } from '../../../lib/utils';
import { useAppContext } from '../../../context/AppContext';
import { 
  ShoppingCart, 
  Package, 
  Calendar, 
  RotateCcw, 
  Eye,
  Heart,
  Star,
  Truck
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  delivery_option?: string;
  payment_method?: string;
  payment_status?: string;
  subtotal?: number;
  delivery_fee?: number;
  delivery_address?: string;
}

export default function OrdersPage() {
  console.log('🚀 OrdersPage - Composant initialisé');
  
  const router = useRouter();
  const { addToCart } = useAppContext();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  console.log('📊 OrdersPage - État initial:', { 
    ordersCount: orders.length, 
    isLoading, 
    hasCurrentUser: !!currentUser,
    currentUserEmail: currentUser?.email 
  });
  
  // Récupérer l'utilisateur actuel depuis Supabase
  useEffect(() => {
    console.log('🔄 OrdersPage - useEffect getCurrentUser déclenché');
    
    const getCurrentUser = async () => {
      try {
        console.log('🔍 OrdersPage - Récupération de la session Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('📊 OrdersPage - Session récupérée:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        
        if (session?.user) {
          console.log('✅ OrdersPage - Utilisateur défini:', session.user.email);
          setCurrentUser(session.user);
        } else {
          console.log('❌ OrdersPage - Aucune session utilisateur trouvée');
        }
      } catch (error) {
        console.error('❌ OrdersPage - Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    
    getCurrentUser();
  }, []);
  
  // Charger les commandes
  useEffect(() => {
    const fetchOrders = async () => {
      console.log('🔄 fetchOrders appelé, currentUser:', !!currentUser, currentUser?.email);
      
      if (!currentUser) {
        console.log('⏳ Pas d\'utilisateur connecté, attente...');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      console.log('🔍 Recherche des commandes pour:', currentUser.email);
      
      try {
        // D'abord, récupérer l'ID du customer basé sur l'email
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('email', currentUser.email)
          .single();

        if (customerError) {
          // Si l'utilisateur n'existe pas encore dans la table customers (PGRST116 = no rows returned)
          if (customerError.code === 'PGRST116') {
            console.log('📄 Utilisateur pas encore dans la table customers, aucune commande à afficher');
            setOrders([]);
            setIsLoading(false);
            return;
          }
          console.error('❌ Erreur lors de la récupération du customer:', customerError);
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        if (!customerData) {
          console.log('📄 Aucun customer trouvé, aucune commande à afficher');
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        console.log('👤 Customer ID trouvé pour les commandes:', customerData.id);

        // Récupérer les commandes avec les détails des produits (requête optimisée)
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            created_at,
            status,
            payment_status,
            total_amount,
            subtotal,
            delivery_fee,
            delivery_address,
            delivery_district,
            delivery_option,
            payment_method,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              unit_price,
              subtotal,
              image_url
            )
          `)
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });
          
        console.log('📦 Commandes récupérées pour', currentUser.email, ':', data ? data.length : 0);
        console.log('📊 Données brutes des commandes:', data);
        
        if (error) {
          console.error('❌ Erreur lors de la récupération des commandes:', error);
          setOrders([]);
        } else {
          // Transformer les données pour correspondre à notre interface (logique améliorée)
          const transformedOrders: Order[] = (data || []).map(order => ({
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at, // Utiliser created_at correct
            status: order.status,
            total_amount: order.total_amount,
            delivery_option: order.delivery_option || order.delivery_district || 'Livraison',
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            subtotal: order.subtotal,
            delivery_fee: order.delivery_fee,
            delivery_address: order.delivery_address,
            items: (order.order_items || []).map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.unit_price, // Mapper unit_price vers price
              product: {
                id: item.product_id,
                name: item.product_name || 'Produit',
                price: item.unit_price,
                image_url: item.image_url || '/placeholder-product.jpg'
              }
            }))
          }));
          
          console.log('✅ Commandes transformées:', transformedOrders.length);
          console.log('📋 Détail des commandes transformées:', transformedOrders);
          setOrders(transformedOrders);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]); // ✅ Correction: dépendre de currentUser au lieu de router
  
  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Nouvelle': 'bg-blue-100 text-blue-800',
      'Confirmée': 'bg-green-100 text-green-800',
      'En préparation': 'bg-yellow-100 text-yellow-800',
      'Prête': 'bg-purple-100 text-purple-800',
      'En livraison': 'bg-indigo-100 text-indigo-800',
      'Livrée': 'bg-green-100 text-green-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Nouvelle': return <Package className="h-4 w-4" />;
      case 'Confirmée': return <Star className="h-4 w-4" />;
      case 'En préparation': return <Calendar className="h-4 w-4" />;
      case 'Prête': return <Heart className="h-4 w-4" />;
      case 'En livraison': return <Truck className="h-4 w-4" />;
      case 'Livrée': return <Star className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    
    try {
      // Logique de recommande complète implémentée
      if (order.items && order.items.length > 0) {
        // Ajouter chaque produit de la commande au panier
        for (const item of order.items) {
          if (item.product) {
            const productToAdd = {
              id: parseInt(item.product.id),
              name: item.product.name,
              price: item.product.price,
              image_url: item.product.image_url || '',
              category: 'aperos', // Valeur par défaut
              description: '',
              stock_quantity: 999, // Assumé disponible
              is_featured: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Utiliser le contexte du panier pour ajouter le produit
            if (typeof window !== 'undefined' && (window as any).addToCart) {
              (window as any).addToCart(productToAdd, item.quantity);
            } else {
              // Fallback: ajouter au localStorage
              const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
              const existingItemIndex = existingCart.findIndex((cartItem: any) => cartItem.id === productToAdd.id);
              
              if (existingItemIndex > -1) {
                existingCart[existingItemIndex].quantity += item.quantity;
              } else {
                existingCart.push({ ...productToAdd, quantity: item.quantity });
              }
              
              localStorage.setItem('cart', JSON.stringify(existingCart));
            }
          }
        }
        
        toast({
          title: "✨ Commande ajoutée au panier !",
          description: `${order.items.length} produit(s) de la commande #${order.order_number} ajouté(s) au panier.`
        });
      } else {
        toast({
          title: "⚠️ Commande vide",
          description: "Cette commande ne contient aucun produit à ajouter.",
          variant: "destructive"
        });
      }
      
      // Rediriger vers le panier après un court délai
      setTimeout(() => {
        router.push('/cart');
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la recommande:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de l'ajout au panier.",
        variant: "destructive"
      });
    } finally {
      setReorderingId(null);
    }
  };
  
  if (isLoading) {
    return (
      <UserAccountLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623] mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
      </UserAccountLayout>
    );
  }
  
  return (
    <UserAccountLayout>
      <div className="space-y-6">
        {/* En-tête avec style friendly */}
        <div className="bg-gradient-to-r from-[#f5a623] to-[#e09000] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Mes Commandes</h1>
          </div>
          <p className="text-orange-100">Retrouvez l'historique de toutes vos commandes et recommandez facilement vos favoris !</p>
        </div>
        
        {orders.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande pour le moment</h3>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande. Découvrez nos délicieux produits !</p>
                <Button 
                  onClick={() => router.push('/products')}
                  className="bg-[#f5a623] hover:bg-[#e09000] text-white px-6 py-2"
                >
                  Découvrir nos produits
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          Commande #{order.order_number || order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} px-4 py-2 font-medium`}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {/* Informations détaillées de la commande */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                    </div>
                    {order.subtotal && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Sous-total</p>
                        <p className="text-md font-semibold text-gray-700">{formatPrice(order.subtotal)}</p>
                      </div>
                    )}
                    {order.delivery_fee && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Livraison</p>
                        <p className="text-md font-semibold text-gray-700">{formatPrice(order.delivery_fee)}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Informations de paiement et livraison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {order.payment_method && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Paiement:</span>
                        <span className="text-sm font-medium">{order.payment_method}</span>
                        {order.payment_status && (
                          <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
                          </Badge>
                        )}
                      </div>
                    )}
                    {order.delivery_address && (
                      <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <Truck className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-600">Livraison:</span>
                          <p className="text-sm font-medium text-gray-800">{order.delivery_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {/* Résumé de la commande */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Articles</p>
                        <p className="text-xl font-bold text-blue-600">{order.items.length}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-green-600">{formatPrice(order.total_amount)} XAF</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <Truck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Livraison</p>
                        <p className="text-sm font-medium text-purple-600">
                          {order.delivery_option === 'pickup' ? 'Retrait au Shop' : 'Livraison'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/mon-compte/commandes/${order.id}`)}
                        className="flex items-center gap-2 border-gray-300 hover:border-[#f5a623] hover:text-[#f5a623]"
                      >
                        <Eye className="h-4 w-4" />
                        Voir les détails
                      </Button>
                      
                      <Button
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order.id}
                        className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#e09000] text-white"
                      >
                        {reorderingId === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Ajout en cours...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            Recommander
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserAccountLayout>
  );
}
