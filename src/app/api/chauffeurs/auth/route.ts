import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, telephone, password, chauffeurData } = body;
    
    console.log('🔐 API Auth Chauffeur - Action:', action);
    console.log('🔧 Variables d\'environnement Auth:', { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY 
    });

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Variables d\'environnement manquantes dans auth');
      return NextResponse.json({ success: false, message: 'Configuration serveur manquante' }, { status: 500 });
    }
    
    if (action === 'register') {
      console.log('📝 Données chauffeur inscription:', {
        nom: chauffeurData?.nom,
        email: chauffeurData?.email,
        telephone: chauffeurData?.telephone,
        vehicule_type: chauffeurData?.type_vehicule,
        immatriculation: chauffeurData?.immatriculation
      });
    }

    if (action === 'login') {
      // Authentification - Utiliser MCP API pour contourner RLS
      console.log('🔍 Tentative de connexion pour:', telephone);
      
      // Utiliser l'URL relative pour éviter les problèmes de déploiement
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const mcpResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'read',
          resource: 'chauffeurs',
          params: { telephone: telephone }
        })
      });

      if (!mcpResponse.ok) {
        const errorText = await mcpResponse.text();
        console.error('❌ Erreur MCP auth:', mcpResponse.status, errorText);
        return NextResponse.json({ success: false, message: 'Erreur de connexion' }, { status: 500 });
      }

      const mcpResult = await mcpResponse.json();
      console.log('📊 Résultat MCP:', mcpResult);
      const chauffeurs = mcpResult.data || [];
      console.log('📊 Chauffeurs trouvés:', chauffeurs.length, chauffeurs);
      
      if (chauffeurs.length === 0) {
        console.log('❌ Aucun chauffeur trouvé pour téléphone:', telephone);
        return NextResponse.json({ success: false, message: 'Chauffeur non trouvé' }, { status: 401 });
      }

      const chauffeur = chauffeurs[0];

      // Vérifier le mot de passe (si hashé)
      let passwordValid = false;
      if (chauffeur.password_hash) {
        passwordValid = await bcrypt.compare(password, chauffeur.password_hash);
      } else {
        // Fallback pour les mots de passe non hashés (temporaire)
        passwordValid = password === chauffeur.password_hash;
      }

      if (!passwordValid) {
        return NextResponse.json({ success: false, message: 'Mot de passe incorrect' }, { status: 401 });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { 
          chauffeurId: chauffeur.id, 
          telephone: chauffeur.telephone,
          nom: chauffeur.nom 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Mettre à jour la dernière connexion via MCP API
      console.log('🔄 Mise à jour statut connexion pour chauffeur:', chauffeur.id);
      const updateResponse = await fetch(`${baseUrl}/api/mcp/supabase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          resource: 'chauffeurs',
          params: {
            id: chauffeur.id
          },
          data: {
            derniere_connexion: new Date().toISOString(),
            statut: 'en_ligne'
          }
        })
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        if (updateResult.success) {
          console.log('✅ Statut mis à jour: en_ligne pour', chauffeur.nom);
        } else {
          console.error('❌ Erreur MCP mise à jour statut:', updateResult.error);
        }
      } else {
        console.error('❌ Erreur requête mise à jour statut:', await updateResponse.text());
      }

      return NextResponse.json({
        success: true,
        token,
        chauffeur: {
          id: chauffeur.id,
          nom: chauffeur.nom,
          telephone: chauffeur.telephone,
          email: chauffeur.email,
          vehicule_type: chauffeur.vehicule_type,
          disponible: chauffeur.disponible
        }
      });

    } else if (action === 'register') {
      // Inscription avec hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const newChauffeurData = {
        ...chauffeurData,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        disponible: false,
        vehicule_plaque: chauffeurData.immatriculation || null,
        notes: null
      };

      // Utiliser l'API MCP comme le reste du projet
      const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/mcp/supabase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          resource: 'chauffeurs',
          data: newChauffeurData
        })
      });

      if (!mcpResponse.ok) {
        const error = await mcpResponse.text();
        console.error('❌ Erreur MCP inscription:', mcpResponse.status, error);
        return NextResponse.json({ 
          success: false, 
          message: 'Erreur lors de l\'inscription d un chauffeur', 
          error: `API MCP ${mcpResponse.status}: ${error}` 
        }, { status: 500 });
      }

      const result = await mcpResponse.json();
      console.log('Chauffeur créé via MCP:', result);

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message || 'Erreur lors de l\'inscription' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Inscription réussie',
        chauffeur: result.data
      });

    } else if (action === 'verify') {
      // Vérifier un token JWT
      const { token } = body;
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Récupérer les informations actuelles du chauffeur
        const response = await fetch(`${SUPABASE_URL}/rest/v1/chauffeurs?id=eq.${decoded.chauffeurId}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return NextResponse.json({ success: false, message: 'Chauffeur non trouvé' }, { status: 404 });
        }

        const chauffeurs = await response.json();
        if (chauffeurs.length === 0) {
          return NextResponse.json({ success: false, message: 'Chauffeur non trouvé' }, { status: 404 });
        }

        const chauffeur = chauffeurs[0];

        return NextResponse.json({
          success: true,
          chauffeur: {
            id: chauffeur.id,
            nom: chauffeur.nom,
            telephone: chauffeur.telephone,
            email: chauffeur.email,
            vehicule_type: chauffeur.vehicule_type,
            disponible: chauffeur.disponible
          }
        });

      } catch (error) {
        return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
      }
    }

    return NextResponse.json({ success: false, message: 'Action non reconnue' }, { status: 400 });

  } catch (error) {
    console.error('Erreur API auth chauffeurs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
