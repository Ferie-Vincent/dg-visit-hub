import { useState, useEffect } from 'react';
import { authService, type AuthState, type User } from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getStoredAuth());

  useEffect(() => {
    const state = authService.getStoredAuth();
    setAuthState(state);
  }, []);

  const login = (username: string, password: string) => {
    const result = authService.login(username, password);
    if (result.success && result.user) {
      setAuthState({ isAuthenticated: true, user: result.user });
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setAuthState({ isAuthenticated: false, user: null });
  };

  return {
    ...authState,
    login,
    logout
  };
}