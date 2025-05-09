import { NextRequest, NextResponse } from 'next/server';
import { Category } from '../../../lib/types';

// Base de données fictive pour les catégories
let categories: Category[] = [
  {
    id: 1,
    name: "Meilleures Ventes",
    description: "Nos produits les plus populaires",
    icon: "Star",
    color: "#F5A623", // Orange Akanda
    productCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Formules",
    description: "Packs et assortiments pour toutes les occasions",
    icon: "Package",
    color: "#4CAF50", // Vert
    productCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Alcools",
    description: "Sélection d'alcools forts de qualité supérieure",
    icon: "Wine",
    color: "#E8505B", // Rouge
    productCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Vins",
    description: "Vins rouges, blancs et rosés de toutes les régions",
    icon: "GlassWine",
    color: "#8B0000", // Rouge foncé
    productCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Liqueurs",
    description: "Liqueurs et spiritueux aromatiques",
    icon: "Beaker",
    color: "#9C27B0", // Violet
    productCount: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: "Bières",
    description: "Grande sélection de bières artisanales et internationales",
    icon: "Beer",
    color: "#FFD700", // Doré
    productCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    name: "Champagnes",
    description: "Champagnes et vins pétillants pour toutes les célébrations",
    icon: "Sparkles",
    color: "#D4AF37", // Or
    productCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    name: "Apéritifs & sucreries",
    description: "Tout pour accompagner vos apéros : snacks, chips, chocolats",
    icon: "Utensils",
    color: "#FF9800", // Orange
    productCount: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 9,
    name: "Sodas & jus",
    description: "Boissons sans alcool, sodas et jus de fruits",
    icon: "Coffee",
    color: "#2196F3", // Bleu
    productCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 10,
    name: "Dépannage",
    description: "Articles essentiels pour dépanner : glace, tabac, briquets",
    icon: "Lightbulb",
    color: "#607D8B", // Gris bleuté
    productCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/categories
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: categories
  });
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifications de base
    if (!body.name || !body.description) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides. Veuillez fournir au moins un nom et une description.'
      }, { status: 400 });
    }
    
    // Créer une nouvelle catégorie
    const newCategory: Category = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: body.name,
      description: body.description,
      icon: body.icon || "Box",
      color: body.color || "#F5A623", // Couleur par défaut : orange Akanda
      productCount: 0, // Nouvelle catégorie, donc pas de produits
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Catégorie créée avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la catégorie'
    }, { status: 500 });
  }
}
