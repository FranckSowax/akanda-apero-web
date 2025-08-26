'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Composant de chargement pour les pages admin
const AdminLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">Chargement du module admin...</p>
    </div>
  </div>
);

// Lazy loading des composants admin lourds
export const LazyDashboard = lazy(() => import('../../app/admin/page'));
export const LazyOrders = lazy(() => import('../../app/admin/orders/page'));
export const LazyProducts = lazy(() => import('../../app/admin/products/page'));
export const LazyCocktailKits = lazy(() => import('../../app/admin/cocktail-kits/page'));
export const LazyCustomers = lazy(() => import('../../app/admin/customers/page'));
export const LazyPromotions = lazy(() => import('../../app/admin/promotions/page'));
export const LazyBanners = lazy(() => import('../../app/admin/bannieres/page'));
export const LazyCategories = lazy(() => import('../../app/admin/categories/page'));
export const LazyDeliveries = lazy(() => import('../../app/admin/deliveries/page'));

// HOC pour wrapper les composants avec Suspense
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<AdminLoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Composants optimisés prêts à l'emploi
export const OptimizedDashboard = withLazyLoading(LazyDashboard);
export const OptimizedOrders = withLazyLoading(LazyOrders);
export const OptimizedProducts = withLazyLoading(LazyProducts);
export const OptimizedCocktailKits = withLazyLoading(LazyCocktailKits);
export const OptimizedCustomers = withLazyLoading(LazyCustomers);
export const OptimizedPromotions = withLazyLoading(LazyPromotions);
export const OptimizedBanners = withLazyLoading(LazyBanners);
export const OptimizedCategories = withLazyLoading(LazyCategories);
export const OptimizedDeliveries = withLazyLoading(LazyDeliveries);
