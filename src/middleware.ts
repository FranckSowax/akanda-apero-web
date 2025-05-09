import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  // Pour déboguer: Désactiver temporairement la protection des routes admin
  console.log('Middleware: URL accedée:', req.nextUrl.pathname);
  
  // Permettre l'accès sans vérification pour le moment
  // C'est temporaire pour déboguer le problème de redirection
  return NextResponse.next();

  /* Code original désactivé pour le débogage
  // Vérifier si nous sommes en train d'accéder à une route protégée
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('Middleware: Tentative d\'accès à une route admin protégée');
    
    // Création manuelle d'un client Supabase pour le middleware
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Middleware: Variables d\'environnement Supabase manquantes');
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    
    try {
      // Récupération des cookies pour vérifier la session
      const { data, error } = await supabase.auth.getSession();
      console.log('Middleware: Session récupérée:', data);
      
      if (error) {
        console.error('Middleware: Erreur lors de la récupération de la session:', error);
      }
      
      // Si pas de session, rediriger vers la page de connexion
      if (!data.session) {
        console.log('Middleware: Pas de session active, redirection vers login');
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Session trouvée, autoriser l'accès
      console.log('Middleware: Session active trouvée, accès autorisé');
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware: Exception lors de la vérification de la session:', error);
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Pour les routes non-admin, autoriser l'accès sans vérification
  return NextResponse.next();
  */
}

export const config = {
  matcher: ['/admin/:path*'],
};
