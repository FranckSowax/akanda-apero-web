import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

/**
 * 📊 API Route pour Analytics - Akanda Apéro
 * 
 * Collecte et stocke les données d'analytics :
 * - Métriques de performance
 * - Événements utilisateur
 * - Métriques business
 */

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // Validation des données
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type et data sont requis' },
        { status: 400 }
      );
    }

    // Enrichir les données avec des informations de contexte
    const enrichedData = {
      ...data,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || null,
      timestamp: new Date().toISOString(),
    };

    // Stocker selon le type d'analytics
    switch (type) {
      case 'performance':
        await storePerformanceMetric(enrichedData);
        break;
      
      case 'user_event':
        await storeUserEvent(enrichedData);
        break;
      
      case 'business':
        await storeBusinessMetric(enrichedData);
        break;
      
      default:
        console.warn(`Type d'analytics non reconnu: ${type}`);
    }

    // Réponse rapide pour ne pas impacter les performances
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Erreur API Analytics:', error);
    
    // Ne pas retourner d'erreur pour ne pas impacter l'UX
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * 📈 Stocker une métrique de performance
 */
async function storePerformanceMetric(data: any) {
  try {
    await supabase
      .from('analytics_performance')
      .insert({
        metric_name: data.name,
        metric_value: data.value,
        url: data.url,
        user_id: data.userId,
        user_agent: data.userAgent,
        timestamp: data.timestamp,
        metadata: {
          ip: data.ip,
          referer: data.referer,
        }
      });
  } catch (error) {
    console.error('Erreur stockage métrique performance:', error);
  }
}

/**
 * 👤 Stocker un événement utilisateur
 */
async function storeUserEvent(data: any) {
  try {
    await supabase
      .from('analytics_events')
      .insert({
        event_name: data.event,
        event_properties: data.properties,
        user_id: data.userId,
        session_id: data.sessionId,
        user_agent: data.userAgent,
        timestamp: data.timestamp,
        metadata: {
          ip: data.ip,
          referer: data.referer,
        }
      });
  } catch (error) {
    console.error('Erreur stockage événement utilisateur:', error);
  }
}

/**
 * 💼 Stocker une métrique business
 */
async function storeBusinessMetric(data: any) {
  try {
    await supabase
      .from('analytics_business')
      .insert({
        metric_name: data.metric,
        metric_value: data.value,
        category: data.category,
        timestamp: data.timestamp,
        metadata: {
          ip: data.ip,
          referer: data.referer,
          userAgent: data.userAgent,
        }
      });
  } catch (error) {
    console.error('Erreur stockage métrique business:', error);
  }
}

/**
 * 📊 GET - Récupérer des statistiques d'analytics (pour l'admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const period = searchParams.get('period') || '7d';

    // Calculer la date de début selon la période
    const startDate = getStartDate(period);

    let data;
    switch (type) {
      case 'performance':
        data = await getPerformanceStats(startDate);
        break;
      
      case 'events':
        data = await getEventStats(startDate);
        break;
      
      case 'business':
        data = await getBusinessStats(startDate);
        break;
      
      default:
        data = await getDashboardStats(startDate);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur récupération analytics:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * 🗓️ Calculer la date de début selon la période
 */
function getStartDate(period: string): string {
  const now = new Date();
  let daysBack = 7;

  switch (period) {
    case '1d': daysBack = 1; break;
    case '7d': daysBack = 7; break;
    case '30d': daysBack = 30; break;
    case '90d': daysBack = 90; break;
  }

  const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  return startDate.toISOString();
}

/**
 * 📈 Récupérer les statistiques de performance
 */
async function getPerformanceStats(startDate: string) {
  const { data, error } = await supabase
    .from('analytics_performance')
    .select('*')
    .gte('timestamp', startDate)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  // Calculer des métriques agrégées
  const metrics = data?.reduce((acc: any, item: any) => {
    const metricName = item.metric_name;
    if (!acc[metricName]) {
      acc[metricName] = {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      };
    }
    
    acc[metricName].count++;
    acc[metricName].total += item.metric_value;
    acc[metricName].min = Math.min(acc[metricName].min, item.metric_value);
    acc[metricName].max = Math.max(acc[metricName].max, item.metric_value);
    acc[metricName].values.push({
      value: item.metric_value,
      timestamp: item.timestamp
    });
    
    return acc;
  }, {});

  // Calculer les moyennes
  Object.keys(metrics || {}).forEach(key => {
    metrics[key].average = metrics[key].total / metrics[key].count;
  });

  return { metrics, rawData: data };
}

/**
 * 👤 Récupérer les statistiques d'événements
 */
async function getEventStats(startDate: string) {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('timestamp', startDate)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  // Compter les événements par type
  const eventCounts = data?.reduce((acc: any, item: any) => {
    acc[item.event_name] = (acc[item.event_name] || 0) + 1;
    return acc;
  }, {});

  return { eventCounts, totalEvents: data?.length || 0, rawData: data };
}

/**
 * 💼 Récupérer les statistiques business
 */
async function getBusinessStats(startDate: string) {
  const { data, error } = await supabase
    .from('analytics_business')
    .select('*')
    .gte('timestamp', startDate)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  // Calculer les métriques par catégorie
  const categoryStats = data?.reduce((acc: any, item: any) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0, metrics: {} };
    }
    
    acc[category].total += item.metric_value;
    acc[category].count++;
    
    if (!acc[category].metrics[item.metric_name]) {
      acc[category].metrics[item.metric_name] = 0;
    }
    acc[category].metrics[item.metric_name] += item.metric_value;
    
    return acc;
  }, {});

  return { categoryStats, rawData: data };
}

/**
 * 📊 Récupérer les statistiques du dashboard
 */
async function getDashboardStats(startDate: string) {
  const [performance, events, business] = await Promise.all([
    getPerformanceStats(startDate),
    getEventStats(startDate),
    getBusinessStats(startDate)
  ]);

  return {
    performance: {
      totalMetrics: Object.keys(performance.metrics || {}).length,
      avgLoadTime: performance.metrics?.loadTime?.average || 0
    },
    events: {
      totalEvents: events.totalEvents,
      topEvents: Object.entries(events.eventCounts || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
    },
    business: {
      totalRevenue: business.categoryStats?.sales?.metrics?.revenue || 0,
      totalOrders: business.categoryStats?.sales?.count || 0
    }
  };
}
