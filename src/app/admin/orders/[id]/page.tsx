'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  FileText,
  Edit3
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { useOrders } from '../../../../hooks/supabase/useOrders';
import OrderPreparationModal from '../../../../components/admin/OrderPreparationModal';
import InvoiceModal from '../../../../components/admin/InvoiceModal';

// Fonction pour obtenir la couleur du badge de statut
const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'nouvelle':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'en préparation':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'prête':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'en livraison':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'livrée':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'annulée':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Fonction pour obtenir la couleur du badge de paiement
const getPaymentBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'payé':
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'en attente':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'échoué':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreparationModalOpen, setIsPreparationModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const { getOrderById, updateOrderStatus } = useOrders();

  // Charger les détails de la commande
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await getOrderById(orderId);
        if (error) {
          setError(error.message);
        } else if (data) {
          setOrder(data);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de la commande:', err);
        setError('Erreur lors du chargement de la commande');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // Gestion de la mise à jour du statut
  const handleStatusChange = async (status: string) => {
    if (!order) return;
    
    try {
      const { success, error } = await updateOrderStatus(order.id, status);
      if (success) {
        setOrder({ ...order, status_fr: status });
      } else {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Commande introuvable</h2>
          <p className="text-gray-600 mb-4">{error || 'Cette commande n\'existe pas ou a été supprimée.'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux commandes
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.order_number || order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Créée le {order.formatted_date || new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Badge className={getStatusBadgeColor(order.status_fr)}>
                {order.status_fr || 'Nouvelle'}
              </Badge>
              <Badge className={getPaymentBadgeColor(order.payment_status)}>
                {order.payment_status || 'En attente'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customers?.first_name} {order.customers?.last_name}
                    </p>
                    {order.customers?.email && (
                      <div className="flex items-center mt-2 text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        {order.customers.email}
                      </div>
                    )}
                    {order.customers?.phone && (
                      <div className="flex items-center mt-1 text-gray-600">
                        <Phone className="mr-2 h-4 w-4" />
                        {order.customers.phone}
                      </div>
                    )}
                  </div>
                  
                  {order.delivery_address && (
                    <div>
                      <div className="flex items-start text-gray-600">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">Adresse de livraison</p>
                          <p>{order.delivery_address}</p>
                          {order.delivery_city && (
                            <p>{order.delivery_postal_code} {order.delivery_city}</p>
                          )}
                          
                          {/* Quartier */}
                          {order.delivery_district && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Quartier</p>
                              <p className="text-sm text-gray-600">{order.delivery_district}</p>
                            </div>
                          )}
                          
                          {/* Coordonnées GPS avec lien Waze */}
                          {(order.gps_latitude && order.gps_longitude) && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-800 mb-2">Position GPS</p>
                              <div className="text-xs text-green-700 font-mono bg-white/50 px-3 py-2 rounded-lg">
                                <div className="flex justify-between">
                                  <span>Latitude:</span>
                                  <span className="font-semibold">{order.gps_latitude.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span>Longitude:</span>
                                  <span className="font-semibold">{order.gps_longitude.toFixed(6)}</span>
                                </div>
                              </div>
                              <a 
                                href={`https://waze.com/ul?ll=${order.gps_latitude},${order.gps_longitude}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                              >
                                <MapPin className="mr-1 h-3 w-3" />
                                Ouvrir dans Waze
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Articles commandés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        {item.product_description && (
                          <p className="text-sm text-gray-600 mt-1">{item.product_description}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.unit_price} FCFA</p>
                        <p className="text-sm text-gray-500">Total: {(item.quantity * item.unit_price).toFixed(0)} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Sous-total et frais de livraison */}
                <div className="space-y-2">
                  {order.subtotal && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sous-total articles</span>
                      <span>{order.subtotal} FCFA</span>
                    </div>
                  )}
                  
                  {/* Frais de livraison */}
                  {(order.delivery_cost || order.delivery_option) && (
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-gray-600">Frais de livraison</span>
                        {order.delivery_option && (
                          <span className="text-xs text-gray-500 capitalize">
                            {order.delivery_option === 'standard' && 'Standard'}
                            {order.delivery_option === 'express' && 'Express'}
                            {order.delivery_option === 'nuit' && 'Nuit (après 22h)'}
                            {order.delivery_option === 'premium' && 'Premium'}
                          </span>
                        )}
                      </div>
                      <span>
                        {order.delivery_cost || 
                         (order.delivery_option === 'standard' ? 2000 :
                          order.delivery_option === 'express' ? 3000 :
                          order.delivery_option === 'nuit' ? 3500 :
                          order.delivery_option === 'premium' ? 4000 : 2000)} FCFA
                      </span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total de la commande</span>
                  <span className="text-[#f5a623]">{order.total_amount} FCFA</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes de livraison */}
            {order.delivery_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes de livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.delivery_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsPreparationModalOpen(true)}
                  className="w-full bg-[#f5a623] hover:bg-[#e6951e] text-white"
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  Guide de préparation
                </Button>
                
                <Button 
                  onClick={() => setIsInvoiceModalOpen(true)}
                  variant="outline" 
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Voir la facture
                </Button>
              </CardContent>
            </Card>

            {/* Gestion du statut */}
            <Card>
              <CardHeader>
                <CardTitle>Gestion du statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleStatusChange('En préparation')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={order.status_fr === 'En préparation'}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Marquer en préparation
                </Button>
                
                <Button 
                  onClick={() => handleStatusChange('Prête')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={order.status_fr === 'Prête'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marquer comme prête
                </Button>
                
                <Button 
                  onClick={() => handleStatusChange('En livraison')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={order.status_fr === 'En livraison'}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Marquer en livraison
                </Button>
                
                <Button 
                  onClick={() => handleStatusChange('Livrée')}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={order.status_fr === 'Livrée'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marquer comme livrée
                </Button>
              </CardContent>
            </Card>

            {/* Informations de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <Badge className={getPaymentBadgeColor(order.payment_status)}>
                      {order.payment_status || 'En attente'}
                    </Badge>
                  </div>
                  
                  {order.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode:</span>
                      <span className="font-medium">{order.payment_method}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-medium text-[#f5a623]">{order.total_amount} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            {order.delivery_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date prévue:</span>
                      <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    {order.delivery_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure:</span>
                        <span className="font-medium">{order.delivery_time}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrderPreparationModal
        order={order}
        isOpen={isPreparationModalOpen}
        onClose={() => setIsPreparationModalOpen(false)}
      />
      
      <InvoiceModal
        order={order}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
