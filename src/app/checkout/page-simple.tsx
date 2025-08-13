'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, ShoppingBag, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { normalizeGabonPhone, isValidGabonPhone } from '../../utils/phoneUtils';

// Utiliser des composants simples au lieu des imports UI
const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' 
        ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
        : 'bg-indigo-600 text-white hover:bg-indigo-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ id, name, value, onChange, placeholder, type = 'text', required }: any) => (
  <input
    id={id}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
);

const Textarea = ({ id, name, value, onChange, placeholder, rows = 3 }: any) => (
  <textarea
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
);

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

// Delivery options
const deliveryOptions = [
  { id: 'pickup', name: 'Retrait au Shop', price: 0, description: 'Retirez sur place - Gratuit' },
  { id: 'standard', name: 'Livraison Standard', price: 2000, description: 'Livraison en moins de 45 min' },
  { id: 'express', name: 'Livraison Express', price: 3500, description: 'Livraison en moins de 25 min' },
];

export default function CheckoutPage() {
  const router = useRouter();
  
  // État du panier simplifié
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  
  // Calculer le total du panier
  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryOptions.find(opt => opt.id === deliveryOption)?.price || 0;
  const finalTotal = cartTotal + deliveryFee;
  
  // Form state
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    mobileNumber: '',
    whatsapp: '',
    paymentMethod: 'orange-money',
    notes: '',
  });
  
  const [formStep, setFormStep] = useState<'delivery' | 'payment' | 'confirmation'>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Format price function
  const formatPriceLocal = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Handle form changes
  const handleDeliveryInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setFormStep('payment');
    }
  };
  
  const validateForm = () => {
    const errors = [];
    
    if (formStep === 'delivery') {
      if (!deliveryInfo.fullName.trim()) errors.push('Nom complet requis');
      if (!deliveryInfo.phone.trim()) {
        errors.push('Numéro de téléphone requis');
      } else {
        // Valider le format du numéro de téléphone gabonais
        const phoneValidation = normalizeGabonPhone(deliveryInfo.phone);
        if (!phoneValidation.isValid) {
          errors.push(`Téléphone invalide: ${phoneValidation.error}`);
        }
      }
      if (deliveryOption !== 'pickup' && !deliveryInfo.address.trim()) {
        errors.push('Adresse de livraison requise');
      }
    } else if (formStep === 'payment') {
      if (!paymentInfo.mobileNumber.trim()) {
        errors.push('Numéro mobile requis');
      } else {
        // Valider le format du numéro mobile gabonais
        const mobileValidation = normalizeGabonPhone(paymentInfo.mobileNumber);
        if (!mobileValidation.isValid) {
          errors.push(`Mobile invalide: ${mobileValidation.error}`);
        }
      }
      if (!paymentInfo.whatsapp.trim()) {
        errors.push('Numéro WhatsApp requis');
      } else {
        // Valider le format du numéro WhatsApp gabonais
        const whatsappValidation = normalizeGabonPhone(paymentInfo.whatsapp);
        if (!whatsappValidation.isValid) {
          errors.push(`WhatsApp invalide: ${whatsappValidation.error}`);
        }
      }
    }
    
    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
      return false;
    }
    
    return true;
  };
  
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setSubmitError(null);
    
    try {
      // Simulation de la création de commande
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirection vers la confirmation
      setFormStep('confirmation');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error) {
      setSubmitError('Erreur lors de la création de la commande');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render cart summary
  const renderCartSummary = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5" />
        Résumé de votre commande
      </h3>
      
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                width={48}
                height={48}
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.product.name}</h4>
              <p className="text-xs text-gray-600">
                {item.quantity} × {formatPriceLocal(item.product.price)}
              </p>
            </div>
            <div className="text-sm font-medium">
              {formatPriceLocal(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
        
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPriceLocal(cartTotal)}</span>
          </div>
          
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatPriceLocal(deliveryFee)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPriceLocal(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render delivery form
  const renderDeliveryForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Informations de livraison
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Option de livraison</label>
            <div className="grid grid-cols-1 gap-2">
              {deliveryOptions.map((option) => (
                <label key={option.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value={option.id}
                    checked={deliveryOption === option.id}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                    <div className="text-sm font-semibold">
                      {option.price === 0 ? 'Gratuit' : formatPriceLocal(option.price)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <Input
              name="fullName"
              value={deliveryInfo.fullName}
              onChange={handleDeliveryInfoChange}
              placeholder="Votre nom complet"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
            <Input
              name="phone"
              type="tel"
              value={deliveryInfo.phone}
              onChange={handleDeliveryInfoChange}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
          
          {deliveryOption !== 'pickup' && (
            <div>
              <label className="block text-sm font-medium mb-1">Adresse de livraison</label>
              <Textarea
                name="address"
                value={deliveryInfo.address}
                onChange={handleDeliveryInfoChange}
                placeholder="Votre adresse complète"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
            <Textarea
              name="notes"
              value={deliveryInfo.notes}
              onChange={handleDeliveryInfoChange}
              placeholder="Des instructions spéciales ?"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/shop')}
          >
            Continuer mes achats
          </Button>
          
          <Button onClick={handleDeliverySubmit}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render payment form
  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Informations de paiement
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Méthode de paiement</label>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="orange-money"
                  checked={paymentInfo.paymentMethod === 'orange-money'}
                  onChange={(e) => handlePaymentInfoChange(e)}
                  className="mr-3"
                />
                <span>Orange Money</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mtn-money"
                  checked={paymentInfo.paymentMethod === 'mtn-money'}
                  onChange={(e) => handlePaymentInfoChange(e)}
                  className="mr-3"
                />
                <span>MTN Money</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Numéro mobile pour le paiement</label>
            <Input
              name="mobileNumber"
              type="tel"
              value={paymentInfo.mobileNumber}
              onChange={handlePaymentInfoChange}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Numéro WhatsApp pour les notifications</label>
            <Input
              name="whatsapp"
              type="tel"
              value={paymentInfo.whatsapp}
              onChange={handlePaymentInfoChange}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes de paiement (optionnel)</label>
            <Textarea
              name="notes"
              value={paymentInfo.notes}
              onChange={handlePaymentInfoChange}
              placeholder="Des instructions pour le paiement ?"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setFormStep('delivery')}
          >
            Retour
          </Button>
          
          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement...' : 'Finaliser la commande'}
          </Button>
        </div>
        
        {submitError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render confirmation
  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Commande confirmée !
        </h2>
        <p className="text-gray-600 mb-4">
          Votre commande a été reçue et sera traitée sous peu.
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Vous allez être redirigé vers la page d'accueil...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {formStep === 'delivery' && renderDeliveryForm()}
            {formStep === 'payment' && renderPaymentForm()}
            {formStep === 'confirmation' && renderConfirmation()}
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {renderCartSummary()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
