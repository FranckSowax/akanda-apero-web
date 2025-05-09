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

// Types
interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  currency: string;
  quantity: number;
  isPromo?: boolean;
  discount?: number;
}

// Mock Cart Data (In a real app, this would come from a cart state/API)
const initialCartItems: CartItem[] = [
  { id: 1, name: 'Pack Tout-en-Un', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae1/100/100', currency: 'XAF', quantity: 1, isPromo: true, discount: 10 },
  { id: 3, name: 'Gingembre Yuzu', description: '1 Boîte (12 Canettes)', price: 24.99, imageUrl: 'https://picsum.photos/seed/alldae3/100/100', currency: 'XAF', quantity: 2 },
  { id: 7, name: 'Chips Sel Marin', description: 'Sachet 150g', price: 2.50, imageUrl: 'https://picsum.photos/seed/snack1/100/100', currency: 'XAF', quantity: 3 },
];

// Delivery options
const deliveryOptions = [
  { id: 'standard', name: 'Livraison Standard', price: 1000, description: '1-2 jours ouvrables', icon: Truck },
  { id: 'express', name: 'Livraison Express', price: 2000, description: 'Même jour (avant 14h)', icon: Truck },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0].id);
  
  useEffect(() => {
    // In a real app, this would fetch the cart from an API or local storage
    setCartItems(initialCartItems);
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
          : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApplyPromo = () => {
    // In a real app, this would validate the promo code with an API
    if (promoCode.toLowerCase() === 'akanda10') {
      setPromoApplied(true);
      setPromoDiscount(10);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      alert('Code promo invalide');
    }
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.isPromo && item.discount 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Get delivery cost
  const deliveryCost = deliveryOptions.find(option => option.id === selectedDelivery)?.price || 0;

  // Calculate discount amount
  const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;

  // Calculate total
  const total = subtotal + deliveryCost - discountAmount;

  // Format price
  const formatPrice = (price: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (cartItems.length === 0) {
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
              <CardTitle>Articles ({cartItems.reduce((total, item) => total + item.quantity, 0)})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = item.isPromo && item.discount 
                  ? item.price * (1 - item.discount / 100) 
                  : item.price;
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="flex items-start space-x-4 py-4 border-b last:border-0">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/product/${item.id}`}>
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name} 
                          width={80} 
                          height={80} 
                          className="rounded-md object-cover"
                        />
                      </Link>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-grow">
                      <Link href={`/product/${item.id}`} className="hover:underline">
                        <h3 className="font-medium">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      
                      {/* Price */}
                      <div className="mt-1">
                        {item.isPromo && item.discount ? (
                          <div className="flex items-center">
                            <span className="text-red-600 font-medium">
                              {formatPrice(itemPrice, item.currency)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatPrice(item.price, item.currency)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(item.price, item.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Total & Remove */}
                    <div className="text-right flex flex-col items-end">
                      <span className="font-bold">
                        {formatPrice(itemTotal, item.currency)}
                      </span>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
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
                      -{promoDiscount}%
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
              <Button className="w-full" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Procéder au paiement
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
