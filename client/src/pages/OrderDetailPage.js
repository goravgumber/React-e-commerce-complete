import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../axios";
import "./Pages.css";

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="loader">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="empty-message">Order not found.</div>;

  return (
    <div className="order-detail-page container">
      <h2>Order #{order.id} Details</h2>
      <p>
        <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
      </p>
      <p>
        <strong>Total:</strong> ₹{Number(order.total).toFixed(2)}
      </p>
      <p>
        <strong>Status:</strong> {order.payment_status || "pending"}
      </p>

      <h3>Items</h3>
      <ul className="items-list">
        {(order.items || []).map((item) => (
          <li key={item.product_id} className="item-row">
            <span className="item-name">{item.name}</span>
            <span>Qty: {item.quantity}</span>
            <span>₹{Number(item.price).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <Link to="/orders" className="btn-back">
        ← Back to Orders
      </Link>
    </div>
  );
};

export default OrderDetailPage;
