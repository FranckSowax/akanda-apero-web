import { Suspense } from 'react';
import ProductClient from './product-client';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Chargement...</div>}>
      <ProductClient productId={params.id} />
    </Suspense>
  );
}
