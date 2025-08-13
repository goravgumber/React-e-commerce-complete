import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useCart } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import Loader from "../components/Loader";
import ToastNotification from "../components/ToastNotification";
import "./CheckoutPage.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Calculate total amount
  const total = cart.reduce(
    (acc, it) => acc + Number(it.price) * it.quantity,
    0,
  );

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  // Validation helper
  const validateForm = () => {
    const newErrors = {};
    if (!shipping.name.trim()) newErrors.name = "Full Name is required";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.postalCode.trim())
      newErrors.postalCode = "Postal Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToast({ type: "error", message: "Your cart is empty." });
      return;
    }

    if (!validateForm()) {
      setToast({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);

    try {
      // Create Stripe Checkout Session via backend
      const { data } = await axios.post("/payments/create-checkout-session", {
        items: cart,
        shipping,
      });

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

      if (error) {
        setToast({
          type: "error",
          message: "Payment failed: " + error.message,
        });
      } else {
        // Usually redirect happens; but if you want to clear cart or do something post payment success:
        // clearCart();
        // navigate("/orders");
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Unable to start checkout.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <div className="checkout-grid">
        {/* Shipping Form */}
        <div className="checkout-left">
          <h3>Shipping Information</h3>
          <form onSubmit={handleFormSubmit} noValidate>
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={shipping.name}
              onChange={handleInputChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}

            <input
              type="text"
              name="address"
              placeholder="Address *"
              value={shipping.address}
              onChange={handleInputChange}
              className={errors.address ? "input-error" : ""}
            />
            {errors.address && (
              <div className="error-text">{errors.address}</div>
            )}

            <input
              type="text"
              name="city"
              placeholder="City *"
              value={shipping.city}
              onChange={handleInputChange}
              className={errors.city ? "input-error" : ""}
            />
            {errors.city && <div className="error-text">{errors.city}</div>}

            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code *"
              value={shipping.postalCode}
              onChange={handleInputChange}
              className={errors.postalCode ? "input-error" : ""}
            />
            {errors.postalCode && (
              <div className="error-text">{errors.postalCode}</div>
            )}

            <input
              type="text"
              name="country"
              placeholder="Country"
              value={shipping.country}
              disabled
            />
          </form>
        </div>

        {/* Order Summary */}
        <div className="checkout-right">
          <h3>Order Summary</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="summary-list">
                {cart.map((it) => (
                  <div className="summary-item" key={it.cart_id}>
                    <img src={`/images/${it.image}`} alt={it.name} />
                    <div>
                      <div className="name">{it.name}</div>
                      <div>
                        Qty: {it.quantity} × ₹{it.price}
                      </div>
                    </div>
                    <div className="price">
                      ₹{(it.quantity * it.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <div>Total</div>
                <div>₹{total.toFixed(2)}</div>
              </div>

              <button
                className="place-order"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                type="button"
              >
                {loading ? <Loader size={20} /> : "Pay & Place Order"}
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
