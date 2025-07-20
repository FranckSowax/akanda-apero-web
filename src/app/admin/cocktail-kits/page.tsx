'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { 
  Package, Plus, Search, Edit, Trash2, X, 
  Star, AlertCircle, Save, Eye, EyeOff, 
  ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';

// Types
interface Cocktail {
  id: string;
  name: string;
  description: string;
  base_price: number;
  difficulty_level: number;
  preparation_time_minutes: number;
  category: string;
  recipe?: string;
  image_url?: string;
  video_url?: string;
  alcohol_percentage?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Mocktail {
  id: string;
  name: string;
  description: string;
  base_price: number;
  difficulty_level: number;
  preparation_time_minutes: number;
  category: string;
  recipe?: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

// Composants UI simples
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
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
    className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
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

export default function CocktailKitsPage() {
  // États
  const [activeTab, setActiveTab] = useState<'cocktails' | 'mocktails'>('cocktails');
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [mocktails, setMocktails] = useState<Mocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    difficulty_level: 1,
    preparation_time_minutes: 5,
    category: 'Famille & amis',
    recipe: '',
    image_url: '',
    video_url: '',
    alcohol_percentage: 0,
    is_active: true,
    is_featured: false
  });

  const categories = ['Famille & amis', 'Anniversaire', 'Romantique', 'Local'];

  // Fonctions de chargement des données
  const loadCocktails = async () => {
    try {
      console.log('=== CHARGEMENT DES COCKTAILS ===');
      setLoading(true);
      const { data, error } = await supabase
        .from('cocktails_maison')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des cocktails:', error);
        throw error;
      }
      
      console.log('✅ Cocktails récupérés:', data?.length || 0);
      
      // Debug: Afficher les données du premier cocktail
      if (data && data.length > 0) {
        console.log('Premier cocktail:', data[0]);
        console.log('Image URL du premier:', data[0].image_url);
        
        // Chercher spécifiquement le Mojito
        const mojito = data.find(c => c.name.toLowerCase().includes('mojito'));
        if (mojito) {
          console.log('🍹 Mojito trouvé:', mojito);
          console.log('🖼️ Image URL du Mojito:', mojito.image_url);
        }
      }
      
      setCocktails(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cocktails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMocktails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mocktails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMocktails(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mocktails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload d'image (même logique que les produits)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('=== DÉBUT UPLOAD IMAGE ===');
    console.log('Fichier sélectionné:', file.name, file.size, 'bytes');

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale: 5MB');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cocktails/${fileName}`;
      
      console.log('Chemin de fichier:', filePath);

      // Upload vers Supabase Storage
      console.log('Upload vers Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('❌ Erreur upload Supabase:', error);
        alert('Erreur lors de l\'upload de l\'image: ' + error.message);
        return;
      }

      console.log('✅ Upload réussi:', data);

      // Obtenir l'URL publique
      console.log('Génération de l\'URL publique...');
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('✅ URL publique générée:', publicUrl);

      // Mettre à jour le formData avec l'URL de l'image
      const updatedFormData = { ...formData, image_url: publicUrl };
      console.log('FormData avant mise à jour:', formData);
      console.log('FormData après mise à jour:', updatedFormData);
      
      setFormData(updatedFormData);
      
      console.log('✅ Upload terminé avec succès');
      alert('Image uploadée avec succès!');
      
    } catch (err) {
      console.error('❌ Erreur générale lors de l\'upload:', err);
      alert('Erreur lors de l\'upload de l\'image: ' + (err as Error).message);
    }
  };

  // Fonctions CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DÉBUT SOUMISSION FORMULAIRE ===');
    console.log('FormData au moment de la soumission:', formData);
    console.log('Image URL présente:', !!formData.image_url);
    console.log('Image URL valeur:', formData.image_url);
    
    try {
      const table = activeTab === 'cocktails' ? 'cocktails_maison' : 'mocktails';
      console.log('Table cible:', table);
      console.log('Mode édition:', isEditMode, 'ID:', currentId);
      
      if (isEditMode && currentId) {
        console.log('Mise à jour en cours...');
        console.log('ID cible:', currentId);
        console.log('Données à mettre à jour:', formData);
        
        // Vérifier d'abord que l'enregistrement existe
        const { data: existingRecord, error: checkError } = await supabase
          .from(table)
          .select('id, name')
          .eq('id', currentId)
          .single();
        
        if (checkError || !existingRecord) {
          console.error('❌ Enregistrement non trouvé:', checkError);
          throw new Error(`Enregistrement avec l'ID ${currentId} non trouvé`);
        }
        
        console.log('✅ Enregistrement trouvé:', existingRecord);
        
        // Effectuer la mise à jour
        const { data, error } = await supabase
          .from(table)
          .update({
            name: formData.name,
            description: formData.description,
            base_price: formData.base_price,
            difficulty_level: formData.difficulty_level,
            preparation_time_minutes: formData.preparation_time_minutes,
            category: formData.category,
            recipe: formData.recipe,
            image_url: formData.image_url,
            video_url: formData.video_url,
            video_type: formData.video_type,
            alcohol_percentage: formData.alcohol_percentage,
            is_active: formData.is_active,
            is_featured: formData.is_featured
          })
          .eq('id', currentId)
          .select();
        
        if (error) {
          console.error('❌ Erreur lors de la mise à jour:', error);
          throw error;
        }
        
        console.log('✅ Mise à jour réussie:', data);
        console.log('✅ Image URL dans la réponse:', data?.[0]?.image_url);
        
        if (!data || data.length === 0) {
          throw new Error('Aucune donnée retournée après la mise à jour');
        }
        
        alert(`${activeTab === 'cocktails' ? 'Cocktail' : 'Mocktail'} mis à jour avec succès`);
      } else {
        console.log('Création en cours...');
        const { data, error } = await supabase
          .from(table)
          .insert([formData])
          .select();
        
        if (error) {
          console.error('❌ Erreur lors de la création:', error);
          throw error;
        }
        
        console.log('✅ Création réussie:', data);
        alert(`${activeTab === 'cocktails' ? 'Cocktail' : 'Mocktail'} créé avec succès`);
      }

      // Recharger les données
      console.log('Rechargement des données...');
      if (activeTab === 'cocktails') {
        await loadCocktails();
      } else {
        await loadMocktails();
      }

      // Fermer le formulaire
      setShowForm(false);
      resetForm();
      
      console.log('✅ Soumission terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + (error as any).message);
    }
  };

  const handleEdit = (item: Cocktail | Mocktail) => {
    setFormData({
      name: item.name,
      description: item.description,
      base_price: item.base_price,
      difficulty_level: item.difficulty_level,
      preparation_time_minutes: item.preparation_time_minutes,
      category: item.category,
      recipe: item.recipe || '',
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      alcohol_percentage: (item as Cocktail).alcohol_percentage || 0,
      is_active: item.is_active,
      is_featured: item.is_featured
    });
    setCurrentId(item.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const table = activeTab === 'cocktails' ? 'cocktails_maison' : 'mocktails';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Recharger les données
      if (activeTab === 'cocktails') {
        loadCocktails();
      } else {
        loadMocktails();
      }
      
      alert('Élément supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      difficulty_level: 1,
      preparation_time_minutes: 5,
      category: 'Famille & amis',
      recipe: '',
      image_url: '',
      video_url: '',
      alcohol_percentage: 0,
      is_active: true,
      is_featured: false
    });
    setCurrentId(null);
    setIsEditMode(false);
  };

  // Charger les données au montage
  useEffect(() => {
    loadCocktails();
    loadMocktails();
  }, []);

  // Filtrer les données
  const filteredCocktails = cocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cocktail.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMocktails = mocktails.filter(mocktail =>
    mocktail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mocktail.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentItems = activeTab === 'cocktails' ? filteredCocktails : filteredMocktails;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Cocktails</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau {activeTab === 'cocktails' ? 'Cocktail' : 'Mocktail'}
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'cocktails'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🍹 Cocktails ({cocktails.length})
        </button>
        <button
          onClick={() => setActiveTab('mocktails')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'mocktails'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🥤 Mocktails ({mocktails.length})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Rechercher un ${activeTab === 'cocktails' ? 'cocktail' : 'mocktail'}...`}
            className="pl-10 w-full max-w-md"
          />
        </div>
      </div>

      {/* Tableau (même style que les produits) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {currentItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'cocktails' ? 'Cocktail' : 'Mocktail'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={item.image_url}
                            alt={item.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <span className="text-lg">{activeTab === 'cocktails' ? '🍹' : '🥤'}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {item.base_price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.difficulty_level}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.preparation_time_minutes}min
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {item.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {item.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(item)}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{activeTab === 'cocktails' ? '🍹' : '🥤'}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun {activeTab === 'cocktails' ? 'cocktail' : 'mocktail'} trouvé
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier élément.'}
            </p>
          </div>
        )}
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isEditMode ? 'Éditer' : 'Créer'} un {activeTab === 'cocktails' ? 'cocktail' : 'mocktail'}
              </h2>
              <Button
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du cocktail"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du cocktail"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    placeholder="Prix"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulté (1-5)</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="time">Temps (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={formData.preparation_time_minutes}
                    onChange={(e) => setFormData({ ...formData, preparation_time_minutes: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {activeTab === 'cocktails' && (
                <div>
                  <Label htmlFor="alcohol">Pourcentage d'alcool</Label>
                  <Input
                    id="alcohol"
                    type="number"
                    value={formData.alcohol_percentage}
                    onChange={(e) => setFormData({ ...formData, alcohol_percentage: Number(e.target.value) })}
                    placeholder="% d'alcool"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="recipe">Recette</Label>
                <textarea
                  id="recipe"
                  value={formData.recipe}
                  onChange={(e) => setFormData({ ...formData, recipe: e.target.value })}
                  placeholder="Instructions de préparation"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  Actif
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  En vedette
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
