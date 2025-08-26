'use client';

import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Printer,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Order } from '../../types/supabase';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  // Fonction pour imprimer la facture
  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Recharger pour restaurer les event listeners
    }
  };

  // Fonction pour télécharger en PDF (simulation)
  const handleDownloadPDF = () => {
    // Pour une vraie implémentation, vous pourriez utiliser jsPDF ou html2pdf
    alert('Fonctionnalité de téléchargement PDF à implémenter avec jsPDF');
  };

  const invoiceNumber = `INV-${order.order_number || order.id?.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString('fr-FR');
  const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Facture #{invoiceNumber}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Contenu de la facture */}
        <div ref={printRef} className="p-8 bg-white">
          {/* En-tête de la facture */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#f5a623] mb-2">Akanda Apéro</h1>
              <div className="text-gray-600 space-y-1">
                <p>Service de livraison de boissons</p>
                <p>Libreville, Gabon</p>
                <p>Tél: +241 XX XX XX XX</p>
                <p>Email: contact@akanda-apero.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">FACTURE</h2>
              <div className="text-gray-600 space-y-1">
                <p><span className="font-medium">N° Facture:</span> {invoiceNumber}</p>
                <p><span className="font-medium">Date facture:</span> {invoiceDate}</p>
                <p><span className="font-medium">Date commande:</span> {orderDate}</p>
              </div>
            </div>
          </div>

          {/* Informations client et livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Facturer à */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Facturer à
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-gray-900">
                  {order.customers ? 
                    `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() || 'Client'
                    : 'Client'}
                </p>
                {order.customers?.email && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {order.customers.email}
                  </p>
                )}
                {order.customers?.phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.customers.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Livrer à */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Livrer à
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-900">{order.delivery_address || 'Adresse non renseignée'}</p>
                {order.delivery_location_address && (
                  <p className="text-gray-600">{order.delivery_location_address}</p>
                )}
                <p className="text-gray-600">Libreville, Gabon</p>
                {order.delivery_notes && (
                  <p className="text-gray-600 text-sm italic">{order.delivery_notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la commande</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                      Article
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-900">
                      Quantité
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                      Prix unitaire
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.products?.name || item.product_name || 'Produit inconnu'}
                            </p>
                            {item.products?.description && (
                              <p className="text-sm text-gray-500">{item.products.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {item.quantity || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right">
                          {(item.unit_price || 0).toLocaleString()} XAF
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                          {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()} XAF
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        Aucun article dans cette commande
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{(order.total_amount || 0).toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Frais de livraison:</span>
                  <span className="font-medium">0 XAF</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-[#f5a623]">
                    {(order.total_amount || 0).toLocaleString()} XAF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de paiement</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Statut du paiement:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.payment_status === 'Payé' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment_status || 'En attente'}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Mode de paiement:</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.delivery_notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes de livraison</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700">{order.delivery_notes}</p>
              </div>
            </div>
          )}

          {/* Pied de page */}
          <div className="border-t border-gray-300 pt-6 text-center text-gray-500 text-sm">
            <p>Merci pour votre confiance !</p>
            <p className="mt-2">
              Cette facture a été générée automatiquement le {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Footer du modal */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
