'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Eye,
  MousePointer,
  ShoppingCart,
  Zap,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MonitoringEvent {
  id: string;
  type: string;
  data: any;
  user_id?: string;
  session_id: string;
  url?: string;
  timestamp: string;
}

interface MonitoringStats {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  errorCount: number;
  avgPerformance: number;
  topEvents: Array<{ event: string; count: number }>;
}

const MonitoringDashboard: React.FC = () => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    totalEvents: 0,
    uniqueUsers: 0,
    uniqueSessions: 0,
    errorCount: 0,
    avgPerformance: 0,
    topEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  // Charger les données de monitoring
  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Calculer la date de début selon la période sélectionnée
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate.setDate(now.getDate() - 1);
      }

      // Query pour les événements récents
      let query = supabase
        .from('monitoring_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (eventTypeFilter !== 'all') {
        query = query.eq('type', eventTypeFilter);
      }

      const { data: eventsData, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return;
      }

      setEvents(eventsData || []);

      // Calculer les statistiques
      if (eventsData && eventsData.length > 0) {
        const uniqueUsers = new Set(eventsData.filter(e => e.user_id).map(e => e.user_id)).size;
        const uniqueSessions = new Set(eventsData.map(e => e.session_id)).size;
        const errorCount = eventsData.filter(e => e.type === 'error').length;
        
        // Performance moyenne (pour les événements de performance)
        const perfEvents = eventsData.filter(e => e.type === 'performance' && e.data?.value);
        const avgPerformance = perfEvents.length > 0 
          ? perfEvents.reduce((sum, e) => sum + (e.data.value || 0), 0) / perfEvents.length 
          : 0;

        // Top événements
        const eventCounts: { [key: string]: number } = {};
        eventsData.forEach(event => {
          const eventName = event.data?.event || event.data?.name || event.type;
          eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
        });
        
        const topEvents = Object.entries(eventCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([event, count]) => ({ event, count }));

        setStats({
          totalEvents: eventsData.length,
          uniqueUsers,
          uniqueSessions,
          errorCount,
          avgPerformance: Math.round(avgPerformance),
          topEvents
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données de monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, [timeRange, eventTypeFilter]);

  // Fonction pour formater les données d'événement
  const formatEventData = (data: any) => {
    if (!data) return 'N/A';
    
    if (typeof data === 'string') return data;
    
    // Afficher les propriétés importantes
    const important = ['event', 'name', 'value', 'message', 'url', 'error'];
    const formatted: string[] = [];
    
    important.forEach(key => {
      if (data[key] !== undefined) {
        formatted.push(`${key}: ${data[key]}`);
      }
    });
    
    return formatted.length > 0 ? formatted.join(', ') : JSON.stringify(data).substring(0, 100);
  };

  // Couleurs selon le type d'événement
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'user_event': return 'bg-green-100 text-green-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Dernière heure</option>
            <option value="24h">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
          
          <select 
            value={eventTypeFilter} 
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Tous les types</option>
            <option value="performance">Performance</option>
            <option value="error">Erreurs</option>
            <option value="user_event">Événements utilisateur</option>
            <option value="business">Métriques business</option>
          </select>
        </div>
        
        <Button onClick={loadMonitoringData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance moyenne et top événements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgPerformance}ms</div>
            <p className="text-sm text-muted-foreground mt-2">
              Temps de réponse moyen des métriques de performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topEvents.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate">{item.event}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Événements Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun événement trouvé pour cette période
              </p>
            ) : (
              events.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {formatEventData(event.data)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()} • Session: {event.session_id.substring(0, 8)}
                      {event.url && ` • ${event.url}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringDashboard;
