import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { debounce } from "lodash";
import { FaShoppingCart, FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [animateBadge, setAnimateBadge] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  // Animate cart count badge on change
  useEffect(() => {
    if (prevCartCountRef.current !== cartCount) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      prevCartCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
      }, 400),
    [setSearchTerm],
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  const handleChange = (e) => {
    debouncedSetSearchTerm(e.target.value);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`modern-navbar ${darkMode ? "dark" : ""}`}>
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" onClick={handleLinkClick}>
            🛍️ ATIPRA's-Store
          </Link>
        </div>

        {user && (
          <div className="navbar-center">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
              <input
                type="text"
                className="navbar-search"
                placeholder="Search products..."
                defaultValue={searchTerm}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <ul className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <li>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className={location.pathname === "/products" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className={location.pathname === "/orders" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={location.pathname === "/profile" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Profile
                </Link>
              </li>
              <li className="cart-icon-wrapper" title="Cart">
                <Link
                  to="/cart"
                  className={location.pathname === "/cart" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  <FaShoppingCart size={20} />
                  <span
                    className={`cart-count ${
                      animateBadge ? "animate-badge" : ""
                    }`}
                  >
                    {cartCount}
                  </span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={location.pathname === "/about" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={location.pathname === "/contact" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={location.pathname === "/register" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
              </li>
            </>
          )}

          <li
            onClick={() => {
              toggleDarkMode();
              setMobileMenuOpen(false);
            }}
            className="dark-toggle"
          >
            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <button
          className={`hamburger-btn ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
