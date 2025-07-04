'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Utiliser dynamic côté client est autorisé
const LoginClient = dynamic(() => import('./login-client'), { ssr: false });

export default function LoginWrapper() {
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
