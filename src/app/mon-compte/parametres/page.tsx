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
  Settings, 
  User, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Mail,
  Lock,
  Smartphone
} from 'lucide-react';

interface UserSettings {
  full_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
}

export default function ParametresPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    phone: '',
    whatsapp: '',
    address: '',
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect_to=/mon-compte/parametres');
    }
  }, [user, loading, router]);

  // Charger les paramètres utilisateur
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erreur lors de la récupération des paramètres:', error);
        } else if (data) {
          setSettings({
            full_name: data.full_name || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            address: data.address || '',
            email_notifications: data.email_notifications ?? true,
            sms_notifications: data.sms_notifications ?? true,
            marketing_emails: data.marketing_emails ?? false
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [user]);

  const handleSettingsChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('customers')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "✅ Paramètres sauvegardés",
        description: "Vos paramètres ont été mis à jour avec succès."
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès."
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);

    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors du changement de mot de passe.",
        variant: "destructive"
      });
    }
  };

  if (loading || isLoading) {
    return (
      <UserAccountLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623] mb-4"></div>
          <p className="text-gray-600">Chargement de vos paramètres...</p>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout>
      <div className="space-y-6">
        {/* En-tête avec style friendly */}
        <div className="bg-gradient-to-r from-[#f5a623] to-[#e09000] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Paramètres</h1>
          </div>
          <p className="text-orange-100">Gérez vos informations personnelles et préférences de notification</p>
        </div>

        {/* Informations personnelles */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nom complet
                </label>
                <Input
                  value={settings.full_name}
                  onChange={(e) => handleSettingsChange('full_name', e.target.value)}
                  placeholder="Votre nom complet"
                  className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Téléphone
                </label>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleSettingsChange('phone', e.target.value)}
                  placeholder="07 XX XX XX XX"
                  className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  WhatsApp
                </label>
                <Input
                  value={settings.whatsapp}
                  onChange={(e) => handleSettingsChange('whatsapp', e.target.value)}
                  placeholder="07 XX XX XX XX"
                  className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Adresse
              </label>
              <Input
                value={settings.address}
                onChange={(e) => handleSettingsChange('address', e.target.value)}
                placeholder="Votre adresse complète"
                className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Sécurité</CardTitle>
                <CardDescription>Gérez votre mot de passe et sécurité</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!showPasswordChange ? (
              <Button
                onClick={() => setShowPasswordChange(true)}
                variant="outline"
                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <Lock className="h-4 w-4" />
                Changer le mot de passe
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Nouveau mot de passe"
                    className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirmer le mot de passe"
                    className="border-gray-300 focus:border-[#f5a623] focus:ring-[#f5a623]"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handlePasswordChange}
                    className="bg-[#f5a623] hover:bg-[#e09000] text-white"
                  >
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-600">Recevez des mises à jour sur vos commandes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => handleSettingsChange('email_notifications', e.target.checked)}
                className="w-5 h-5 text-[#f5a623] border-gray-300 rounded focus:ring-[#f5a623]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Notifications SMS</p>
                  <p className="text-sm text-gray-600">Recevez des SMS pour les mises à jour importantes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sms_notifications}
                onChange={(e) => handleSettingsChange('sms_notifications', e.target.checked)}
                className="w-5 h-5 text-[#f5a623] border-gray-300 rounded focus:ring-[#f5a623]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Emails marketing</p>
                  <p className="text-sm text-gray-600">Recevez nos offres spéciales et nouveautés</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.marketing_emails}
                onChange={(e) => handleSettingsChange('marketing_emails', e.target.checked)}
                className="w-5 h-5 text-[#f5a623] border-gray-300 rounded focus:ring-[#f5a623]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#f5a623] hover:bg-[#e09000] text-white px-8 py-3 text-lg"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Sauvegarder les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </UserAccountLayout>
  );
}
