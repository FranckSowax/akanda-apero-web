'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { normalizeGabonPhone, isValidGabonPhone } from '../../../utils/phoneUtils';

// Créer un client Supabase pour l'admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  retry: number;
}

interface Notification {
  id: string;
  order_id: string;
  customer_phone: string;
  message_status: 'pending' | 'sent' | 'failed' | 'retry';
  whapi_message_id?: string;
  status_change?: string;
  message_content?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  sent_at?: string;
}

export default function WhatsAppAdminPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    retry: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from Akanda Apéro admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/whatsapp/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  // Charger l'historique des notifications
  const loadNotifications = async () => {
    try {
      // Utiliser une requête RPC pour éviter les problèmes de permissions
      const { data, error } = await supabase.rpc('get_whatsapp_notifications_simple', {
        limit_count: 50
      });
      
      if (error) {
        // Si la fonction n'existe pas, essayer la requête directe sans relations
        console.log('RPC function not found, trying direct query...');
        const { data: directData, error: directError } = await supabase
          .from('whatsapp_notifications')
          .select('id, order_id, customer_phone, message_status, whapi_message_id, status_change, message_content, error_message, retry_count, created_at, sent_at')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (directError) {
          console.error('Error loading notifications:', directError.message || directError);
          setNotifications([]);
          return;
        }
        setNotifications(directData || []);
      } else {
        setNotifications(data || []);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error.message || error);
      setNotifications([]);
    }
  };

  // Vérifier le statut du monitoring
  const checkMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/monitor/status');
      if (response.ok) {
        const data = await response.json();
        setIsMonitoring(data.isRunning);
      }
    } catch (error) {
      console.error('Error checking monitoring status:', error);
    }
  };

  // Charger toutes les données au montage
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadStats(),
        loadNotifications(),
        checkMonitoringStatus()
      ]);
    };
    loadData();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Envoyer un message test
  const sendTestMessage = async () => {
    if (!testPhone) {
      setError('Veuillez entrer un numéro de téléphone');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Message envoyé avec succès!');
        setTestPhone('');
        await loadNotifications();
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error: any) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Contrôler le monitoring
  const toggleMonitoring = async () => {
    setLoading(true);
    try {
      const action = isMonitoring ? 'stop' : 'start';
      const response = await fetch(`/api/whatsapp/monitor/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        setIsMonitoring(!isMonitoring);
        setSuccess(`Monitoring ${!isMonitoring ? 'démarré' : 'arrêté'} avec succès`);
      }
    } catch (error) {
      setError('Erreur lors du contrôle du monitoring');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'green',
      failed: 'red',
      pending: 'yellow',
      retry: 'orange'
    };
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: colors[status] || 'gray'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        WhatsApp Notifications Admin
      </h1>

      {/* Contrôle du monitoring */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Service de Monitoring</h2>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Status: <strong style={{ color: isMonitoring ? 'green' : 'red' }}>
                {isMonitoring ? 'Actif' : 'Inactif'}
              </strong>
            </p>
          </div>
          <button
            onClick={toggleMonitoring}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: isMonitoring ? '#dc2626' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Chargement...' : (isMonitoring ? 'Arrêter' : 'Démarrer')}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: '#666' }}>Total Messages</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: '#666' }}>Messages Envoyés</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{stats.sent}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: '#666' }}>Messages Échoués</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>{stats.failed}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: '#666' }}>En Attente</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>{stats.pending}</p>
        </div>
      </div>

      {/* Envoi de message test */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Envoyer un Message Test</h2>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: '10px', backgroundColor: '#efe', color: '#0a0', borderRadius: '4px', marginBottom: '10px' }}>
            {success}
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Numéro WhatsApp (format gabonais: 077889988 ou +24177889988)
          </label>
          <input
            type="tel"
            value={testPhone}
            onChange={(e) => {
              const value = e.target.value;
              setTestPhone(value);
              
              // Validation en temps réel pour les numéros gabonais
              if (value.trim()) {
                const phoneValidation = normalizeGabonPhone(value);
                if (!phoneValidation.isValid) {
                  console.log('Numéro WhatsApp invalide:', phoneValidation.error);
                }
              }
            }}
            placeholder="Ex: 077889988 ou +24177889988"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Message
          </label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          onClick={sendTestMessage}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>

      {/* Historique des notifications */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          Historique des Notifications
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Téléphone</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Changement</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Retries</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Aucune notification trouvée
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr key={notif.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      {new Date(notif.created_at).toLocaleString('fr-CH')}
                    </td>
                    <td style={{ padding: '10px' }}>{notif.customer_phone}</td>
                    <td style={{ padding: '10px' }}>
                      {getStatusBadge(notif.message_status)}
                    </td>
                    <td style={{ padding: '10px' }}>{notif.status_change || '-'}</td>
                    <td style={{ padding: '10px' }}>{notif.retry_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
