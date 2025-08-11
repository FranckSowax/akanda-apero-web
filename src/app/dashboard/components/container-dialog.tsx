'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { CocktailContainer } from '../../../types/supabase';

interface ContainerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (container: Partial<CocktailContainer>) => void;
  editingContainer: CocktailContainer | null;
}

export function ContainerDialog({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  editingContainer 
}: ContainerDialogProps) {
  const [formData, setFormData] = useState<Partial<CocktailContainer>>({
    name: '',
    description: '',
    volume_ml: 500,
    base_price: 0,
    sort_order: 1,
    is_active: true
  });

  useEffect(() => {
    if (editingContainer) {
      setFormData(editingContainer);
    } else {
      setFormData({
        name: '',
        description: '',
        volume_ml: 500,
        base_price: 0,
        sort_order: 1,
        is_active: true
      });
    }
  }, [editingContainer, isOpen]);

  const handleInputChange = (field: keyof CocktailContainer, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.volume_ml && formData.base_price !== undefined) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingContainer ? 'Modifier le contenant' : 'Ajouter un nouveau contenant'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du contenant *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Gobelet Standard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du contenant"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume_ml">Volume (ml) *</Label>
              <Input
                id="volume_ml"
                type="number"
                value={formData.volume_ml || ''}
                onChange={(e) => handleInputChange('volume_ml', parseInt(e.target.value) || 0)}
                placeholder="500"
                min="100"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_price">Prix supplémentaire (XAF) *</Label>
              <Input
                id="base_price"
                type="number"
                value={formData.base_price || ''}
                onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Ordre d'affichage</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order || ''}
              onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 1)}
              placeholder="1"
              min="1"
            />
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

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {editingContainer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
