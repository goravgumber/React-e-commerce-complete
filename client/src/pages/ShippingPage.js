// src/pages/ShippingPage.jsx
import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

const ShippingPage = () => {
  const [form, setForm] = useState({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/shipping");
      setAddresses(res.data || []);
      if (res.data?.length) setSelectedAddressId(res.data[0].id);
    } catch (err) {
      setError("Failed to fetch saved addresses.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Basic validation
    if (
      !form.full_name ||
      !form.address_line1 ||
      !form.city ||
      !form.postal_code ||
      !form.country
    ) {
      setError("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    try {
      const res = await axios.post("/shipping", form);
      setAddresses((prev) => [res.data, ...prev]);
      setSelectedAddressId(res.data.id);
      navigate("/checkout");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save address");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUseExisting = () => {
    if (!selectedAddressId) {
      alert("Please select an address first.");
      return;
    }
    navigate("/checkout", { state: { shipping_id: selectedAddressId } });
  };

  return (
    <div className="shipping-page container">
      <h2>Shipping Address</h2>

      {error && <div className="error">{error}</div>}

      <div className="shipping-grid">
        <section className="shipping-form">
          <form onSubmit={handleSave} noValidate>
            <input
              name="full_name"
              placeholder="Full name *"
              value={form.full_name}
              onChange={handleChange}
              required
            />
            <input
              name="address_line1"
              placeholder="Address line 1 *"
              value={form.address_line1}
              onChange={handleChange}
              required
            />
            <input
              name="address_line2"
              placeholder="Address line 2 (optional)"
              value={form.address_line2}
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
              required
            />
            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />
            <input
              name="postal_code"
              placeholder="Postal / ZIP code *"
              value={form.postal_code}
              onChange={handleChange}
              required
            />
            <input
              name="country"
              placeholder="Country *"
              value={form.country}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={handleChange}
            />
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </section>

        <section className="shipping-saved">
          <h3>Saved Addresses</h3>
          {addresses.length === 0 ? (
            <p>No saved addresses</p>
          ) : (
            <>
              <ul>
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className={selectedAddressId === addr.id ? "selected" : ""}
                    onClick={() => setSelectedAddressId(addr.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedAddressId === addr.id}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setSelectedAddressId(addr.id)
                    }
                  >
                    <div>
                      <strong>{addr.full_name}</strong>
                    </div>
                    <div>
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                    </div>
                    <div>
                      {addr.city} {addr.state} {addr.postal_code}
                    </div>
                    <div>{addr.country}</div>
                    {addr.phone && <div>{addr.phone}</div>}
                  </li>
                ))}
              </ul>
              <button onClick={handleUseExisting} className="use-address-btn">
                Use Selected Address
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShippingPage;
