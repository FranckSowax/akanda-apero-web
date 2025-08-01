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
import { supabase } from '../../lib/supabase/client';
import { Header } from '../../components/layout/Header';
import { useEcommerceTracking, useComponentPerformance } from '../../components/MonitoringProvider';




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
  
  // 📊 Monitoring hooks - Temporairement désactivé pour le build Netlify
  // const { trackRemoveFromCart, trackBeginCheckout } = useEcommerceTracking();
  // useComponentPerformance('CartPage');
  
  // Hooks de monitoring désactivés temporairement
  const trackRemoveFromCart = (productId: string) => console.log('trackRemoveFromCart désactivé:', productId);
  const trackBeginCheckout = () => console.log('trackBeginCheckout désactivé');
  
  // Vérifier si l'utilisateur est connecté
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  
  // État local pour gérer le timeout d'authentification
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Debug de l'authentification et gestion du timeout
  useEffect(() => {
    console.log('🛍️ Cart - État auth:', { user, isLoggedIn, authLoading, authTimeout });
    
    // Si le chargement prend plus de 10 secondes, on considère qu'il y a un problème
    if (authLoading && !authTimeout) {
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Cart - Timeout d\'authentification détecté');
        setAuthTimeout(true);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Réinitialiser le timeout si le chargement se termine
    if (!authLoading && authTimeout) {
      setAuthTimeout(false);
    }
  }, [user, isLoggedIn, authLoading, authTimeout]);
  
  // Fonction de recuperation manuelle de l'authentification
  const handleManualAuthCheck = async () => {
    console.log('🔄 Cart - Verification manuelle de l\'authentification');
    try {
      // Forcer une nouvelle vérification de session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ Cart - Utilisateur trouvé manuellement:', session.user.email);
        // Rediriger vers checkout
        window.location.href = '/checkout';
      } else {
        console.log('❌ Cart - Aucun utilisateur trouvé, redirection vers auth');
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('❌ Cart - Erreur vérification manuelle:', error);
      window.location.href = '/auth';
    }
  };
  
  // État local pour le code promo
  const [promoCode, setPromoCode] = useState('');
  
  // Récupérer les éléments du panier depuis le contexte
  const cartItems = state.cart.items;
  
  // État local pour gérer le rendu côté client uniquement
  const [isClient, setIsClient] = useState(false);
  const [isNightDeliveryAvailable, setIsNightDeliveryAvailable] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Fonction pour vérifier si l'heure actuelle est après 22h30 (heure d'Afrique centrale)
    const checkNightDeliveryAvailability = () => {
      // Obtenir l'heure locale actuelle
      const now = new Date();
      
      // Heure en Afrique centrale (UTC+1)
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Vérifier si nous sommes après 22h30
      const isAfter2230 = (currentHour > 22) || (currentHour === 22 && currentMinute >= 30);
      setIsNightDeliveryAvailable(isAfter2230);
    };
    
    // Vérifier immédiatement
    checkNightDeliveryAvailability();
    
    // Vérifier toutes les minutes
    const intervalId = setInterval(checkNightDeliveryAvailability, 60000);
    
    // Nettoyer l'intervalle lors du démontage
    return () => clearInterval(intervalId);
  }, []);

  // Fonction pour changer la quantité d'un article
  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (item) {
      updateCartItemQuantity(productId, Math.max(1, item.quantity + delta));
    }
  };

  // Fonction pour supprimer un article
  const handleRemoveItem = (productId: string) => {
    // Trouver le produit avant de le supprimer pour le tracking
    const item = cartItems.find(item => item.product.id === productId);
    
    if (item) {
      // 📊 Tracker la suppression du panier
      trackRemoveFromCart(item.product.id);
    }
    
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

  // Rendu de base pour tous les cas
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
      {/* Affichage conditionnel du contenu après hydratation */}
      {isClient && (!cartItems || cartItems.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 min-h-[60vh]">
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
      ) : isClient && cartItems && cartItems.length > 0 ? (

        <>
          {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/category" className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuer les achats
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Articles ({getCartItemsCount()})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                const itemPrice = product.isPromo && product.discount 
                  ? product.price * (1 - product.discount / 100) 
                  : product.price;
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.product.id} className="bg-white rounded-lg p-3 md:p-4 border border-gray-100 shadow-sm">
                    {/* Mobile Layout - Image à gauche, infos à droite */}
                    <div className="block md:hidden">
                      <div className="flex items-start space-x-3">
                        {/* Image à gauche */}
                        <div className="flex-shrink-0">
                          <Link href={`/product/${item.product.id}`}>
                            <Image 
                              src={item.product.imageUrl && item.product.imageUrl.trim() !== '' ? item.product.imageUrl : '/images/placeholder-product.svg'} 
                              alt={item.product.name} 
                              width={80} 
                              height={80} 
                              className="rounded-lg object-cover shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-product.svg';
                              }}
                            />
                          </Link>
                        </div>
                        
                        {/* Titre et prix à droite */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product.id}`} className="hover:underline">
                            <h3 className="font-semibold text-base mb-2 line-clamp-2">{item.product.name}</h3>
                          </Link>
                          
                          {/* Prix */}
                          <div className="mb-3">
                            {item.product.isPromo && item.product.discount ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600 font-bold text-lg">
                                  {formatPrice(itemPrice, item.product.currency)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.product.price, item.product.currency)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-lg">
                                {formatPrice(item.product.price, item.product.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contrôles quantité et total */}
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2">
                          <button 
                            onClick={() => handleQuantityChange(item.product.id, -1)}
                            className="p-1 rounded-full text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.product.id, 1)}
                            className="p-1 rounded-full text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Total et suppression */}
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg text-orange-600">
                            {formatPrice(itemTotal, item.product.currency)}
                          </span>
                          <button 
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            aria-label="Supprimer l'article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Layout - Layout horizontal classique */}
                    <div className="hidden md:flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/product/${item.product.id}`}>
                          <Image 
                            src={item.product.imageUrl && item.product.imageUrl.trim() !== '' ? item.product.imageUrl : '/images/placeholder-product.svg'} 
                            alt={item.product.name} 
                            width={80} 
                            height={80} 
                            className="rounded-md object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder-product.svg';
                            }}
                          />
                        </Link>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-grow">
                        <Link href={`/product/${item.product.id}`} className="hover:underline">
                          <h3 className="font-medium">{item.product.name}</h3>
                        </Link>
                        
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
              {/* Promo Code */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Label htmlFor="promo-code" className="text-gray-700 font-medium">Code Promo</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input 
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code"
                    className="flex-grow bg-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    disabled={!promoCode}
                    className="w-full sm:w-auto bg-white hover:bg-gray-100"
                  >
                    Appliquer
                  </Button>
                </div>
                {promoApplied && (
                  <div className="text-green-600 text-sm flex flex-wrap items-center mt-2 p-2 bg-green-50 rounded-md border border-green-100">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 mr-2 mb-1 sm:mb-0">
                      -{state.cart.promoDiscount}%
                    </Badge>
                    Code promo appliqué avec succès
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Delivery Note */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Options de livraison</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Vous pourrez choisir votre mode de livraison à l'étape suivante
                </p>
              </div>
              
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
            <CardFooter className="md:block hidden"> {/* Uniquement sur desktop */}
              {(authLoading && !authTimeout) ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Chargement...
                </Button>
              ) : authTimeout ? (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  size="lg"
                  onClick={handleManualAuthCheck}
                >
                  🔄 Reessayer la connexion
                </Button>
              ) : (
                <Link 
                  href={isLoggedIn ? "/checkout" : "/auth"} 
                  className="w-full"
                  onClick={() => {
                    console.log('🔗 Cart - Navigation vers:', isLoggedIn ? '/checkout' : '/auth');
                    // Sauvegarder le panier dans localStorage avant redirection vers /auth
                    if (!isLoggedIn) {
                      localStorage.setItem('cart_before_auth', JSON.stringify({
                        items: cartItems,
                        timestamp: Date.now()
                      }));
                    }
                  }}
                >
                  <Button 
                    className={`w-full ${!isLoggedIn ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200' : ''}`} 
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isLoggedIn ? "Procéder au paiement" : "Se connecter pour commander"}
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
          {/* Mobile Sticky Checkout Button - en dehors de la grille pour éviter les doublons */}
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-sm border-t shadow-lg md:hidden z-50 flex justify-center">
            <div className="w-full max-w-md flex items-center justify-between">
              <div className="mr-3">
                <p className="font-semibold text-lg">{formatPrice(total)}</p>
                <p className="text-xs text-gray-500">Total TTC</p>
              </div>
              {(authLoading && !authTimeout) ? (
                <Button 
                  className="flex-1" 
                  size="lg"
                  disabled
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Chargement...
                </Button>
              ) : authTimeout ? (
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
                  size="lg"
                  onClick={handleManualAuthCheck}
                >
                  🔄 Reessayer
                </Button>
              ) : (
                <Link 
                  href={isLoggedIn ? "/checkout" : "/auth"} 
                  className="flex-1"
                  onClick={() => {
                    console.log('🔗 Cart Mobile - Navigation vers:', isLoggedIn ? '/checkout' : '/auth');
                    // Sauvegarder le panier dans localStorage avant redirection vers /auth
                    if (!isLoggedIn) {
                      localStorage.setItem('cart_before_auth', JSON.stringify({
                        items: cartItems,
                        timestamp: Date.now()
                      }));
                    }
                  }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isLoggedIn ? "Procéder au paiement" : "Se connecter"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Ajouter un espace en bas pour éviter que le contenu soit caché par le bouton fixe sur mobile */}
          <div className="h-24 md:h-0"></div>
        </>
      ) : (
        <div className="flex items-center justify-center py-16 min-h-[60vh]">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-4 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-64 mb-6 mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded w-40 mx-auto"></div>
          </div>
        </div>
      )}
    </div>

    </>
  );
}
