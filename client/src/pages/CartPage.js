import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ToastNotification from "../components/ToastNotification";
import "./CartPage.css";

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, cartCount } =
    useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty <= 0) return;
    setLoading(true);
    try {
      await updateCartItem(cartItemId, newQty); // assuming async update, e.g. API call
      setToast({ type: "success", message: "Quantity updated" });
    } catch {
      setToast({ type: "error", message: "Failed to update quantity" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId) => {
    setLoading(true);
    try {
      await removeFromCart(cartItemId);
      setToast({ type: "success", message: "Item removed" });
    } catch {
      setToast({ type: "error", message: "Failed to remove item" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      await clearCart();
      setToast({ type: "success", message: "Cart cleared" });
      setModalOpen(false);
    } catch {
      setToast({ type: "error", message: "Failed to clear cart" });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  if (cart.length === 0 && !loading)
    return (
      <div className="cart-page empty">
        <h2>Your Cart is Empty</h2>
        <button className="continue-shopping" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );

  return (
    <div className="cart-page">
      <h2>Your Cart ({cartCount} items)</h2>

      {loading && (
        <div className="loader-container">
          <Loader size={50} />
        </div>
      )}

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}

      {!loading && cart.length > 0 && (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.cart_id}
                item={item}
                onUpdateQuantity={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="cart-summary">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <div className="cart-buttons">
              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
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
            <button
              className="modal-btn cancel"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to clear all items from your cart? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CartPage;
