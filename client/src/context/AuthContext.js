import { createContext, useContext, useState, useEffect } from "react";
import axios from "../axios";
import ToastNotification from "../components/ToastNotification";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      ToastNotification.success("Login successful!");
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      ToastNotification.error(message);
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post("/auth/register", { name, email, password });
      ToastNotification.success("Account created successfully!");
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "Register failed";
      ToastNotification.error(message);
      throw new Error(message);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await axios.put("/auth/update", updates);
      setUser(res.data.user);
      ToastNotification.success("Profile updated!");
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      ToastNotification.error(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout", {});
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
        updateUser: updateProfile,
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
