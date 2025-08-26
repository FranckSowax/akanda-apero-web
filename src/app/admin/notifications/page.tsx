'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  MessageSquare,
  Settings,
  History,
  Edit3,
  Save,
  RefreshCw,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { supabase } from '../../../lib/supabase';

// Types pour les templates et notifications
interface WhatsAppTemplate {
  id: string;
  status: string;
  message: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface WhatsAppNotification {
  id: string;
  phone_number: string;
  message_content: string;
  message_status: 'pending' | 'sent' | 'failed' | 'retry';
  order_id?: string;
  whapi_message_id?: string;
  status_change?: string;
  error_message?: string;
  created_at: string;
  sent_at?: string;
}

const ORDER_STATUSES = [
  'En attente',
  'Confirmée',
  'En préparation',
  'Prête',
  'En livraison',
  'Livrée',
  'Annulée'
];

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Charger les templates WhatsApp
  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('status');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  // Charger l'historique des notifications
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  // Sauvegarder un template
  const saveTemplate = async (templateId: string, message: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({ 
          message,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);
      
      if (error) throw error;
      
      await loadTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'templates') {
      await loadTemplates();
    } else {
      await loadNotifications();
    }
    setRefreshing(false);
  };
  
  // Charger les données au montage
  useEffect(() => {
    loadTemplates();
    loadNotifications();
  }, []);

  // Filtrer les notifications selon les critères
  const filteredNotifications = notifications
    .filter(notification => {
      // Filtrer par statut
      if (statusFilter !== 'all' && notification.message_status !== statusFilter) {
        return false;
      }
      
      // Filtrer par recherche
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        notification.phone_number.includes(query) ||
        notification.message_content.toLowerCase().includes(query) ||
        notification.status_change?.toLowerCase().includes(query)
      );
    });

  // Obtenir les compteurs pour les statuts
  const getStatusCounts = () => {
    return {
      all: notifications.length,
      sent: notifications.filter(n => n.message_status === 'sent').length,
      pending: notifications.filter(n => n.message_status === 'pending').length,
      failed: notifications.filter(n => n.message_status === 'failed').length,
      retry: notifications.filter(n => n.message_status === 'retry').length,
    };
  };

  const counts = getStatusCounts();

  // Composant pour éditer un template
  const TemplateEditor = ({ template }: { template: WhatsAppTemplate }) => {
    const [message, setMessage] = useState(template.message);
    const isEditing = editingTemplate === template.id;

    return (
      <Card key={template.id} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Statut : {template.status}
              </CardTitle>
              <CardDescription>
                Variables disponibles : {template.variables.join(', ')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(template.id)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveTemplate(template.id, message)}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Label htmlFor={`message-${template.id}`}>Message template</Label>
              <Textarea
                id={`message-${template.id}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Votre message avec variables..."
              />
              <div className="text-sm text-gray-500">
                <p><strong>Variables disponibles :</strong></p>
                <ul className="list-disc list-inside">
                  <li><code>{'{customerName}'}</code> - Nom du client</li>
                  <li><code>{'{orderNumber}'}</code> - Numéro de commande</li>
                  <li><code>{'{status}'}</code> - Nouveau statut</li>
                  <li><code>{'{totalAmount}'}</code> - Montant total</li>
                  <li><code>{'{deliveryDate}'}</code> - Date de livraison</li>
                  <li><code>{'{deliveryTime}'}</code> - Heure de livraison</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{template.message}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Obtenir le badge de statut pour les notifications
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Envoyé</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échec</Badge>;
      case 'retry':
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Nouvelle tentative</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications WhatsApp</h1>
          <p className="text-muted-foreground">
            Gérez les templates de messages et consultez l'historique des notifications
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates de messages
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique ({notifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Onglet Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Templates de messages par statut
              </CardTitle>
              <CardDescription>
                Personnalisez les messages envoyés automatiquement selon le statut de la commande
              </CardDescription>
            </CardHeader>
          </Card>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Aucun template trouvé</h3>
                <p className="text-gray-500 mb-4">
                  Les templates de messages seront créés automatiquement lors du premier envoi.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {templates.map(template => (
                <TemplateEditor key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par téléphone, nom, message..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts ({counts.all})</SelectItem>
                    <SelectItem value="sent">Envoyé ({counts.sent})</SelectItem>
                    <SelectItem value="pending">En attente ({counts.pending})</SelectItem>
                    <SelectItem value="failed">Échec ({counts.failed})</SelectItem>
                    <SelectItem value="retry">Nouvelle tentative ({counts.retry})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des notifications */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Aucune notification trouvée' 
                    : 'Aucune notification envoyée'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Essayez de modifier vos critères de recherche.'
                    : 'Les notifications WhatsApp apparaîtront ici une fois envoyées.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{notification.phone_number}</span>
                          {notification.status_change && (
                            <span className="text-gray-500">({notification.status_change})</span>
                          )}
                          {getStatusBadge(notification.message_status)}
                        </div>
                        
                        {notification.order_id && (
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="w-4" /> {/* Spacer */}
                            <span>Commande: {notification.order_id}</span>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{notification.message_content}</p>
                        </div>
                        
                        {notification.error_message && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <p className="text-sm text-red-600">{notification.error_message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
