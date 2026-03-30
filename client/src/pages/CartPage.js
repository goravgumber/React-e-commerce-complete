import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import CartItem from "../components/CartItem";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ToastNotification from "../components/ToastNotification";
import "./CartPage.css";

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "cancelled") {
      ToastNotification.info("Payment was cancelled. You can retry checkout anytime.");
    }
  }, [searchParams]);

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty <= 0) return;
    setLoading(true);
    try {
      await updateCartItem(cartItemId, newQty);
      ToastNotification.success("Quantity updated");
    } catch {
      ToastNotification.error("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId) => {
    setLoading(true);
    try {
      await removeFromCart(cartItemId);
      ToastNotification.success("Item removed");
    } catch {
      ToastNotification.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      await clearCart();
      ToastNotification.success("Cart cleared");
      setModalOpen(false);
    } catch {
      ToastNotification.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0 && !loading) {
    return (
      <div className="cart-page empty">
        <h2>Your Cart is Empty</h2>
        <button className="continue-shopping" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart ({cartCount} items)</h2>

      {loading && (
        <div className="loader-container">
          <Loader size={50} />
        </div>
      )}

      {!loading && cart.length > 0 && (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="cart-summary">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <div className="cart-buttons">
              <button className="checkout-btn" onClick={() => navigate("/shipping")}>
                Proceed to Checkout
              </button>
              <button className="clear-btn" onClick={() => setModalOpen(true)}>
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Clear Cart?"
        footer={
          <>
            <button className="modal-btn confirm" onClick={handleClearCart}>
              Yes, Clear
            </button>
            <button className="modal-btn cancel" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </>
        }
      >
        <p>Are you sure you want to clear all items from your cart? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CartPage;
