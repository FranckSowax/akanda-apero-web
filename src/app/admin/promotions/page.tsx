'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { 
  Gift, Plus, Search, Edit, Trash2, X, 
  Save, Eye, EyeOff, Calendar, Percent,
  Image as ImageIcon, Upload, AlertCircle
} from 'lucide-react';

// Types
interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  code?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  min_order_amount?: number;
  max_uses?: number;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface FormData {
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  min_order_amount: number;
  max_uses: number;
}

// Composants UI simples
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const baseClasses = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text', ...props }: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  [key: string]: any;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = '' }: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
    {children}
  </label>
);

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    code: '',
    start_date: '',
    end_date: '',
    is_active: true,
    is_featured: false,
    image_url: '',
    min_order_amount: 0,
    max_uses: 0
  });

  // Charger les promotions
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Upload d'image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('🖼️ Aucun fichier sélectionné');
      return;
    }

    console.log('🖼️ Début upload image:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `promotions/${fileName}`;

      console.log('🖼️ Tentative upload vers:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('🚨 Erreur upload Supabase:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload réussi, récupération URL publique...');

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🖼️ URL publique générée:', publicUrl);

      setFormData({ ...formData, image_url: publicUrl });
      console.log('✅ FormData mis à jour avec image_url:', publicUrl);
      
      alert('Image uploadée avec succès !');
    } catch (error) {
      console.error('🚨 Erreur détaillée lors de l\'upload:');
      console.error('Type d\'erreur:', typeof error);
      console.error('Erreur complète:', error);
      
      let errorMessage = 'Erreur lors de l\'upload de l\'image';
      if (error && typeof error === 'object' && error.message) {
        errorMessage = `Erreur upload: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    console.log('🚀 Début de la sauvegarde promotion...');
    console.log('📸 image_url:', formData.image_url);
    
    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        code: formData.code,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        image_url: formData.image_url || null,
        min_order_amount: formData.min_order_amount || null,
        max_uses: formData.max_uses || null,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Données à sauvegarder:', promotionData);

      if (isEditMode && currentPromotion) {
        console.log('📝 Vérification promotion:', currentPromotion.id);
        
        // Vérifier d'abord que la promotion existe
        const { data: existingPromotion, error: checkError } = await supabase
          .from('promotions')
          .select('*')
          .eq('id', currentPromotion.id);

        if (checkError) {
          console.error('❌ Erreur vérification:', checkError);
          throw checkError;
        }

        if (!existingPromotion || existingPromotion.length === 0) {
          console.error('❌ Promotion introuvable:', currentPromotion.id);
          console.error('Promotions disponibles:', promotions.map(p => ({id: p.id, title: p.title})));
          throw new Error(`Promotion ${currentPromotion.id} introuvable. Veuillez créer une nouvelle promotion.`);
        }

        console.log('✅ Promotion trouvée:', existingPromotion[0]);

        // Procéder à la mise à jour
        const { data, error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', currentPromotion.id)
          .select();

        if (error) {
          console.error('❌ Erreur mise à jour:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Promotion mise à jour:', data[0]);
          setPromotions(promotions.map(p => p.id === currentPromotion.id ? data[0] : p));
        } else {
          throw new Error('Mise à jour échouée - aucune ligne modifiée');
        }
      } else {
        console.log('➕ Création nouvelle promotion');
        const { data, error } = await supabase
          .from('promotions')
          .insert({
            ...promotionData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur création:', error);
          throw error;
        }
        
        console.log('✅ Promotion créée:', data);
        setPromotions([data, ...promotions]);
      }
      
      resetForm();
      console.log('🎉 Sauvegarde terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      
      let errorMessage = 'Erreur lors de la sauvegarde';
      
      if (error instanceof Error) {
        errorMessage = `Erreur: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Erreur: ${error}`;
      } else {
        errorMessage = `Erreur: ${JSON.stringify(error)}`;
      }
      
      console.error('Message d\'erreur formaté:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      code: '',
      start_date: '',
      end_date: '',
      is_active: true,
      is_featured: false,
      image_url: '',
      min_order_amount: 0,
      max_uses: 0
    });
    setShowForm(false);
    setIsEditMode(false);
    setCurrentPromotion(null);
  };

  // Gérer l'édition
  const handleEdit = async (promotion: Promotion) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        discount_type: promotion.discount_type || 'percentage',
        discount_value: promotion.discount_value || 0,
        code: promotion.code || '',
        start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
        is_active: promotion.is_active || false,
        is_featured: promotion.is_featured || false,
        image_url: promotion.image_url || '',
        min_order_amount: promotion.min_order_amount || 0,
        max_uses: promotion.max_uses || 0
      });
      
      setCurrentPromotion(promotion);
      setIsEditMode(true);
      setShowForm(true);
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Supprimer une promotion
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPromotions();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer les promotions
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (promotion.code && promotion.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && promotion.is_active) ||
                         (statusFilter === 'inactive' && !promotion.is_active);

    return matchesSearch && matchesStatus;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Formater la remise
  const formatDiscount = (promotion: Promotion) => {
    const value = promotion.discount_value || 0;
    if (promotion.discount_type === 'percentage') {
      return `${value}%`;
    } else {
      return `${value.toLocaleString('fr-FR')} FCFA`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Promotions</h1>
          <p className="text-gray-600">Gérez vos promotions et codes de réduction</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle promotion
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une promotion..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 text-sm rounded-lg ${
                statusFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 text-sm rounded-lg ${
                statusFilter === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-2 text-sm rounded-lg ${
                statusFilter === 'inactive' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactives
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Modifier la promotion' : 'Ajouter une promotion'}
            </h2>
            <Button variant="secondary" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre de la promotion</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Titre de la promotion"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code promo</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="CODE20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de la promotion"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount_type">Type de remise</Label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
              </div>
              <div>
                <Label htmlFor="discount_value">
                  Valeur {formData.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step={formData.discount_type === 'percentage' ? '1' : '100'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  step="100"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_uses">Nombre d'utilisations maximum</Label>
              <Input
                id="max_uses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: parseInt(e.target.value) || 0})}
                placeholder="0 = illimité"
              />
            </div>

            <div>
              <Label htmlFor="image_upload">Image de la promotion</Label>
              <div className="space-y-2">
                <input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Aperçu"
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG, GIF (max 5MB)
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_active">Promotion active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_featured">Promotion mise en avant</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={isProcessing}>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des promotions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredPromotions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisations
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {promotion.image_url && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={promotion.image_url}
                            alt={promotion.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{promotion.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {promotion.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {promotion.code || 'Aucun code'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDiscount(promotion)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{formatDate(promotion.start_date)}</div>
                        <div className="text-gray-500">au {formatDate(promotion.end_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {promotion.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {promotion.is_featured && (
                          <Gift className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {promotion.usage_count || 0}
                        {promotion.max_uses ? ` / ${promotion.max_uses}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(promotion)}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(promotion.id)}
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune promotion trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune promotion ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre première promotion.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une promotion
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
