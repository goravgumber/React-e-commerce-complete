// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // Use plain axios here to specify full URLs explicitly
import ToastNotification from "../components/ToastNotification";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // true until first check is done

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${API_BASE}/login`,
        { email, password },
        { withCredentials: true },
      );
      setUser(res.data.user);
      setIsAuthenticated(true);
      ToastNotification.success("Login successful!");
      return { success: true };
    } catch (err) {
      ToastNotification.error(err.response?.data?.message || "Login failed");
      return { success: false };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(
        `${API_BASE}/register`,
        { name, email, password },
        { withCredentials: true },
      );
      ToastNotification.success("Account created successfully!");
      return { success: true };
    } catch (err) {
      ToastNotification.error(err.response?.data?.message || "Register failed");
      return { success: false };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await axios.put(`${API_BASE}/update`, updates, {
        withCredentials: true,
      });
      setUser(res.data.user);
      ToastNotification.success("Profile updated!");
    } catch (err) {
      ToastNotification.error(err.response?.data?.message || "Update failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
