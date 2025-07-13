'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Truck, MapPin, Check, ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { LocationMap } from '../../components/ui/location-map';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../lib/utils/formatters';
import { useOrders } from '../../hooks/supabase/useOrders';
import { useAuth } from '../../hooks/supabase/useAuth';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Header } from '../../components/layout/Header';

// Types pour la page de checkout
interface CheckoutCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  currency?: string;
  isPromo?: boolean;
  discount?: number;
}

// Delivery options
const deliveryOptions = [
  { id: 'standard', name: 'Livraison Standard', price: 2000, description: 'Livraison en moins de 45 min' },
  { id: 'express', name: 'Livraison Express', price: 3000, description: 'Livraison en moins de 25 min' },
  { id: 'night', name: 'Livraison nuit', price: 3500, description: 'Après 22H30' },
];

// Payment methods
const paymentMethods = [
  { id: 'cash', name: 'Paiement à la livraison', description: 'Payez en espèces à la réception' },
  { id: 'mobile_money', name: 'Mobile Money', description: 'Airtel Money, MTN Mobile Money, etc.' },
  { id: 'card', name: 'Carte bancaire', description: 'Visa, Mastercard, etc.' },
];

// Définir les types pour la logique du panier
interface ProductItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  currency?: string;
  categorySlug?: string;
  stock?: number;
  discount?: number;
  isPromo?: boolean;
}

interface CartItem {
  product: ProductItem;
  quantity: number;
}

// Fonction utilitaire pour extraire le prénom et le nom
const getFirstAndLastName = (fullName: string): { firstName: string, lastName: string } => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
};

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getCartTotal, clearCart, dispatch } = useAppContext();
  const cartItems = state.cart.items as CartItem[];
  const [formStep, setFormStep] = useState<'delivery' | 'payment' | 'confirmation'>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Récupérer l'état d'authentification de l'utilisateur
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  
  // Récupérer les fonctions du hook useOrders
  const { createOrder, loading: orderLoading } = useOrders();

  // Rediriger vers la page panier si le panier est vide ou vers la page d'authentification si l'utilisateur n'est pas connecté
  useEffect(() => {
    // Attendre que l'authentification soit complètement chargée
    if (authLoading) {
      console.log('🔄 Checkout - Authentification en cours de chargement...');
      return;
    }
    
    console.log('📊 Checkout - État auth:', { user, isLoggedIn, cartItems: state.cart.items.length });
    
    if (state.cart.items.length === 0) {
      console.log('🛒 Checkout - Panier vide, redirection vers /cart');
      router.push('/cart');
    } else if (!isLoggedIn) {
      console.log('🔐 Checkout - Utilisateur non connecté, redirection vers /auth');
      router.push('/auth');
    }
  }, [state.cart.items, router, isLoggedIn, authLoading, user]);

  // Form state
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: 'Libreville, Gabon',
    district: '',
    additionalInfo: '',
    deliveryOption: 'standard',
    location: {
      lat: 0.4162,
      lng: 9.4167,
      hasLocation: false,
    },
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    mobileNumber: '',
    email: '',
  });

  // Vérifier si c'est la nuit (après 22h30)
  const [isNightTime, setIsNightTime] = useState(false);
  
  useEffect(() => {
    const checkNightTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      
      // Considérer qu'il est nuit après 22h30 (22:30)
      setIsNightTime(hour >= 22 && minutes >= 30);
    };
    
    checkNightTime();
    const interval = setInterval(checkNightTime, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(interval);
  }, []);

  // Récupérer les informations de base du panier
  const { subtotal, discount: discountAmount } = getCartTotal();
  
  // Obtenir les frais de livraison en fonction de l'option sélectionnée
  const selectedDeliveryOption = deliveryOptions.find(opt => opt.id === deliveryInfo.deliveryOption);
  const deliveryFee = selectedDeliveryOption?.price || 2000; // 2000 FCFA par défaut (standard)
  
  // Calculer le total final
  const total = subtotal - discountAmount + deliveryFee;

  // Format price function
  const formatPriceLocal = (price: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle delivery info changes
  const handleDeliveryInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle location selection - Mémorisé avec useCallback pour éviter le clignotement de la carte
  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    console.log('📍 Location selected:', location);
    setDeliveryInfo(prev => ({
      ...prev,
      address: location.address,
      location: {
        lat: location.lat,
        lng: location.lng,
        hasLocation: true,
      },
    }));
  }, []); // Pas de dépendances car on utilise la forme fonctionnelle de setState

  // Handle delivery option change
  const handleDeliveryOptionChange = (option: string) => {
    // Mettre à jour l'option de livraison locale
    setDeliveryInfo(prev => ({
      ...prev,
      deliveryOption: option,
    }));
    
    // Mettre à jour l'option de livraison dans le contexte global
    dispatch({ 
      type: 'SET_DELIVERY_OPTION', 
      payload: option 
    });
  };

  // Handle form submission
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentInfo(prev => ({
      ...prev,
      method,
    }));
  };

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError(null);
    
    try {
      // Extraire le prénom et le nom du nom complet
      const { firstName, lastName } = getFirstAndLastName(deliveryInfo.fullName);
      
      // Préparer les données de commande
      const orderData = {
        customerInfo: {
          email: paymentInfo.email || `client_${deliveryInfo.phone.replace(/[^0-9]/g, '')}@akandaapero.com`,
          first_name: firstName,
          last_name: lastName,
          phone: deliveryInfo.phone
        },
        deliveryInfo: {
          address: deliveryInfo.address,
          district: deliveryInfo.district,
          additionalInfo: deliveryInfo.additionalInfo,
          location: deliveryInfo.location,
          deliveryOption: deliveryInfo.deliveryOption
        },
        paymentInfo: paymentInfo,
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl
        })),
        totalAmount: total,
        subtotal: subtotal,
        deliveryCost: deliveryFee,
        discount: discountAmount
      };
      
      // Créer la commande et enregistrer le client
      const { success, orderNumber: newOrderNumber, error } = await createOrder(orderData);
      
      if (success) {
        setOrderNumber(newOrderNumber);
        setOrderPlaced(true);
        setFormStep('confirmation');
        
        // Vider le panier après confirmation de la commande
        setTimeout(() => {
          clearCart();
        }, 2000);
        
        window.scrollTo(0, 0);
      } else {
        setOrderError(error?.message || 'Une erreur est survenue lors de la création de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la commande:', error);
      setOrderError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render cart summary
  const renderCartSummary = () => {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden sticky top-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Récapitulatif</h2>
              <p className="text-orange-100 text-xs">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Cart Items */}
          <div className="space-y-4 mt-6">
            {cartItems.map((item) => {
              const itemPrice = item.product.isPromo && item.product.discount 
                ? item.product.price * (1 - item.product.discount / 100) 
                : item.product.price;
              
              return (
                <div key={item.product.id} className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image 
                      src={item.product.imageUrl && item.product.imageUrl.trim() !== '' ? item.product.imageUrl : '/images/placeholder-product.svg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-product.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.product.name}</h4>
                    <div className="text-sm text-gray-500">
                      Quantité: {item.quantity}
                    </div>
                    {item.product.isPromo && item.product.discount && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 line-through mr-2">
                          {formatPriceLocal(item.product.price)}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          -{item.product.discount}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatPriceLocal(itemPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator />
          
          {/* Subtotal */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatPriceLocal(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPriceLocal(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span>{formatPriceLocal(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPriceLocal(total)}</span>
            </div>
          </div>
        
          <div className="text-xs text-gray-500 mt-2">
            Tous les prix incluent la TVA.
          </div>
        </div>
      </div>
    );
  };

  // Render delivery form
  const renderDeliveryForm = () => {
    return (
      <form onSubmit={handleDeliverySubmit}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Informations de livraison</h2>
                <p className="text-indigo-100 text-sm">Où souhaitez-vous être livré ?</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nom complet</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={deliveryInfo.fullName} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Votre nom complet" 
                  required 
                  className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={deliveryInfo.phone} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Ex: +241 07 12 34 56" 
                  required 
                  type="tel"
                  inputMode="tel"
                  className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Sélectionnez votre position sur la carte
              </Label>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-colors duration-200">
                <LocationMap 
                  onLocationSelect={handleLocationSelect}
                  initialAddress={deliveryInfo.address}
                />
              </div>
              
              {deliveryInfo.location.hasLocation && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-green-100 rounded-full">
                      <MapPin className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="font-semibold text-sm text-green-800">Position GPS confirmée</span>
                  </div>
                  <div className="text-xs text-green-700 font-mono bg-white/50 px-3 py-2 rounded-lg">
                    <div className="flex justify-between">
                      <span>Latitude:</span>
                      <span className="font-semibold">{typeof deliveryInfo.location.lat === 'number' ? deliveryInfo.location.lat.toFixed(6) : '0.000000'}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Longitude:</span>
                      <span className="font-semibold">{typeof deliveryInfo.location.lng === 'number' ? deliveryInfo.location.lng.toFixed(6) : '0.000000'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium text-gray-700">Quartier</Label>
              <Input 
                id="district" 
                name="district" 
                value={deliveryInfo.district || ''} 
                onChange={handleDeliveryInfoChange} 
                placeholder="Ex: Akanda, Glass, Nombakele..."
                className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">Informations supplémentaires (optionnel)</Label>
              <Textarea 
                id="additionalInfo" 
                name="additionalInfo" 
                value={deliveryInfo.additionalInfo} 
                onChange={handleDeliveryInfoChange} 
                placeholder="Instructions de livraison, points de repère, étage, code d'accès..." 
                className="min-h-[80px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors duration-200 resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />
                Option de livraison
              </Label>
              <RadioGroup value={deliveryInfo.deliveryOption} onValueChange={(value) => handleDeliveryOptionChange(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {deliveryOptions.map(option => (
                  <div key={option.id} className="relative">
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id} 
                      className="peer sr-only"
                    />
                    <Label 
                      htmlFor={option.id}
                      className="group flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm p-5 hover:border-indigo-300 hover:bg-indigo-50/50 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 [&:has([data-state=checked])]:border-indigo-500 [&:has([data-state=checked])]:bg-indigo-50 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    >
                      <div className="mb-3 text-3xl group-hover:scale-110 transition-transform duration-200">
                        {option.id === 'standard' ? '🚚' : option.id === 'night' ? '🌙' : '⚡️'}
                      </div>
                      <div className="font-semibold text-gray-900 text-center">{option.name}</div>
                      <div className="text-xs text-gray-600 mt-1 text-center leading-tight">{option.description}</div>
                      <div className="font-bold mt-3 text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-sm">
                        {formatPrice(option.price)} XAF
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Link href="/cart" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au panier
                </Button>
              </Link>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                Continuer vers le paiement
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  // Render payment form
  const renderPaymentForm = () => {
    return (
      <form onSubmit={handleSubmitOrder}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Méthode de paiement</h2>
                <p className="text-green-100 text-sm">Comment souhaitez-vous payer ?</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2 mb-6">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse e-mail (pour confirmation et suivi)</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={paymentInfo.email} 
                onChange={handlePaymentInfoChange} 
                placeholder="votre@email.com" 
                required 
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg transition-colors duration-200"
              />
              <p className="text-xs text-gray-500">Une adresse e-mail vous permettra de recevoir vos confirmations de commande</p>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                Choisissez votre méthode de paiement
              </Label>
              <RadioGroup 
                value={paymentInfo.method} 
                onValueChange={handlePaymentMethodChange}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`group flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${
                      paymentInfo.method === method.id 
                        ? 'border-green-500 bg-green-50 shadow-sm' 
                        : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-green-300 hover:bg-green-50/30'
                    }`}
                  >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={method.id} 
                      id={method.id}
                    />
                    <div>
                      <Label 
                        htmlFor={method.id} 
                        className="font-medium cursor-pointer"
                      >
                        {method.name}
                      </Label>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    {method.id === 'cash' && (
                      <Truck className="h-5 w-5 text-amber-500" />
                    )}
                    {method.id === 'mobile_money' && (
                      <div className="text-lg font-bold text-blue-500">M</div>
                    )}
                    {method.id === 'card' && (
                      <CreditCard className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
            
            {paymentInfo.method === 'mobile_money' && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    Numéro Mobile Money
                  </Label>
                  <Input 
                    id="mobileNumber" 
                    name="mobileNumber" 
                    value={paymentInfo.mobileNumber} 
                    onChange={handlePaymentInfoChange} 
                    placeholder="Ex: +241 07 12 34 56" 
                    required 
                    type="tel"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                  />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Paiement sécurisé</p>
                      <p className="text-xs leading-relaxed">Vous recevrez une notification sur votre téléphone pour confirmer le paiement via votre opérateur mobile.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {paymentInfo.method === 'card' && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Informations de carte bancaire</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">Numéro de carte</Label>
                      <Input 
                        id="cardNumber" 
                        name="cardNumber" 
                        value={paymentInfo.cardNumber} 
                        onChange={handlePaymentInfoChange} 
                        placeholder="1234 5678 9012 3456" 
                        required 
                        className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg transition-colors duration-200 font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">Nom sur la carte</Label>
                      <Input 
                        id="cardName" 
                        name="cardName" 
                        value={paymentInfo.cardName} 
                        onChange={handlePaymentInfoChange} 
                        placeholder="JEAN DUPONT" 
                        required 
                        className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg transition-colors duration-200 uppercase"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">Date d'expiration</Label>
                        <Input 
                          id="expiryDate" 
                          name="expiryDate" 
                          value={paymentInfo.expiryDate} 
                          onChange={handlePaymentInfoChange} 
                          placeholder="MM/AA" 
                          required 
                          className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg transition-colors duration-200 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">CVV</Label>
                        <Input 
                          id="cvv" 
                          name="cvv" 
                          value={paymentInfo.cvv} 
                          onChange={handlePaymentInfoChange} 
                          placeholder="123" 
                          required 
                          maxLength={4}
                          className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg transition-colors duration-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-yellow-100 rounded-full mt-0.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="text-xs text-yellow-700">
                        <p className="font-medium mb-1">Paiement sécurisé</p>
                        <p>Vos informations de carte sont chiffrées et sécurisées. Nous ne stockons aucune donnée bancaire.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setFormStep('delivery')}
                className="flex-1 border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la livraison
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Traitement...' : 'Finaliser la commande'}
                <CreditCard className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  // Render confirmation 
  const renderConfirmation = () => {
    return (
    <>
      <Header />
      {/* Arrière-plan moderne avec gradient animé */}
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-purple-100/20 to-pink-100/20" />
        
        <div className="relative z-10 py-4 sm:py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header avec bouton retour moderne */}
            <div className="mb-6 sm:mb-8">
              <Link 
                href="/cart" 
                className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Retour au panier
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Finaliser ma commande
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Quelques informations pour livrer votre commande
              </p>
            </div>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Commande confirmée</h2>
                <p className="text-gray-600 mb-4">
                  Merci pour votre commande ! Votre numéro de commande est :
                </p>
                <div className="bg-gray-100 p-3 rounded-md inline-block font-mono text-lg font-bold mb-6">
                  {orderNumber}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Nous vous avons envoyé un email de confirmation avec les détails de votre commande.
                  Vous pouvez suivre l'état de votre commande dans votre compte.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Retour à l'accueil
                    </Button>
                  </Link>
                  <Link href="/account/orders">
                    <Button className="w-full sm:w-auto">
                      Suivre ma commande
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    );
  };

  // Afficher un écran de chargement pendant l'authentification
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-purple-100/20 to-pink-100/20" />
          
          <div className="relative z-10 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Chargement...</h2>
              <p className="text-gray-600 text-sm">Vérification de votre authentification</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Arrière-plan moderne avec gradient animé */}
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-purple-100/20 to-pink-100/20" />
        
        <div className="relative z-10 py-4 sm:py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header avec bouton retour moderne */}
            <div className="mb-6 sm:mb-8">
              <Link 
                href="/cart" 
                className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Retour au panier
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Finaliser ma commande
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Quelques informations pour livrer votre commande
              </p>
            </div>
            
            {/* Si le panier est vide, afficher un message et un lien pour retourner aux produits */}
            {state.cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
                  <p className="text-gray-600 mb-6">Ajoutez des produits à votre panier pour continuer</p>
                  <Link href="/products">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105">
                      Découvrir nos produits
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                  {formStep === 'delivery' && renderDeliveryForm()}
                  {formStep === 'payment' && renderPaymentForm()}
                  {formStep === 'confirmation' && renderConfirmation()}
                </div>
                
                <div className="lg:w-[360px]">
                  {formStep !== 'confirmation' && renderCartSummary()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
