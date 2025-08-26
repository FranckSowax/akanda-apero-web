'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { AlcoholDosage } from '../../../types/supabase';

interface DosageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dosage: Partial<AlcoholDosage>) => void;
  editingDosage: AlcoholDosage | null;
}

export function DosageDialog({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  editingDosage 
}: DosageDialogProps) {
  const [formData, setFormData] = useState<Partial<AlcoholDosage>>({
    name: '',
    description: '',
    percentage: 12,
    price_modifier: 0,
    sort_order: 1,
    is_active: true
  });

  useEffect(() => {
    if (editingDosage) {
      setFormData(editingDosage);
    } else {
      setFormData({
        name: '',
        description: '',
        percentage: 12,
        price_modifier: 0,
        sort_order: 1,
        is_active: true
      });
    }
  }, [editingDosage, isOpen]);

  const handleInputChange = (field: keyof AlcoholDosage, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.percentage !== undefined) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingDosage ? 'Modifier le dosage' : 'Ajouter un nouveau dosage'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du dosage *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Standard, Léger, Fort"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du niveau d'alcool"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Pourcentage d'alcool *</Label>
              <Input
                id="percentage"
                type="number"
                value={formData.percentage || ''}
                onChange={(e) => handleInputChange('percentage', parseFloat(e.target.value) || 0)}
                placeholder="12"
                min="0"
                max="50"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_modifier">Modificateur de prix (XAF)</Label>
              <Input
                id="price_modifier"
                type="number"
                value={formData.price_modifier || ''}
                onChange={(e) => handleInputChange('price_modifier', parseFloat(e.target.value) || 0)}
                placeholder="0"
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
            {editingDosage ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
