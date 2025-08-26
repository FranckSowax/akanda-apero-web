'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { ReadyCocktail } from '../../../types/supabase';
import { supabase } from '../../../lib/supabase/client';
import Image from 'next/image';

interface CocktailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cocktail: Partial<ReadyCocktail>) => void;
  editingCocktail: ReadyCocktail | null;
}

const colorThemes = [
  { value: 'green', label: 'Vert', color: 'bg-green-500' },
  { value: 'blue', label: 'Bleu', color: 'bg-blue-500' },
  { value: 'pink', label: 'Rose', color: 'bg-pink-500' },
  { value: 'yellow', label: 'Jaune', color: 'bg-yellow-500' },
  { value: 'lime', label: 'Lime', color: 'bg-lime-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'amber', label: 'Ambre', color: 'bg-amber-500' },
  { value: 'gold', label: 'Or', color: 'bg-yellow-600' },
  { value: 'sunset', label: 'Coucher de soleil', color: 'bg-gradient-to-r from-orange-500 to-pink-500' },
  { value: 'purple', label: 'Violet', color: 'bg-purple-500' }
];

const categories = [
  'Tropical',
  'Classique',
  'Fruité',
  'Signature',
  'Créatif',
  'Local',
  'Famille & Amis',
  'Romantique',
  'Détox',
  'Anniversaire'
];

export function CocktailDialog({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  editingCocktail 
}: CocktailDialogProps) {
  const [formData, setFormData] = useState<Partial<ReadyCocktail>>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: 0,
    default_alcohol_percentage: 12,
    category: '',
    categories: [],
    flavor_profile: '',
    color_theme: 'green',
    emoji: '🍹',
    main_ingredients: [],
    image_url: '',
    is_active: true,
    is_featured: false,
    stock_status: 'in_stock'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');

  // Upload d'image
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cocktail-${Date.now()}.${fileExt}`;
      const filePath = `cocktails/${fileName}`;

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

  // Gestion du fichier image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (editingCocktail) {
      setFormData({
        ...editingCocktail,
        main_ingredients: editingCocktail.main_ingredients || []
      });
      setImagePreview(editingCocktail.image_url || '');
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        base_price: 0,
        default_alcohol_percentage: 12,
        category: '',
        categories: [],
        flavor_profile: '',
        color_theme: 'green',
        emoji: '🍹',
        main_ingredients: [],
        image_url: '',
        is_active: true,
        is_featured: false,
        stock_status: 'in_stock'
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [editingCocktail, isOpen]);

  const handleInputChange = (field: keyof ReadyCocktail, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && formData.main_ingredients) {
      setFormData(prev => ({
        ...prev,
        main_ingredients: [...(prev.main_ingredients || []), newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      main_ingredients: prev.main_ingredients?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async () => {
    if (formData.name && formData.base_price !== undefined) {
      try {
        setUploadingImage(true);
        let imageUrl = formData.image_url;

        // Upload de l'image si un nouveau fichier est sélectionné
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }

        // Générer le slug à partir du nom si pas défini
        const slug = formData.slug || formData.name?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const cocktailData = {
          ...formData,
          slug,
          image_url: imageUrl
        };

        onSave(cocktailData);
        onOpenChange(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de l\'upload de l\'image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCocktail ? 'Modifier le cocktail' : 'Ajouter un nouveau cocktail'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du cocktail *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Mojito Classic"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                value={formData.emoji || ''}
                onChange={(e) => handleInputChange('emoji', e.target.value)}
                placeholder="🍹"
                maxLength={2}
              />
            </div>
          </div>

          {/* Upload d'image */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo du cocktail</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Description courte</Label>
            <Input
              id="short_description"
              value={formData.short_description || ''}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Description courte pour les cartes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description complète</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description détaillée du cocktail"
              rows={3}
            />
          </div>

          {/* Prix et alcool */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Prix de base (XAF) *</Label>
              <Input
                id="base_price"
                type="number"
                value={formData.base_price || ''}
                onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                placeholder="2500"
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_alcohol_percentage">% d'alcool par défaut</Label>
              <Input
                id="default_alcohol_percentage"
                type="number"
                value={formData.default_alcohol_percentage || ''}
                onChange={(e) => handleInputChange('default_alcohol_percentage', parseFloat(e.target.value) || 0)}
                placeholder="12"
                min="0"
                max="50"
                step="0.5"
              />
            </div>
          </div>

          {/* Catégories multiples et profil de saveur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégories</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.categories?.includes(category) || false}
                        onCheckedChange={(checked) => {
                          const currentCategories = formData.categories || [];
                          if (checked) {
                            handleInputChange('categories', [...currentCategories, category]);
                          } else {
                            handleInputChange('categories', currentCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`category-${category}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Affichage des catégories sélectionnées */}
              {formData.categories && formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          const currentCategories = formData.categories || [];
                          handleInputChange('categories', currentCategories.filter(c => c !== category));
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="flavor_profile">Profil de saveur</Label>
              <Input
                id="flavor_profile"
                value={formData.flavor_profile || ''}
                onChange={(e) => handleInputChange('flavor_profile', e.target.value)}
                placeholder="Ex: Frais et mentholé"
              />
            </div>
          </div>

          {/* Thème de couleur */}
          <div className="space-y-2">
            <Label>Thème de couleur</Label>
            <div className="grid grid-cols-5 gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleInputChange('color_theme', theme.value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.color_theme === theme.value 
                      ? 'border-gray-800 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${theme.color} mb-1`}></div>
                  <span className="text-xs">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ingrédients principaux */}
          <div className="space-y-2">
            <Label>Ingrédients principaux</Label>
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Ajouter un ingrédient"
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              />
              <Button type="button" onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.main_ingredients?.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>



          {/* Options */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured || false}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Cocktail populaire</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Actif</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {editingCocktail ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
