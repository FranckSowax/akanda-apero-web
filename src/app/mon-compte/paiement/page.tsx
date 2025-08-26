'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/supabase/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/use-toast';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { supabase } from '../../../lib/supabase/client';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money';
  name: string;
  last_four?: string;
  phone_number?: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({
    type: 'mobile_money' as 'card' | 'mobile_money',
    name: '',
    phone_number: '',
    card_number: '',
    expiry: '',
    cvv: ''
  });

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect_to=/mon-compte/paiement');
    }
  }, [user, loading, router]);

  // Charger les moyens de paiement
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Pour l'instant, on simule des données car la table n'existe pas encore
        // Dans un vrai projet, on ferait un appel à Supabase
        const mockData: PaymentMethod[] = [
          {
            id: '1',
            type: 'mobile_money',
            name: 'Orange Money',
            phone_number: '+225 07 XX XX XX 45',
            is_default: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'mobile_money',
            name: 'MTN Money',
            phone_number: '+225 05 XX XX XX 23',
            is_default: false,
            created_at: new Date().toISOString()
          }
        ];
        
        setPaymentMethods(mockData);
      } catch (error) {
        console.error('Erreur lors du chargement des moyens de paiement:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos moyens de paiement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user, toast]);

  const handleAddMethod = async () => {
    try {
      // Validation
      if (newMethod.type === 'mobile_money' && !newMethod.phone_number) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir un numéro de téléphone",
          variant: "destructive",
        });
        return;
      }

      if (newMethod.type === 'card' && (!newMethod.card_number || !newMethod.expiry || !newMethod.cvv)) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs de la carte",
          variant: "destructive",
        });
        return;
      }

      // Simuler l'ajout (dans un vrai projet, on sauvegarderait en base)
      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: newMethod.type,
        name: newMethod.name,
        phone_number: newMethod.type === 'mobile_money' ? newMethod.phone_number : undefined,
        last_four: newMethod.type === 'card' ? newMethod.card_number.slice(-4) : undefined,
        is_default: paymentMethods.length === 0,
        created_at: new Date().toISOString()
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      setIsAdding(false);
      setNewMethod({
        type: 'mobile_money',
        name: '',
        phone_number: '',
        card_number: '',
        expiry: '',
        cvv: ''
      });

      toast({
        title: "Succès",
        description: "Moyen de paiement ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le moyen de paiement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      toast({
        title: "Succès",
        description: "Moyen de paiement supprimé",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le moyen de paiement",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      toast({
        title: "Succès",
        description: "Moyen de paiement par défaut mis à jour",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le moyen de paiement par défaut",
        variant: "destructive",
      });
    }
  };

  if (loading || isLoading) {
    return (
      <UserAccountLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div>
        </div>
      </UserAccountLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UserAccountLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moyens de paiement</h1>
            <p className="text-gray-600 mt-1">Gérez vos moyens de paiement pour vos commandes</p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#f5a623] hover:bg-[#e6951f] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un moyen
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter un moyen de paiement
              </CardTitle>
              <CardDescription>
                Ajoutez un nouveau moyen de paiement pour vos commandes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de paiement
                  </label>
                  <select
                    value={newMethod.type}
                    onChange={(e) => setNewMethod(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'card' | 'mobile_money' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Carte bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du moyen
                  </label>
                  <Input
                    value={newMethod.name}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Orange Money, Visa..."
                  />
                </div>
              </div>

              {newMethod.type === 'mobile_money' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <Input
                    value={newMethod.phone_number}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte
                    </label>
                    <Input
                      value={newMethod.card_number}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, card_number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'expiration
                    </label>
                    <Input
                      value={newMethod.expiry}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, expiry: e.target.value }))}
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <Input
                      value={newMethod.cvv}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  onClick={handleAddMethod}
                  className="bg-[#f5a623] hover:bg-[#e6951f] text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdding(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des moyens de paiement */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun moyen de paiement
                </h3>
                <p className="text-gray-600 mb-4">
                  Ajoutez un moyen de paiement pour faciliter vos commandes
                </p>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="bg-[#f5a623] hover:bg-[#e6951f] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un moyen
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className={method.is_default ? 'ring-2 ring-[#f5a623]' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          {method.is_default && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f5a623] text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Par défaut
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {method.type === 'mobile_money' 
                            ? method.phone_number 
                            : `**** **** **** ${method.last_four}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Définir par défaut
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Informations de sécurité */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Sécurité des paiements
                </h3>
                <p className="text-sm text-blue-700">
                  Vos informations de paiement sont cryptées et sécurisées. 
                  Nous ne stockons jamais vos données sensibles comme les CVV ou codes PIN.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserAccountLayout>
  );
}
