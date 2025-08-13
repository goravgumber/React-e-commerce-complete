import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import AuthProvider and useAuth

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Product & shopping pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

// User & info pages
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Misc
import NotFoundPage from "./pages/NotFoundPage";

// Protect routes that require login
function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Prevent logged-in users from visiting login/register/forgot password pages
function AuthRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div>Loading...</div>;
  return !user ? children : <Navigate to="/" replace />;
}

function App() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div style={{ padding: "20px 40px" }}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRoute>
                  <RegisterPage />
                </AuthRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthRoute>
                  <ForgotPasswordPage />
                </AuthRoute>
              }
            />

            {/* Optional public pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Home (public landing page) */}
            <Route path="/" element={<HomePage />} />

            {/* Private routes */}
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductsPage searchTerm={searchTerm} />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <OrderDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
