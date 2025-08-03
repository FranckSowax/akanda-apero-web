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
        // Rechercher le client connecté par email ou téléphone
        console.log('🔍 Recherche du client pour email:', currentUser.email);
        
        let customerData = null;
        
        // Méthode 1: Recherche par email exact
        const { data: exactCustomer, error: exactError } = await supabase
          .from('customers')
          .select('id, email, phone, first_name, last_name')
          .eq('email', currentUser.email)
          .single();
          
        if (!exactError && exactCustomer) {
          customerData = exactCustomer;
          console.log('✅ Client trouvé par email exact:', customerData);
        } else {
          console.log('⚠️ Client non trouvé par email exact, recherche par téléphone...');
          
          // Méthode 2: Extraire le téléphone de l'email et rechercher
          const phoneFromEmail = currentUser.email.split('@')[0];
          console.log('📞 Téléphone extrait:', phoneFromEmail);
          
          // Rechercher par téléphone (avec ou sans indicatif)
          const { data: phoneCustomers, error: phoneError } = await supabase
            .from('customers')
            .select('id, email, phone, first_name, last_name')
            .or(`phone.eq.${phoneFromEmail},phone.eq.+241${phoneFromEmail},email.ilike.%${phoneFromEmail}%`);
            
          if (!phoneError && phoneCustomers && phoneCustomers.length > 0) {
            customerData = phoneCustomers[0]; // Prendre le premier trouvé
            console.log('✅ Client trouvé par téléphone:', customerData);
          } else {
            console.log('⚠️ Aucun client trouvé, recherche dans tous les clients...');
            
            // Méthode 3: Recherche élargie dans tous les clients
            const { data: allCustomers, error: allError } = await supabase
              .from('customers')
              .select('id, email, phone, first_name, last_name')
              .limit(50);
              
            if (!allError && allCustomers) {
              // Chercher une correspondance
              const foundCustomer = allCustomers.find((customer: any) => {
                const userEmail = currentUser.email.toLowerCase();
                const customerEmail = customer.email?.toLowerCase() || '';
                const userPhone = phoneFromEmail;
                const customerPhone = customer.phone?.replace(/[^0-9]/g, '') || '';
                
                return customerEmail === userEmail || 
                       customerEmail.includes(userPhone) ||
                       customerPhone.includes(userPhone) ||
                       userEmail.includes(customerPhone);
              });
              
              if (foundCustomer) {
                customerData = foundCustomer;
                console.log('✅ Client trouvé par recherche élargie:', customerData);
              }
            }
          }
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
            delivery_address,
            delivery_district,
            delivery_option,
            payment_method,
            gps_latitude,
            gps_longitude,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              unit_price,
              subtotal
            )
          `)
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });
          
        console.log('📦 Commandes récupérées pour', currentUser.email, ':', data ? data.length : 0);
        console.log('📊 Données brutes des commandes:', data);
        
        if (error) {
          console.error('❌ Erreur lors de la récupération des commandes:');
          console.error('Code d\'erreur:', error.code);
          console.error('Message:', error.message);
          console.error('Détails:', error.details);
          console.error('Hint:', error.hint);
          console.error('Erreur complète:', error);
          setOrders([]);
        } else {
          // Transformer les données pour correspondre à notre interface (logique améliorée)
          const transformedOrders: Order[] = (data || []).map((order: any) => ({
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            status: order.status,
            total_amount: order.total_amount,
            delivery_option: order.delivery_option || order.delivery_district || 'Livraison',
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            subtotal: order.subtotal,
            delivery_fee: 0, // Valeur par défaut car la colonne n'existe pas
            delivery_address: order.delivery_address,
            gps_latitude: order.gps_latitude,
            gps_longitude: order.gps_longitude,
            items: (order.order_items || []).map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.unit_price,
              product: {
                id: item.product_id,
                name: item.product_name || 'Produit',
                price: item.unit_price,
                image_url: '/placeholder-product.jpg' // Valeur par défaut
              }
            }))
          }));
          
          console.log('✅ Commandes transformées:', transformedOrders.length);
          console.log('📋 Détail des commandes transformées:', transformedOrders);
          setOrders(transformedOrders);
        }
      } catch (error: any) {
        console.error('❌ Erreur globale lors de la récupération des commandes:');
        console.error('Type d\'erreur:', typeof error);
        console.error('Message:', error?.message || 'Pas de message');
        console.error('Stack:', error?.stack || 'Pas de stack trace');
        console.error('Erreur complète:', error);
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
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4">
                  {/* Ligne 1: Informations principales */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <button
                          onClick={() => router.push(`/mon-compte/commandes/${order.id}`)}
                          className="text-lg font-bold text-[#f5a623] hover:text-[#e09000] hover:underline transition-colors"
                        >
                          #{order.order_number || order.id.slice(0, 8)}
                        </button>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm`}>
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                  
                  {/* Ligne 2: Détails des produits et actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                      </div>
                      {order.delivery_address && (
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{order.delivery_address}</span>
                        </div>
                      )}
                      {order.payment_method && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <span>{order.payment_method}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/mon-compte/commandes/${order.id}`)}
                        className="flex items-center gap-1 border-gray-300 hover:border-[#f5a623] hover:text-[#f5a623]"
                      >
                        <Eye className="h-3 w-3" />
                        Détails
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order.id}
                        className="flex items-center gap-1 bg-[#f5a623] hover:bg-[#e09000] text-white"
                      >
                        {reorderingId === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span className="hidden sm:inline">Ajout...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3 w-3" />
                            <span className="hidden sm:inline">Recommander</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Aperçu des produits (optionnel, affiché seulement si peu d'articles) */}
                  {order.items.length <= 3 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-xs bg-gray-50 px-2 py-1 rounded">
                            {item.quantity}x {item.product?.name || 'Produit'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserAccountLayout>
  );
}
