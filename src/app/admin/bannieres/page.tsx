'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Banner, BannerInsert, BannerUpdate } from '../../../types/supabase';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  MoreHorizontal,
  Save,
  X,
  Loader2,
  Move
} from 'lucide-react';
import Image from 'next/image';

interface BannerFormData extends Omit<BannerInsert, 'image_url'> {
  image_url: string;
  imageFile?: File;
}

const BANNER_TYPES = [
  { value: 'hero_slide', label: 'Slide Hero', description: 'Slides du carousel principal' },
  { value: 'cocktail_kit_bg', label: 'Fond Cocktail Kits', description: 'Image de fond du module cocktail kits' },
  { value: 'parallax_section', label: 'Section Parallax', description: 'Image parallax avant le cocktail de la semaine' }
];

const GRADIENT_OPTIONS = [
  'from-orange-400/50 to-orange-500/50',
  'from-purple-400/50 to-purple-500/50',
  'from-blue-400/50 to-blue-500/50',
  'from-pink-400/50 to-pink-500/50',
  'from-green-400/50 to-green-500/50',
  'from-red-400/50 to-red-500/50',
  'from-yellow-400/50 to-yellow-500/50',
  'from-indigo-400/50 to-indigo-500/50'
];

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<BannerFormData>({
    type: 'hero_slide',
    title: '',
    subtitle: '',
    price: '',
    rating: '',
    year: '',
    gradient: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });

  // Charger les bannières
  const loadBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('type')
        .order('sort_order');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des bannières:', error);
      toast.error('Erreur lors du chargement des bannières');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Upload d'image
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      console.log('Tentative d\'upload:', { fileName, filePath, fileSize: file.size });

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erreur upload Supabase:', uploadError);
        throw new Error(`Erreur d'upload: ${uploadError.message || JSON.stringify(uploadError)}`);
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Upload réussi, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Erreur dans uploadImage:', error);
      throw error;
    }
  };

  // Gestion du changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarder une bannière
  const saveBanner = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.image_url;

      // Upload de l'image si nécessaire
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      const bannerData: BannerInsert = {
        type: formData.type,
        title: formData.title || null,
        subtitle: formData.subtitle || null,
        price: formData.price || null,
        rating: formData.rating || null,
        year: formData.year || null,
        gradient: formData.gradient || null,
        image_url: imageUrl,
        is_active: formData.is_active,
        sort_order: formData.sort_order
      };

      if (editingBanner) {
        // Mise à jour
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Bannière mise à jour avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('banners')
          .insert(bannerData);

        if (error) throw error;
        toast.success('Bannière créée avec succès');
      }

      setIsModalOpen(false);
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Erreur lors de la sauvegarde';
      if (error instanceof Error) {
        errorMessage = `Erreur: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = `Erreur: ${JSON.stringify(error)}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une bannière
  const deleteBanner = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bannière supprimée avec succès');
      loadBanners();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Basculer le statut actif/inactif
  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      toast.success(`Bannière ${!banner.is_active ? 'activée' : 'désactivée'}`);
      loadBanners();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      type: 'hero_slide',
      title: '',
      subtitle: '',
      price: '',
      rating: '',
      year: '',
      gradient: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    });
    setEditingBanner(null);
    setImagePreview('');
  };

  // Ouvrir le modal d'édition
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      price: banner.price || '',
      rating: banner.rating || '',
      year: banner.year || '',
      gradient: banner.gradient || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order
    });
    setImagePreview(banner.image_url || '');
    setIsModalOpen(true);
  };

  // Ouvrir le modal de création
  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Grouper les bannières par type
  const bannersByType = banners.reduce((acc, banner) => {
    if (!acc[banner.type]) acc[banner.type] = [];
    acc[banner.type].push(banner);
    return acc;
  }, {} as Record<string, Banner[]>);

  const getBannerTypeLabel = (type: string) => {
    return BANNER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getBannerTypeDescription = (type: string) => {
    return BANNER_TYPES.find(t => t.value === type)?.description || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Bannières</h1>
          <p className="text-gray-600 mt-2">
            Gérez les images et textes de la page d'accueil
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Bannière
        </Button>
      </div>

      {/* Affichage par type de bannière */}
      <div className="space-y-8">
        {BANNER_TYPES.map(bannerType => {
          const typeBanners = bannersByType[bannerType.value] || [];
          
          return (
            <Card key={bannerType.value}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{bannerType.label}</h2>
                    <p className="text-sm text-gray-600 mt-1">{bannerType.description}</p>
                  </div>
                  <Badge variant="outline">
                    {typeBanners.length} élément{typeBanners.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeBanners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeBanners.map(banner => (
                      <div key={banner.id} className="border rounded-lg p-4 space-y-3">
                        {/* Image preview */}
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                          {banner.image_url ? (
                            <Image
                              src={banner.image_url}
                              alt={banner.title || 'Bannière'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Status badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant={banner.is_active ? "default" : "secondary"}>
                              {banner.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          {banner.title && (
                            <h3 className="font-medium text-sm">{banner.title}</h3>
                          )}
                          {banner.subtitle && (
                            <p className="text-xs text-gray-600 line-clamp-2">{banner.subtitle}</p>
                          )}
                          {banner.price && (
                            <p className="text-xs font-medium text-green-600">{banner.price}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500">
                            Ordre: {banner.sort_order}
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => openEditModal(banner)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleActive(banner)}>
                                {banner.is_active ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteBanner(banner.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune bannière de ce type</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de création/édition */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Type de bannière */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de bannière</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {BANNER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload d'image */}
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="space-y-4">
                {/* Preview */}
                {imagePreview && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={imagePreview}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* Upload button */}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    Choisir une image
                  </Label>
                  
                  {/* URL directe */}
                  <div className="flex-1">
                    <Input
                      placeholder="Ou saisir une URL d'image"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image_url: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Champs spécifiques aux slides hero */}
            {formData.type === 'hero_slide' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Textarea
                      id="title"
                      placeholder="COCKTAIL\nTIME!"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Sous-titre</Label>
                    <Textarea
                      id="subtitle"
                      placeholder="Description du slide"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix</Label>
                    <Input
                      id="price"
                      placeholder="2500 XAF"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Note</Label>
                    <Input
                      id="rating"
                      placeholder="4.8"
                      value={formData.rating || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Année</Label>
                    <Input
                      id="year"
                      placeholder="2020"
                      value={formData.year || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradient">Gradient</Label>
                  <Select
                    value={formData.gradient || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gradient: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un gradient" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {GRADIENT_OPTIONS.map(gradient => (
                        <SelectItem key={gradient} value={gradient}>
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-4 h-4 rounded bg-gradient-to-r ${gradient}`}
                            />
                            {gradient}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Autres champs pour les autres types */}
            {formData.type !== 'hero_slide' && (
              <div className="space-y-2">
                <Label htmlFor="title">Titre/Description</Label>
                <Input
                  id="title"
                  placeholder="Description de la bannière"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
            )}

            {/* Paramètres généraux */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordre d'affichage</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button
                onClick={saveBanner}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {uploading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
