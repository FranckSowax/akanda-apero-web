'use client';

import React, { useState } from 'react';
import { 
  Save,
  Bell,
  Globe,
  CreditCard,
  Truck,
  Mail,
  User,
  Shield,
  Database,
  Image,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { ClientOnly } from '../../../components/ui/client-only';
import { Label } from '../../../components/ui/label';

// Type pour les sections de paramètres
type SettingsSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

// Composant pour afficher un formulaire de paramètres
const SettingsForm = ({ 
  title, 
  description, 
  children,
  className,
  collapsible = false
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Version simplifié avec toggle manuel au lieu d'Accordion
  if (collapsible) {
    return (
      <div className={`bg-white rounded-lg shadow-sm mb-6 ${className || ''}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {isOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 mb-6 ${className || ''}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="space-y-6 border-t border-gray-100 pt-6">
        {children}
      </div>
    </div>
  );
};

// Composant pour une ligne de paramètre avec label et control
const SettingRow = ({ 
  label, 
  description, 
  children 
}: { 
  label: string; 
  description?: string; 
  children: React.ReactNode;
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between py-3">
    <div className="mb-3 md:mb-0 md:w-1/2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <div className="md:w-1/2 flex justify-end">
      {children}
    </div>
  </div>
);

export default function SettingsPage() {
  // Les différentes sections de paramètres
  const sections: SettingsSection[] = [
    { 
      id: 'general', 
      title: 'Général', 
      icon: <Globe className="h-5 w-5" />,
      description: 'Paramètres généraux de la boutique'
    },
    { 
      id: 'notifications', 
      title: 'Notifications', 
      icon: <Bell className="h-5 w-5" />,
      description: 'Gérer les paramètres de notification'
    },
    { 
      id: 'payment', 
      title: 'Paiement', 
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Configuration des méthodes de paiement'
    },
    { 
      id: 'delivery', 
      title: 'Livraison', 
      icon: <Truck className="h-5 w-5" />,
      description: 'Paramètres de livraison et expédition'
    },
    { 
      id: 'email', 
      title: 'Emails', 
      icon: <Mail className="h-5 w-5" />,
      description: 'Configuration des modèles d\'emails'
    },
    { 
      id: 'users', 
      title: 'Utilisateurs', 
      icon: <User className="h-5 w-5" />,
      description: 'Gestion des utilisateurs et permissions'
    },
    { 
      id: 'security', 
      title: 'Sécurité', 
      icon: <Shield className="h-5 w-5" />,
      description: 'Sécurité et autorisations'
    },
    { 
      id: 'media', 
      title: 'Médias', 
      icon: <Image className="h-5 w-5" />,
      description: 'Gestion des médias et images'
    },
    { 
      id: 'integrations', 
      title: 'Intégrations', 
      icon: <Database className="h-5 w-5" />,
      description: 'Services tiers et API'
    }
  ];

  const [activeTab, setActiveTab] = useState('general');

  // États pour les paramètres
  const [storeName, setStoreName] = useState('Akanda Apéro');
  const [storeUrl, setStoreUrl] = useState('https://akanda-apero.com');
  const [storeEmail, setStoreEmail] = useState('contact@akanda-apero.com');
  const [storePhone, setStorePhone] = useState('+241 77 12 34 56');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableEmails, setEnableEmails] = useState(true);
  const [enableSMS, setEnableSMS] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [allowImageHosting, setAllowImageHosting] = useState(true);
  const [allowedDomains, setAllowedDomains] = useState('placeholder.co, picsum.photos');

  return (
    <ClientOnly>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-gray-500 mt-1">Gérez les paramètres de votre boutique en ligne</p>
          </div>
          <Button className="bg-[#f5a623] hover:bg-[#e09000] text-white">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === section.id
                        ? 'bg-[#fff6e5] text-[#f5a623]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Paramètres généraux */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <SettingsForm
                  title="Informations de la boutique"
                  description="Informations générales sur votre boutique en ligne"
                >
                  <SettingRow label="Nom de la boutique" description="Nom qui apparaîtra sur le site et dans les communications">
                    <Input
                      id="store-name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="max-w-sm"
                    />
                  </SettingRow>
                  <SettingRow label="URL de la boutique" description="Adresse web de votre boutique">
                    <Input
                      id="store-url"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      className="max-w-sm"
                    />
                  </SettingRow>
                  <SettingRow label="Email de contact" description="Email principal pour les communications">
                    <Input
                      id="store-email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="max-w-sm"
                      type="email"
                    />
                  </SettingRow>
                  <SettingRow label="Téléphone" description="Numéro de téléphone principal de la boutique">
                    <Input
                      id="store-phone"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="max-w-sm"
                      type="tel"
                    />
                  </SettingRow>
                  <SettingRow label="Mode maintenance" description="Activer le mode maintenance pour bloquer l'accès au site">
                    <Switch
                      id="maintenance-mode"
                      checked={maintenance}
                      onCheckedChange={setMaintenance}
                    />
                  </SettingRow>
                </SettingsForm>

                <SettingsForm
                  title="Préférences régionales"
                  description="Paramètres régionaux et monnaie"
                  collapsible
                >
                  <SettingRow label="Fuseau horaire" description="Fuseau horaire utilisé pour les dates et heures">
                    <select className="w-full max-w-sm rounded-md border border-gray-300 p-2">
                      <option>Africa/Libreville (GMT+1)</option>
                      <option>Europe/Paris (GMT+2)</option>
                      <option>UTC</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Devise" description="Devise principale utilisée pour les prix">
                    <select className="w-full max-w-sm rounded-md border border-gray-300 p-2">
                      <option>XAF (Franc CFA)</option>
                      <option>EUR (Euro)</option>
                      <option>USD (Dollar américain)</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Format de date" description="Format d'affichage des dates">
                    <select className="w-full max-w-sm rounded-md border border-gray-300 p-2">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </SettingRow>
                </SettingsForm>
              </div>
            )}

            {/* Paramètres de notification */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <SettingsForm
                  title="Préférences de notification"
                  description="Gérez comment et quand les notifications sont envoyées"
                >
                  <SettingRow label="Activer les notifications" description="Activer ou désactiver toutes les notifications">
                    <Switch
                      id="notifications-enabled"
                      checked={enableNotifications}
                      onCheckedChange={setEnableNotifications}
                    />
                  </SettingRow>
                  <SettingRow label="Notifications par email" description="Envoyer des notifications par email">
                    <Switch
                      id="email-notifications"
                      checked={enableEmails}
                      onCheckedChange={setEnableEmails}
                      disabled={!enableNotifications}
                    />
                  </SettingRow>
                  <SettingRow label="Notifications par SMS" description="Envoyer des notifications par SMS">
                    <Switch
                      id="sms-notifications"
                      checked={enableSMS}
                      onCheckedChange={setEnableSMS}
                      disabled={!enableNotifications}
                    />
                  </SettingRow>
                </SettingsForm>

                <SettingsForm
                  title="Types de notifications"
                  description="Personnalisez les paramètres pour chaque type de notification"
                  collapsible
                >
                  <SettingRow label="Nouvelles commandes" description="Notifications pour les nouvelles commandes">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="orders-email" defaultChecked />
                        <label htmlFor="orders-email" className="text-sm">Email</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="orders-sms" />
                        <label htmlFor="orders-sms" className="text-sm">SMS</label>
                      </div>
                    </div>
                  </SettingRow>
                  <SettingRow label="Stock faible" description="Notifications lorsque le stock est bas">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="stock-email" defaultChecked />
                        <label htmlFor="stock-email" className="text-sm">Email</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="stock-sms" />
                        <label htmlFor="stock-sms" className="text-sm">SMS</label>
                      </div>
                    </div>
                  </SettingRow>
                </SettingsForm>
              </div>
            )}

            {/* Paramètres médias */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <SettingsForm
                  title="Gestion des images"
                  description="Configuration pour les images et médias"
                >
                  <SettingRow label="Autoriser l'hébergement externe" description="Autoriser les images provenant de domaines externes">
                    <Switch
                      id="external-hosting"
                      checked={allowImageHosting}
                      onCheckedChange={setAllowImageHosting}
                    />
                  </SettingRow>
                  <SettingRow label="Domaines autorisés" description="Liste des domaines externes autorisés (séparés par des virgules)">
                    <Input
                      id="allowed-domains"
                      value={allowedDomains}
                      onChange={(e) => setAllowedDomains(e.target.value)}
                      className="max-w-sm"
                      disabled={!allowImageHosting}
                    />
                  </SettingRow>
                  <SettingRow label="Taille maximale" description="Taille maximale des fichiers importés">
                    <select className="w-full max-w-sm rounded-md border border-gray-300 p-2">
                      <option>2 MB</option>
                      <option>5 MB</option>
                      <option>10 MB</option>
                      <option>20 MB</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Optimisation automatique" description="Optimiser automatiquement les images importées">
                    <Switch
                      id="auto-optimize"
                      defaultChecked={true}
                    />
                  </SettingRow>
                </SettingsForm>

                <SettingsForm
                  title="Stockage"
                  description="Configuration du stockage des médias"
                  collapsible
                >
                  <SettingRow label="Emplacement de stockage" description="Où stocker les fichiers médias">
                    <select className="w-full max-w-sm rounded-md border border-gray-300 p-2">
                      <option>Stockage local</option>
                      <option>Amazon S3</option>
                      <option>Google Cloud Storage</option>
                    </select>
                  </SettingRow>
                </SettingsForm>
              </div>
            )}

            {/* Afficher un message pour les onglets qui ne sont pas encore implémentés */}
            {!['general', 'notifications', 'media'].includes(activeTab) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-orange-100 p-3 rounded-full mb-4">
                    {sections.find(s => s.id === activeTab)?.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Paramètres {sections.find(s => s.id === activeTab)?.title.toLowerCase()}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Cette section est en cours de développement et sera disponible prochainement.
                  </p>
                  <Button className="mt-6 bg-[#f5a623] hover:bg-[#e09000] text-white">
                    Revenir aux paramètres généraux
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
