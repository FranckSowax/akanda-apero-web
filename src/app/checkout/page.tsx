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

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getCartTotal, clearCart } = useAppContext();
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);
  
  // Rediriger vers la page panier si le panier est vide
  useEffect(() => {
    if (state.cart.items.length === 0) {
      router.push('/cart');
    } else {
      // Convertir les articles du panier au format attendu par cette page
      const formattedItems = state.cart.items.map(item => ({
        id: Number(item.product.id),
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl || 'https://picsum.photos/seed/product/100/100',
        isPromo: item.product.discount ? true : false,
        discount: item.product.discount
      }));
      setCartItems(formattedItems);
    }
  }, [state.cart.items, router]);

  // Form state
  const [formStep, setFormStep] = useState<'delivery' | 'payment' | 'confirmation'>('delivery');
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Libreville',
    additionalInfo: '',
    deliveryOption: 'standard', // Valeur par défaut
    location: {
      lat: 0,
      lng: 0,
      hasLocation: false
    }
  });

  // Vérifier l'heure actuelle pour les options de livraison
  const [currentHour, setCurrentHour] = useState<number>(0);
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);

  // Mettre à jour l'heure actuelle
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      // UTC+1 pour l'Afrique centrale
      const centralAfricaHour = now.getUTCHours() + 1;
      const hour = centralAfricaHour > 24 ? centralAfricaHour - 24 : centralAfricaHour;
      const minute = now.getMinutes();
      
      setCurrentHour(hour);
      setCurrentMinute(minute);
      
      // Vérifier si c'est le mode nuit (après 22h30)
      const isNight = hour >= 22 && minute >= 30 || hour >= 23 || hour < 6;
      setIsNightTime(isNight);
    };
    
    updateCurrentTime();
    
    // Actualiser l'heure chaque minute
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Ajuster l'option de livraison automatiquement en fonction de l'heure
  useEffect(() => {
    if (formStep !== 'delivery') return; // Ne pas changer l'option si on n'est pas sur l'étape de livraison
    
    // Vérifier si l'option de livraison actuelle est valide avec l'heure actuelle
    const isNightOption = deliveryInfo.deliveryOption === 'night';
    const isInvalid = (isNightTime && !isNightOption) || (!isNightTime && isNightOption);
    
    if (isInvalid) {
      // Choisir l'option appropriée en fonction de l'heure
      const appropriateOption = isNightTime ? 'night' : 'standard';
      setDeliveryInfo(prev => ({ ...prev, deliveryOption: appropriateOption }));
      
      // Notifier l'utilisateur du changement
      alert(`L'option de livraison a été automatiquement mise à jour en fonction de l'heure.\n\n${isNightTime ? 'Livraison de nuit sélectionnée (après 22h30).' : 'Livraison standard sélectionnée (avant 22h30).'}`);
    }
  }, [isNightTime, deliveryInfo.deliveryOption, formStep]);
  const [paymentInfo, setPaymentInfo] = useState({
    method: paymentMethods[0].id,
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    mobileNumber: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Cart summary calculations from context
  const { subtotal, discount: discountAmount, deliveryCost: deliveryFee, total } = getCartTotal();
  // Ajuster le coût de livraison en fonction de l'option sélectionnée
  const selectedDeliveryFee = deliveryInfo.deliveryOption === 'standard' ? deliveryFee : deliveryOptions.find(opt => opt.id === deliveryInfo.deliveryOption)?.price || 0;

  // Format price
  const formatPrice = (price: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle form submission
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('payment');
    window.scrollTo(0, 0);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the order to the backend
    setOrderNumber(`AK${Math.floor(100000 + Math.random() * 900000)}`);
    setOrderPlaced(true);
    setFormStep('confirmation');
    
    // Vider le panier après confirmation de la commande
    setTimeout(() => {
      clearCart();
    }, 2000);
    
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitOrder(e);
  };

  // Handle input changes
  const handleDeliveryInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle location selection from map
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setDeliveryInfo(prev => ({
      ...prev,
      address: location.address,
      location: {
        lat: location.lat,
        lng: location.lng,
        hasLocation: true
      }
    }));
  };

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  // Render order summary
  const renderOrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-4 mt-6">
          {cartItems.map((item) => {
            const itemPrice = item.isPromo && item.discount 
              ? item.price * (1 - item.discount / 100) 
              : item.price;
            const itemTotal = itemPrice * item.quantity;
            
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium text-sm">
                  {formatPrice(itemTotal, item.currency)}
                </span>
              </div>
            );
          })}
        </div>
        
        <Separator />
        
        {/* Subtotal */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frais de livraison</span>
            <span>{formatPrice(selectedDeliveryFee || deliveryFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(total + (selectedDeliveryFee - deliveryFee))}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Tous les prix incluent la TVA.
        </div>
      </CardContent>
    </Card>
  );

  // Render delivery form
  const renderDeliveryForm = () => (
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
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse de livraison</Label>
            <Input 
              id="address" 
              name="address" 
              value={deliveryInfo.address} 
              onChange={handleDeliveryInfoChange} 
              placeholder="Votre adresse complète" 
              required 
            />
          </div>
          
          <div className="space-y-3 mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
            <LocationMap 
              onLocationSelect={handleLocationSelect}
              initialAddress={deliveryInfo.address}
            />
            
            {deliveryInfo.location.hasLocation && (
              <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-2 rounded">
                <div className="font-semibold">Position GPS enregistrée</div>
                <div>Lat: {deliveryInfo.location.lat.toFixed(6)}, Lng: {deliveryInfo.location.lng.toFixed(6)}</div>
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
                disabled 
              />
              <p className="text-xs text-gray-500">Actuellement, nous livrons uniquement à Libreville</p>
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
          </div>
          
          <div className="space-y-3 mt-4">
            <Label>Option de livraison</Label>
            <RadioGroup 
              value={deliveryInfo.deliveryOption} 
              onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, deliveryOption: value }))}
            >
              {deliveryOptions.map((option) => {
                // Déterminer si l'option est disponible en fonction de l'heure
                const isNightOption = option.id === 'night';
                const isDisabled = (isNightTime && !isNightOption) || (!isNightTime && isNightOption);
                
                return (
                  <div 
                    key={option.id}
                    className={`flex items-center justify-between p-3 border rounded-md ${
                      deliveryInfo.deliveryOption === option.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    } ${
                      isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id} 
                        disabled={isDisabled} 
                      />
                      <div>
                        <Label 
                          htmlFor={option.id} 
                          className={`font-medium ${isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'}`}
                        >
                          {option.name}
                          {isDisabled && isNightOption && (
                            <span className="ml-2 text-xs text-yellow-600 font-normal">Disponible après 22h30</span>
                          )}
                          {isDisabled && !isNightOption && (
                            <span className="ml-2 text-xs text-yellow-600 font-normal">Indisponible après 22h30</span>
                          )}
                        </Label>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <span className={`font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                      {formatPrice(option.price)}
                    </span>
                  </div>
                );
              })}
            </RadioGroup>
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

  // Render payment form
  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Méthode de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={paymentInfo.method} 
            onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, method: value }))}
            className="space-y-3"
          >
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                className={`flex items-center p-3 border rounded-md ${
                  paymentInfo.method === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="ml-3">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          {paymentInfo.method === 'card' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input 
                  id="cardNumber" 
                  name="cardNumber" 
                  value={paymentInfo.cardNumber} 
                  onChange={handlePaymentInfoChange} 
                  placeholder="1234 5678 9012 3456" 
                  required={paymentInfo.method === 'card'} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Date d'expiration</Label>
                  <Input 
                    id="cardExpiry" 
                    name="cardExpiry" 
                    value={paymentInfo.cardExpiry} 
                    onChange={handlePaymentInfoChange} 
                    placeholder="MM/AA" 
                    required={paymentInfo.method === 'card'} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input 
                    id="cardCvc" 
                    name="cardCvc" 
                    value={paymentInfo.cardCvc} 
                    onChange={handlePaymentInfoChange} 
                    placeholder="123" 
                    required={paymentInfo.method === 'card'} 
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentInfo.method === 'mobile_money' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Numéro de téléphone</Label>
                <Input 
                  id="mobileNumber" 
                  name="mobileNumber" 
                  value={paymentInfo.mobileNumber} 
                  onChange={handlePaymentInfoChange} 
                  placeholder="077123456" 
                  required={paymentInfo.method === 'mobile_money'} 
                />
                <p className="text-xs text-gray-500">
                  Vous recevrez une notification sur ce numéro pour confirmer le paiement.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setFormStep('delivery')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la livraison
            </Button>
            <Button type="submit">
              <CreditCard className="mr-2 h-4 w-4" />
              Payer {formatPrice(total)}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );

  // Render confirmation
  const renderConfirmation = () => (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
        <p className="text-gray-600 mb-4">
          Merci pour votre commande. Votre numéro de commande est :
        </p>
        <div className="bg-gray-100 py-2 px-4 rounded-md inline-block font-mono font-bold text-lg mb-6">
          {orderNumber}
        </div>
        
        <div className="space-y-4 text-left mb-6">
          <div className="border rounded-md p-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Adresse de livraison</h3>
                <p className="text-gray-600">{deliveryInfo.fullName}</p>
                <p className="text-gray-600">{deliveryInfo.address}</p>
                <p className="text-gray-600">{deliveryInfo.city}</p>
                <p className="text-gray-600">{deliveryInfo.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Méthode de livraison</h3>
                <p className="text-gray-600">
                  {deliveryOptions.find(option => option.id === deliveryInfo.deliveryOption)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {deliveryOptions.find(option => option.id === deliveryInfo.deliveryOption)?.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex items-start">
              <CreditCard className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Méthode de paiement</h3>
                <p className="text-gray-600">
                  {paymentMethods.find(method => method.id === paymentInfo.method)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Vous recevrez un SMS de confirmation avec les détails de votre commande.
          Vous pouvez suivre l'état de votre commande en utilisant votre numéro de commande.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/">
          <Button>
            Retour à l'accueil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {!orderPlaced && (
        <div className="mb-6">
          <Link href={formStep === 'delivery' ? '/cart' : '/checkout'} className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {formStep === 'delivery' ? 'Retour au panier' : 'Retour à la livraison'}
          </Link>
        </div>
      )}
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">
        {formStep === 'delivery' && 'Finaliser votre commande'}
        {formStep === 'payment' && 'Paiement'}
        {formStep === 'confirmation' && 'Confirmation de commande'}
      </h1>
      
      {/* Progress Steps */}
      {!orderPlaced && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                formStep === 'delivery' ? 'bg-primary text-white' : 'bg-primary text-white'
              }`}>
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Livraison</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              formStep === 'delivery' ? 'bg-gray-200' : 'bg-primary'
            }`} />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                formStep === 'payment' || formStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Paiement</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              formStep === 'confirmation' ? 'bg-primary' : 'bg-gray-200'
            }`} />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                formStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <Check className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Confirmation</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {formStep === 'delivery' && renderDeliveryForm()}
          {formStep === 'payment' && renderPaymentForm()}
          {formStep === 'confirmation' && renderConfirmation()}
        </div>
        
        {/* Order Summary */}
        {!orderPlaced && (
          <div>
            {renderOrderSummary()}
          </div>
        )}
      </div>
    </div>
  );
}
