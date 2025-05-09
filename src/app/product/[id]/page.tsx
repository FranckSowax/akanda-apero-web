import { Suspense } from 'react';
import ProductClient from './product-client';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Produit ${params.id} | Akanda Apéro`,
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Chargement...</div>}>
      <ProductClient productId={params.id} />
    </Suspense>
  );
}
