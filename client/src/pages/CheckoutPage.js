import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useCart } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import Loader from "../components/Loader";
import ToastNotification from "../components/ToastNotification";
import { IMAGE_BASE_URL } from "../config";
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

  const total = cart.reduce((acc, it) => acc + Number(it.price) * it.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const validateForm = () => {
    const newErrors = {};
    if (!shipping.name.trim()) newErrors.name = "Full Name is required";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.postalCode.trim()) newErrors.postalCode = "Postal Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      ToastNotification.error("Your cart is empty.");
      return;
    }

    if (!validateForm()) {
      ToastNotification.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/payments/create-checkout-session", {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping,
      });

      const stripe = await stripePromise;
      if (!stripe) {
        ToastNotification.error("Stripe failed to initialize.");
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

      if (error) {
        ToastNotification.error(`Payment failed: ${error.message}`);
      }
    } catch (err) {
      ToastNotification.error(err.response?.data?.message || "Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <div className="checkout-grid">
        <div className="checkout-left">
          <h3>Shipping Information</h3>
          <form noValidate>
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
            {errors.address && <div className="error-text">{errors.address}</div>}

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
            {errors.postalCode && <div className="error-text">{errors.postalCode}</div>}

            <input
              type="text"
              name="country"
              placeholder="Country"
              value={shipping.country}
              disabled
            />
          </form>
        </div>

        <div className="checkout-right">
          <h3>Order Summary</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="summary-list">
                {cart.map((it) => (
                  <div className="summary-item" key={it.id}>
                    <img src={`${IMAGE_BASE_URL}/${it.image}`} alt={it.name} />
                    <div>
                      <div className="name">{it.name}</div>
                      <div>
                        Qty: {it.quantity} × ₹{it.price}
                      </div>
                    </div>
                    <div className="price">₹{(it.quantity * it.price).toFixed(2)}</div>
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
    </div>
  );
};

export default CheckoutPage;
