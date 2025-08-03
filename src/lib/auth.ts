import { agentStorage } from './storage';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'viewer';
  fullName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthService {
  private storageKey = 'dg-visit-hub-auth';

  getStoredAuth(): AuthState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          user: parsed.user,
          isAuthenticated: !!parsed.user
        };
      }
    } catch (error) {
      console.error('Error reading auth state:', error);
    }
    
    return {
      user: null,
      isAuthenticated: false
    };
  }

  setStoredAuth(authState: AuthState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(authState));
  }

  clearStoredAuth(): void {
    localStorage.removeItem(this.storageKey);
  }

  login(username: string, password: string): { success: boolean; user?: User; error?: string } {
    // Rechercher l'agent dans le stockage
    const agent = agentStorage.findByUsername(username);
    
    if (!agent) {
      return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }

    if (!agent.isActive) {
      return { success: false, error: 'Compte désactivé' };
    }

    // Pour la démonstration, utilisons un mot de passe par défaut
    // En production, vous devriez utiliser un système de hachage sécurisé
    const defaultPassword = agent.role === 'admin' ? 'admin123' : 'user123';
    
    if (password !== defaultPassword) {
      return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }

    const user: User = {
      id: agent.id,
      username: agent.username,
      role: agent.role,
      fullName: agent.fullName
    };

    const authState: AuthState = {
      user,
      isAuthenticated: true
    };

    this.setStoredAuth(authState);
    
    // Mettre à jour la dernière connexion
    agentStorage.updateLastLogin(agent.id);

    return { success: true, user };
  }

  logout(): void {
    this.clearStoredAuth();
  }
}

export const authService = new AuthService();