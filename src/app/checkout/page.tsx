'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Truck, MapPin, Check } from 'lucide-react';
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
  
  // Récupérer les fonctions du hook useOrders
  const { createOrder, loading: orderLoading } = useOrders();

  // Rediriger vers la page panier si le panier est vide
  useEffect(() => {
    if (state.cart.items.length === 0) {
      router.push('/cart');
    }
  }, [state.cart.items, router]);

  // Form state
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: 'Libreville, Gabon',
    city: 'Libreville',
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

  // Handle location selection
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setDeliveryInfo(prev => ({
      ...prev,
      address: location.address,
      location: {
        lat: location.lat,
        lng: location.lng,
        hasLocation: true,
      },
    }));
  };

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
          city: deliveryInfo.city,
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
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
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
        </CardContent>
      </Card>
    );
  };

  // Render delivery form
  const renderDeliveryForm = () => {
    return (
      <form onSubmit={handleDeliverySubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={deliveryInfo.fullName} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Votre nom complet" 
                  required 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={deliveryInfo.phone} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Ex: 077123456" 
                  required 
                  type="tel"
                  inputMode="tel"
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sélectionnez votre position sur la carte</Label>
              <LocationMap 
                onLocationSelect={handleLocationSelect}
                initialAddress={deliveryInfo.address}
              />
              
              {deliveryInfo.location.hasLocation && (
                <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-3 rounded">
                  <div className="font-semibold text-sm mb-1">Position GPS enregistrée</div>
                  <div>
                    Lat: {typeof deliveryInfo.location.lat === 'number' ? deliveryInfo.location.lat.toFixed(6) : '0.000000'}, 
                    Lng: {typeof deliveryInfo.location.lng === 'number' ? deliveryInfo.location.lng.toFixed(6) : '0.000000'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={deliveryInfo.city} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Votre ville"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quartier</Label>
                <Input 
                  id="additionalInfo" 
                  name="additionalInfo" 
                  value={deliveryInfo.additionalInfo || ''} 
                  onChange={handleDeliveryInfoChange} 
                  placeholder="Informations additionnelles"
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Informations supplémentaires (optionnel)</Label>
              <Textarea 
                id="additionalInfo" 
                name="additionalInfo" 
                value={deliveryInfo.additionalInfo} 
                onChange={handleDeliveryInfoChange} 
                placeholder="Instructions de livraison, points de repère, etc." 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Option de livraison</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deliveryOptions.map(option => (
                  <div key={option.id} className="relative">
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id} 
                      className="peer sr-only"
                      checked={deliveryInfo.deliveryOption === option.id}
                      onChange={() => handleDeliveryOptionChange(option.id)}
                    />
                    <Label 
                      htmlFor={option.id}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer touch-manipulation"
                    >
                      <div className="mb-3 text-2xl">
                        {option.id === 'standard' ? '🚚' : '⚡️'}
                      </div>
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                      <div className="font-semibold mt-2">{formatPrice(option.price)} XAF</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Link href="/cart">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au panier
                </Button>
              </Link>
              <Button type="submit">
                Continuer vers le paiement
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    );
  };

  // Render payment form
  const renderPaymentForm = () => {
    return (
      <form onSubmit={handleSubmitOrder}>
        <Card>
          <CardHeader>
            <CardTitle>Méthode de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 mb-4">
              <Label htmlFor="email">Adresse e-mail (pour confirmation et suivi)</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={paymentInfo.email} 
                onChange={handlePaymentInfoChange} 
                placeholder="exemple@email.com" 
                className="h-11"
              />
              <p className="text-xs text-gray-500">Une adresse e-mail vous permettra de recevoir vos confirmations de commande</p>
            </div>
            
            <RadioGroup 
              value={paymentInfo.method} 
              onValueChange={handlePaymentMethodChange}
              className="space-y-3"
            >
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`flex items-center justify-between p-3 border rounded-md ${
                    paymentInfo.method === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
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
            
            {paymentInfo.method === 'mobile_money' && (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Numéro Mobile Money</Label>
                  <Input 
                    id="mobileNumber" 
                    name="mobileNumber" 
                    value={paymentInfo.mobileNumber} 
                    onChange={handlePaymentInfoChange} 
                    placeholder="Ex: 077123456" 
                    required 
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                  Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
                </div>
              </div>
            )}
            
            {paymentInfo.method === 'card' && (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input 
                    id="cardNumber" 
                    name="cardNumber" 
                    value={paymentInfo.cardNumber} 
                    onChange={handlePaymentInfoChange} 
                    placeholder="1234 5678 9012 3456" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nom sur la carte</Label>
                    <Input 
                      id="cardName" 
                      name="cardName" 
                      value={paymentInfo.cardName} 
                      onChange={handlePaymentInfoChange} 
                      placeholder="JEAN DUPONT" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Date d'expiration</Label>
                      <Input 
                        id="expiryDate" 
                        name="expiryDate" 
                        value={paymentInfo.expiryDate} 
                        onChange={handlePaymentInfoChange} 
                        placeholder="MM/AA" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        name="cvv" 
                        value={paymentInfo.cvv} 
                        onChange={handlePaymentInfoChange} 
                        placeholder="123" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormStep('delivery')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la livraison
              </Button>
              <Button type="submit">
                Finaliser la commande
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    );
  };

  // Render confirmation 
  const renderConfirmation = () => {
    return (
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
    );
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">Passer une commande</h1>
      
      {/* Si le panier est vide, afficher un message et un lien pour retourner aux produits */}
      {state.cart.items.length === 0 ? (
        <div className="text-center">
          <p>Votre panier est vide.</p>
          <Link href="/">
            <Button variant="outline">
              Retourner aux produits
            </Button>
          </Link>
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
  );
}
