import "./global.css";
import { AppProvider } from "../context/AppContext";
import ToastNotification from "../components/ToastNotification";
import ReactQueryProvider from "../lib/react-query/provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akanda Apéro - Votre boutique de cocktails",
  description: "Découvrez notre gamme de kits cocktails et accessoires pour vos apéros",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#f5a623",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Méta-tags pour améliorer l'expérience mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Correction du délai tactile sur iOS */}
        <style jsx global>{`
          * { -webkit-tap-highlight-color: rgba(0,0,0,0); }
          button, a { touch-action: manipulation; }
          input, button, a { -webkit-touch-callout: none; }
        `}</style>
      </head>
      <body>
        <AppProvider>
          <ReactQueryProvider>
            <div className="touch-manipulation">
              {children}
            </div>
            <ToastNotification />
          </ReactQueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
