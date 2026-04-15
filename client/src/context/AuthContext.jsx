/**
 * Provides global authentication state to the entire app.
 * Handles: login, logout, signup, and auto-restore session on page reload.
 * After OTP verification, MFAPage calls loginWithToken(accessToken, user)
 * which properly sets both the token AND the user in context,
 * so ProtectedRoute sees isAuthenticated: true immediately.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading]         = useState(true);

  const saveToken = (token) => {
    setAccessToken(token);
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  };

  // Restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) { setLoading(false); return; }
      try {
        const { user } = await authService.getMe();
        setUser(user);
      } catch {
        try {
          const { accessToken: newToken } = await authService.refresh();
          saveToken(newToken);
          const { user } = await authService.getMe();
          setUser(user);
        } catch {
          saveToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Standard login (email + password)
  // Returns full response so LoginPage can detect mfaRequired
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data.mfaRequired) return data; // don't set user yet
    saveToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  // Called by MFAPage after successful OTP verification
  // Properly sets BOTH token AND user so ProtectedRoute passes
  const loginWithToken = useCallback((token, userData) => {
    saveToken(token);
    setUser(userData);
  }, []);

  const signup = useCallback(async (userData) => {
    const data = await authService.signup(userData);
    saveToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    finally { saveToken(null); setUser(null); }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithToken,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};


// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// import { authService } from "../services/authService";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
//   const [loading, setLoading] = useState(true); // true while restoring session

//   // save token to both state and localStorage
//   const saveToken = (token) => {
//     setAccessToken(token);
//     if (token) localStorage.setItem("accessToken", token);
//     else localStorage.removeItem("accessToken");
//   };

//   // restore session on page load
//   useEffect(() => {
//     const restoreSession = async () => {
//       if (!accessToken) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const { user } = await authService.getMe();
//         setUser(user);
//       } catch {
//         // Token invalid or expired — try to refresh
//         try {
//           const { accessToken: newToken } = await authService.refresh();
//           saveToken(newToken);
//           const { user } = await authService.getMe();
//           setUser(user);
//         } catch {
//           // Refresh also failed — clear everything
//           saveToken(null);
//           setUser(null);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     restoreSession();
//   }, []); // Run only on mount

//   // login 
//   const login = useCallback(async (credentials) => {
//     const data = await authService.login(credentials);
//     saveToken(data.accessToken);
//     setUser(data.user);
//     return data;
//   }, []);

//   // signup
//   const signup = useCallback(async (userData) => {
//     const data = await authService.signup(userData);
//     saveToken(data.accessToken);
//     setUser(data.user);
//     return data;
//   }, []);

//   // logout
//   const logout = useCallback(async () => {
//     try {
//       await authService.logout();
//     } catch {
//       // Even if server fails, clear client state
//     } finally {
//       saveToken(null);
//       setUser(null);
//     }
//   }, []);

//   const value = {
//     user,
//     accessToken,
//     loading,
//     isAuthenticated: !!user,
//     login,
//     signup,
//     logout,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// /**
//  * useAuth hook — access auth context from any component
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };
