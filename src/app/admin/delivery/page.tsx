'use client';

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  User,
  Package,
  Truck,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  RefreshCw,
  X,
  Filter
} from 'lucide-react';
import Image from 'next/image';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

// Types pour les livraisons
interface Delivery {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: string[];
  totalItems: number;
  amount: number;
  status: 'En attente' | 'En cours' | 'Livrée' | 'Problème';
  deliveryPerson?: string;
  assignedTime?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
}

// Types pour les livreurs
interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  status: 'En ligne' | 'Occupé' | 'Hors ligne';
  activeDeliveries: number;
  totalDeliveries: number;
  avatarUrl: string;
  location: string;
}

export default function DeliveryPage() {
  // Ajout d'un état pour contrôler l'hydratation et éviter les différences serveur/client
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);
  
  // Effet pour marquer le composant comme hydraté côté client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Données fictives pour les livraisons
  const deliveries: Delivery[] = [
    {
      id: 1,
      orderId: "A1084",
      customerName: "Marie Koumba",
      customerPhone: "+241 66 22 33 44",
      address: "Quartier Louis, Rue de la Paix, Libreville",
      items: ["Cocktail DIY Kit"],
      totalItems: 1,
      amount: 38500,
      status: "En cours",
      deliveryPerson: "Irène Mboumba",
      assignedTime: "14:15",
      estimatedDelivery: "15:00"
    },
    {
      id: 2,
      orderId: "A1083",
      customerName: "Sarah Ndong",
      customerPhone: "+241 77 33 44 55",
      address: "Avenue Léon M'Ba, Port-Gentil",
      items: ["Formule Apéro"],
      totalItems: 1,
      amount: 32000,
      status: "En attente",
      estimatedDelivery: "15:30"
    },
    {
      id: 3,
      orderId: "A1082",
      customerName: "Fabrice Ondo",
      customerPhone: "+241 66 44 55 66",
      address: "Boulevard du Bord de Mer, Libreville",
      items: ["Pack Football"],
      totalItems: 1,
      amount: 45000,
      status: "Livrée",
      deliveryPerson: "Patrick Anguile",
      assignedTime: "13:00",
      estimatedDelivery: "13:45",
      actualDelivery: "13:40"
    },
    {
      id: 4,
      orderId: "A1081",
      customerName: "Pascal Ntoutoume",
      customerPhone: "+241 77 55 66 77",
      address: "Quartier Ambowé, Oyem",
      items: ["Assortiment de spiritueux"],
      totalItems: 1,
      amount: 25000,
      status: "Problème",
      deliveryPerson: "Bruno Nzaou",
      assignedTime: "11:30",
      estimatedDelivery: "12:30"
    },
    {
      id: 5,
      orderId: "A1080",
      customerName: "Estelle Mayombo",
      customerPhone: "+241 66 77 88 99",
      address: "Cité Okala, Libreville",
      items: ["Vin & Fromages"],
      totalItems: 1,
      amount: 18500,
      status: "En attente",
      estimatedDelivery: "16:00"
    },
  ];

  // Données fictives pour les livreurs
  const deliveryPersons: DeliveryPerson[] = [
    {
      id: 1,
      name: "Patrick Anguile",
      phone: "+241 66 12 34 56",
      vehicle: "Moto",
      status: "En ligne",
      activeDeliveries: 1,
      totalDeliveries: 145,
      avatarUrl: "https://picsum.photos/seed/driver1/100/100",
      location: "Libreville Centre"
    },
    {
      id: 2,
      name: "Irène Mboumba",
      phone: "+241 77 23 45 67",
      vehicle: "Scooter",
      status: "Occupé",
      activeDeliveries: 2,
      totalDeliveries: 98,
      avatarUrl: "https://picsum.photos/seed/driver2/100/100",
      location: "Quartier Akanda"
    },
    {
      id: 3,
      name: "Bruno Nzaou",
      phone: "+241 66 34 56 78",
      vehicle: "Moto",
      status: "Occupé",
      activeDeliveries: 1,
      totalDeliveries: 120,
      avatarUrl: "https://picsum.photos/seed/driver3/100/100",
      location: "Quartier Nkembo"
    },
    {
      id: 4,
      name: "Francine Makaya",
      phone: "+241 77 45 67 89",
      vehicle: "Scooter",
      status: "Hors ligne",
      activeDeliveries: 0,
      totalDeliveries: 87,
      avatarUrl: "https://picsum.photos/seed/driver4/100/100",
      location: "Quartier Plein Ciel"
    }
  ];

  // Filtrer les livraisons en fonction de la recherche et du filtre de statut
  const filteredDeliveries = deliveries.filter(delivery => {
    // Filtre par terme de recherche
    const searchMatch = delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par statut
    const statusMatch = filterStatus === 'all' || delivery.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  // Livreur sélectionné pour l'attribution
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string | null>(null);

  // Si le composant n'est pas encore hydratté, afficher un état de chargement
  // Cela permet d'éviter les différences de rendu entre le serveur et le client
  if (!isClient) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des livraisons</h1>
        </div>
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Obtenir les détails d'une livraison spécifique
  const selectedDelivery = selectedDeliveryId 
    ? deliveries.find(d => d.id === selectedDeliveryId) 
    : null;

  // Obtenir le livreur assigné à une livraison
  const getDeliveryPerson = (deliveryPersonName?: string) => {
    if (!deliveryPersonName) return null;
    return deliveryPersons.find(d => d.name === deliveryPersonName);
  };

  // Compter les livraisons par statut
  const countByStatus = {
    pending: deliveries.filter(d => d.status === 'En attente').length,
    inProgress: deliveries.filter(d => d.status === 'En cours').length,
    delivered: deliveries.filter(d => d.status === 'Livrée').length,
    issues: deliveries.filter(d => d.status === 'Problème').length,
  };

  // Fonction pour afficher une carte de livraison
  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const deliveryPerson = getDeliveryPerson(delivery.deliveryPerson);
    
    return (
      <Card 
        className={`overflow-hidden ${selectedDeliveryId === delivery.id ? 'border-2 border-[#f5a623]' : ''}`}
        onClick={() => setSelectedDeliveryId(delivery.id)}
      >
        <div className={`h-2 ${
          delivery.status === 'En cours' ? 'bg-blue-500' : 
          delivery.status === 'Livrée' ? 'bg-green-500' : 
          delivery.status === 'Problème' ? 'bg-red-500' : 
          'bg-amber-500'
        }`}></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-mono text-lg">#{delivery.orderId}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> 
                {delivery.estimatedDelivery}
                {delivery.status === 'Livrée' && delivery.actualDelivery && (
                  <span className="text-green-600 ml-1">(Livrée à {delivery.actualDelivery})</span>
                )}
              </CardDescription>
            </div>
            <Badge className={
              delivery.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 
              delivery.status === 'Livrée' ? 'bg-green-100 text-green-800' : 
              delivery.status === 'Problème' ? 'bg-red-100 text-red-800' : 
              'bg-amber-100 text-amber-800'
            }>
              {delivery.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {delivery.customerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{delivery.customerName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {delivery.customerPhone}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 flex items-start gap-1">
              <MapPin className="h-4 w-4 min-w-[16px] mt-0.5" /> 
              <span>{delivery.address}</span>
            </p>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs text-gray-500 mb-1">Produits</p>
              <div className="flex flex-wrap gap-1">
                {delivery.items.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between items-center border-t border-gray-100">
          <p className="font-bold text-[#f5a623]">{delivery.amount.toLocaleString()} XAF</p>
          {deliveryPerson ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image
                  src={deliveryPerson.avatarUrl}
                  alt={deliveryPerson.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <p className="text-sm font-medium">{deliveryPerson.name}</p>
            </div>
          ) : (
            <Button size="sm" className="bg-[#f5a623] text-white hover:bg-[#e09000]">
              Assigner
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Livraisons</h1>
        <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">En attente</p>
          <p className="text-amber-600 text-2xl font-bold">{countByStatus.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">En cours</p>
          <p className="text-blue-600 text-2xl font-bold">{countByStatus.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Livrées aujourd'hui</p>
          <p className="text-green-600 text-2xl font-bold">{countByStatus.delivered}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Problèmes</p>
          <p className="text-red-600 text-2xl font-bold">{countByStatus.issues}</p>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher par numéro de commande, client ou adresse..." 
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
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Livrée">Livrée</SelectItem>
                <SelectItem value="Problème">Problème</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des livraisons (2 colonnes) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Livraisons ({filteredDeliveries.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeliveries.map(delivery => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        </div>

        {/* Détails de la livraison sélectionnée (1 colonne) */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Détails de la livraison</h2>
          {selectedDelivery ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-mono">Commande #{selectedDelivery.orderId}</CardTitle>
                    <CardDescription>
                      {selectedDelivery.status === 'Livrée' 
                        ? `Livrée à ${selectedDelivery.actualDelivery}`
                        : `Livraison prévue à ${selectedDelivery.estimatedDelivery}`
                      }
                    </CardDescription>
                  </div>
                  <Badge className={
                    selectedDelivery.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 
                    selectedDelivery.status === 'Livrée' ? 'bg-green-100 text-green-800' : 
                    selectedDelivery.status === 'Problème' ? 'bg-red-100 text-red-800' : 
                    'bg-amber-100 text-amber-800'
                  }>
                    {selectedDelivery.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Client</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {selectedDelivery.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{selectedDelivery.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedDelivery.customerPhone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Adresse de livraison</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{selectedDelivery.address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Produits ({selectedDelivery.totalItems})</h3>
                  <div className="space-y-2">
                    {selectedDelivery.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <p className="font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedDelivery.deliveryPerson && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Livreur</h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 relative">
                          <Image
                            src={getDeliveryPerson(selectedDelivery.deliveryPerson)?.avatarUrl || ""}
                            alt={selectedDelivery.deliveryPerson}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{selectedDelivery.deliveryPerson}</p>
                          <p className="text-sm text-gray-500">{getDeliveryPerson(selectedDelivery.deliveryPerson)?.phone}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <Truck className="h-4 w-4" /> {getDeliveryPerson(selectedDelivery.deliveryPerson)?.vehicle}
                        </p>
                        <p className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" /> {getDeliveryPerson(selectedDelivery.deliveryPerson)?.location}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between w-full">
                  <p className="text-gray-500">Sous-total</p>
                  <p>{(selectedDelivery.amount * 0.85).toLocaleString()} XAF</p>
                </div>
                <div className="flex justify-between w-full">
                  <p className="text-gray-500">Taxes (15%)</p>
                  <p>{(selectedDelivery.amount * 0.15).toLocaleString()} XAF</p>
                </div>
                <div className="flex justify-between w-full">
                  <p className="text-gray-500">Frais de livraison</p>
                  <p>1,500 XAF</p>
                </div>
                <div className="flex justify-between w-full font-bold pt-2 border-t border-gray-100">
                  <p>Total</p>
                  <p className="text-[#f5a623]">{(selectedDelivery.amount + 1500).toLocaleString()} XAF</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 w-full mt-3">
                  {selectedDelivery.status === 'En attente' && (
                    <>
                      <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                        Assigner un livreur
                      </Button>
                      <Button variant="outline">
                        Annuler
                      </Button>
                    </>
                  )}
                  
                  {selectedDelivery.status === 'En cours' && (
                    <>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="h-4 w-4 mr-1" /> Marquer comme livrée
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <X className="h-4 w-4 mr-1" /> Signaler un problème
                      </Button>
                    </>
                  )}
                  
                  {selectedDelivery.status === 'Livrée' && (
                    <>
                      <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white">
                        Voir le reçu
                      </Button>
                      <Button variant="outline">
                        Nouvelle commande
                      </Button>
                    </>
                  )}
                  
                  {selectedDelivery.status === 'Problème' && (
                    <>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Truck className="h-4 w-4 mr-1" /> Réassigner
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        Annuler la commande
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune livraison sélectionnée</h3>
              <p className="text-gray-500">Sélectionnez une livraison pour voir les détails</p>
            </div>
          )}

          {/* Liste des livreurs */}
          <h2 className="text-lg font-semibold mt-6 mb-4">Livreurs disponibles</h2>
          <div className="space-y-3">
            {deliveryPersons.map(person => (
              <div key={person.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 relative">
                    <Image
                      src={person.avatarUrl}
                      alt={person.name}
                      fill
                      className="rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      person.status === 'En ligne' ? 'bg-green-500' : 
                      person.status === 'Occupé' ? 'bg-amber-500' : 
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <Truck className="h-3 w-3" /> {person.vehicle}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {person.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Badge className={
                    person.status === 'En ligne' ? 'bg-green-100 text-green-800' : 
                    person.status === 'Occupé' ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-100 text-gray-800'
                  }>
                    {person.status} {person.activeDeliveries > 0 && `(${person.activeDeliveries})`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
