import { api } from '../lib/api-utils';
import { User, ApiResponse } from '../lib/types';

// Service pour la gestion de l'authentification
const AuthService = {
  // Connecter un utilisateur
  login: (email: string, password: string) => {
    return api.post<{ user: User; token: string }>('/auth/login', { email, password });
  },

  // Déconnecter un utilisateur
  logout: () => {
    return api.post<{ success: boolean }>('/auth/logout', {});
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: () => {
    return api.get<User>('/auth/me');
  },

  // Récupérer tous les utilisateurs (admin seulement)
  getUsers: () => {
    return api.get<User[]>('/auth/users');
  },

  // Créer un nouvel utilisateur (admin seulement)
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => {
    return api.post<User>('/auth/users', user);
  },

  // Mettre à jour un utilisateur
  updateUser: (id: number, user: Partial<User>) => {
    return api.put<User>(`/auth/users/${id}`, user);
  },

  // Modifier le mot de passe
  changePassword: (currentPassword: string, newPassword: string) => {
    return api.post<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Demander la réinitialisation du mot de passe
  requestPasswordReset: (email: string) => {
    return api.post<{ success: boolean }>('/auth/request-reset', { email });
  },

  // Réinitialiser le mot de passe
  resetPassword: (token: string, newPassword: string) => {
    return api.post<{ success: boolean }>('/auth/reset-password', {
      token,
      newPassword
    });
  }
};

export default AuthService;
