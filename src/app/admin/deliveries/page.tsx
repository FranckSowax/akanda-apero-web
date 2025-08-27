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

// Types pour les filtres
type DeliveryStatus = 'all' | 'en_attente' | 'recherche_chauffeur' | 'affecte' | 'en_route_pickup' | 'recupere' | 'en_livraison' | 'livre' | 'annule';

const DeliveriesPage = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [filteredLivraisons, setFilteredLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus>('all');
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Charger les livraisons et chauffeurs
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🚚 Chargement des données de livraison...');
      
      // Charger les livraisons
      const { data: livraisonsData, error: livraisonsError } = await DeliveryService.getLivraisons();
      if (livraisonsData && !livraisonsError) {
        setLivraisons(livraisonsData);
        setFilteredLivraisons(livraisonsData);
      } else {
        console.error('Erreur livraisons:', livraisonsError);
      }

      // Charger les chauffeurs
      const { data: chauffeursData, error: chauffeursError } = await DeliveryService.getChauffeurs();
      if (chauffeursData && !chauffeursError) {
        setChauffeurs(chauffeursData);
      } else {
        console.error('Erreur chauffeurs:', chauffeursError);
      }

      // Charger les statistiques
      const { data: statsData, error: statsError } = await DeliveryService.getStatistiques();
      if (statsData && !statsError) {
        setStats(statsData);
      }

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

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(livraison => livraison.statut_livraison === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(livraison =>
        livraison.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livraison.nom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livraison.adresse_livraison.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livraison.telephone_client && livraison.telephone_client.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLivraisons(filtered);
  }, [livraisons, statusFilter, searchTerm]);

  // Mettre à jour le statut d'une livraison
  const handleStatusUpdate = async (livraisonId: string, newStatus: Livraison['statut_livraison']) => {
    try {
      console.log(`Mise à jour statut livraison ${livraisonId} vers ${newStatus}`);
      const { data, error } = await DeliveryService.updateLivraisonStatus(livraisonId, newStatus);
      if (data && !error) {
        await loadData(); // Recharger les données
      } else {
        console.error('Erreur lors de la mise à jour:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Assigner un chauffeur à une livraison
  const handleAssignDriver = async (livraisonId: string, chauffeurId: string) => {
    try {
      console.log(`Assignation livraison ${livraisonId} au chauffeur ${chauffeurId}`);
      const { data, error } = await DeliveryService.assignerChauffeur(livraisonId, chauffeurId);
      if (data && !error) {
        await loadData(); // Recharger les données
      } else {
        console.error('Erreur lors de l\'assignation:', error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation du chauffeur:', error);
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      recherche_chauffeur: { color: 'bg-blue-100 text-blue-800', label: 'Recherche chauffeur' },
      affecte: { color: 'bg-purple-100 text-purple-800', label: 'Affectée' },
      en_route_pickup: { color: 'bg-orange-100 text-orange-800', label: 'En route récup.' },
      recupere: { color: 'bg-indigo-100 text-indigo-800', label: 'Récupérée' },
      en_livraison: { color: 'bg-blue-100 text-blue-800', label: 'En livraison' },
      livre: { color: 'bg-green-100 text-green-800', label: 'Livrée' },
      annule: { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
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
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.filter(l => ['en_attente', 'recherche_chauffeur'].includes(l.statut_livraison)).length}
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
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.filter(l => ['affecte', 'en_route_pickup', 'recupere', 'en_livraison'].includes(l.statut_livraison)).length}
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
                <p className="text-sm font-medium text-gray-600">Livrées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livraisons.filter(l => l.statut_livraison === 'livree').length}
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
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="recherche_chauffeur">Recherche chauffeur</option>
                <option value="affecte">Affectée</option>
                <option value="en_route_pickup">En route récup.</option>
                <option value="recupere">Récupérée</option>
                <option value="en_livraison">En livraison</option>
                <option value="livre">Livrée</option>
                <option value="annule">Annulée</option>
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
            <Card key={livraison.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informations de base */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{livraison.numero_commande}
                      </h3>
                      {getStatusBadge(livraison.statut_livraison)}
                      <span className="text-sm text-gray-500">
                        {new Date(livraison.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span className="font-medium">Client:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{livraison.nom_client}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="font-medium">Téléphone:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{livraison.telephone_client || 'Non renseigné'}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">Adresse:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{livraison.adresse_livraison}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Truck className="w-4 h-4 mr-2" />
                          <span className="font-medium">Chauffeur:</span>
                        </div>
                        <p className="text-gray-900 ml-6">{getChauffeurName(livraison.chauffeur_id)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {livraison.montant_livraison} XAF
                      </span>
                      
                      {/* Actions de statut */}
                      <div className="flex gap-2">
                        {livraison.statut_livraison === 'en_attente' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(livraison.id, 'recherche_chauffeur')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Confirmer
                          </Button>
                        )}
                        
                        {livraison.statut_livraison === 'recherche_chauffeur' && chauffeurs.length > 0 && (
                          <div className="flex gap-2">
                            <select
                              onChange={(e) => handleAssignDriver(livraison.id, e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                              defaultValue=""
                            >
                              <option value="" disabled>Assigner chauffeur</option>
                              {chauffeurs.filter(c => c.disponible).map(chauffeur => (
                                <option key={chauffeur.id} value={chauffeur.id}>
                                  {chauffeur.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {livraison.statut_livraison === 'affecte' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(livraison.id, 'en_route_pickup')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            En route
                          </Button>
                        )}

                        {livraison.statut_livraison === 'en_route_pickup' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(livraison.id, 'recupere')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Récupérée
                          </Button>
                        )}

                        {livraison.statut_livraison === 'recupere' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(livraison.id, 'en_livraison')}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            En livraison
                          </Button>
                        )}

                        {livraison.statut_livraison === 'en_livraison' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(livraison.id, 'livre')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Livrée
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation GPS et actions */}
                  <div className="lg:w-80">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {/* Coordonnées GPS */}
                      {livraison.latitude && livraison.longitude && (
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="font-medium">Coordonnées:</span>
                          </div>
                          <p className="ml-6">{livraison.latitude}, {livraison.longitude}</p>
                        </div>
                      )}

                      {/* Lien Waze */}
                      {livraison.lien_waze && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(livraison.lien_waze, '_blank')}
                          className="w-full"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Ouvrir dans Waze
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}

                      {/* Téléphone client */}
                      {livraison.telephone_client && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${livraison.telephone_client}`, '_self')}
                          className="w-full"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler client
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes de livraison */}
                {livraison.notes_livraison && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Notes de livraison:</p>
                        <p className="text-sm text-yellow-700 mt-1">{livraison.notes_livraison}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveriesPage;
