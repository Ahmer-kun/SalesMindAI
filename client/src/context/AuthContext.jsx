/**
 * Provides global authentication state to the entire app.
 * Handles: login, logout, signup, and auto-restore session on page reload.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // save token to both state and localStorage
  const saveToken = (token) => {
    setAccessToken(token);
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  };

  // restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const { user } = await authService.getMe();
        setUser(user);
      } catch {
        // Token invalid or expired — try to refresh
        try {
          const { accessToken: newToken } = await authService.refresh();
          saveToken(newToken);
          const { user } = await authService.getMe();
          setUser(user);
        } catch {
          // Refresh also failed — clear everything
          saveToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // Run only on mount

  // login 
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    saveToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  // signup
  const signup = useCallback(async (userData) => {
    const data = await authService.signup(userData);
    saveToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  // logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if server fails, clear client state
    } finally {
      saveToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook — access auth context from any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
