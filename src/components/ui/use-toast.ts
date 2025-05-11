// Cette implémentation imite les fonctionnalités de la bibliothèque sonner
// pour résoudre les problèmes de build Netlify

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Fonction de base pour afficher une notification
const baseToast = (title?: string, options?: any) => {
  // En environnement de production, cette fonction serait remplacée par une bibliothèque réelle
  console.log(`Toast: ${title}`, options);
};

// Création d'une API compatible avec sonner
export const toast = Object.assign(
  // Fonction de base
  ({ title, description, action, variant = "default" }: ToastProps) => {
    baseToast(title, {
      description,
      action,
      className: variant === "destructive" ? "bg-red-100 border-red-400" : "",
    });
  },
  // Méthodes supplémentaires utilisées dans le projet
  {
    success: (title: string, options?: any) => {
      baseToast(title, { ...options, variant: "success" });
    },
    error: (title: string, options?: any) => {
      baseToast(title, { ...options, variant: "destructive" });
    },
    loading: (title: string, options?: any) => {
      const id = Math.random().toString(36).substring(2, 9);
      baseToast(title, { ...options, variant: "loading", id });
      return id;
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        console.log(`Dismissing toast: ${toastId}`);
      } else {
        console.log("Dismissing all toasts");
      }
    },
  }
);

// Hook pour la compatibilité avec les autres composants
export const useToast = () => {
  return { toast };
};
