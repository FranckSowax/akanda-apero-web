'use client';

import React, { useState } from 'react';
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
  Tag
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
  DialogTrigger,
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

// Types pour les clients
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'Actif' | 'Inactif' | 'VIP';
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  joinDate: string;
}

// Types pour les segments
interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  customerCount: number;
  color: string;
}

export default function CustomersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Données fictives pour les clients
  const customers: Customer[] = [
    {
      id: 1,
      name: 'Jean Mouloungui',
      email: 'jean.mouloungui@gmail.com',
      phone: '+241 77 11 22 33',
      location: 'Libreville',
      status: 'VIP',
      lastOrderDate: '06 Mai 2025',
      totalOrders: 12,
      totalSpent: 320000,
      loyaltyPoints: 450,
      joinDate: '15 Jan 2024'
    },
    {
      id: 2,
      name: 'Marie Koumba',
      email: 'marie.koumba@yahoo.fr',
      phone: '+241 66 22 33 44',
      location: 'Libreville',
      status: 'Actif',
      lastOrderDate: '06 Mai 2025',
      totalOrders: 5,
      totalSpent: 175000,
      loyaltyPoints: 180,
      joinDate: '20 Fév 2024'
    },
    {
      id: 3,
      name: 'Sarah Ndong',
      email: 'sarah.ndong@gmail.com',
      phone: '+241 77 33 44 55',
      location: 'Port-Gentil',
      status: 'Actif',
      lastOrderDate: '06 Mai 2025',
      totalOrders: 3,
      totalSpent: 85000,
      loyaltyPoints: 90,
      joinDate: '10 Mars 2025'
    },
    {
      id: 4,
      name: 'Fabrice Ondo',
      email: 'fabrice.ondo@hotmail.com',
      phone: '+241 66 44 55 66',
      location: 'Libreville',
      status: 'Actif',
      lastOrderDate: '06 Mai 2025',
      totalOrders: 8,
      totalSpent: 230000,
      loyaltyPoints: 240,
      joinDate: '05 Jan 2025'
    },
    {
      id: 5,
      name: 'Pascal Ntoutoume',
      email: 'pascal.ntoutoume@gmail.com',
      phone: '+241 77 55 66 77',
      location: 'Oyem',
      status: 'Inactif',
      lastOrderDate: '15 Avril 2025',
      totalOrders: 2,
      totalSpent: 65000,
      loyaltyPoints: 70,
      joinDate: '28 Fév 2025'
    },
    {
      id: 6,
      name: 'Estelle Mayombo',
      email: 'estelle.mayombo@yahoo.fr',
      phone: '+241 66 77 88 99',
      location: 'Libreville',
      status: 'VIP',
      lastOrderDate: '06 Mai 2025',
      totalOrders: 15,
      totalSpent: 380000,
      loyaltyPoints: 480,
      joinDate: '12 Déc 2024'
    },
  ];

  // Données fictives pour les segments
  const segments: CustomerSegment[] = [
    {
      id: 1,
      name: 'VIP',
      description: 'Clients avec plus de 10 commandes ou 300 000 XAF dépensés',
      customerCount: 2,
      color: 'bg-purple-500'
    },
    {
      id: 2,
      name: 'Réguliers',
      description: 'Clients avec 5-10 commandes dans les derniers 3 mois',
      customerCount: 2,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Nouveaux',
      description: 'Clients ayant rejoint dans les 30 derniers jours',
      customerCount: 1,
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'À risque',
      description: 'Clients sans activité depuis 60 jours',
      customerCount: 1,
      color: 'bg-red-500'
    },
  ];

  // Filtrer les clients en fonction du statut, de l'onglet actif et du terme de recherche
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    if (activeTab === 'all') return matchesStatus && matchesSearch;
    if (activeTab === 'vip') return customer.status === 'VIP' && matchesSearch;
    if (activeTab === 'active') return customer.status === 'Actif' && matchesSearch;
    if (activeTab === 'inactive') return customer.status === 'Inactif' && matchesSearch;
    
    return false;
  });

  // Gestionnaires d'événements
  const handleEditCustomer = (id: number) => {
    console.log(`Éditer le client ${id}`);
    // Navigation vers la page d'édition ou ouverture d'une modale d'édition
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log(`Supprimer le client ${customerToDelete}`);
    // Logique de suppression
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // Composant pour la carte client
  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <CardTitle className="flex items-center">
                {customer.name}
                {customer.status === 'VIP' && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">VIP</Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {customer.email}
              </CardDescription>
            </div>
          </div>
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
                <Star className="mr-2 h-4 w-4" />
                <span>Ajouter aux VIP</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Téléphone</p>
            <p className="font-medium flex items-center gap-1">
              <Phone className="h-3 w-3" /> {customer.phone}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Localisation</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {customer.location}
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
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Clients</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Clients VIP</p>
          <p className="text-purple-600 text-2xl font-bold">
            {customers.filter(c => c.status === 'VIP').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Clients Actifs</p>
          <p className="text-green-600 text-2xl font-bold">
            {customers.filter(c => c.status === 'Actif').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Clients Inactifs</p>
          <p className="text-red-600 text-2xl font-bold">
            {customers.filter(c => c.status === 'Inactif').length}
          </p>
        </div>
      </div>

      {/* Onglets et filtres */}
      <div>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-4 max-w-md">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
              <TabsTrigger value="active">Actifs</TabsTrigger>
              <TabsTrigger value="inactive">Inactifs</TabsTrigger>
            </TabsList>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className={viewMode === 'table' ? 'bg-white shadow-sm' : ''}
                onClick={() => setViewMode('table')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                className={viewMode === 'cards' ? 'bg-white shadow-sm' : ''}
                onClick={() => setViewMode('cards')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid-3x3"><rect width="6" height="6" x="3" y="3" rx="1" /><rect width="6" height="6" x="15" y="3" rx="1" /><rect width="6" height="6" x="3" y="15" rx="1" /><rect width="6" height="6" x="15" y="15" rx="1" /></svg>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Rechercher un client..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Segments
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <Checkbox id="select-all" />
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Client</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Commandes</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Dépensé</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
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
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={
                            customer.status === 'VIP' ? 'bg-purple-100 text-purple-800' : 
                            customer.status === 'Actif' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {customer.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.location}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.totalOrders}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {customer.totalSpent.toLocaleString()} XAF
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className="bg-amber-100 text-amber-800">
                            {customer.loyaltyPoints} pts
                          </Badge>
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
                                <Star className="mr-2 h-4 w-4" />
                                <span>Ajouter aux VIP</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
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
                {filteredCustomers.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="vip" className="mt-0">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                {/* Même tableau que pour "all" mais avec un filtre sur VIP */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                {/* Même tableau que pour "all" mais avec un filtre sur Actif */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive" className="mt-0">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                {/* Même tableau que pour "all" mais avec un filtre sur Inactif */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
