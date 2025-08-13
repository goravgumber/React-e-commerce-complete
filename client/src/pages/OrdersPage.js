// src/pages/OrdersPage.js
import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Link } from "react-router-dom";
import "./Pages.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/orders");
        setOrders(res.data);
      } catch (err) {
        setError("Failed to load orders. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loader">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;
  if (orders.length === 0)
    return <div className="empty-message">You have no orders yet.</div>;

  return (
    <div className="orders-page container">
      <h2>Your Orders</h2>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <Link to={`/orders/${order.id}`}>
              <div>
                <strong>Order #{order.id}</strong>
              </div>
              <div>Total: ₹{order.total.toFixed(2)}</div>
              <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
