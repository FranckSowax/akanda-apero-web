'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { CocktailDialog } from '../../dashboard/components/cocktail-dialog';
import { ContainerDialog } from '../../dashboard/components/container-dialog';
import { DosageDialog } from '../../dashboard/components/dosage-dialog';
import { DashboardCocktailsService } from '../../../services/dashboard-cocktails-service';
import { ReadyCocktail, CocktailContainer, AlcoholDosage } from '../../../types/supabase';
import { toast } from 'react-hot-toast';

export default function AdminCocktailsPage() {
  // États pour les cocktails
  const [cocktails, setCocktails] = useState<ReadyCocktail[]>([]);
  const [containers, setContainers] = useState<CocktailContainer[]>([]);
  const [dosages, setDosages] = useState<AlcoholDosage[]>([]);
  const [isCocktailDialogOpen, setIsCocktailDialogOpen] = useState(false);
  const [isContainerDialogOpen, setIsContainerDialogOpen] = useState(false);
  const [isDosageDialogOpen, setIsDosageDialogOpen] = useState(false);
  const [editingCocktail, setEditingCocktail] = useState<ReadyCocktail | null>(null);
  const [editingContainer, setEditingContainer] = useState<CocktailContainer | null>(null);
  const [editingDosage, setEditingDosage] = useState<AlcoholDosage | null>(null);
  const [loadingCocktails, setLoadingCocktails] = useState(false);

  // Charger les données des cocktails
  const loadCocktailsData = async () => {
    try {
      setLoadingCocktails(true);
      const [cocktailsData, containersData, dosagesData] = await Promise.all([
        DashboardCocktailsService.getAllCocktails(),
        DashboardCocktailsService.getAllContainers(),
        DashboardCocktailsService.getAllDosages()
      ]);
      
      setCocktails(cocktailsData);
      setContainers(containersData);
      setDosages(dosagesData);
    } catch (error) {
      console.error('Erreur lors du chargement des cocktails:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoadingCocktails(false);
    }
  };

  // Gestion des cocktails
  const handleSaveCocktail = async (cocktail: Partial<ReadyCocktail>) => {
    try {
      if (editingCocktail) {
        const updated = await DashboardCocktailsService.updateCocktail(editingCocktail.id, cocktail);
        setCocktails(prev => prev.map(c => c.id === editingCocktail.id ? updated : c));
        toast.success('Cocktail modifié avec succès');
      } else {
        const created = await DashboardCocktailsService.createCocktail(cocktail);
        setCocktails(prev => [created, ...prev]);
        toast.success('Cocktail créé avec succès');
      }
      setEditingCocktail(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cocktail:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEditCocktail = (cocktail: ReadyCocktail) => {
    setEditingCocktail(cocktail);
    setIsCocktailDialogOpen(true);
  };

  const handleDeleteCocktail = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cocktail ?')) {
      try {
        await DashboardCocktailsService.deleteCocktail(id);
        setCocktails(prev => prev.filter(c => c.id !== id));
        toast.success('Cocktail supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du cocktail:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Gestion des contenants
  const handleSaveContainer = async (container: Partial<CocktailContainer>) => {
    try {
      if (editingContainer) {
        const updated = await DashboardCocktailsService.updateContainer(editingContainer.id, container);
        setContainers(prev => prev.map(c => c.id === editingContainer.id ? updated : c));
        toast.success('Contenant modifié avec succès');
      } else {
        const created = await DashboardCocktailsService.createContainer(container);
        setContainers(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
        toast.success('Contenant créé avec succès');
      }
      setEditingContainer(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contenant:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEditContainer = (container: CocktailContainer) => {
    setEditingContainer(container);
    setIsContainerDialogOpen(true);
  };

  const handleDeleteContainer = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contenant ?')) {
      try {
        await DashboardCocktailsService.deleteContainer(id);
        setContainers(prev => prev.filter(c => c.id !== id));
        toast.success('Contenant supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du contenant:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Gestion des dosages
  const handleSaveDosage = async (dosage: Partial<AlcoholDosage>) => {
    try {
      if (editingDosage) {
        const updated = await DashboardCocktailsService.updateDosage(editingDosage.id, dosage);
        setDosages(prev => prev.map(d => d.id === editingDosage.id ? updated : d));
        toast.success('Dosage modifié avec succès');
      } else {
        const created = await DashboardCocktailsService.createDosage(dosage);
        setDosages(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
        toast.success('Dosage créé avec succès');
      }
      setEditingDosage(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du dosage:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEditDosage = (dosage: AlcoholDosage) => {
    setEditingDosage(dosage);
    setIsDosageDialogOpen(true);
  };

  const handleDeleteDosage = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dosage ?')) {
      try {
        await DashboardCocktailsService.deleteDosage(id);
        setDosages(prev => prev.filter(d => d.id !== id));
        toast.success('Dosage supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du dosage:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadCocktailsData();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Cocktails</h1>
        <p className="text-gray-600 mt-2">Gérez vos cocktails prêts à boire, contenants et dosages d'alcool.</p>
      </div>

      <Tabs defaultValue="cocktails" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-3 h-auto p-1">
          <TabsTrigger className="text-sm flex-1 py-3 px-4" value="cocktails">
            Cocktails
          </TabsTrigger>
          <TabsTrigger className="text-sm flex-1 py-3 px-4" value="containers">
            Contenants
          </TabsTrigger>
          <TabsTrigger className="text-sm flex-1 py-3 px-4" value="dosages">
            Dosages
          </TabsTrigger>
        </TabsList>

        {/* Cocktails Tab */}
        <TabsContent value="cocktails">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Cocktails Prêts à Boire</CardTitle>
                  <CardDescription>Gérez vos cocktails, leurs prix et disponibilité.</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingCocktail(null);
                    setIsCocktailDialogOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Ajouter un cocktail
                </Button>
              </div>

              <CocktailDialog
                isOpen={isCocktailDialogOpen}
                onOpenChange={setIsCocktailDialogOpen}
                onSave={handleSaveCocktail}
                editingCocktail={editingCocktail}
              />
            </CardHeader>
            <CardContent>
              {loadingCocktails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cocktail</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Prix de base</TableHead>
                        <TableHead className="text-center">% Alcool</TableHead>
                        <TableHead className="text-center">Populaire</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cocktails.map((cocktail) => (
                        <TableRow key={cocktail.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{cocktail.emoji}</span>
                              <div>
                                <div className="font-medium">{cocktail.name}</div>
                                <div className="text-sm text-gray-500">{cocktail.flavor_profile}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{cocktail.category}</TableCell>
                          <TableCell className="text-right">{cocktail.base_price?.toLocaleString()} XAF</TableCell>
                          <TableCell className="text-center">{cocktail.default_alcohol_percentage}%</TableCell>
                          <TableCell className="text-center">{cocktail.is_featured ? 'Oui' : 'Non'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${cocktail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {cocktail.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => handleEditCocktail(cocktail)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCocktail(cocktail.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Containers Tab */}
        <TabsContent value="containers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Contenants</CardTitle>
                  <CardDescription>Gérez les types de gobelets et leurs prix.</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingContainer(null);
                    setIsContainerDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un contenant
                </Button>
              </div>

              <ContainerDialog
                isOpen={isContainerDialogOpen}
                onOpenChange={setIsContainerDialogOpen}
                onSave={handleSaveContainer}
                editingContainer={editingContainer}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {containers.map((container) => (
                  <div key={container.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{container.name}</div>
                      <div className="text-sm text-gray-500">
                        {container.volume_ml}ml - +{container.base_price} XAF
                      </div>
                      {container.description && (
                        <div className="text-xs text-gray-400 mt-1">{container.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditContainer(container)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContainer(container.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dosages Tab */}
        <TabsContent value="dosages">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Dosages d'Alcool</CardTitle>
                  <CardDescription>Gérez les niveaux d'alcool et leurs modificateurs de prix.</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingDosage(null);
                    setIsDosageDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un dosage
                </Button>
              </div>

              <DosageDialog
                isOpen={isDosageDialogOpen}
                onOpenChange={setIsDosageDialogOpen}
                onSave={handleSaveDosage}
                editingDosage={editingDosage}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dosages.map((dosage) => (
                  <div key={dosage.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{dosage.name}</div>
                      <div className="text-sm text-gray-500">
                        {dosage.percentage}% - {dosage.price_modifier > 0 ? `+${dosage.price_modifier} XAF` : 'Gratuit'}
                      </div>
                      {dosage.description && (
                        <div className="text-xs text-gray-400 mt-1">{dosage.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDosage(dosage)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDosage(dosage.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
