'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function TestValidationPage() {
  const { addToCart } = useAppContext();

  const testValidProduct = () => {
    const validProduct = {
      id: 'ae0ef188-7497-4a31-9a24-2b7f9343537d', // UUID valide d'un produit existant
      name: 'Baron de Lestac Rouge - Bordeaux - 75 cl',
      base_price: 1500,
      sale_price: null,
      image_url: '/images/wine.jpg',
      emoji: '🍷'
    };

    console.log('🧪 Test produit valide:', validProduct);
    addToCart(validProduct as any, 1);
  };

  const testInvalidProduct = () => {
    const invalidProduct = {
      id: '0', // ID invalide
      name: 'Produit avec ID invalide',
      base_price: 1000,
      sale_price: null,
      image_url: '/images/invalid.jpg',
      emoji: '❌'
    };

    console.log('🧪 Test produit invalide:', invalidProduct);
    addToCart(invalidProduct as any, 1);
  };

  const testProductWithoutId = () => {
    const productWithoutId = {
      name: 'Produit sans ID',
      base_price: 800,
      sale_price: null,
      image_url: '/images/no-id.jpg',
      emoji: '🚫'
    };

    console.log('🧪 Test produit sans ID:', productWithoutId);
    addToCart(productWithoutId as any, 1);
  };

  const testProductWithNonStringId = () => {
    const productWithNumberId = {
      id: 123, // ID numérique au lieu de string
      name: 'Produit avec ID numérique',
      base_price: 1200,
      sale_price: null,
      image_url: '/images/number-id.jpg',
      emoji: '🔢'
    };

    console.log('🧪 Test produit avec ID numérique:', productWithNumberId);
    addToCart(productWithNumberId as any, 1);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test de Validation des Produits</h1>
      
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Test Produit Valide</h2>
          <p className="text-green-600 mb-4">Ajoute un produit avec un UUID valide</p>
          <button
            onClick={testValidProduct}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Tester Produit Valide
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Test Produit avec ID "0"</h2>
          <p className="text-red-600 mb-4">Ajoute un produit avec ID invalide "0"</p>
          <button
            onClick={testInvalidProduct}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tester Produit Invalide
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Test Produit Sans ID</h2>
          <p className="text-yellow-600 mb-4">Ajoute un produit sans propriété ID</p>
          <button
            onClick={testProductWithoutId}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Tester Produit Sans ID
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Produit avec ID Numérique</h2>
          <p className="text-blue-600 mb-4">Ajoute un produit avec un ID numérique au lieu d'un UUID</p>
          <button
            onClick={testProductWithNonStringId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tester Produit ID Numérique
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Ouvrez la console du navigateur (F12)</li>
          <li>Cliquez sur les boutons de test</li>
          <li>Observez les logs de validation dans la console</li>
          <li>Vérifiez les toasts de succès/erreur</li>
          <li>Seul le produit valide devrait être ajouté au panier</li>
        </ol>
      </div>
    </div>
  );
}
