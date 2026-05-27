import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuthToken, setAuthToken } from '@/shared/services/apiClient';
import { fetchCurrentUser, loginUser, registerCompanyUser, registerUser } from '@/features/auth/services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      try {
        const currentUser = await fetchCurrentUser();
        if (!ignore) {
          setUser(currentUser);
        }
      } catch (_error) {
        clearAuthToken();
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async ({ email, password, rememberMe = false }) => {
    const result = await loginUser({ email, password });
    setAuthToken(result.token, rememberMe);
    setUser(result.user);
    return result.user;
  };

  const register = async (formData) => {
    const result = await registerUser(formData);
    setAuthToken(result.token, true);
    setUser(result.user);
    return result.user;
  };

  const registerCompany = async (formData) => {
    const result = await registerCompanyUser(formData);
    setAuthToken(result.token, true);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      register,
      registerCompany,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
