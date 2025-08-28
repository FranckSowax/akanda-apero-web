'use client';

import React, { useState, useEffect } from 'react';
import deliveryService from '../../../services/delivery-service';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  X, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';

interface Chauffeur {
  id: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  disponible: boolean;
  vehicule_type?: string;
  vehicule_plaque?: string;
  notes?: string;
  created_at?: string;
  latitude?: number;
  longitude?: number;
  vitesse?: number;
  direction?: number;
  derniere_activite?: string;
  en_ligne?: boolean;
}

interface LocationUpdate {
  id: string;
  chauffeur_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export default function ChauffeursPage() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [onlineStatuses, setOnlineStatuses] = useState<{[key: string]: boolean}>({});
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    vehicule_type: '',
    vehicule_plaque: '',
    notes: ''
  });

  useEffect(() => {
    loadChauffeurs();
    
    // Actualiser les données toutes les 5 secondes
    const interval = setInterval(() => {
      loadChauffeurs();
    }, 5000); // Actualiser toutes les 5 secondes pour le statut en ligne

    return () => clearInterval(interval);
  }, []);

  // Vérifier les statuts en ligne des chauffeurs
  const checkOnlineStatuses = async (chauffeursData?: any[]) => {
    try {
      const dataToCheck = chauffeursData || chauffeurs;
      const newStatuses: {[key: string]: boolean} = {};
      
      console.log('🔍 Vérification statuts en ligne pour', dataToCheck.length, 'chauffeurs');
      
      dataToCheck.forEach(chauffeur => {
        // Nouvelle logique : utiliser le champ statut directement
        const isOnline = chauffeur.statut === 'en_ligne';
        
        console.log(`👤 ${chauffeur.nom} (ID: ${chauffeur.id}):`, {
          statut: chauffeur.statut,
          isOnline,
          email: chauffeur.email,
          telephone: chauffeur.telephone
        });
        
        newStatuses[chauffeur.id] = isOnline;
      });
      
      setOnlineStatuses(newStatuses);
      console.log('✅ Statuts mis à jour:', newStatuses);
    } catch (error) {
      console.error('Erreur lors de la vérification des statuts:', error);
    }
  };

  const loadChauffeurs = async () => {
    try {
      console.log('🔄 Chargement des chauffeurs...');
      const result = await deliveryService.getChauffeurs();
      console.log('📊 Résultat getChauffeurs:', result);
      
      if (result.data) {
        setChauffeurs(result.data);
        console.log('✅ Chauffeurs chargés:', result.data.length);
        
        // Vérifier les statuts en ligne après le chargement
        setTimeout(() => {
          checkOnlineStatuses(result.data || []);
        }, 100);
      } else {
        console.error('❌ Aucune donnée chauffeur reçue');
        setError('Aucune donnée chauffeur disponible');
      }
    } catch (error) {
      console.error('❌ Erreur chargement chauffeurs:', error);
      setError('Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationUpdates = async () => {
    try {
      const response = await fetch('/api/chauffeurs/location');
      if (response.ok) {
        const data = await response.json();
        setLocationUpdates(data.locations || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des positions:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      telephone: '',
      email: '',
      vehicule_type: '',
      vehicule_plaque: '',
      notes: ''
    });
  };

  const handleEdit = (chauffeur: Chauffeur) => {
    setEditingChauffeur(chauffeur);
    setFormData({
      nom: chauffeur.nom || '',
      telephone: chauffeur.telephone || '',
      email: chauffeur.email || '',
      vehicule_type: chauffeur.vehicule_type || '',
      vehicule_plaque: chauffeur.vehicule_plaque || '',
      notes: chauffeur.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les données avant envoi - convertir email vide en undefined
    const cleanedData = {
      ...formData,
      email: formData.email.trim() === '' ? undefined : formData.email.trim()
    };
    
    try {
      let result;
      if (editingChauffeur) {
        result = await deliveryService.updateChauffeur(editingChauffeur.id, cleanedData);
      } else {
        result = await deliveryService.createChauffeur(cleanedData);
      }

      if (result.error) {
        console.error('Erreur:', result.error);
        
        // Gestion spécifique des erreurs de contrainte unique
        if (result.error.includes('duplicate key value violates unique constraint') && 
            result.error.includes('telephone')) {
          alert('Ce numéro de téléphone est déjà utilisé par un autre chauffeur.');
        } else if (result.error.includes('duplicate key value violates unique constraint') && 
                   result.error.includes('email')) {
          alert('Cette adresse email est déjà utilisée par un autre chauffeur.');
        } else {
          alert('Erreur lors de la sauvegarde: ' + result.error);
        }
      } else {
        await loadChauffeurs();
        setShowForm(false);
        resetForm();
        setEditingChauffeur(null);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      
      // Gestion des erreurs de contrainte unique dans le catch
      if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('telephone')) {
          alert('Ce numéro de téléphone est déjà utilisé par un autre chauffeur.');
        } else if (error.message.includes('email')) {
          alert('Cette adresse email est déjà utilisée par un autre chauffeur.');
        } else {
          alert('Une valeur unique est déjà utilisée. Veuillez vérifier vos données.');
        }
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      return;
    }

    try {
      const result = await deliveryService.deleteChauffeur(id);
      if (result.error) {
        console.error('Erreur:', result.error);
        alert('Erreur lors de la suppression');
      } else {
        await loadChauffeurs();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const sendLocationRequest = async (chauffeurId: string) => {
    try {
      const response = await fetch('/api/chauffeurs/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chauffeur_id: chauffeurId, action: 'request' })
      });
      
      if (response.ok) {
        alert('Demande de position envoyée');
        await loadLocationUpdates();
      } else {
        alert('Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement des chauffeurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Chauffeurs</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingChauffeur(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Chauffeur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChauffeur ? 'Modifier' : 'Nouveau'} Chauffeur
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="vehicule_type">Type de véhicule</Label>
                <Select value={formData.vehicule_type} onValueChange={(value) => setFormData({ ...formData, vehicule_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="voiture">Voiture</SelectItem>
                    <SelectItem value="camionnette">Camionnette</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vehicule_plaque">Plaque d'immatriculation</Label>
                <Input
                  id="vehicule_plaque"
                  value={formData.vehicule_plaque}
                  onChange={(e) => setFormData({ ...formData, vehicule_plaque: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingChauffeur ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table des chauffeurs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {chauffeurs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chauffeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut En Ligne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position GPS
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chauffeurs.map((chauffeur) => (
                  <tr key={chauffeur.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {chauffeur.prenom} {chauffeur.nom}
                          </div>
                          {chauffeur.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {chauffeur.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {chauffeur.telephone}
                        </div>
                        {chauffeur.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {chauffeur.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{chauffeur.vehicule_type}</div>
                          <div className="text-sm text-gray-500">{chauffeur.vehicule_plaque}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {onlineStatuses[chauffeur.id] ? (
                          <div className="flex items-center animate-pulse">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
                            <Wifi className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs font-medium text-green-700">En ligne</span>
                          </div>
                        ) : (
                          <div className="flex items-center animate-pulse">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                            <WifiOff className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-xs font-medium text-red-700">Hors ligne</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {chauffeur.latitude && chauffeur.longitude ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {chauffeur.latitude.toFixed(4)}, {chauffeur.longitude.toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {chauffeur.vitesse ? `${chauffeur.vitesse} km/h` : 'Position fixe'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Position non disponible</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(chauffeur)}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(chauffeur.id)}
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
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chauffeur trouvé</h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter votre premier chauffeur.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un chauffeur
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
