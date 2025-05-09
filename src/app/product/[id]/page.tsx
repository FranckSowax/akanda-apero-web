import { Suspense } from 'react';
import ProductClient from './product-client';

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function ProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Chargement...</div>}>
      <ProductClient productId={params.id} />
    </Suspense>
  );
}
