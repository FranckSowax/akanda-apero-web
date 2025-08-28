'use client';

import { ChauffeurAuthProvider } from '../../contexts/ChauffeurAuthContext';

export default function ChauffeurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChauffeurAuthProvider>
      {children}
    </ChauffeurAuthProvider>
  );
}
