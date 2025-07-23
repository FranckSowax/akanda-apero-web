import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * 🚨 API Route pour Error Tracking - Akanda Apéro
 * 
 * Collecte et stocke les erreurs de l'application :
 * - Erreurs JavaScript
 * - Erreurs de promesses non gérées
 * - Erreurs personnalisées
 */

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Validation des données d'erreur
    if (!errorData.message) {
      return NextResponse.json(
        { error: 'Message d\'erreur requis' },
        { status: 400 }
      );
    }

    // Enrichir les données d'erreur
    const enrichedError = {
      ...errorData,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || null,
      timestamp: new Date().toISOString(),
      fingerprint: generateErrorFingerprint(errorData),
    };

    // Stocker l'erreur
    await storeError(enrichedError);

    // Vérifier si c'est une erreur critique
    if (errorData.severity === 'critical') {
      await handleCriticalError(enrichedError);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Erreur API Error Tracking:', error);
    
    // Ne pas retourner d'erreur pour éviter les boucles infinies
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * 💾 Stocker une erreur en base de données
 */
async function storeError(errorData: any) {
  try {
    // Vérifier si une erreur similaire existe déjà (déduplication)
    const { data: existingError } = await supabase
      .from('error_logs')
      .select('id, occurrence_count')
      .eq('fingerprint', errorData.fingerprint)
      .eq('resolved', false)
      .single();

    if (existingError) {
      // Incrémenter le compteur d'occurrences
      await supabase
        .from('error_logs')
        .update({
          occurrence_count: existingError.occurrence_count + 1,
          last_occurrence: errorData.timestamp,
          last_user_agent: errorData.userAgent,
          last_url: errorData.url
        })
        .eq('id', existingError.id);
    } else {
      // Créer une nouvelle entrée d'erreur
      await supabase
        .from('error_logs')
        .insert({
          message: errorData.message,
          stack: errorData.stack,
          url: errorData.url,
          user_id: errorData.userId,
          severity: errorData.severity,
          fingerprint: errorData.fingerprint,
          user_agent: errorData.userAgent,
          ip_address: errorData.ip,
          referer: errorData.referer,
          timestamp: errorData.timestamp,
          last_occurrence: errorData.timestamp,
          occurrence_count: 1,
          resolved: false,
          metadata: {
            browser: parseBrowserInfo(errorData.userAgent),
            viewport: errorData.viewport,
            additional: errorData.additional
          }
        });
    }
  } catch (error) {
    console.error('Erreur stockage erreur:', error);
  }
}

/**
 * 🔥 Gérer les erreurs critiques
 */
async function handleCriticalError(errorData: any) {
  try {
    // Créer une alerte pour les erreurs critiques
    await supabase
      .from('error_alerts')
      .insert({
        error_fingerprint: errorData.fingerprint,
        severity: 'critical',
        message: `Erreur critique détectée: ${errorData.message}`,
        url: errorData.url,
        user_id: errorData.userId,
        timestamp: errorData.timestamp,
        status: 'open'
      });

    // Ici vous pourriez aussi :
    // - Envoyer un email/SMS aux développeurs
    // - Créer un ticket dans votre système de gestion
    // - Envoyer une notification Slack/Discord
    // - Déclencher une alerte PagerDuty

    console.error('🚨 ERREUR CRITIQUE DÉTECTÉE:', {
      message: errorData.message,
      url: errorData.url,
      userId: errorData.userId,
      timestamp: errorData.timestamp
    });

  } catch (error) {
    console.error('Erreur gestion erreur critique:', error);
  }
}

/**
 * 🔍 Générer une empreinte unique pour l'erreur (déduplication)
 */
function generateErrorFingerprint(errorData: any): string {
  // Créer une empreinte basée sur le message et la stack trace
  const message = errorData.message || '';
  const stack = errorData.stack || '';
  const url = errorData.url || '';
  
  // Normaliser la stack trace (supprimer les numéros de ligne variables)
  const normalizedStack = stack
    .replace(/:\d+:\d+/g, ':0:0') // Remplacer line:col par 0:0
    .replace(/\?[^)]+/g, '') // Supprimer les query params
    .replace(/\/[a-f0-9]{8,}/g, '/[hash]'); // Remplacer les hashes

  const fingerprint = `${message}|${normalizedStack}|${url}`;
  
  // Créer un hash simple
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * 🌐 Parser les informations du navigateur
 */
function parseBrowserInfo(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  let browser = 'unknown';
  let version = 'unknown';
  
  if (ua.includes('chrome')) {
    browser = 'chrome';
    const match = ua.match(/chrome\/([0-9.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('firefox')) {
    browser = 'firefox';
    const match = ua.match(/firefox\/([0-9.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('safari')) {
    browser = 'safari';
    const match = ua.match(/version\/([0-9.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('edge')) {
    browser = 'edge';
    const match = ua.match(/edge\/([0-9.]+)/);
    version = match ? match[1] : 'unknown';
  }
  
  const os = ua.includes('windows') ? 'windows' :
            ua.includes('mac') ? 'mac' :
            ua.includes('linux') ? 'linux' :
            ua.includes('android') ? 'android' :
            ua.includes('ios') ? 'ios' : 'unknown';
  
  return { browser, version, os };
}

/**
 * 📊 GET - Récupérer les statistiques d'erreurs (pour l'admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved') === 'true';

    // Calculer la date de début
    const startDate = getStartDate(period);

    // Construire la requête
    let query = supabase
      .from('error_logs')
      .select('*')
      .gte('timestamp', startDate)
      .eq('resolved', resolved);

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: errors, error } = await query
      .order('last_occurrence', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Calculer des statistiques
    const stats = {
      totalErrors: errors?.length || 0,
      totalOccurrences: errors?.reduce((sum, err) => sum + err.occurrence_count, 0) || 0,
      bySeverity: errors?.reduce((acc: any, err) => {
        acc[err.severity] = (acc[err.severity] || 0) + 1;
        return acc;
      }, {}),
      byUrl: errors?.reduce((acc: any, err) => {
        const url = err.url || 'unknown';
        acc[url] = (acc[url] || 0) + err.occurrence_count;
        return acc;
      }, {}),
      topErrors: errors?.slice(0, 10).map(err => ({
        id: err.id,
        message: err.message,
        occurrences: err.occurrence_count,
        severity: err.severity,
        lastOccurrence: err.last_occurrence
      }))
    };

    return NextResponse.json({ errors, stats });

  } catch (error) {
    console.error('Erreur récupération erreurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * 🔧 PATCH - Marquer une erreur comme résolue
 */
export async function PATCH(request: NextRequest) {
  try {
    const { errorId, resolved } = await request.json();

    if (!errorId) {
      return NextResponse.json(
        { error: 'ID d\'erreur requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('error_logs')
      .update({ 
        resolved: resolved !== false,
        resolved_at: resolved !== false ? new Date().toISOString() : null
      })
      .eq('id', errorId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur mise à jour erreur:', error);
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
