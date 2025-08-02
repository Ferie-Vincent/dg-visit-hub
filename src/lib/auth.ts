export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Default admin credentials for demo
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'admin' as const
};

class AuthService {
  private storageKey = 'dg-visit-hub-auth';

  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return { isAuthenticated: false, user: null };
      
      const authData = JSON.parse(stored);
      return {
        isAuthenticated: true,
        user: authData.user
      };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  }

  login(username: string, password: string): { success: boolean; error?: string; user?: User } {
    // Check default admin
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      const user: User = {
        id: '1',
        username: DEFAULT_ADMIN.username,
        role: DEFAULT_ADMIN.role,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify({ user }));
      return { success: true, user };
    }

    // Check stored users
    const users = this.getStoredUsers();
    const foundUser = users.find(u => u.username === username);
    
    if (!foundUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const storedPasswords = JSON.parse(localStorage.getItem('dg-visit-hub-passwords') || '{}');
    if (storedPasswords[foundUser.id] !== password) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    localStorage.setItem(this.storageKey, JSON.stringify({ user: foundUser }));
    return { success: true, user: foundUser };
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  createUser(username: string, password: string, role: 'admin' | 'viewer'): { success: boolean; error?: string; user?: User } {
    const users = this.getStoredUsers();
    
    if (users.some(u => u.username === username)) {
      return { success: false, error: 'Nom d\'utilisateur déjà utilisé' };
    }

    const user: User = {
      id: Date.now().toString(),
      username,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem('dg-visit-hub-users', JSON.stringify(users));
    
    // Store password separately
    const passwords = JSON.parse(localStorage.getItem('dg-visit-hub-passwords') || '{}');
    passwords[user.id] = password;
    localStorage.setItem('dg-visit-hub-passwords', JSON.stringify(passwords));

    return { success: true, user };
  }

  getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem('dg-visit-hub-users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  deleteUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers().filter(u => u.id !== userId);
      localStorage.setItem('dg-visit-hub-users', JSON.stringify(users));
      
      const passwords = JSON.parse(localStorage.getItem('dg-visit-hub-passwords') || '{}');
      delete passwords[userId];
      localStorage.setItem('dg-visit-hub-passwords', JSON.stringify(passwords));
      
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();