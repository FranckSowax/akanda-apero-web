import ProductClient from './product-client';

// Version statique sans typage pour éviter les problèmes sur Netlify
export default function ProductPage({ params }: any) {
  const productId = params?.id || '';
  return <ProductClient productId={productId} />;
}
