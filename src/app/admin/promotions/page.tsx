'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  MoreHorizontal,
  Percent,
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Copy
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// Types pour les promotions
interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'Pourcentage' | 'Montant fixe' | 'Livraison gratuite';
  value: number;
  minPurchase?: number;
  status: 'Actif' | 'Inactif' | 'Planifié' | 'Expiré';
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  products: string[];
  categories: string[];
}

export default function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<number | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Données fictives pour les promotions
  const promotions: Promotion[] = [
    {
      id: 1,
      name: "Bienvenue Akanda",
      code: "WELCOME20",
      type: "Pourcentage",
      value: 20,
      minPurchase: 15000,
      status: "Actif",
      usageCount: 145,
      usageLimit: 300,
      startDate: "01/04/2025",
      endDate: "30/06/2025",
      products: [],
      categories: []
    },
    {
      id: 2,
      name: "Happy Hour",
      code: "HAPPY15",
      type: "Pourcentage",
      value: 15,
      status: "Actif",
      usageCount: 87,
      startDate: "01/05/2025",
      endDate: "01/08/2025",
      products: ["Cocktails", "Bières"],
      categories: ["Cocktails", "Bières"]
    },
    {
      id: 3,
      name: "Livraison Gratuite",
      code: "FREESHIP",
      type: "Livraison gratuite",
      value: 0,
      minPurchase: 25000,
      status: "Actif",
      usageCount: 210,
      startDate: "15/04/2025",
      endDate: "15/07/2025",
      products: [],
      categories: []
    },
    {
      id: 4,
      name: "Réduction Weekend",
      code: "WEEKEND10",
      type: "Pourcentage",
      value: 10,
      status: "Planifié",
      usageCount: 0,
      startDate: "15/05/2025",
      endDate: "31/12/2025",
      products: [],
      categories: ["Spiritueux", "Vins"]
    },
    {
      id: 5,
      name: "Fête des Mères",
      code: "MAMAN5000",
      type: "Montant fixe",
      value: 5000,
      minPurchase: 30000,
      status: "Planifié",
      usageCount: 0,
      usageLimit: 200,
      startDate: "20/05/2025",
      endDate: "04/06/2025",
      products: ["Vins", "Champagnes"],
      categories: ["Vins"]
    },
    {
      id: 6,
      name: "Lancement Site",
      code: "LAUNCH25",
      type: "Pourcentage",
      value: 25,
      minPurchase: 20000,
      status: "Expiré",
      usageCount: 354,
      usageLimit: 500,
      startDate: "01/01/2025",
      endDate: "31/03/2025",
      products: [],
      categories: []
    },
  ];

  // Filtrer les promotions en fonction du terme de recherche et de l'onglet actif
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return promo.status === 'Actif' && matchesSearch;
    if (activeTab === 'scheduled') return promo.status === 'Planifié' && matchesSearch;
    if (activeTab === 'expired') return promo.status === 'Expiré' && matchesSearch;
    
    return false;
  });

  // Gestionnaires d'événements
  const handleAddPromotion = () => {
    setIsAddEditDialogOpen(true);
  };

  const handleEditPromotion = (id: number) => {
    console.log(`Éditer la promotion ${id}`);
    // Navigation vers la page d'édition ou ouverture d'une modale d'édition
  };

  const handleDeletePromotion = (id: number) => {
    setPromotionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log(`Supprimer la promotion ${promotionToDelete}`);
    // Logique de suppression
    setIsDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Afficher une notification de confirmation (non implémentée ici)
  };

  // Composant pour la carte de promotion
  const PromotionCard = ({ promotion }: { promotion: Promotion }) => (
    <Card className="overflow-hidden">
      <div className={`h-2 ${
        promotion.status === 'Actif' ? 'bg-green-500' : 
        promotion.status === 'Planifié' ? 'bg-blue-500' : 
        'bg-gray-500'
      }`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={
            promotion.status === 'Actif' ? 'bg-green-100 text-green-800' : 
            promotion.status === 'Planifié' ? 'bg-blue-100 text-blue-800' : 
            promotion.status === 'Inactif' ? 'bg-gray-100 text-gray-800' : 
            'bg-red-100 text-red-800'
          }>
            {promotion.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditPromotion(promotion.id)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyCode(promotion.code)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copier le code</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePromotion(promotion.id)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl">{promotion.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Tag className="h-3 w-3" /> Code: <span className="font-mono font-bold">{promotion.code}</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1" onClick={() => handleCopyCode(promotion.code)}>
            <Copy className="h-3 w-3" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <Percent className="h-4 w-4 text-[#f5a623]" />
            <span className="font-medium">
              {promotion.type === 'Pourcentage' 
                ? `${promotion.value}% de réduction` 
                : promotion.type === 'Montant fixe' 
                ? `${promotion.value.toLocaleString()} XAF de réduction`
                : 'Livraison gratuite'}
            </span>
          </div>
          {promotion.minPurchase && (
            <Badge variant="outline" className="text-xs">
              Min. {promotion.minPurchase.toLocaleString()} XAF
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Du {promotion.startDate}
            </p>
          </div>
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Au {promotion.endDate}
            </p>
          </div>
        </div>

        {promotion.products.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {promotion.products.map((product, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {product}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Utilisations</p>
          <p className="font-medium">
            {promotion.usageCount}
            {promotion.usageLimit && <span className="text-gray-400">/{promotion.usageLimit}</span>}
          </p>
        </div>
        <Button 
          variant={promotion.status === 'Actif' ? 'destructive' : 'default'}
          size="sm"
          className={promotion.status === 'Actif' ? '' : 'bg-[#f5a623] text-white hover:bg-[#e09000]'}
        >
          {promotion.status === 'Actif' ? 'Désactiver' : 'Activer'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Promotions</h1>
        <Button 
          className="bg-[#f5a623] hover:bg-[#e09000] text-white flex items-center gap-2"
          onClick={handleAddPromotion}
        >
          <Plus className="h-4 w-4" />
          Créer une promotion
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Promotions</p>
          <p className="text-2xl font-bold">{promotions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Promotions Actives</p>
          <p className="text-green-600 text-2xl font-bold">
            {promotions.filter(p => p.status === 'Actif').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Promotions Planifiées</p>
          <p className="text-blue-600 text-2xl font-bold">
            {promotions.filter(p => p.status === 'Planifié').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Utilisations (ce mois)</p>
          <p className="text-[#f5a623] text-2xl font-bold">
            {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
          </p>
        </div>
      </div>

      {/* Onglets et recherche */}
      <div>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-4 max-w-md">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="active">Actives</TabsTrigger>
              <TabsTrigger value="scheduled">Planifiées</TabsTrigger>
              <TabsTrigger value="expired">Expirées</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Rechercher par nom ou code..." 
                className="pl-10" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map(promotion => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map(promotion => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map(promotion => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="expired" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map(promotion => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Formulaire d'ajout/édition de promotion (en dialogue) */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle promotion</DialogTitle>
            <DialogDescription>
              Remplissez les détails ci-dessous pour créer une nouvelle promotion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                placeholder="Ex: Offre spéciale weekend"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                placeholder="Ex: WEEKEND25"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                  <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Valeur
              </Label>
              <Input
                id="value"
                type="number"
                placeholder="Ex: 25"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min_purchase" className="text-right">
                Achat minimum
              </Label>
              <Input
                id="min_purchase"
                type="number"
                placeholder="Ex: 15000"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dates" className="text-right">
                Dates
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  id="start_date"
                  type="date"
                  placeholder="Date de début"
                />
                <Input
                  id="end_date"
                  type="date"
                  placeholder="Date de fin"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usage_limit" className="text-right">
                Limite d'utilisations
              </Label>
              <Input
                id="usage_limit"
                type="number"
                placeholder="Laisser vide pour illimité"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="active-status" />
                <Label htmlFor="active-status">Activer immédiatement</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Application
              </Label>
              <div className="col-span-3 space-y-4">
                <div className="space-y-2">
                  <Label>Appliquer à</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les produits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits</SelectItem>
                      <SelectItem value="specific_products">Produits spécifiques</SelectItem>
                      <SelectItem value="categories">Catégories spécifiques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white">
              Créer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette promotion ? Les clients ne pourront plus l'utiliser, mais les commandes passées avec ce code resteront inchangées.
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
