import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function toast({ title, description, action, variant = "default" }: ToastProps) {
  sonnerToast(title, {
    description,
    action,
    className: variant === "destructive" ? "bg-red-100 border-red-400" : "",
  });
}

// Ajout d'un hook useToast pour compatibilité
export const useToast = () => {
  return { toast };
};
