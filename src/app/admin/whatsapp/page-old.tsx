'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase pour l'admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  queueSize: number;
}

interface Notification {
  id: string;
  order_id: string;
  customer_phone: string;
  message_content: string;
  message_status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export default function WhatsAppAdminPage() {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [monitorStatus, setMonitorStatus] = useState<'running' | 'stopped' | 'unknown'>('unknown');
  const [monitorLoading, setMonitorLoading] = useState(false);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/whatsapp/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Charger l'historique des notifications
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error loading notifications:', error.message || error);
        // Si la table n'existe pas ou pas de permissions, on continue sans erreur
        setNotifications([]);
        return;
      }
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error loading notifications:', error.message || error);
      setNotifications([]);
    }
  };

  // Vérifier le statut du monitoring
  const checkMonitorStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/monitor/status');
      if (response.ok) {
        const data = await response.json();
        setMonitorStatus(data.isRunning ? 'running' : 'stopped');
      }
    } catch (error) {
      console.error('Error checking monitor status:', error);
      setMonitorStatus('unknown');
    }
  };

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadNotifications(),
        checkMonitorStatus()
      ]);
      setLoading(false);
    };
    
    loadData();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Envoyer un message test
  const sendTestMessage = async () => {
    if (!testPhone) {
      setTestResult({ success: false, message: 'Veuillez entrer un numéro de téléphone' });
      return;
    }

    setSending(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok && data.sent) {
        setTestResult({ success: true, message: 'Message envoyé avec succès !' });
        // Recharger les stats et notifications
        setTimeout(() => {
          loadStats();
          loadNotifications();
        }, 2000);
      } else {
        setTestResult({ 
          success: false, 
          message: data.error || 'Erreur lors de l\'envoi du message' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      });
    } finally {
      setSending(false);
    }
  };

  // Contrôler le monitoring
  const toggleMonitoring = async () => {
    setMonitorLoading(true);
    
    try {
      const action = monitorStatus === 'running' ? 'stop' : 'start';
      const response = await fetch(`/api/whatsapp/monitor/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        setMonitorStatus(action === 'start' ? 'running' : 'stopped');
      }
    } catch (error) {
      console.error('Error toggling monitor:', error);
    } finally {
      setMonitorLoading(false);
    }
  };

  // Formater le statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Envoyé</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Échec</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Formater la date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administration WhatsApp</h1>
        <p className="text-gray-600">Gérez les notifications WhatsApp et surveillez les envois</p>
      </div>

      {/* Statut du monitoring */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Service de Monitoring</span>
            <Button
              onClick={toggleMonitoring}
              disabled={monitorLoading}
              variant={monitorStatus === 'running' ? 'destructive' : 'default'}
              size="sm"
            >
              {monitorLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : monitorStatus === 'running' ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Arrêter
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              monitorStatus === 'running' ? 'bg-green-500 animate-pulse' : 
              monitorStatus === 'stopped' ? 'bg-gray-400' : 
              'bg-yellow-500'
            }`} />
            <span className="text-sm">
              {monitorStatus === 'running' ? 'En cours d\'exécution' :
               monitorStatus === 'stopped' ? 'Arrêté' :
               'Statut inconnu'}
            </span>
            {monitorStatus === 'running' && (
              <span className="text-xs text-gray-500 ml-2">
                (Vérification toutes les 30 secondes)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Envoyés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Échecs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">File d'attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queueSize}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">Test d'envoi</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Test */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Envoyer un message test</CardTitle>
              <CardDescription>
                Testez l'envoi de messages WhatsApp via l'API Whapi.Cloud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+41 77 123 45 67"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  disabled={sending}
                />
                <p className="text-xs text-gray-500">
                  Format international avec indicatif pays
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  placeholder="Laissez vide pour envoyer le message test par défaut"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  disabled={sending}
                />
              </div>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={sendTestMessage}
                disabled={sending || !testPhone}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des notifications</CardTitle>
              <CardDescription>
                Les 50 dernières notifications WhatsApp envoyées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Téléphone</th>
                      <th className="text-left py-2 px-4">Statut</th>
                      <th className="text-left py-2 px-4">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notif) => (
                      <tr key={notif.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm">
                          {formatDate(notif.created_at)}
                        </td>
                        <td className="py-2 px-4 text-sm font-mono">
                          {notif.customer_phone}
                        </td>
                        <td className="py-2 px-4">
                          {getStatusBadge(notif.message_status)}
                        </td>
                        <td className="py-2 px-4 text-sm max-w-md truncate">
                          {notif.message_content}
                        </td>
                      </tr>
                    ))}
                    {notifications.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          Aucune notification envoyée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
