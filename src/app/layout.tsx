import "./global.css";
import { AppProvider } from "../context/AppContext";
import { CartModalProvider } from "../context/CartModalContext";
import { AuthProvider } from "../contexts/AuthContext";
// import { MonitoringProvider } from "../components/MonitoringProvider"; // Temporairement désactivé pour éviter ChunkLoadError
import ToastNotification from "../components/ToastNotification";
import ReactQueryProvider from "../lib/react-query/provider";
import { Metadata, Viewport } from "next";
import { Suspense } from "react";

// Ajout de styles globaux pour la compatibilité mobile dans le fichier CSS global
import "./mobile-optimizations.css";

// Définition des métadonnées principales
export const metadata: Metadata = {
  title: "Akanda Apéro - Votre boutique de cocktails",
  description: "Découvrez notre gamme de kits cocktails et accessoires pour vos apéros",
};

// Définition séparée des paramètres de viewport selon les nouvelles normes Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5a623",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Méta-tags pour améliorer l'expérience mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {/* MonitoringProvider temporairement désactivé pour éviter les erreurs */}
          {/* <MonitoringProvider> */}
            <AppProvider>
              <CartModalProvider>
                <ReactQueryProvider>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div></div>}>
                    <div className="touch-manipulation">
                      {children}
                    </div>
                  </Suspense>
                  <ToastNotification />
                </ReactQueryProvider>
              </CartModalProvider>
            </AppProvider>
          {/* </MonitoringProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}
