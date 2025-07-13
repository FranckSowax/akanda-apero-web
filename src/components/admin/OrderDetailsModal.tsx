'use client';

import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Navigation,
  Package,
  Clock,
  User,
  Mail,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Order } from '../../types/supabase';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  // Générer le lien Waze
  const generateWazeLink = (address: string, district?: string) => {
    const fullAddress = district ? `${address}, ${district}, Libreville, Gabon` : `${address}, Libreville, Gabon`;
    return `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`;
  };

  // Générer le lien WhatsApp
  const generateWhatsAppLink = (phone: string, orderNumber: string) => {
    const message = `Bonjour ! Je vous contacte concernant votre commande #${orderNumber} chez Akanda Apéro. Comment puis-je vous aider ?`;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Statut avec couleurs
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'nouvelle': return 'bg-blue-100 text-blue-800';
      case 'en préparation': return 'bg-yellow-100 text-yellow-800';
      case 'prête': return 'bg-purple-100 text-purple-800';
      case 'en livraison': return 'bg-indigo-100 text-indigo-800';
      case 'livrée': return 'bg-green-100 text-green-800';
      case 'retardée': return 'bg-red-100 text-red-800';
      case 'annulée': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Détails de la commande #{order.order_number || order.id?.slice(0, 6)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Créée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statut et Paiement */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Statut:</span>
              <Badge className={getStatusColor(order.status_fr || 'Nouvelle')}>
                {order.status_fr || 'Nouvelle'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Paiement:</span>
              <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {order.payment_status === 'paid' ? 'Payée' : 'En attente'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations Client */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Client
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nom complet</p>
                  <p className="text-gray-900">
                    {order.customers ? 
                      `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() || 'Non renseigné'
                      : 'Client inconnu'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{order.customers?.email || 'Non renseigné'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone</p>
                    <p className="text-gray-900">{order.customers?.phone || 'Non renseigné'}</p>
                  </div>
                  {order.customers?.phone && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(generateWhatsAppLink(order.customers.phone, order.order_number || order.id?.slice(0, 6) || ''), '_blank')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Informations Livraison */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informations de Livraison
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Adresse</p>
                  <p className="text-gray-900">{order.delivery_address || 'Non renseignée'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Quartier</p>
                  <p className="text-gray-900">{order.delivery_district || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Ville</p>
                  <p className="text-gray-900">{order.delivery_city || 'Libreville'}</p>
                </div>
                {order.delivery_additional_info && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Informations supplémentaires</p>
                    <p className="text-gray-900">{order.delivery_additional_info}</p>
                  </div>
                )}
                {order.delivery_address && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(generateWazeLink(order.delivery_address, order.delivery_district), '_blank')}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ouvrir dans Waze
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Détails de la Commande */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Détails de la Commande
            </h3>
            
            {/* Items de commande */}
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-3">
                {order.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.products?.name || item.product_name || 'Produit inconnu'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantité: {item.quantity} × {item.unit_price || 0} XAF
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()} XAF
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-900">Total</p>
                    <p className="text-lg font-bold text-[#f5a623]">
                      {(order.total_amount || 0).toLocaleString()} XAF
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun détail de commande disponible</p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
