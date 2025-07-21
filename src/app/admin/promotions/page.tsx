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
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";

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
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    value: 0,
    min_purchase: null as number | null,
    max_discount: null as number | null,
    status: 'active' as 'active' | 'inactive' | 'scheduled' | 'expired',
    usage_limit: null as number | null,
    start_date: '',
    end_date: '',
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
    is_stackable: false,
    is_first_order_only: false
  });
  const [saving, setSaving] = useState(false);

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

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      min_purchase: null,
      max_discount: null,
      status: 'active',
      usage_limit: null,
      start_date: '',
      end_date: '',
      applicable_products: [],
      applicable_categories: [],
      is_stackable: false,
      is_first_order_only: false
    });
  };

  // Remplir le formulaire avec les données d'une promotion existante
  const fillForm = (promotion: Promotion) => {
    setFormData({
      name: promotion.name,
      code: promotion.code,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value,
      min_purchase: promotion.min_purchase,
      max_discount: promotion.max_discount,
      status: promotion.status,
      usage_limit: promotion.usage_limit,
      start_date: promotion.start_date.split('T')[0], // Format YYYY-MM-DD
      end_date: promotion.end_date.split('T')[0],
      applicable_products: promotion.applicable_products || [],
      applicable_categories: promotion.applicable_categories || [],
      is_stackable: promotion.is_stackable,
      is_first_order_only: promotion.is_first_order_only
    });
  };

  // Sauvegarder une promotion (ajout ou édition)
  const handleSavePromotion = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation basique
      if (!formData.name || !formData.code || !formData.start_date || !formData.end_date) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const promotionData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        type: formData.type,
        value: formData.value,
        min_purchase: formData.min_purchase,
        max_discount: formData.max_discount,
        status: formData.status,
        usage_limit: formData.usage_limit,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        applicable_products: formData.applicable_products,
        applicable_categories: formData.applicable_categories,
        is_stackable: formData.is_stackable,
        is_first_order_only: formData.is_first_order_only
      };

      if (editingPromotion) {
        // Édition
        const { error: updateError } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id);
        
        if (updateError) throw updateError;
      } else {
        // Ajout
        const { error: insertError } = await supabase
          .from('promotions')
          .insert([promotionData]);
        
        if (insertError) throw insertError;
      }

      await fetchPromotions(); // Recharger la liste
      setIsAddEditDialogOpen(false);
      setEditingPromotion(null);
      resetForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Impossible de sauvegarder la promotion');
    } finally {
      setSaving(false);
    }
  };

  // Ouverture du dialog d'édition
  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    fillForm(promotion);
    setIsAddEditDialogOpen(true);
  };

  // Ouverture du dialog d'ajout
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    resetForm();
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
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-gray-50 text-gray-600"
          >
            Toutes ({promotions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-gray-50 text-gray-600"
          >
            Actives ({promotions.filter(p => p.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-gray-50 text-gray-600"
          >
            Planifiées ({promotions.filter(p => p.status === 'scheduled').length})
          </TabsTrigger>
          <TabsTrigger 
            value="expired" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-gray-50 text-gray-600"
          >
            Expirées ({promotions.filter(p => p.status === 'expired').length})
          </TabsTrigger>
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
                          <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-50">
                            <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleEditPromotion(promotion)}
                              className="text-gray-900 hover:bg-gray-100 cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigator.clipboard.writeText(promotion.code)}
                              className="text-gray-900 hover:bg-gray-100 cursor-pointer"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copier le code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200" />
                            <DropdownMenuItem 
                              onClick={() => {
                                setPromotionToDelete(promotion.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* Dialog d'ajout/édition */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        {isAddEditDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        )}
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl z-50 mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'Modifiez les informations de la promotion' : 'Créez une nouvelle promotion ou code de réduction'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6 px-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              </div>
            )}
            
            {/* Informations générales */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations générales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nom de la promotion *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Bienvenue Akanda"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">Code promo *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: WELCOME20"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la promotion..."
                  rows={3}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Type et valeur */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Type et valeur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type de réduction *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage</SelectItem>
                      <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                      <SelectItem value="free_shipping">Livraison gratuite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                    {formData.type === 'percentage' ? 'Pourcentage (%)' : 
                     formData.type === 'fixed_amount' ? 'Montant (FCFA)' : 'Valeur'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    placeholder={formData.type === 'percentage' ? '20' : '5000'}
                    disabled={formData.type === 'free_shipping'}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Conditions d'application</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_purchase" className="text-sm font-medium text-gray-700">Achat minimum (FCFA)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    value={formData.min_purchase || ''}
                    onChange={(e) => setFormData({...formData, min_purchase: parseFloat(e.target.value) || null})}
                    placeholder="15000"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount" className="text-sm font-medium text-gray-700">Réduction maximum (FCFA)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    value={formData.max_discount || ''}
                    onChange={(e) => setFormData({...formData, max_discount: parseFloat(e.target.value) || null})}
                    placeholder="10000"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Statut et limite d'utilisation */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Gestion et statut</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="scheduled">Planifié</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage_limit" className="text-sm font-medium text-gray-700">Limite d'utilisation</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({...formData, usage_limit: parseInt(e.target.value) || null})}
                    placeholder="100"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Période de validité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Date de début *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">Date de fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Options avancées */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Options avancées</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_stackable"
                    checked={formData.is_stackable}
                    onCheckedChange={(checked) => setFormData({...formData, is_stackable: checked})}
                  />
                  <Label htmlFor="is_stackable" className="text-sm font-medium text-gray-700">Cumulable avec d'autres promotions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_first_order_only"
                    checked={formData.is_first_order_only}
                    onCheckedChange={(checked) => setFormData({...formData, is_first_order_only: checked})}
                  />
                  <Label htmlFor="is_first_order_only" className="text-sm font-medium text-gray-700">Réservé aux nouvelles commandes uniquement</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddEditDialogOpen(false);
                setError(null);
              }}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSavePromotion}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                editingPromotion ? 'Modifier' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
