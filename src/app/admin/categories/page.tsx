'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { 
  Plus, Search, Edit, Trash2, X, Save, AlertCircle, 
  Eye, EyeOff, Package, Wine, Beer, GlassWater, 
  Sparkles, Coffee, Beaker, Utensils, Star,
  ChevronUp, ChevronDown, Image as ImageIcon
} from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Composants UI intégrés
function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  type = 'button',
  onClick,
  disabled = false 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  };
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label = ({ className = '', ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    emoji: '📦',
    color: '#3B82F6',
    is_active: true,
    sort_order: 0,
    image_url: ''
  });

  // Icônes disponibles pour les catégories
  const availableIcons = [
    { emoji: '🎁', name: 'Formules' },
    { emoji: '🍷', name: 'Vins' },
    { emoji: '🍺', name: 'Bières' },
    { emoji: '🥃', name: 'Spiritueux' },
    { emoji: '🍾', name: 'Champagnes' },
    { emoji: '🧊', name: 'Softs' },
    { emoji: '☕', name: 'Café/Thé' },
    { emoji: '🥤', name: 'Boissons' },
    { emoji: '📦', name: 'Autres' }
  ];

  // Charger les catégories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrer les catégories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Remplacer tirets multiples par un seul
      .trim()
      .replace(/^-+|-+$/g, ''); // Supprimer tirets en début/fin
  };

  // Ouvrir le modal pour créer/éditer
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug || generateSlug(category.name),
        description: category.description || '',
        emoji: category.emoji,
        color: category.color,
        is_active: category.is_active,
        sort_order: category.sort_order,
        image_url: category.image_url || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        emoji: '📦',
        color: '#3B82F6',
        is_active: true,
        sort_order: categories.length,
        image_url: ''
      });
    }
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Sauvegarder la catégorie
  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Générer le slug automatiquement si vide
      const slug = formData.slug || generateSlug(formData.name);
      
      if (editingCategory) {
        // Mise à jour
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: slug,
            description: formData.description || null,
            emoji: formData.emoji,
            color: formData.color,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            image_url: formData.image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: slug,
            description: formData.description || null,
            emoji: formData.emoji,
            color: formData.color,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            image_url: formData.image_url || null
          });

        if (error) throw error;
      }

      await loadCategories();
      closeModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      
      // Affichage détaillé de l'erreur
      let errorMessage = 'Erreur lors de la sauvegarde de la catégorie';
      
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage += ': ' + (err as any).message;
        } else if ('error' in err) {
          errorMessage += ': ' + (err as any).error;
        } else {
          errorMessage += ': ' + JSON.stringify(err);
        }
      } else if (typeof err === 'string') {
        errorMessage += ': ' + err;
      }
      
      alert(errorMessage);
    }
  };

  // Ouvrir le modal de confirmation de suppression
  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Fermer le modal de suppression
  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  // Supprimer une catégorie (fonction effective)
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;
      
      // Recharger la liste des catégories
      await loadCategories();
      
      // Fermer le modal
      closeDeleteModal();
      
      // Notification de succès
      alert('Catégorie supprimée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  // Basculer le statut actif/inactif
  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          is_active: !category.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      alert('Erreur lors du changement de statut');
    }
  };

  // Changer l'ordre de tri
  const changeSortOrder = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];

    try {
      // Échanger les sort_order
      await supabase
        .from('categories')
        .update({ sort_order: targetCategory.sort_order })
        .eq('id', category.id);

      await supabase
        .from('categories')
        .update({ sort_order: category.sort_order })
        .eq('id', targetCategory.id);

      await loadCategories();
    } catch (err) {
      console.error('Erreur lors du changement d\'ordre:', err);
      alert('Erreur lors du changement d\'ordre');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCategories}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Catégories</h1>
          <p className="text-gray-600">Gérez les catégories de produits de votre boutique</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <EyeOff className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => !c.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avec Image</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.image_url).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </div>
        </div>

        {/* Liste des catégories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Commencez par créer votre première catégorie.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une catégorie
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordre
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.emoji}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            {category.image_url && (
                              <div className="flex items-center mt-1">
                                <ImageIcon className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">Image disponible</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(category)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.is_active ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-900">{category.sort_order}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => changeSortOrder(category, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                            </button>
                            <button
                              onClick={() => changeSortOrder(category, 'down')}
                              disabled={index === filteredCategories.length - 1}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                              e?.preventDefault();
                              e?.stopPropagation();
                              openDeleteModal(category);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de création/édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={saveCategory} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de la catégorie *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newName = e.target.value;
                        setFormData({ 
                          ...formData, 
                          name: newName,
                          slug: formData.slug || generateSlug(newName)
                        });
                      }}
                      placeholder="Ex: Vins rouges"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Ex: vins-rouges"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisé dans l'URL. Généré automatiquement depuis le nom.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description de la catégorie..."
                      rows={3}
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emoji">Emoji</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableIcons.map((icon) => (
                          <button
                            key={icon.emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, emoji: icon.emoji })}
                            className={`p-2 text-lg border rounded-lg hover:bg-gray-50 ${
                              formData.emoji === icon.emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                          >
                            {icon.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="color">Couleur</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, color: e.target.value })}
                          className="h-10 w-16 rounded border border-gray-300"
                        />
                        <Input
                          type="text"
                          value={formData.color}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sort_order">Ordre d'affichage</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL de l'image (optionnel)</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="is_active">Catégorie active</Label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Supprimer la catégorie
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{categoryToDelete.name}"</strong> ?
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Cette action est irréversible et supprimera définitivement cette catégorie.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDeleteModal}
                      className="px-4 py-2"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={confirmDeleteCategory}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
