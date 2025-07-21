'use client';

import React, { useState, useEffect } from 'react';
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
  Copy,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import { Promotion } from '../../../types/supabase';
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
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export default function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Récupération des promotions depuis Supabase
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setPromotions(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des promotions:', err);
      setError('Impossible de charger les promotions');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une promotion
  const handleDeletePromotion = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      await fetchPromotions(); // Recharger la liste
      setIsDeleteDialogOpen(false);
      setPromotionToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer la promotion');
    }
  };

  // Ouverture du dialog d'édition
  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsAddEditDialogOpen(true);
  };

  // Ouverture du dialog d'ajout
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsAddEditDialogOpen(true);
  };

  // Chargement initial
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Fonctions utilitaires pour l'affichage
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Actif', color: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
      'scheduled': { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
      'expired': { label: 'Expiré', color: 'bg-red-100 text-red-800' }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      'percentage': 'Pourcentage',
      'fixed_amount': 'Montant fixe',
      'free_shipping': 'Livraison gratuite'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'fixed_amount') return `${value.toLocaleString()} FCFA`;
    return 'Gratuit';
  };

  // Filtrage des promotions selon l'onglet actif
  const filteredPromotions = promotions.filter(promotion => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return promotion.status === 'active';
    if (activeTab === 'scheduled') return promotion.status === 'scheduled';
    if (activeTab === 'expired') return promotion.status === 'expired';
    return true;
  }).filter(promotion => 
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Chargement des promotions...</span>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
          <Button onClick={fetchPromotions} className="ml-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Promotions</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos codes de réduction et offres promotionnelles
          </p>
        </div>
        <Button onClick={handleAddPromotion} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Promotion
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Onglets de filtrage */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="scheduled">Planifiées</TabsTrigger>
          <TabsTrigger value="expired">Expirées</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table des promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({filteredPromotions.length})</CardTitle>
          <CardDescription>
            Liste de toutes vos promotions et codes de réduction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune promotion trouvée</p>
              <Button onClick={handleAddPromotion} className="mt-4">
                Créer votre première promotion
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Nom</th>
                    <th className="text-left p-4 font-medium">Code</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Valeur</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Utilisation</th>
                    <th className="text-left p-4 font-medium">Dates</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          {promotion.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {promotion.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {promotion.code}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {getTypeLabel(promotion.type)}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatValue(promotion.type, promotion.value)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(promotion.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {promotion.usage_count}
                          {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{formatDate(promotion.start_date)}</div>
                          <div className="text-gray-500">{formatDate(promotion.end_date)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigator.clipboard.writeText(promotion.code)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copier le code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setPromotionToDelete(promotion.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la promotion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette promotion ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => promotionToDelete && handleDeletePromotion(promotionToDelete)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
