import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Définir ce fichier comme non-statique pour Next.js
export const runtime = 'edge';
export const revalidate = 0;

// Importer le composant client sans prérendu côté serveur
const LoginClient = dynamic(() => import('./login-client'), { ssr: false });

// Composant serveur qui rend le composant client
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-amber-600 font-semibold">Chargement...</p>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
