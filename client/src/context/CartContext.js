// src/context/CartContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "../axios";
import { useAuth } from "./AuthContext";
import ToastNotification from "../components/ToastNotification";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("/cart", { withCredentials: true });
      setCart(res.data || []);
    } catch (error) {
      ToastNotification.error("Failed to fetch cart");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (product_id, quantity = 1) => {
    if (!isAuthenticated) {
      ToastNotification.error("Please log in to add items to your cart.");
      return;
    }
    try {
      await axios.post(
        "/cart",
        { product_id, quantity },
        { withCredentials: true },
      );
      await fetchCart();
      ToastNotification.success("Added to cart!");
    } catch (error) {
      ToastNotification.error(
        error.response?.data?.message || "Add to cart failed",
      );
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) return;
    try {
      await axios.put(
        `/cart/${cartItemId}`,
        { quantity },
        { withCredentials: true },
      );
      await fetchCart();
    } catch (error) {
      ToastNotification.error(error.response?.data?.message || "Update failed");
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return;
    try {
      await axios.delete(`/cart/${cartItemId}`, { withCredentials: true });
      await fetchCart();
    } catch (error) {
      ToastNotification.error(error.response?.data?.message || "Remove failed");
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await axios.delete("/cart/clear", { withCredentials: true });
      await fetchCart();
    } catch (error) {
      ToastNotification.error(
        error.response?.data?.message || "Clear cart failed",
      );
    }
  };

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (item.quantity || 0), 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 0),
        0,
      ),
    [cart],
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
