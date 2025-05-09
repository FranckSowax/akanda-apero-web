import "./global.css";
import { AppProvider } from "../context/AppContext";
import ToastNotification from "../components/ToastNotification";
import ReactQueryProvider from "../lib/react-query/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>
          <ReactQueryProvider>
            {children}
            <ToastNotification />
          </ReactQueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
