import LoginWrapper from './login-wrapper';

// Définir ce fichier comme non-statique pour Next.js
export const dynamic = 'force-dynamic';

// Page serveur simple qui rend uniquement le wrapper client
export default function LoginPage() {
  return <LoginWrapper />;
}
