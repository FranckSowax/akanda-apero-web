import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../lib/types';

// Base de données fictive pour les utilisateurs
let users: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@akandaapero.com",
    role: "admin",
    name: "Administrateur",
    avatar: "https://ui-avatars.com/api/?name=Administrateur&background=F5A623&color=fff",
    createdAt: "2024-06-01T08:00:00.000Z",
    updatedAt: "2025-03-15T10:30:00.000Z"
  },
  {
    id: 2,
    username: "manager",
    email: "manager@akandaapero.com",
    role: "staff",
    name: "Responsable des Ventes",
    avatar: "https://ui-avatars.com/api/?name=Responsable+Ventes&background=F5A623&color=fff",
    createdAt: "2024-08-10T09:15:00.000Z",
    updatedAt: "2025-01-20T14:45:00.000Z"
  },
  {
    id: 3,
    username: "delivery",
    email: "delivery@akandaapero.com",
    role: "delivery",
    name: "Superviseur Livraison",
    avatar: "https://ui-avatars.com/api/?name=Superviseur+Livraison&background=F5A623&color=fff",
    createdAt: "2024-09-05T11:30:00.000Z",
    updatedAt: "2025-02-10T16:20:00.000Z"
  }
];

// Base de données pour les jetons actifs
let activeTokens: {userId: number, token: string, expiresAt: Date}[] = [];

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (endpoint === 'login') {
      const body = await request.json();
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json({
          success: false,
          error: 'Email et mot de passe requis'
        }, { status: 400 });
      }
      
      // Dans une application réelle, le mot de passe serait haché et comparé au hachage stocké
      // Ici, pour la démo, on vérifie simplement que l'email correspond à un utilisateur
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Identifiants invalides'
        }, { status: 401 });
      }
      
      // Générer un jeton (token) pour l'authentification
      // Dans une application réelle, on utiliserait JWT ou une autre méthode sécurisée
      const token = generateToken();
      
      // Stockage du jeton avec une date d'expiration (24h)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Ajouter le jeton à la liste des jetons actifs
      activeTokens.push({
        userId: user.id,
        token,
        expiresAt
      });
      
      // Ne pas renvoyer les informations sensibles
      const { ...userWithoutSensitiveInfo } = user;
      
      return NextResponse.json({
        success: true,
        data: {
          user: userWithoutSensitiveInfo,
          token
        },
        message: 'Connexion réussie'
      });
    } else if (endpoint === 'logout') {
      const authorization = request.headers.get('Authorization');
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({
          success: false,
          error: 'Jeton non fourni'
        }, { status: 401 });
      }
      
      const token = authorization.split('Bearer ')[1];
      
      // Supprimer le jeton de la liste des jetons actifs
      const tokenIndex = activeTokens.findIndex(t => t.token === token);
      
      if (tokenIndex !== -1) {
        activeTokens.splice(tokenIndex, 1);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } else if (endpoint === 'users') {
      // Pour l'ajout d'un nouvel utilisateur, accessible seulement à l'admin
      const authorization = request.headers.get('Authorization');
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({
          success: false,
          error: 'Jeton non fourni'
        }, { status: 401 });
      }
      
      const token = authorization.split('Bearer ')[1];
      const activeToken = activeTokens.find(t => t.token === token && t.expiresAt > new Date());
      
      if (!activeToken) {
        return NextResponse.json({
          success: false,
          error: 'Jeton invalide ou expiré'
        }, { status: 401 });
      }
      
      // Vérifier si l'utilisateur est admin
      const admin = users.find(u => u.id === activeToken.userId && u.role === 'admin');
      
      if (!admin) {
        return NextResponse.json({
          success: false,
          error: 'Autorisation refusée'
        }, { status: 403 });
      }
      
      const body = await request.json();
      const { username, email, name, role, password } = body;
      
      if (!username || !email || !name || !role || !password) {
        return NextResponse.json({
          success: false,
          error: 'Toutes les informations sont requises'
        }, { status: 400 });
      }
      
      // Vérifier si l'email ou le nom d'utilisateur existe déjà
      const existingUser = users.find(u => u.email === email || u.username === username);
      
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Cet email ou nom d\'utilisateur existe déjà'
        }, { status: 409 });
      }
      
      // Créer un nouvel utilisateur
      const newUser: User = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        email,
        role: role as 'admin' | 'staff' | 'delivery',
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F5A623&color=fff`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      
      // Ne pas renvoyer les informations sensibles
      const { ...userWithoutSensitiveInfo } = newUser;
      
      return NextResponse.json({
        success: true,
        data: userWithoutSensitiveInfo,
        message: 'Utilisateur créé avec succès'
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Endpoint non valide'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la requête'
    }, { status: 500 });
  }
}

// GET /api/auth/me ou /api/auth/users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Jeton non fourni'
      }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    const activeToken = activeTokens.find(t => t.token === token && t.expiresAt > new Date());
    
    if (!activeToken) {
      return NextResponse.json({
        success: false,
        error: 'Jeton invalide ou expiré'
      }, { status: 401 });
    }
    
    const user = users.find(u => u.id === activeToken.userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    if (endpoint === 'me') {
      // Ne pas renvoyer les informations sensibles
      const { ...userWithoutSensitiveInfo } = user;
      
      return NextResponse.json({
        success: true,
        data: userWithoutSensitiveInfo
      });
    } else if (endpoint === 'users') {
      // Vérifier si l'utilisateur est admin
      if (user.role !== 'admin') {
        return NextResponse.json({
          success: false,
          error: 'Autorisation refusée'
        }, { status: 403 });
      }
      
      // Renvoyer la liste des utilisateurs sans informations sensibles
      const usersWithoutSensitiveInfo = users.map(u => {
        const { ...user } = u;
        return user;
      });
      
      return NextResponse.json({
        success: true,
        data: usersWithoutSensitiveInfo
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Endpoint non valide'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la requête'
    }, { status: 500 });
  }
}

// Fonction pour générer un jeton aléatoire
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
