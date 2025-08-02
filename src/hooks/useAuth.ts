import { useState, useEffect } from 'react';
import { authService, type AuthState, type User } from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState());

  useEffect(() => {
    const state = authService.getAuthState();
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

  const createUser = (username: string, password: string, role: 'admin' | 'viewer') => {
    return authService.createUser(username, password, role);
  };

  const deleteUser = (userId: string) => {
    return authService.deleteUser(userId);
  };

  const getUsers = () => {
    return authService.getStoredUsers();
  };

  return {
    ...authState,
    login,
    logout,
    createUser,
    deleteUser,
    getUsers
  };
}