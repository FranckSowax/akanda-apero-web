'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import UserAccountLayout from '../../../../components/layout/UserAccountLayout';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  Star,
  Heart,
  Eye,
  RotateCcw,
  ShoppingCart,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Types
interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  name?: string;
  price?: number;
  product?: {
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
  updated_at: string;
  status: string;
  total_amount: number;
  subtotal: number;
  delivery_fee?: number;
  items: OrderItem[];
  delivery_option?: string;
  delivery_address?: string;
  delivery_district?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  payment_method?: string;
  payment_status?: string;
  customer_id: string;
  customer?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    full_name: string;
  };
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Récupération des détails de la commande:', orderId);

        // Récupérer la commande avec ses articles et informations client
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              unit_price,
              subtotal
            ),
            customers (
              id,
              email,
              first_name,
              last_name,
              phone,
              full_name
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError) {
          console.error('❌ Erreur lors de la récupération de la commande:', orderError);
          setError('Commande non trouvée');
          return;
        }

        if (!orderData) {
          setError('Commande non trouvée');
          return;
        }

        // Transformer les données pour correspondre à notre interface
        const transformedOrder: Order = {
          id: orderData.id,
          order_number: orderData.order_number,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          status: orderData.status,
          total_amount: parseFloat(orderData.total_amount),
          subtotal: parseFloat(orderData.subtotal || orderData.total_amount),
          delivery_fee: orderData.delivery_fee ? parseFloat(orderData.delivery_fee) : undefined,
          delivery_option: orderData.delivery_option,
          delivery_address: orderData.delivery_address,
          delivery_district: orderData.delivery_district,
          gps_latitude: orderData.gps_latitude,
          gps_longitude: orderData.gps_longitude,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          customer_id: orderData.customer_id,
          customer: orderData.customers,
          items: (orderData.order_items || []).map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            subtotal: parseFloat(item.subtotal),
            name: item.product_name,
            price: parseFloat(item.unit_price),
            product: {
              id: item.product_id || item.id,
              name: item.product_name,
              price: parseFloat(item.unit_price),
              image_url: '/placeholder-product.jpg'
            }
          }))
        };

        console.log('✅ Commande récupérée:', transformedOrder);
        setOrder(transformedOrder);

      } catch (error: any) {
        console.error('❌ Erreur lors de la récupération des détails:', error);
        setError('Erreur lors du chargement des détails');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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
      case 'Nouvelle': return <Package className="h-5 w-5" />;
      case 'Confirmée': return <Star className="h-5 w-5" />;
      case 'En préparation': return <Clock className="h-5 w-5" />;
      case 'Prête': return <Heart className="h-5 w-5" />;
      case 'En livraison': return <Truck className="h-5 w-5" />;
      case 'Livrée': return <Star className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
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

  const handleReorder = async () => {
    if (!order) return;
    
    setReordering(true);
    
    try {
      // Logique de recommande
      for (const item of order.items) {
        if (item.product) {
          const productToAdd = {
            id: parseInt(item.product.id),
            name: item.product.name,
            price: item.product.price,
            image_url: item.product.image_url || '',
            category: 'aperos',
            description: '',
            stock_quantity: 999,
            is_featured: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Ajouter au localStorage comme fallback
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
      
      // Rediriger vers le panier
      router.push('/cart');
      
    } catch (error) {
      console.error('Erreur lors de la recommande:', error);
    } finally {
      setReordering(false);
    }
  };

  if (isLoading) {
    return (
      <UserAccountLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div>
          </div>
        </div>
      </UserAccountLayout>
    );
  }

  if (error || !order) {
    return (
      <UserAccountLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Commande non trouvée'}</h3>
                <p className="text-gray-500 mb-6">Cette commande n'existe pas ou vous n'avez pas l'autorisation de la voir.</p>
                <Button 
                  onClick={() => router.push('/mon-compte/commandes')}
                  className="bg-[#f5a623] hover:bg-[#e09000] text-white px-6 py-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux commandes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/mon-compte/commandes')}
            className="mb-4 border-gray-300 hover:border-[#f5a623] hover:text-[#f5a623]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.order_number || order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Passée le {formatDate(order.created_at)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(order.status)} px-4 py-2 text-lg font-medium flex items-center gap-2`}>
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
              
              <Button
                onClick={handleReorder}
                disabled={reordering}
                className="bg-[#f5a623] hover:bg-[#e09000] text-white px-6 py-2"
              >
                {reordering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Recommander
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Articles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles commandés */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Articles commandés ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.product_name || item.name || 'Produit'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity} • Prix unitaire: {formatPrice(item.unit_price)} FCFA
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatPrice(item.subtotal || (item.unit_price * item.quantity))} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            {order.delivery_address && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informations de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Adresse de livraison</p>
                        <p className="text-gray-600">{order.delivery_address}</p>
                        {order.delivery_district && (
                          <p className="text-sm text-gray-500">{order.delivery_district}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Mode de livraison</p>
                        <p className="text-gray-600">
                          {order.delivery_option === 'pickup' ? 'Retrait au Shop' : 'Livraison à domicile'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale - Résumé */}
          <div className="space-y-6">
            {/* Résumé de la commande */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(order.subtotal)} FCFA</span>
                  </div>
                  
                  {order.delivery_fee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de livraison</span>
                      <span className="font-medium">{formatPrice(order.delivery_fee)} FCFA</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold text-[#f5a623]">
                        {formatPrice(order.total_amount)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de paiement */}
            {order.payment_method && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode</span>
                      <span className="font-medium">{order.payment_method}</span>
                    </div>
                    {order.payment_status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut</span>
                        <Badge className={(order.payment_status === 'paid' || order.payment_status === 'Payé') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {(order.payment_status === 'paid' || order.payment_status === 'Payé') ? 'Payé' : 'En attente'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {order.customer && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f5a623] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {order.customer.first_name?.[0]}{order.customer.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{order.customer.full_name || `${order.customer.first_name} ${order.customer.last_name}`}</p>
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                      </div>
                    </div>
                    
                    {order.customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{order.customer.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}
