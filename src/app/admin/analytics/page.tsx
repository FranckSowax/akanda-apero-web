'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  Eye, 
  Clock, 
  DollarSign,
  Activity,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';

/**
 * 📊 Dashboard Analytics Admin - Akanda Apéro
 * 
 * Dashboard complet pour visualiser les données de monitoring :
 * - Métriques de performance (Web Vitals)
 * - Événements e-commerce
 * - Erreurs et alertes
 * - Statistiques business
 */

interface AnalyticsData {
  performance: {
    totalMetrics: number;
    avgLoadTime: number;
    webVitals: {
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
      ttfb: number;
    };
  };
  events: {
    totalEvents: number;
    topEvents: [string, number][];
    conversionFunnel: {
      product_views: number;
      add_to_cart: number;
      begin_checkout: number;
      purchases: number;
    };
  };
  business: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  errors: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    topErrors: Array<{
      message: string;
      occurrences: number;
      severity: string;
    }>;
  };
}

interface ErrorData {
  id: string;
  message: string;
  occurrence_count: number;
  severity: string;
  last_occurrence: string;
  resolved: boolean;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les données d'analytics
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Charger les données du dashboard
      const dashboardResponse = await fetch(`/api/analytics?period=${period}`);
      const dashboardData = await dashboardResponse.json();

      // Charger les erreurs
      const errorsResponse = await fetch(`/api/errors?period=${period}`);
      const errorsData = await errorsResponse.json();

      setAnalyticsData(dashboardData);
      setErrors(errorsData.errors || []);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  // Marquer une erreur comme résolue
  const resolveError = async (errorId: string) => {
    try {
      await fetch('/api/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId, resolved: true })
      });
      
      // Recharger les erreurs
      loadAnalyticsData();
    } catch (error) {
      console.error('Erreur résolution erreur:', error);
    }
  };

  // Calculer le taux de conversion
  const getConversionRate = () => {
    if (!analyticsData?.events?.conversionFunnel) return 0;
    const { product_views, purchases } = analyticsData.events.conversionFunnel;
    return product_views > 0 ? ((purchases / product_views) * 100) : 0;
  };

  // Formater les prix
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formater les métriques de performance
  const formatMetric = (value: number, unit: string = 'ms') => {
    if (value < 1000) return `${value.toFixed(0)}${unit}`;
    return `${(value / 1000).toFixed(1)}s`;
  };

  // Obtenir la couleur selon la performance
  const getPerformanceColor = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoring et analytics de performance Akanda Apéro
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24h</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(analyticsData?.business?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.business?.totalOrders || 0} commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConversionRate().toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de conversion global
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.events?.totalEvents?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Actions utilisateur trackées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analyticsData?.errors?.criticalErrors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Erreurs critiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs détaillés */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel de conversion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Funnel de Conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.events?.conversionFunnel && (
                  <div className="space-y-4">
                    {Object.entries(analyticsData.events.conversionFunnel).map(([step, count], index) => {
                      const percentage = index === 0 ? 100 : 
                        ((count / analyticsData.events.conversionFunnel.product_views) * 100);
                      
                      return (
                        <div key={step} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                            }`} />
                            <span className="capitalize">
                              {step.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{count}</div>
                            <div className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top événements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.events?.topEvents?.slice(0, 5).map(([event, count]) => (
                    <div key={event} className="flex items-center justify-between">
                      <span className="text-sm">{event}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.performance?.webVitals && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(analyticsData.performance.webVitals).map(([metric, value]) => (
                    <div key={metric} className="text-center p-4 border rounded-lg">
                      <div className="text-sm font-medium uppercase mb-2">
                        {metric}
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(metric, value)}`}>
                        {formatMetric(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-commerce */}
        <TabsContent value="ecommerce" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métriques Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Panier moyen</span>
                  <span className="font-semibold">
                    {formatPrice(analyticsData?.business?.avgOrderValue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taux de conversion</span>
                  <span className="font-semibold">
                    {getConversionRate().toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Commandes totales</span>
                  <span className="font-semibold">
                    {analyticsData?.business?.totalOrders || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance E-commerce</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Données des {period === '1d' ? '24 dernières heures' : 
                               period === '7d' ? '7 derniers jours' :
                               period === '30d' ? '30 derniers jours' : '90 derniers jours'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Erreurs */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Erreurs Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.slice(0, 10).map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium truncate max-w-md">
                        {error.message}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {error.occurrence_count} occurrence{error.occurrence_count > 1 ? 's' : ''} • 
                        {new Date(error.last_occurrence).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        error.severity === 'critical' ? 'destructive' :
                        error.severity === 'high' ? 'default' :
                        error.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {error.severity}
                      </Badge>
                      {!error.resolved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveError(error.id)}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {errors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    🎉 Aucune erreur récente !
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
