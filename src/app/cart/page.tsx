'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/supabase/useAuth';

// Delivery options
const deliveryOptions = [
  { id: 'standard', name: 'Livraison Standard', price: 1000, description: '1-2 jours ouvrables', icon: Truck },
  { id: 'express', name: 'Livraison Express', price: 2000, description: 'Même jour (avant 14h)', icon: Truck },
];

export default function CartPage() {
  // Utiliser le contexte du panier pour accéder aux articles et fonctions
  const { 
    state, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    applyPromoCode,
    getCartTotal,
    getCartItemsCount
  } = useAppContext();
  
  // Vérifier si l'utilisateur est connecté
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  // État local pour le code promo et la livraison
  const [promoCode, setPromoCode] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  
  // Récupérer les éléments du panier depuis le contexte
  const cartItems = state.cart.items;

  // Fonction pour changer la quantité d'un article
  const handleQuantityChange = (productId: number, delta: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (item) {
      updateCartItemQuantity(productId, Math.max(1, item.quantity + delta));
    }
  };

  // Fonction pour supprimer un article
  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  // Fonction pour appliquer un code promo
  const handleApplyPromo = () => {
    applyPromoCode(promoCode);
  };

  // Obtenir les totaux depuis le contexte
  const { subtotal, deliveryCost, discount: discountAmount, total } = getCartTotal();
  
  // État pour savoir si un code promo est appliqué
  const promoApplied = state.cart.promoCode !== '' && state.cart.promoDiscount > 0;

  // Format price
  const formatPrice = (price: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="mb-6 text-gray-600 text-center">Vous n'avez pas encore ajouté de produits à votre panier.</p>
        <Link href="/category">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Parcourir les produits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/category" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuer les achats
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Articles ({getCartItemsCount()})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                const itemPrice = product.isPromo && product.discount 
                  ? product.price * (1 - product.discount / 100) 
                  : product.price;
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.product.id} className="flex items-start space-x-4 py-4 border-b last:border-0">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/product/${item.product.id}`}>
                        <Image 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          width={80} 
                          height={80} 
                          className="rounded-md object-cover"
                        />
                      </Link>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-grow">
                      <Link href={`/product/${item.product.id}`} className="hover:underline">
                        <h3 className="font-medium">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500">{item.product.description}</p>
                      
                      {/* Price */}
                      <div className="mt-1">
                        {item.product.isPromo && item.product.discount ? (
                          <div className="flex items-center">
                            <span className="text-red-600 font-medium">
                              {formatPrice(itemPrice, item.product.currency)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatPrice(item.product.price, item.product.currency)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(item.product.price, item.product.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Total & Remove */}
                    <div className="text-right flex flex-col items-end">
                      <span className="font-bold">
                        {formatPrice(itemTotal, item.product.currency)}
                      </span>
                      <button 
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 mt-2"
                        aria-label="Supprimer l'article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              {/* Delivery Options */}
              <div className="space-y-2">
                <Label className="text-gray-600">Livraison</Label>
                {deliveryOptions.map((option) => (
                  <div 
                    key={option.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                      selectedDelivery === option.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedDelivery(option.id)}
                  >
                    <div className="flex items-center">
                      <option.icon className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(option.price)}</span>
                  </div>
                ))}
              </div>
              
              {/* Promo Code */}
              <div className="space-y-2">
                <Label htmlFor="promo-code" className="text-gray-600">Code Promo</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code"
                    className="flex-grow"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    disabled={!promoCode}
                  >
                    Appliquer
                  </Button>
                </div>
                {promoApplied && (
                  <div className="text-green-600 text-sm flex items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 mr-2">
                      -{state.cart.promoDiscount}%
                    </Badge>
                    Code promo appliqué
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Discount */}
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              
              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Tous les prix incluent la TVA.
              </div>
            </CardContent>
            <CardFooter>
              <Link href={isLoggedIn ? "/checkout" : "/auth"} className="w-full">
                <Button className="w-full" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoggedIn ? "Procéder au paiement" : "Se connecter pour commander"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
