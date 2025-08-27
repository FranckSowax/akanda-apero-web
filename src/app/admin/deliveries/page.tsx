'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Package, 
  User, 
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import DeliveryService, { Livraison, Chauffeur } from '../../../services/delivery-service';

// Interface pour les commandes avec infos client
interface OrderWithCustomer {
  id: string;
  order_number: string;
  customer_id: string;
  customers?: {
    name: string;
    phone: string;
  };
  delivery_address: string;
  delivery_district: string;
  delivery_option: string;
  delivery_cost: number;
  total_amount: number;
  subtotal: number;
  gps_latitude?: number;
  gps_longitude?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Types pour les filtres
type DeliveryStatus = 'all' | 'standard' | 'express';

const DeliveriesPage = () => {
  const [livraisons, setLivraisons] = useState<OrderWithCustomer[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [filteredLivraisons, setFilteredLivraisons] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus>('all');
  const [selectedLivraison, setSelectedLivraison] = useState<OrderWithCustomer | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Charger les livraisons et chauffeurs
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🚚 Chargement des données de livraison...');
      
      // Charger les commandes en préparation via l'API MCP
      const response = await fetch('/api/mcp/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'read',
          resource: 'livraisons'
        })
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        setLivraisons(result.data);
        setFilteredLivraisons(result.data);
        console.log('✅ Livraisons chargées:', result.data.length);
      } else {
        console.error('❌ Erreur lors du chargement des livraisons:', result.error);
        setLivraisons([]);
        setFilteredLivraisons([]);
      }

      // Charger les chauffeurs
      const chauffeursResponse = await fetch('/api/mcp/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'read',
          resource: 'chauffeurs'
        })
      });
      
      const chauffeursResult = await chauffeursResponse.json();
      if (chauffeursResult.success && chauffeursResult.data) {
        setChauffeurs(chauffeursResult.data);
        console.log('✅ Chauffeurs chargés:', chauffeursResult.data.length);
      } else {
        console.error('❌ Erreur lors du chargement des chauffeurs:', chauffeursResult.error);
        setChauffeurs([]);
      }

      // Les statistiques sont calculées directement depuis les données
      console.log('✅ Données chargées avec succès');

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les livraisons
  useEffect(() => {
    let filtered = livraisons;

    // Filtre par type de livraison
    if (statusFilter !== 'all') {
      filtered = filtered.filter(livraison => livraison.delivery_option === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(livraison =>
        livraison.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livraison.customers?.name && livraison.customers.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        livraison.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livraison.customers?.phone && livraison.customers.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLivraisons(filtered);
  }, [livraisons, statusFilter, searchTerm]);

  // Générer le lien Waze
  const generateWazeLink = (latitude?: number, longitude?: number) => {
    if (!latitude || !longitude) return null;
    return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  };

  // Mettre à jour le statut d'une livraison
  const handleStatusUpdate = async (livraisonId: string, newStatus: string) => {
    try {
      console.log(`Mise à jour statut livraison ${livraisonId} vers ${newStatus}`);
      // Pour l'instant, juste recharger les données
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Assigner un chauffeur à une livraison
  const handleAssignDriver = async (livraisonId: string, chauffeurId: string) => {
    try {
      console.log(`Assignation livraison ${livraisonId} au chauffeur ${chauffeurId}`);
      // Pour l'instant, juste recharger les données
      await loadData();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du chauffeur:', error);
    }
  };

  // Formater le prix
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Obtenir le nom du chauffeur
  const getChauffeurName = (chauffeurId?: string) => {
    if (!chauffeurId) return 'Non assigné';
    const chauffeur = chauffeurs.find(c => c.id === chauffeurId);
    return chauffeur ? chauffeur.nom : 'Chauffeur inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement des livraisons...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Livraisons</h1>
          <p className="text-gray-600 mt-1">Suivi et navigation GPS pour toutes les livraisons</p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{livraisons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En préparation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.filter(l => l.status === 'En préparation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.reduce((sum, l) => sum + (l.total_amount || 0), 0).toLocaleString()} XAF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Frais livraison</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.reduce((sum, l) => sum + (l.delivery_cost || 0), 0).toLocaleString()} XAF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, adresse ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les livraisons</option>
                <option value="standard">Livraison standard</option>
                <option value="express">Livraison express</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des livraisons */}
      <div className="grid gap-4">
        {filteredLivraisons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune livraison trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune livraison ne correspond à vos critères de recherche.'
                  : 'Aucune livraison disponible.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLivraisons.map((livraison) => (
            <Card key={livraison.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Informations principales */}
                  <div className="flex-1 space-y-4">
                    {/* En-tête avec badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        #{livraison.order_number}
                      </h3>
                      <Badge className={`px-3 py-1 text-sm font-medium ${
                        livraison.delivery_option === 'express' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {livraison.delivery_option === 'express' ? '🚀 Express' : '📦 Standard'}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        En préparation
                      </Badge>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {new Date(livraison.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Informations client et livraison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informations client */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Informations Client
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium text-gray-900">
                              {livraison.customers?.name || 'Non renseigné'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Téléphone:</span>
                            <span className="font-medium text-gray-900">
                              {livraison.customers?.phone || 'Non renseigné'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Informations livraison */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-green-600" />
                          Détails Livraison
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {livraison.delivery_option}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Frais:</span>
                            <span className="font-bold text-green-700">
                              {livraison.delivery_cost?.toLocaleString()} XAF
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-gray-900 text-lg">
                              {livraison.total_amount?.toLocaleString()} XAF
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Adresse de livraison */}
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                        Adresse de Livraison
                      </h4>
                      <p className="text-gray-800 font-medium">{livraison.delivery_address}</p>
                      {livraison.delivery_district && (
                        <p className="text-sm text-gray-600 mt-1">
                          District: {livraison.delivery_district}
                        </p>
                      )}
                      {livraison.gps_latitude && livraison.gps_longitude && (
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          GPS: {livraison.gps_latitude}, {livraison.gps_longitude}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions et navigation */}
                  <div className="lg:w-80">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Navigation className="w-5 h-5 mr-2 text-gray-700" />
                        Actions Rapides
                      </h4>
                      
                      {/* Lien Waze généré */}
                      {livraison.gps_latitude && livraison.gps_longitude && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          onClick={() => window.open(generateWazeLink(livraison.gps_latitude, livraison.gps_longitude)!, '_blank')}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Naviguer avec Waze
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}

                      {/* Appeler client */}
                      {livraison.customers?.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => window.open(`tel:${livraison.customers?.phone}`, '_self')}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler {livraison.customers.name}
                        </Button>
                      )}

                      {/* Google Maps alternatif */}
                      {livraison.gps_latitude && livraison.gps_longitude && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${livraison.gps_latitude},${livraison.gps_longitude}`,
                            '_blank'
                          )}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Google Maps
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}

                      {/* Statut et actions */}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">Statut:</span>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Prêt à livrer
                          </Badge>
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusUpdate(livraison.id, 'en_livraison')}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Marquer en livraison
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveriesPage;
