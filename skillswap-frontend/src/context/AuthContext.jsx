import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, creditApi, getAuthToken, setAuthToken } from '../api/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await authApi.getProfile();
      if (profile && profile.role === 'admin') {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }
      setUser(profile);
    } catch (err) {
      console.error('Error loading auth profile:', err);
      setAuthToken(null);
      localStorage.removeItem("isAdmin");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const loginUser = async (email, password) => {
    const res = await authApi.login(email, password);
    setAuthToken(res.token);
    if (res.user?.role === 'admin') {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.removeItem("isAdmin");
    }
    await fetchProfile();
    return res;
  };

  const registerUser = async (full_name, email, password) => {
    const res = await authApi.register(full_name, email, password);
    setAuthToken(res.token);
    localStorage.removeItem("isAdmin");
    await fetchProfile();
    return res;
  };

  const logoutUser = () => {
    setAuthToken(null);
    localStorage.removeItem("isAdmin");
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
