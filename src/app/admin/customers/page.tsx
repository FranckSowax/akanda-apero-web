'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  ShoppingBag,
  User,
  Edit,
  Trash,
  ArrowUpDown,
  Download,
  Filter,
  Tag,
  Loader2,
  Calendar,
  Check,
  Smartphone
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Checkbox } from "../../../components/ui/checkbox";
import Link from 'next/link';

import { useCustomers, CustomerWithStats } from '../../../hooks/supabase/useCustomers';

// Types pour les segments
interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  color: string;
}

// Données pour les segments
const segments: CustomerSegment[] = [
  {
    id: '1',
    name: 'VIP',
    description: 'Clients avec plus de 10 commandes ou 300 000 XAF dépensés',
    customerCount: 0,
    color: 'bg-purple-500'
  },
  {
    id: '2',
    name: 'Réguliers',
    description: 'Clients avec 5-10 commandes dans les derniers 3 mois',
    customerCount: 0,
    color: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Nouveaux',
    description: 'Clients ayant rejoint dans les 30 derniers jours',
    customerCount: 0,
    color: 'bg-green-500'
  },
  {
    id: '4',
    name: 'À risque',
    description: 'Clients sans activité depuis 60 jours',
    customerCount: 0,
    color: 'bg-red-500'
  },
];

export default function CustomersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getCustomers, deleteCustomer } = useCustomers();
  
  // Charger les clients depuis Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getCustomers();
        if (error) {
          setError(error.message);
        } else if (data) {
          setCustomers(data);
          
          // Mettre à jour les compteurs de segments
          // Dans une application réelle, cela pourrait être fait côté serveur ou via une requête dédiée
          const updatedSegments = [...segments];
          // VIP
          updatedSegments[0].customerCount = data.filter(c => c.totalOrders > 10 || c.totalSpent > 300000).length;
          // Réguliers
          updatedSegments[1].customerCount = data.filter(c => c.totalOrders >= 5 && c.totalOrders <= 10).length;
          // Nouveaux - clients inscrits dans les 30 derniers jours
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          updatedSegments[2].customerCount = data.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
          // À risque - pas de commande depuis 60 jours
          updatedSegments[3].customerCount = data.filter(c => c.lastOrderDate === null || new Date(c.lastOrderDate) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)).length;
        }
      } catch (err) {
        setError('Erreur lors du chargement des clients');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  // Déterminer le statut du client en fonction de son activité
  const getCustomerStatus = (customer: CustomerWithStats): 'Actif' | 'Inactif' | 'VIP' => {
    if (customer.totalOrders > 10 || customer.totalSpent > 300000) {
      return 'VIP';
    }
    
    if (customer.lastOrderDate) {
      const lastOrderDate = new Date(customer.lastOrderDate);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      if (lastOrderDate >= sixtyDaysAgo) {
        return 'Actif';
      }
    }
    
    return 'Inactif';
  };

  // Filtrer les clients en fonction du terme de recherche et du filtre de statut
  const filteredCustomers = customers
    .filter(customer => {
      // Filtrer par terme de recherche
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const email = customer.email.toLowerCase();
      const phone = customer.phone || '';
      
      if (searchTerm && !fullName.includes(searchTerm.toLowerCase()) && 
          !email.includes(searchTerm.toLowerCase()) && 
          !phone.includes(searchTerm)) {
        return false;
      }
      
      // Filtrer par statut (onglet actif)
      if (activeTab === 'vip' && getCustomerStatus(customer) !== 'VIP') {
        return false;
      }
      if (activeTab === 'active' && getCustomerStatus(customer) !== 'Actif') {
        return false;
      }
      if (activeTab === 'inactive' && getCustomerStatus(customer) !== 'Inactif') {
        return false;
      }
      
      return true;
    });

  // Gestionnaires d'événements
  const handleEditCustomer = (id: string) => {
    // Dans une application réelle, cela pourrait ouvrir un formulaire d'édition ou rediriger vers une page dédiée
    console.log(`Éditer le client ${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        const { error } = await deleteCustomer(customerToDelete);
        if (error) {
          setError(`Erreur lors de la suppression: ${error.message}`);
        } else {
          // Mise à jour de l'état local après suppression réussie
          setCustomers(prev => prev.filter(c => c.id !== customerToDelete));
        }
      } catch (err) {
        setError('Erreur lors de la suppression du client');
        console.error(err);
      } finally {
        setIsDeleteDialogOpen(false);
        setCustomerToDelete(null);
      }
    }
  };

  // Fonction pour rendre une carte client
  const renderCustomerCard = (customer: CustomerWithStats) => {
    return (
      <Card key={customer.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
              </div>
              <div>
                <CardTitle className="flex items-center">
                  {customer.first_name} {customer.last_name}
                  {getCustomerStatus(customer) === 'VIP' && (
                    <Badge className="ml-2 bg-purple-100 text-purple-800">VIP</Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {customer.email}
                </CardDescription>
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Voir les commandes</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => {
                      setCustomerToDelete(customer.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Téléphone</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="h-3 w-3" /> {customer.phone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Date d'inscription</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(customer.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Localisation</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {customer.city || 'Non renseigné'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Commandes</p>
              <p className="font-medium">{customer.totalOrders}</p>
            </div>
            <div>
              <p className="text-gray-500">Dépensé</p>
              <p className="font-medium">{customer.totalSpent.toLocaleString()} XAF</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Points de fidélité</p>
            <p className="font-bold text-[#f5a623]">{customer.loyaltyPoints} pts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Mail className="h-3 w-3 mr-1" /> Email
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-[#f5a623] text-white border-[#f5a623] hover:bg-[#e09000]">
              <ShoppingBag className="h-3 w-3 mr-1" /> Commandes
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Clients</h1>
        <div className="flex gap-2">
          <Button className="bg-white text-gray-600 hover:bg-gray-50 border-gray-200 border flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Ajouter un client
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-3xl font-bold">{customers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clients VIP</p>
                <p className="text-3xl font-bold">{customers.filter(c => getCustomerStatus(c) === 'VIP').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clients Actifs</p>
                <p className="text-3xl font-bold">{customers.filter(c => getCustomerStatus(c) === 'Actif').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Commandes</p>
                <p className="text-3xl font-bold">{customers.reduce((sum, c) => sum + c.totalOrders, 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mode d'affichage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Tableau</SelectItem>
              <SelectItem value="cards">Cartes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
            <Badge className="ml-1 px-1 h-5">2</Badge>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Segments
          </Button>
        </div>
      </div>

      {/* Contenu principal - liste des clients */}
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Chargement des clients...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">
                Tous <Badge className="ml-2 bg-gray-100 text-gray-800">{customers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="vip">
                VIP <Badge className="ml-2 bg-purple-100 text-purple-800">{customers.filter(c => getCustomerStatus(c) === 'VIP').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Actifs <Badge className="ml-2 bg-green-100 text-green-800">{customers.filter(c => getCustomerStatus(c) === 'Actif').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactifs <Badge className="ml-2 bg-red-100 text-red-800">{customers.filter(c => getCustomerStatus(c) === 'Inactif').length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-12 px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">
                          <Checkbox id="select-all" />
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            Client <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commandes
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dépensé
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fidélité
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap w-12">
                            <Checkbox id={`select-${customer.id}`} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                                {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{customer.first_name} {customer.last_name}</p>
                                <p className="text-xs text-gray-500">{customer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge 
                              className={getCustomerStatus(customer) === 'VIP' 
                                ? 'bg-purple-100 text-purple-700' 
                                : getCustomerStatus(customer) === 'Actif' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'}
                            >
                              {getCustomerStatus(customer)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.phone || 'Non renseigné'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.totalOrders} commandes
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {customer.totalSpent.toLocaleString()} XAF
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <Badge className="bg-[#f5a623] text-white">{customer.loyaltyPoints} pts</Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Modifier</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                  <span>Voir les commandes</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Smartphone className="mr-2 h-4 w-4" />
                                  <span>SMS</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => {
                                    setCustomerToDelete(customer.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Supprimer</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomers.map(customer => renderCustomerCard(customer))}
                </div>
              )}
            </TabsContent>

            {/* Autres onglets avec contenu simplifié */}
            <TabsContent value="vip" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => renderCustomerCard(customer))}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => renderCustomerCard(customer))}
              </div>
            </TabsContent>
            
            <TabsContent value="inactive" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => renderCustomerCard(customer))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Segments de clientèle */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Segments de Clientèle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map(segment => (
            <Card key={segment.id}>
              <CardHeader className="pb-2">
                <div className={`w-12 h-1 ${segment.color} mb-2`}></div>
                <CardTitle className="text-base">{segment.name}</CardTitle>
                <CardDescription className="text-xs">
                  {segment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-2xl font-bold">{segment.customerCount}</p>
                <p className="text-sm text-gray-500">clients</p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Voir les clients
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée et supprimera toutes les données associées à ce client.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
