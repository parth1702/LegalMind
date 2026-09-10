import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfileApi, loginApi, registerApi, logoutApi, updateProfileApi } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('legalmind_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify profile on load
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await getProfileApi();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err.message);
          handleLogout();
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token]);

  const handleLogin = async (credentials) => {
    const res = await loginApi(credentials);
    if (res.token && res.user) {
      localStorage.setItem('legalmind_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const handleRegister = async (userData) => {
    const res = await registerApi(userData);
    if (res.token && res.user) {
      localStorage.setItem('legalmind_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (_) {
      // Ignore logout network error
    } finally {
      localStorage.removeItem('legalmind_token');
      setToken(null);
      setUser(null);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    const res = await updateProfileApi(profileData);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
