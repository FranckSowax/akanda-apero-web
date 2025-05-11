'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/supabase/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/use-toast';
import UserAccountLayout from '../../../components/layout/UserAccountLayout';
import { supabase } from '../../../lib/supabase/client';

export default function UserProfile() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  // Charger les données du profil avec une gestion d'erreur améliorée
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        try {
          // Vérifier si la table profiles existe
          try {
            await supabase.from('profiles').select('id').limit(1);
          } catch (tableError) {
            // La table n'existe probablement pas encore, on ne peut rien faire
            setIsLoading(false);
            return;
          }
          
          // Vérifier si le profil existe
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id);
          
          // Si aucun profil n'existe, en créer un vide
          if (!data || data.length === 0) {
            try {
              // Tenter d'insérer sans upsert pour éviter les problèmes de contrainte
              await supabase
                .from('profiles')
                .insert({ user_id: user.id });
              
              // Après l'insertion, laisser les champs vides par défaut
            } catch (insertError) {
              // Si l'insertion échoue, ne pas afficher d'erreur dans la console
              // Il est possible que le profil ait été créé entre-temps
            }
          } else if (data && data.length > 0) {
            // Profil trouvé, mettre à jour les champs
            setName(data[0].full_name || '');
            setPhone(data[0].phone || '');
            setAddress(data[0].address || '');
          }
        } catch (queryError) {
          // Gérer silencieusement les erreurs de requête
        }
      } catch (globalError) {
        // Failsafe global - gérer silencieusement toutes les erreurs
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Vérifier que les données sont valides avant de les envoyer
    console.log('Données à sauvegarder:', { name, phone, address });
    
    setIsSaving(true);
    
    try {
      // Vérifier d'abord si un profil existe pour cet utilisateur
      const { data: profileData, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
      
      if (checkError) {
        console.error('Erreur lors de la vérification du profil:', checkError);
        throw new Error("Impossible de vérifier l'existence du profil");
      }
      
      let result;
      
      if (profileData && profileData.length > 0) {
        console.log('Profil existant, mise à jour...', profileData[0].id);
        // Profil existe, faire un update
        result = await supabase
          .from('profiles')
          .update({
            full_name: name,
            phone,
            address,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        console.log('Profil inexistant, création...');
        // Pas de profil, insérer un nouveau
        result = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              full_name: name,
              phone,
              address,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);
      }
      
      if (result.error) {
        console.error('Erreur lors de la mise à jour du profil:', result.error);
        throw result.error;
      }
      
      // Actualiser les données locales pour être sûr qu'elles sont à jour
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (updatedProfile) {
        setName(updatedProfile.full_name || '');
        setPhone(updatedProfile.phone || '');
        setAddress(updatedProfile.address || '');
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Exception lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading || isLoading) {
    return <UserAccountLayout><div className="flex justify-center py-8">Chargement...</div></UserAccountLayout>;
  }
  
  return (
    <UserAccountLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Mon profil</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Adresse email</label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">L'adresse email ne peut pas être modifiée</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Adresse de livraison</label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Votre adresse"
                />
              </div>
              
              <Button 
                type="submit" 
                className="mt-4 bg-[#f5a623] hover:bg-[#e09000]"
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserAccountLayout>
  );
}
