import React from "react";
import "./CartItem.css";

import { IMAGE_BASE_URL } from "../config";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (e) => {
    let qty = parseInt(e.target.value, 10);
    if (Number.isNaN(qty) || qty < 1) qty = 1;
    onUpdateQuantity(item.id, qty);
  };

  return (
    <div className="cart-item" tabIndex={0} aria-label={`Cart item: ${item.name}`}>
      <img
        src={`${IMAGE_BASE_URL}/${item.image}`}
        alt={item.name}
        className="cart-item-image"
        loading="lazy"
      />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p className="price">Price: ₹{item.price}</p>
        <label htmlFor={`qty-${item.id}`} className="quantity-label">
          Quantity:
        </label>
        <input
          id={`qty-${item.id}`}
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="cart-quantity-input"
          aria-live="polite"
          aria-label={`Change quantity for ${item.name}`}
          title="Change quantity"
        />
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="remove-btn"
        aria-label={`Remove ${item.name} from cart`}
        title="Remove item"
      >
        ✖ Remove
      </button>
    </div>
  );
};

export default CartItem;
